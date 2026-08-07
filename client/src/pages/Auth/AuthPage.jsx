// File: client/src/pages/Auth/AuthPage.jsx
import TopBar from '@/components/Layout/Topbar'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useGoogleSignin,
  useSignin,
  useSignup,
} from '../../hooks/useAuth'

const METRICS = [
  { number: '1.2M', label: 'Design assets' },
  { number: '500+', label: 'UAE partners' },
  { number: '2.4s', label: 'Generation time' },
]

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const type = urlParams.get('type')
    return type === 'signup' ? false : true
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false,
  })
  const [formErrors, setFormErrors] = useState({})
  const [socialError, setSocialError] = useState('')
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false)

  // React Query mutations
  const signupMutation = useSignup()
  const signinMutation = useSignin()
  const googleSigninMutation = useGoogleSignin()

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const isConfiguredClientId = (value) => {
    if (!value || typeof value !== 'string') return false
    return !value.trim().toUpperCase().startsWith('REPLACE_WITH_')
  }
  const hasGoogleClientId = isConfiguredClientId(googleClientId)

  useEffect(() => {
    const loadScript = (src, id, onLoad) => {
      const existingScript = document.getElementById(id)
      if (existingScript) {
        onLoad?.()
        return
      }

      const script = document.createElement('script')
      script.src = src
      script.id = id
      script.async = true
      script.defer = true
      script.onload = () => onLoad?.()
      script.onerror = () => {
        console.error(`Failed to load script: ${src}`)
      }
      document.body.appendChild(script)
    }

    if (hasGoogleClientId) {
      loadScript(
        'https://accounts.google.com/gsi/client',
        'google-gsi-script',
        () => setIsGoogleScriptLoaded(true)
      )
    }

  }, [hasGoogleClientId])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
    // Clear error for this field
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email) {
      errors.email = 'Email is required'
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address'
    }

    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      errors.password = 'Password must be at least 8 characters long'
    }

    // Signup-specific validation
    if (!isLogin) {
      if (!formData.firstName.trim()) {
        errors.firstName = 'First name is required'
      }
      if (!formData.lastName.trim()) {
        errors.lastName = 'Last name is required'
      }
      if (!formData.password) {
        errors.password = 'Password is required'
      }
      if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = 'Passwords do not match'
      }
      if (!formData.agreeToTerms) {
        errors.agreeToTerms = 'You must agree to the terms and conditions'
      }
    }

    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSocialError('')

    if (!validateForm()) {
      return
    }

    try {
      if (isLogin) {
        await signinMutation.mutateAsync({
          email: formData.email,
          password: formData.password,
        })
      } else {
        await signupMutation.mutateAsync({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        })
      }
    } catch (error) {
      // Error is handled by the mutation
      console.error('Auth error:', error)
    }
  }

  const handleGoogleSignin = () => {
    setSocialError('')

    if (!hasGoogleClientId) {
      setSocialError('Google sign-in is not configured yet.')
      return
    }

    if (!isGoogleScriptLoaded || !window.google?.accounts?.id) {
      setSocialError('Google sign-in is still loading. Please try again.')
      return
    }

    window.google.accounts.id.initialize({
      client_id: googleClientId.trim(),
      callback: async (response) => {
        try {
          if (!response?.credential) {
            setSocialError('Google did not return a valid credential.')
            return
          }
          await googleSigninMutation.mutateAsync({ idToken: response.credential })
        } catch (error) {
          const message =
            error?.data?.message || error?.message || 'Google sign-in failed'
          setSocialError(message)
        }
      },
    })

    const reasonMap = {
      secure_http_required:
        'Google Sign-In requires HTTPS (or localhost). Open this app on https://... or localhost.',
      unregistered_origin:
        'This origin is not allowed in Google OAuth settings. Add this exact origin in Authorized JavaScript origins.',
      invalid_client:
        'Google Client ID is invalid. Recheck VITE_GOOGLE_CLIENT_ID and GOOGLE_CLIENT_ID.',
      missing_client_id:
        'Google Client ID is missing in env settings.',
      opt_out_or_no_session:
        'No active Google session found. Please log into a Google account and try again.',
      browser_not_supported:
        'Your browser does not support this Google sign-in flow.',
      suppressed_by_user:
        'Google prompt was previously dismissed. Try in an incognito window or clear site data.',
    }

    window.google.accounts.id.prompt((notification) => {
      if (notification?.isNotDisplayed?.()) {
        const reason = notification?.getNotDisplayedReason?.() || 'unknown'
        setSocialError(
          reasonMap[reason] ||
            `Google sign-in was not displayed (${reason}). Check OAuth origin + HTTPS settings.`
        )
        return
      }

      if (notification?.isSkippedMoment?.()) {
        const reason = notification?.getSkippedReason?.() || 'unknown'
        setSocialError(
          reasonMap[reason] ||
            `Google sign-in was skipped (${reason}). Try again or use an incognito window.`
        )
      }
    })
  }

  const reduxLoading = useSelector((state) => state.user.loading)
  const currentMutation = isLogin ? signinMutation : signupMutation
  const isSocialLoading = googleSigninMutation.isPending
  const isLoading = reduxLoading || currentMutation.isPending || isSocialLoading
  const error = currentMutation.error

  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-ivory text-charcoal font-sans relative'>
        {/* Main Content */}
        <div className='relative z-10 min-h-screen flex items-center justify-center px-4 py-8 pt-24 pb-16'>
          <div className='w-full max-w-6xl mx-auto'>
            <div className='grid lg:grid-cols-2 lg:h-[720px] overflow-hidden border border-beige bg-white shadow-[0_24px_70px_-48px_rgba(23,22,20,0.45)] rounded-xl'>
              {/* Left Panel — Editorial */}
              <div
                className='relative h-full min-h-[580px] flex flex-col justify-between overflow-hidden bg-charcoal p-8 md:p-12 hidden lg:flex'
              >
                {/* Top row */}
                <div className='relative z-10 flex items-start justify-between'>
                  <p className='label-arch-light'>The Manāra Atelier</p>
                  <p className='font-serif italic text-[#c3a886] text-2xl leading-none'>
                    01
                  </p>
                </div>

                {/* Center — big serif statement */}
                <div className='relative z-10 my-10'>
                  <h2 className='font-serif font-normal text-ivory text-5xl xl:text-6xl leading-[1.02] tracking-[-0.01em]'>
                    Design your
                    <br />
                    <span className='italic text-[#c3a886]'>dream space.</span>
                  </h2>
                  <p className='mt-6 max-w-xs text-[13px] leading-[1.85] text-ivory/60'>
                    AI-powered interiors for Dubai and the UAE — from
                    moodboard to move-in, in under two hours.
                  </p>
                </div>

                {/* Metrics */}
                <div className='relative z-10'>
                  <div className='grid grid-cols-3 gap-6 pt-7 border-t border-ivory/15'>
                    {METRICS.map((m) => (
                      <div key={m.label} className='flex flex-col'>
                        <span className='font-serif text-3xl text-ivory tracking-[-0.01em]'>
                          {m.number}
                        </span>
                        <span className='mt-2 text-[8.5px] font-semibold uppercase tracking-[0.3em] text-ivory/45'>
                          {m.label}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <p className='relative z-10 mt-9 border-t border-ivory/15 pt-5 text-[9px] font-semibold uppercase tracking-[0.3em] text-ivory/45'>
                  Creative renders · Accurate floor plans · Curated shop lists
                </p>
              </div>

              {/* Right Panel — Auth Form */}
              <div
                className='p-8 md:p-12 bg-white flex flex-col justify-center overflow-y-auto'
              >
                <div className='w-full max-w-md mx-auto py-2'>
                  {/* Header */}
                  <div className='mb-1'>
                    <p className='label-arch'>
                      {isLogin ? 'Member entry' : 'New member'}
                    </p>
                    <h1 className='mt-4 font-serif text-4xl md:text-5xl tracking-[-0.01em] text-charcoal leading-none'>
                      {isLogin ? (
                        <>
                          Welcome <span className='italic text-manara'>back.</span>
                        </>
                      ) : (
                        <>
                          Create your <span className='italic text-manara'>space.</span>
                        </>
                      )}
                    </h1>
                    <p className='mt-3 text-[13px] text-stone'>
                      {isLogin
                        ? 'Sign in to continue your design journey.'
                        : 'Join the Manāra design workspace.'}
                    </p>
                  </div>

                  {/* Error Display */}
                  {(error || socialError) && (
                    <div className='mb-5 p-3 bg-[#fdecea] border border-[#e4a9a2]/60 rounded-lg flex items-start gap-2.5'>
                      <AlertCircle className='w-4 h-4 text-[#c0392b] flex-shrink-0 mt-0.5' />
                      <div className='flex-1'>
                        <p className='text-[#c0392b] text-xs leading-relaxed'>
                          {socialError ||
                            error?.response?.data?.message ||
                            error?.message ||
                            'An error occurred. Please try again.'}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Toggle Buttons */}
                  <div className='grid grid-cols-2 border-b border-beige mb-8' role='tablist' aria-label='Authentication mode'>
                    <button
                      type='button'
                      role='tab'
                      aria-selected={isLogin}
                      onClick={() => {
                        if (isLoading) return
                        setSocialError('')
                        setIsLogin(true)
                      }}
                      disabled={isLoading}
                      className={`relative py-3.5 text-[13px] font-semibold tracking-wide ${
                        isLogin
                          ? 'text-charcoal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-manara'
                          : 'text-stone hover:text-charcoal'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Sign In
                    </button>
                    <button
                      type='button'
                      role='tab'
                      aria-selected={!isLogin}
                      onClick={() => {
                        if (isLoading) return
                        setSocialError('')
                        setIsLogin(false)
                      }}
                      disabled={isLoading}
                      className={`relative py-3.5 text-[13px] font-semibold tracking-wide ${
                        !isLogin
                          ? 'text-charcoal after:absolute after:inset-x-0 after:-bottom-px after:h-0.5 after:bg-manara'
                          : 'text-stone hover:text-charcoal'
                      } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      Create Account
                    </button>
                  </div>

                  {/* Google */}
                  <div className='space-y-2.5 mb-7'>
                    <button
                      type='button'
                      onClick={handleGoogleSignin}
                      disabled={isLoading}
                      className='w-full flex items-center justify-center gap-2.5 h-[50px] rounded-lg border border-charcoal/15 bg-ivory/60 text-charcoal text-[13px] font-semibold tracking-wide hover:bg-ivory hover:border-charcoal/30 transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {googleSigninMutation.isPending ? (
                        <Loader2 className='w-4 h-4 animate-spin' />
                      ) : (
                        <>
                          <svg
                            className='w-4 h-4'
                            viewBox='0 0 48 48'
                            aria-hidden='true'
                          >
                            <path
                              fill='#FFC107'
                              d='M43.6 20.5H42V20H24v8h11.3C33.6 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.4-.4-3.5z'
                            />
                            <path
                              fill='#EA4335'
                              d='M6.3 14.7l6.6 4.8C14.7 14.9 18.9 12 24 12c3 0 5.7 1.1 7.8 3l5.7-5.7C34.1 6.1 29.3 4 24 4 16.3 4 9.7 8.4 6.3 14.7z'
                            />
                            <path
                              fill='#34A853'
                              d='M24 44c5.2 0 10-2 13.6-5.3l-6.3-5.2C29.4 35 26.9 36 24 36c-5.2 0-9.6-3.3-11.2-8l-6.6 5.1C9.6 39.5 16.3 44 24 44z'
                            />
                            <path
                              fill='#4285F4'
                              d='M43.6 20.5H42V20H24v8h11.3c-.8 2.4-2.3 4.5-4 6l6.3 5.2C37.2 39 44 34 44 24c0-1.3-.1-2.4-.4-3.5z'
                            />
                          </svg>
                          <span>Continue with Google</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Form */}
                    <form
                      onSubmit={handleSubmit}
                      className='space-y-4'
                    >
                      {/* Name fields for signup */}
                      {!isLogin && (
                        <div className='grid grid-cols-2 gap-3'>
                          <InputWrapper
                            error={formErrors.firstName}
                            loading={isLoading}
                            type='text'
                            name='firstName'
                            placeholder='First Name'
                            value={formData.firstName}
                            onChange={handleInputChange}
                            required={!isLogin}
                          />
                          <InputWrapper
                            error={formErrors.lastName}
                            loading={isLoading}
                            type='text'
                            name='lastName'
                            placeholder='Last Name'
                            value={formData.lastName}
                            onChange={handleInputChange}
                            required={!isLogin}
                          />
                        </div>
                      )}

                      {/* Email field */}
                      <InputWrapper
                        error={formErrors.email}
                        loading={isLoading}
                        type='email'
                        name='email'
                        placeholder='Email address'
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                      />

                      {/* Password field */}
                      <div className='relative'>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          name='password'
                          placeholder='Password'
                          value={formData.password}
                          onChange={handleInputChange}
                          disabled={isLoading}
                          className={inputClass(
                            'pr-11',
                            formErrors.password,
                            isLoading
                          )}
                          required
                        />
                        <ToggleEye
                          show={showPassword}
                          onToggle={() => setShowPassword(!showPassword)}
                          disabled={isLoading}
                        />
                        {formErrors.password && (
                          <FieldError text={formErrors.password} />
                        )}
                      </div>

                      {/* Confirm password for signup */}
                      {!isLogin && (
                        <div className='relative'>
                          <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name='confirmPassword'
                            placeholder='Confirm Password'
                            value={formData.confirmPassword}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={inputClass(
                              'pr-11',
                              formErrors.confirmPassword,
                              isLoading
                            )}
                            required={!isLogin}
                          />
                          <button
                            type='button'
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            disabled={isLoading}
                            className='absolute right-3.5 top-1/2 transform -translate-y-1/2 text-stone hover:text-charcoal transition-colors'
                          >
                            {showConfirmPassword ? (
                              <EyeOff className='w-4 h-4' />
                            ) : (
                              <Eye className='w-4 h-4' />
                            )}
                          </button>
                          {formErrors.confirmPassword && (
                            <FieldError text={formErrors.confirmPassword} />
                          )}
                        </div>
                      )}

                      {/* Remember me / Terms */}
                      <div className='flex items-center justify-between text-xs'>
                        {isLogin ? (
                          <>
                            <label className='flex items-center text-charcoal/70 cursor-pointer'>
                              <input
                                type='checkbox'
                                disabled={isLoading}
                                className='mr-2 rounded border-beige text-manara focus:ring-manara/30'
                              />
                              Remember me
                            </label>
                            <a
                              href='#'
                              className='text-manara hover:text-[#a08163] transition-colors'
                            >
                              Forgot password?
                            </a>
                          </>
                        ) : (
                          <label className='flex items-start gap-3 text-charcoal/70 cursor-pointer'>
                            <input
                              type='checkbox'
                              name='agreeToTerms'
                              checked={formData.agreeToTerms}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className='mt-0.5 rounded bg-transparent border border-beige text-manara focus:ring-manara/30'
                              required={!isLogin}
                            />
                            <span className='text-xs leading-relaxed'>
                              I agree to the{' '}
                              <a
                                href='#'
                                className='text-manara hover:text-[#a08163] transition-colors'
                              >
                                Terms & Conditions
                              </a>{' '}
                              and{' '}
                              <a
                                href='#'
                                className='text-manara hover:text-[#a08163] transition-colors'
                              >
                                Privacy Policy
                              </a>
                            </span>
                          </label>
                        )}
                      </div>
                      {formErrors.agreeToTerms && (
                        <FieldError text={formErrors.agreeToTerms} />
                      )}

                      {/* Submit button */}
                      <button
                        type='submit'
                        disabled={isLoading}
                        className='group w-full h-[54px] text-ivory text-[13px] font-semibold tracking-wide rounded-lg relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed bg-charcoal hover:bg-manara transition-colors duration-150'
                      >
                        <div className='relative flex items-center justify-center gap-2'>
                          {isLoading ? (
                            <>
                              <Loader2 className='w-4 h-4 animate-spin' />
                              <span>
                                {isLogin
                                  ? 'Signing In...'
                                  : 'Creating Account...'}
                              </span>
                            </>
                          ) : (
                            <>
                              <span>
                                {isLogin ? 'Sign In' : 'Create Account'}
                              </span>
                              <ArrowRight className='w-4 h-4' />
                            </>
                          )}
                        </div>
                      </button>
                    </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

const inputClass = (extra = '', hasError = false, loading = false) =>
  `w-full h-[50px] px-4 ${extra} bg-[#f5f2ec]/70 border text-sm text-charcoal placeholder-stone rounded-lg focus:outline-none focus:ring-2 focus:ring-manara/30 focus:border-manara transition-colors duration-150 ${
    hasError ? 'border-[#e4a9a2]' : 'border-beige'
  } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`

const FieldError = ({ text }) => (
  <p className='text-[#c0392b] text-xs mt-1.5 ml-1'>{text}</p>
)

const ToggleEye = ({ show, onToggle, disabled }) => (
  <button
    type='button'
    onClick={onToggle}
    disabled={disabled}
    className='absolute right-3.5 top-1/2 transform -translate-y-1/2 text-stone hover:text-charcoal transition-colors'
  >
    {show ? <EyeOff className='w-4 h-4' /> : <Eye className='w-4 h-4' />}
  </button>
)

const InputWrapper = ({ error, loading, ...props }) => (
  <div>
    <input {...props} className={inputClass('', error, loading)} />
    {error && <FieldError text={error} />}
  </div>
)

export default AuthPage
