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
import { useSignin, useSignup } from '../../hooks/useAuth'

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
  const [isMobile, setIsMobile] = useState(false)

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  // React Query mutations
  const signupMutation = useSignup()
  const signinMutation = useSignin()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  const switchMode = () => {
    setIsLogin(!isLogin)
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreeToTerms: false,
    })
    setFormErrors({})
  }
  const reduxLoading = useSelector((state) => state.user.loading)
  const currentMutation = isLogin ? signinMutation : signupMutation
  const isLoading = reduxLoading || currentMutation.isPending
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
      <div className='min-h-screen bg-black overflow-hidden relative'>
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
              <motion.div
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
              </motion.div>
            )
          })}
        </div>

        {/* Main Content */}
        <div className='relative z-10 min-h-screen flex items-center justify-center px-4 py-8 pt-24'>
          <motion.div
            className='w-full max-w-6xl mx-auto'
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className='bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl shadow-2xl overflow-hidden'>
              <div className='grid lg:grid-cols-2 min-h-[600px]'>
                {/* Left Panel - Hero Content */}
                <motion.div
                  className='relative overflow-hidden bg-gradient-to-br from-gray-900/50 to-black/50 p-8 lg:p-12 flex flex-col justify-center items-center text-center lg:text-left hidden lg:flex'
                  initial={{ x: -50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  <div className='relative z-10 space-y-8'>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.8 }}
                    >
                      <h2 className='text-4xl md:text-5xl font-bold text-white mb-4'>
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
                      <p className='text-gray-300 text-lg leading-relaxed'>
                        Join thousands of designers creating beautiful interiors
                        with AI-powered tools.
                      </p>
                    </motion.div>

                    <motion.div
                      className='space-y-4'
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
                            className='flex items-center gap-3 text-gray-300'
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
                            <span className='text-sm'>{feature.text}</span>
                          </motion.div>
                        )
                      })}
                    </motion.div>
                  </div>
                </motion.div>

                {/* Right Panel - Auth Form */}
                <motion.div
                  className='p-8 lg:p-12 flex flex-col justify-center'
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                >
                  <div className='w-full max-w-md mx-auto'>
                    {/* Header */}
                    <motion.div
                      className='text-center mb-8'
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.6 }}
                    >
                      <h1 className='text-3xl lg:text-4xl font-bold text-white mb-2'>
                        {isLogin ? 'Welcome Back' : 'Create Account'}
                      </h1>
                      <p className='text-gray-400'>
                        {isLogin
                          ? 'Sign in to your account'
                          : 'Join the design revolution'}
                      </p>
                    </motion.div>

                    {/* Error Display */}
                    {error && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className='mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-start gap-3'
                      >
                        <AlertCircle className='w-5 h-5 text-red-400 flex-shrink-0 mt-0.5' />
                        <div className='flex-1'>
                          <p className='text-red-400 text-sm'>
                            {error?.response?.data?.message ||
                              error?.message ||
                              'An error occurred. Please try again.'}
                          </p>
                        </div>
                      </motion.div>
                    )}

                    {/* Toggle Buttons */}
                    <motion.div
                      className='flex bg-white/5 rounded-2xl p-1 mb-8'
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                    >
                      <button
                        type='button'
                        onClick={() => !isLoading && setIsLogin(true)}
                        disabled={isLoading}
                        className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 font-medium text-sm ${
                          isLogin
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
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
                        onClick={() => !isLoading && setIsLogin(false)}
                        disabled={isLoading}
                        className={`flex-1 py-2 px-4 rounded-xl transition-all duration-300 font-medium text-sm ${
                          !isLogin
                            ? 'text-white shadow-lg'
                            : 'text-gray-400 hover:text-gray-300'
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

                    {/* Form */}
                    <AnimatePresence mode='wait'>
                      <motion.form
                        key={isLogin ? 'login' : 'signup'}
                        onSubmit={handleSubmit}
                        className='space-y-6'
                        initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                        transition={{ duration: 0.5 }}
                      >
                        {/* Name fields for signup */}
                        {!isLogin && (
                          <div className='grid grid-cols-2 gap-4'>
                            <div className='relative'>
                              <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                              <input
                                type='text'
                                name='firstName'
                                placeholder='First Name'
                                value={formData.firstName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                                  formErrors.firstName
                                    ? 'border-red-500/50'
                                    : 'border-white/10'
                                } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
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
                              <User className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                              <input
                                type='text'
                                name='lastName'
                                placeholder='Last Name'
                                value={formData.lastName}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                                  formErrors.lastName
                                    ? 'border-red-500/50'
                                    : 'border-white/10'
                                } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
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
                          <Mail className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                          <input
                            type='email'
                            name='email'
                            placeholder='Email'
                            value={formData.email}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full pl-12 pr-4 py-3 bg-white/5 border ${
                              formErrors.email
                                ? 'border-red-500/50'
                                : 'border-white/10'
                            } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
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
                          <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                          <input
                            type={showPassword ? 'text' : 'password'}
                            name='password'
                            placeholder='Password'
                            value={formData.password}
                            onChange={handleInputChange}
                            disabled={isLoading}
                            className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                              formErrors.password
                                ? 'border-red-500/50'
                                : 'border-white/10'
                            } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
                              isLoading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                            required
                          />
                          <button
                            type='button'
                            onClick={() => setShowPassword(!showPassword)}
                            disabled={isLoading}
                            className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'
                          >
                            {showPassword ? (
                              <EyeOff className='w-5 h-5' />
                            ) : (
                              <Eye className='w-5 h-5' />
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
                            <Lock className='absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400' />
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              name='confirmPassword'
                              placeholder='Confirm Password'
                              value={formData.confirmPassword}
                              onChange={handleInputChange}
                              disabled={isLoading}
                              className={`w-full pl-12 pr-12 py-3 bg-white/5 border ${
                                formErrors.confirmPassword
                                  ? 'border-red-500/50'
                                  : 'border-white/10'
                              } rounded-2xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 focus:border-transparent transition-all duration-300 ${
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
                              className='absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors'
                            >
                              {showConfirmPassword ? (
                                <EyeOff className='w-5 h-5' />
                              ) : (
                                <Eye className='w-5 h-5' />
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
                        <div className='flex items-center justify-between text-sm'>
                          {isLogin ? (
                            <>
                              <label className='flex items-center text-gray-300 cursor-pointer'>
                                <input
                                  type='checkbox'
                                  disabled={isLoading}
                                  className='mr-2 rounded bg-white/5 border-white/10 text-[#947d61] focus:ring-[#947d61]'
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
                            <label className='flex items-start gap-3 text-gray-300 cursor-pointer'>
                              <input
                                type='checkbox'
                                name='agreeToTerms'
                                checked={formData.agreeToTerms}
                                onChange={handleInputChange}
                                disabled={isLoading}
                                className='mt-0.5 rounded bg-white/5 border-white/10 text-[#947d61] focus:ring-[#947d61]'
                                required={!isLogin}
                              />
                              <span className='text-sm'>
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
                          className='group w-full py-3 px-6 text-white font-semibold rounded-2xl relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed'
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
                                <Loader2 className='w-5 h-5 animate-spin' />
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
                                <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
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
