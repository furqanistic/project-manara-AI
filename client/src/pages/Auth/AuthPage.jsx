// File: client/src/pages/Auth/AuthPage.jsx
import TopBar from '@/components/Layout/Topbar'
import { AnimatePresence, motion } from 'framer-motion'
import {
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  Globe,
  Layers,
  Loader2,
  Lock,
  Mail,
  Sparkles,
  User,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  useAppleSignin,
  useGoogleSignin,
  useSignin,
  useSignup,
} from '../../hooks/useAuth'

const AuthPage = () => {
  const MotionDiv = motion.div
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
  const [isMobile, setIsMobile] = useState(false)
  const [socialError, setSocialError] = useState('')
  const [isGoogleScriptLoaded, setIsGoogleScriptLoaded] = useState(false)
  const [isAppleScriptLoaded, setIsAppleScriptLoaded] = useState(false)

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  // React Query mutations
  const signupMutation = useSignup()
  const signinMutation = useSignin()
  const googleSigninMutation = useGoogleSignin()
  const appleSigninMutation = useAppleSignin()

  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const appleClientId = import.meta.env.VITE_APPLE_CLIENT_ID
  const appleRedirectUri =
    import.meta.env.VITE_APPLE_REDIRECT_URI || `${window.location.origin}/auth`
  const isConfiguredClientId = (value) => {
    if (!value || typeof value !== 'string') return false
    return !value.trim().toUpperCase().startsWith('REPLACE_WITH_')
  }
  const hasGoogleClientId = isConfiguredClientId(googleClientId)
  const hasAppleClientId = isConfiguredClientId(appleClientId)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

    if (hasAppleClientId) {
      loadScript(
        'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js',
        'apple-js-script',
        () => setIsAppleScriptLoaded(true)
      )
    }
  }, [hasAppleClientId, hasGoogleClientId])

  useEffect(() => {
    if (!isAppleScriptLoaded || !window.AppleID?.auth || !hasAppleClientId)
      return

    window.AppleID.auth.init({
      clientId: appleClientId.trim(),
      scope: 'name email',
      redirectURI: appleRedirectUri,
      usePopup: true,
    })
  }, [appleClientId, appleRedirectUri, hasAppleClientId, isAppleScriptLoaded])

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

  const handleAppleSignin = async () => {
    setSocialError('')

    if (!hasAppleClientId) {
      setSocialError('Apple sign-in is not configured yet.')
      return
    }

    if (!isAppleScriptLoaded || !window.AppleID?.auth?.signIn) {
      setSocialError('Apple sign-in is still loading. Please try again.')
      return
    }

    try {
      const response = await window.AppleID.auth.signIn()
      const idToken = response?.authorization?.id_token

      if (!idToken) {
        setSocialError('Apple did not return a valid credential.')
        return
      }

      await appleSigninMutation.mutateAsync({
        idToken,
        firstName: response?.user?.name?.firstName,
        lastName: response?.user?.name?.lastName,
        name: [response?.user?.name?.firstName, response?.user?.name?.lastName]
          .filter(Boolean)
          .join(' ')
          .trim(),
      })
    } catch (error) {
      const message =
        error?.data?.message || error?.message || 'Apple sign-in failed'
      setSocialError(message)
    }
  }

  const reduxLoading = useSelector((state) => state.user.loading)
  const currentMutation = isLogin ? signinMutation : signupMutation
  const isSocialLoading =
    googleSigninMutation.isPending || appleSigninMutation.isPending
  const isLoading = reduxLoading || currentMutation.isPending || isSocialLoading
  const error = currentMutation.error

  const floatingElements = [
    {
      icon: Sparkles,
      position: { top: '15%', left: '10%' },
      size: 'w-6 h-6',
      color: brandColor,
      delay: 0,
    },
    {
      icon: Globe,
      position: { top: '70%', left: '15%' },
      size: 'w-5 h-5',
      color: '#3b82f6',
      delay: 1,
    },
    {
      icon: Layers,
      position: { top: '40%', left: '8%' },
      size: 'w-6 h-6',
      color: '#10b981',
      delay: 2,
    },
  ]

  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-stone-100 dark:bg-black overflow-hidden relative'>
        {/* Background Elements */}
        <div className='absolute inset-0'>
          <div
            className='absolute inset-0 opacity-5'
            style={{
              backgroundImage: `
                linear-gradient(${brandColor}40 1px, transparent 1px),
                linear-gradient(90deg, ${brandColor}40 1px, transparent 1px)
              `,
              backgroundSize: isMobile ? '40px 40px' : '60px 60px',
            }}
          />

          {floatingElements.map((element, index) => {
            const IconComponent = element.icon
            return (
              <MotionDiv
                key={index}
                className={`absolute ${element.size} rounded-full opacity-20 flex items-center justify-center`}
                style={{
                  ...element.position,
                  background: `radial-gradient(circle, ${element.color}40, transparent 70%)`,
                }}
                animate={{
                  y: [0, -15, 0],
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 4 + element.delay,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: element.delay,
                }}
              >
                <IconComponent className='w-3 h-3 text-white' />
              </MotionDiv>
            )
          })}
        </div>

        {/* Main Content */}
        <div className='relative z-10 min-h-screen flex items-center justify-center px-4 py-6 pt-20'>
          <motion.div
            className='w-full max-w-5xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className='bg-white/80 dark:bg-black/40 backdrop-blur-2xl border border-black/10 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden'>
              <div className='grid lg:grid-cols-2 min-h-[540px]'>
                {/* Left Panel - Hero Content */}
                <motion.div
                  className='relative overflow-hidden bg-gradient-to-br from-stone-200/70 to-stone-100/70 dark:from-gray-900/50 dark:to-black/50 p-6 lg:p-8 flex flex-col justify-center items-center text-center lg:text-left hidden lg:flex'
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className='relative z-10 space-y-6'>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                    >
                      <h2 className='text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3'>
                        Design Your
                        <span
                          className='block text-transparent bg-clip-text bg-gradient-to-r'
                          style={{
                            backgroundImage: `linear-gradient(to right, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          Dream Space
                        </span>
                      </h2>
                      <p className='text-gray-600 dark:text-gray-300 text-base leading-relaxed'>
                        Join thousands of designers creating beautiful interiors
                        with AI-powered tools.
                      </p>
                    </motion.div>

                    <motion.div
                      className='space-y-3'
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.8 }}
                    >
                      {[
                        {
                          icon: Sparkles,
                          text: 'AI-Powered Design Intelligence',
                          color: brandColor,
                        },
                        {
                          icon: Layers,
                          text: '3D Visualization & Rendering',
                          color: '#3b82f6',
                        },
                        {
                          icon: Globe,
                          text: 'UAE Marketplace Integration',
                          color: '#10b981',
                        },
                      ].map((feature, index) => {
                        const IconComponent = feature.icon
                        return (
                          <motion.div
                            key={index}
                            className='flex items-center gap-3 text-gray-600 dark:text-gray-300'
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: 0.8 + index * 0.1,
                              duration: 0.6,
                            }}
                          >
                            <div
                              className='w-8 h-8 rounded-lg flex items-center justify-center'
                              style={{
                                background: `linear-gradient(135deg, ${feature.color}60, ${feature.color}20)`,
                              }}
                            >
                              <IconComponent className='w-4 h-4 text-white' />
                            </div>
                            <span className='text-xs'>{feature.text}</span>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Right Panel - Auth Form */}
                <motion.div
                  className='p-6 lg:p-8 flex flex-col justify-center'
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className='w-full max-w-sm mx-auto'>
                    {/* Header */}
                    <motion.div
                      className='text-center mb-6'
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <h1 className='text-2xl lg:text-3xl font-bold text-gray-900 dark:text-white mb-1.5'>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                      </h1>
                      <p className='text-sm text-gray-600 dark:text-gray-400'>
                        {isLogin
                          ? 'Sign in to your account'
                          : 'Join the design revolution'}
                      </p>
                    </motion.div>

                    {/* Error Display */}
                    {(error || socialError) && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5'
                      >
                        <AlertCircle className='w-4 h-4 text-red-400 flex-shrink-0 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-red-400 text-xs'>
                            {socialError ||
                              error?.response?.data?.message ||
                              error?.message ||
                              'An error occurred. Please try again.'}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Toggle Buttons */}
                    <motion.div
                      className='flex bg-black/[0.04] dark:bg-white/5 rounded-xl p-1 mb-5'
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <button
                        type='button'
                        onClick={() => {
                          if (isLoading) return
                          setSocialError('')
                          setIsLogin(true)
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-300 font-semibold text-xs ${
                          isLogin
                            ? 'text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={
                          isLogin
                            ? {
                                background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                                boxShadow: `0 4px 15px ${brandColor}25`,
                              }
                            : {}
                        }
                      >
                        Sign In
                      </button>
                      <button
                        type='button'
                        onClick={() => {
                          if (isLoading) return
                          setSocialError('')
                          setIsLogin(false)
                        }}
                        disabled={isLoading}
                        className={`flex-1 py-1.5 px-3 rounded-lg transition-all duration-300 font-semibold text-xs ${
                          !isLogin
                            ? 'text-white shadow-lg'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300'
                        } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        style={
                          !isLogin
                            ? {
                                background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                                boxShadow: `0 4px 15px ${brandColor}25`,
                              }
                            : {}
                        }
                      >
                        Sign Up
                      </button>
                    </motion.div>

                    <motion.div
                      className='space-y-2.5 mb-6'
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.65, duration: 0.5 }}
                    >
                      <button
                        type='button'
                        onClick={handleGoogleSignin}
                        disabled={isLoading}
                        className='w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-white text-sm font-medium hover:bg-gray-50 dark:hover:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {googleSigninMutation.isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <>
                            <svg
                              className='w-4.5 h-4.5'
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

                      <button
                        type='button'
                        onClick={handleAppleSignin}
                        disabled={isLoading}
                        className='w-full flex items-center justify-center gap-2.5 py-2.5 rounded-xl border border-black/10 dark:border-white/10 bg-black dark:bg-white text-white dark:text-black text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
                      >
                        {appleSigninMutation.isPending ? (
                          <Loader2 className='w-4 h-4 animate-spin' />
                        ) : (
                          <>
                            <svg
                              className='w-4.5 h-4.5'
                              viewBox='0 0 24 24'
                              fill='currentColor'
                              aria-hidden='true'
                            >
                              <path d='M17.56 12.66c.03 3.22 2.82 4.29 2.85 4.3-.02.08-.45 1.56-1.49 3.1-.9 1.33-1.83 2.65-3.31 2.68-1.46.03-1.93-.88-3.61-.88-1.68 0-2.2.85-3.57.91-1.43.05-2.52-1.43-3.43-2.75-1.86-2.72-3.29-7.69-1.38-10.97.95-1.63 2.64-2.66 4.47-2.69 1.39-.03 2.71.93 3.56.93.85 0 2.44-1.15 4.11-.98.7.03 2.67.28 3.94 2.14-.1.06-2.35 1.37-2.33 4.11zm-2.86-7.2c.75-.92 1.26-2.2 1.12-3.46-1.09.05-2.4.72-3.18 1.64-.7.81-1.32 2.11-1.16 3.35 1.22.1 2.47-.62 3.22-1.53z' />
                            </svg>
                            <span>Continue with Apple</span>
                          </>
                        )}
                      </button>
                    </motion.div>

                    {/* Form */}
                    <AnimatePresence mode='wait'>
                      <motion.form
                        key={isLogin ? 'login' : 'signup'}
                        onSubmit={handleSubmit}
                        className='space-y-4'
                        initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Name fields for signup */}
                        {!isLogin && (
                          <div className='grid grid-cols-2 gap-3'>
                            <div className='relative'>
                              <User className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                              <input
                                type='text'
                                name='firstName'
                                placeholder='First Name'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`w-full pl-10 pr-3 py-2.5 bg-black/[0.03] dark:bg-white/5 border ${
                                  formErrors.firstName
                                    ? 'border-red-500/50'
                                    : 'border-black/10 dark:border-white/10'
                                } rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                                  isLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                required={!isLogin}
                              />
                              {formErrors.firstName && (
                                <p className='text-red-400 text-xs mt-1 ml-1'>
                                  {formErrors.firstName}
                                </p>
                              )}
                            </div>
                            <div className='relative'>
                              <User className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                              <input
                                type='text'
                                name='lastName'
                                placeholder='Last Name'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`w-full pl-10 pr-3 py-2.5 bg-black/[0.03] dark:bg-white/5 border ${
                                  formErrors.lastName
                                    ? 'border-red-500/50'
                                    : 'border-black/10 dark:border-white/10'
                                } rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                                  isLoading
                                    ? 'opacity-50 cursor-not-allowed'
                                    : ''
                                }`}
                                required={!isLogin}
                              />
                              {formErrors.lastName && (
                                <p className='text-red-400 text-xs mt-1 ml-1'>
                                  {formErrors.lastName}
                                </p>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Email field */}
                        <div className='relative'>
                          <Mail className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                          <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full pl-10 pr-3 py-2.5 bg-black/[0.03] dark:bg-white/5 border ${
                              formErrors.email
                                ? 'border-red-500/50'
                                : 'border-black/10 dark:border-white/10'
                            } rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            required
                          />
                          {formErrors.email && (
                            <p className='text-red-400 text-xs mt-1 ml-1'>
                              {formErrors.email}
                            </p>
                          )}
                        </div>

                        {/* Password field */}
                        <div className='relative'>
                          <Lock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full pl-10 pr-10 py-2.5 bg-black/[0.03] dark:bg-white/5 border ${
                              formErrors.password
                                ? 'border-red-500/50'
                                : 'border-black/10 dark:border-white/10'
                            } rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            required
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className='absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                          >
                            {showPassword ? (
                              <EyeOff className='w-4 h-4' />
                            ) : (
                              <Eye className='w-4 h-4' />
                            )}
                          </button>
                          {formErrors.password && (
                            <p className='text-red-400 text-xs mt-1 ml-1'>
                              {formErrors.password}
                            </p>
                          )}
                        </div>

                        {/* Confirm password for signup */}
                        {!isLogin && (
                          <div className='relative'>
                            <Lock className='absolute left-3.5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400' />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name='confirmPassword'
                              placeholder='Confirm Password'
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className={`w-full pl-10 pr-10 py-2.5 bg-black/[0.03] dark:bg-white/5 border ${
                                formErrors.confirmPassword
                                  ? 'border-red-500/50'
                                  : 'border-black/10 dark:border-white/10'
                              } rounded-xl text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                                isLoading ? 'opacity-50 cursor-not-allowed' : ''
                              }`}
                              required={!isLogin}
                            />
                            <button
                              type='button'
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                              disabled={isLoading}
                              className='absolute right-3.5 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors'
                            >
                              {showConfirmPassword ? (
                                <EyeOff className='w-4 h-4' />
                              ) : (
                                <Eye className='w-4 h-4' />
                              )}
                            </button>
                            {formErrors.confirmPassword && (
                              <p className='text-red-400 text-xs mt-1 ml-1'>
                                {formErrors.confirmPassword}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Remember me / Terms */}
                        <div className='flex items-center justify-between text-xs'>
                          {isLogin ? (
                            <>
                              <label className='flex items-center text-gray-700 dark:text-gray-300 cursor-pointer'>
                                <input
                                  type='checkbox'
                                  disabled={isLoading}
                                  className='mr-2 rounded bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/10 text-[#947d61] focus:ring-[#947d61]'
                                />
                                Remember me
                              </label>
                              <a
                                href='#'
                                className='text-[#947d61] hover:text-[#a68970] transition-colors'
                              >
                                Forgot password?
                              </a>
                            </>
                          ) : (
                            <label className='flex items-start gap-3 text-gray-700 dark:text-gray-300 cursor-pointer'>
                              <input
                                type='checkbox'
                                name='agreeToTerms'
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className='mt-0.5 rounded bg-black/[0.04] dark:bg-white/5 border-black/10 dark:border-white/10 text-[#947d61] focus:ring-[#947d61]'
                                required={!isLogin}
                              />
                              <span className='text-xs'>
                                I agree to the{' '}
                                <a
                                  href='#'
                                  className='text-[#947d61] hover:text-[#a68970] transition-colors'
                                >
                                  Terms & Conditions
                                </a>{' '}
                                and{' '}
                                <a
                                  href='#'
                                  className='text-[#947d61] hover:text-[#a68970] transition-colors'
                                >
                                  Privacy Policy
                                </a>
                              </span>
                            </label>
                          )}
                        </div>
                        {formErrors.agreeToTerms && (
                          <p className='text-red-400 text-xs mt-1 ml-1'>
                            {formErrors.agreeToTerms}
                          </p>
                        )}

                        {/* Submit button */}
                        <motion.button
                          type='submit'
                          disabled={isLoading}
                          className='group w-full py-2.5 px-5 text-white text-sm font-semibold rounded-xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                            boxShadow: `0 8px 25px ${brandColor}25`,
                          }}
                          whileHover={
                            !isLoading
                              ? {
                                  scale: 1.02,
                                  boxShadow: `0 12px 35px ${brandColor}35`,
                                }
                              : {}
                          }
                          whileTap={!isLoading ? { scale: 0.98 } : {}}
                          transition={{
                            type: 'spring',
                            stiffness: 400,
                            damping: 17,
                          }}
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
                                <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                              </>
                            )}
                          </div>
                        </motion.button>
                      </motion.form>
                    </AnimatePresence>
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Noise texture */}
        <div
          className='absolute inset-0 opacity-5 pointer-events-none mix-blend-multiply'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          }}
        />
      </div>
    </>
  )
}

export default AuthPage
