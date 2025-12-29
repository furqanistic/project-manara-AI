import { Button } from '@/components/ui/button'
import { updateProfile } from '@/redux/userSlice'
import { authService } from '@/services/authService'
import { AnimatePresence, motion } from 'framer-motion'
import {
    AlertCircle,
    Briefcase,
    Check,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    Heart,
    Palette,
    Settings,
    User,
    X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'

// Reusable Modern Form Components
const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  error = '',
}) => (
  <div className='space-y-2'>
    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
      {label} {required && <span className='text-[#937c60]'>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full bg-gray-50/50 border rounded-xl py-3 px-4 outline-none transition-all duration-300 focus:bg-white ${
        error 
          ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/5' 
          : 'border-gray-100 focus:border-[#937c60] focus:ring-4 focus:ring-[#937c60]/5'
      }`}
    />
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className='text-[10px] text-red-500 font-semibold mt-1 uppercase flex items-center gap-1'>
        <AlertCircle size={10} /> {error}
      </motion.p>
    )}
  </div>
)

const FormSelect = ({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select an option',
  error = '',
}) => (
  <div className='space-y-2'>
    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
      {label} {required && <span className='text-[#937c60]'>*</span>}
    </label>
    <div className='relative'>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full bg-gray-50/50 border rounded-xl py-3 px-4 outline-none appearance-none transition-all duration-300 focus:bg-white ${
          error 
            ? 'border-red-300 focus:border-red-500' 
            : 'border-gray-100 focus:border-[#937c60]'
        }`}
      >
        <option value='' disabled className='text-gray-400'>{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className='absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400'>
        <ChevronDown size={16} />
      </div>
    </div>
    {error && (
      <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }} className='text-[10px] text-red-500 font-semibold mt-1 uppercase flex items-center gap-1'>
        <AlertCircle size={10} /> {error}
      </motion.p>
    )}
  </div>
)

const ChevronDown = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
)

const FormRadioGroup = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error = '',
}) => (
  <div className='space-y-3'>
    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
      {label} {required && <span className='text-[#937c60]'>*</span>}
    </label>
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
      {options.map((option) => {
        const isSelected = value === option.value
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => onChange(option.value)}
            className={`flex items-center justify-between p-4 rounded-2xl border-2 transition-all duration-300 text-left ${
              isSelected 
                ? 'border-[#937c60] bg-[#937c60]/5 text-[#937c60]' 
                : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <span className='text-sm font-medium'>{option.label}</span>
            {isSelected && <Check size={16} />}
          </button>
        )
      })}
    </div>
    {error && (
      <p className='text-[10px] text-red-500 font-semibold mt-1 uppercase flex items-center gap-1'>
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
)

const FormCheckboxGroup = ({
  label,
  options,
  values,
  onChange,
  required = false,
  error = '',
  minSelection = 0,
}) => (
  <div className='space-y-3'>
    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
      {label} {required && <span className='text-[#937c60]'>*</span>}
      {minSelection > 0 && (
        <span className='lowercase font-normal normal-case opacity-60 ml-2'>(Pick {minSelection}+)</span>
      )}
    </label>
    <div className='grid grid-cols-2 gap-3'>
      {options.map((option) => {
        const isSelected = values.includes(option.value)
        return (
          <button
            key={option.value}
            type='button'
            onClick={() => {
              if (isSelected) {
                onChange(values.filter((v) => v !== option.value))
              } else {
                onChange([...values, option.value])
              }
            }}
            className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 text-left ${
              isSelected 
                ? 'border-[#937c60] bg-[#937c60]/5 text-[#937c60]' 
                : 'border-gray-50 bg-gray-50/50 text-gray-600 hover:border-gray-200 hover:bg-white'
            }`}
          >
            <span className='text-xs font-medium'>{option.label}</span>
            {isSelected && <Check size={14} />}
          </button>
        )
      })}
    </div>
    {error && (
      <p className='text-[10px] text-red-500 font-semibold mt-1 uppercase flex items-center gap-1'>
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
)

const FormTextarea = ({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 3,
  error = '',
}) => (
  <div className='space-y-2'>
    <label className='block text-xs font-semibold text-gray-400 uppercase tracking-widest'>
      {label} {required && <span className='text-[#937c60]'>*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full bg-gray-50/50 border rounded-2xl py-3 px-4 outline-none transition-all duration-300 resize-none focus:bg-white ${
        error 
          ? 'border-red-300 focus:border-red-500' 
          : 'border-gray-100 focus:border-[#937c60]'
      }`}
    />
    {error && (
      <p className='text-[10px] text-red-500 font-semibold mt-1 uppercase flex items-center gap-1'>
        <AlertCircle size={10} /> {error}
      </p>
    )}
  </div>
)

const AvatarOnboardingPopup = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [errors, setErrors] = useState({})
  const dispatch = useDispatch()
  
  const [formData, setFormData] = useState({
    name: '',
    pronouns: '',
    householdSize: '',
    hasChildren: '',
    hasElders: '',
    hasPets: '',
    workFromHome: '',
    hoursAtHome: '',
    hobbies: [],
    lifestylePriorities: '',
    allergies: '',
    texturePreferences: '',
    acousticNeeds: '',
    footwearCulture: '',
    stylePreferences: [],
    referenceLinks: '',
    antiReference: '',
    favoredColors: '',
    noGoColors: '',
    metalFinishes: '',
    storagePainPoints: '',
    smartHomePreference: '',
    avRequirements: '',
    budgetRange: '',
    timeline: '',
    decisionStyle: '',
  })

  const totalSteps = 5

  const updateFormData = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  const validateStep = (step) => {
    const newErrors = {}
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Full name is required'
      if (!formData.householdSize) newErrors.householdSize = 'Required'
    } else if (step === 2) {
      if (!formData.workFromHome) newErrors.workFromHome = 'Required'
    } else if (step === 4) {
      if (formData.stylePreferences.length < 3) newErrors.stylePreferences = 'Select at least 3'
    } else if (step === 5) {
      if (!formData.budgetRange) newErrors.budgetRange = 'Required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps))
    }
  }

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1))
    setErrors({})
  }

  const handleFinalSubmit = async () => {
    if (!validateStep(currentStep)) return
    
    setIsSubmitting(true)
    try {
      const response = await authService.completeOnboarding(formData)
      if (response.status === 'success') {
        setIsSuccess(true)
        // Update local state to prevent showing popup again immediately
        dispatch(updateProfile(response.data.user))
        
        setTimeout(() => {
          if (onSubmit) onSubmit(formData)
          onClose()
          setIsSuccess(false)
          setCurrentStep(1)
        }, 2000)
      }
    } catch (error) {
      console.error('Onboarding failed:', error)
      setErrors({ global: 'Something went wrong. Please try again.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const steps = [
    { id: 1, title: 'Foundations', icon: User },
    { id: 2, title: 'Lifestyle', icon: Briefcase },
    { id: 3, title: 'Comfort', icon: Heart },
    { id: 4, title: 'Aesthetic', icon: Palette },
    { id: 5, title: 'Vision', icon: Settings },
  ]

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className='fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md'>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className='bg-white shadow-[0_40px_120px_rgba(0,0,0,0.15)] rounded-[32px] w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]'
        >
          {isSuccess ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }} 
              animate={{ opacity: 1, scale: 1 }} 
              className='h-[600px] flex flex-col items-center justify-center text-center p-12 bg-gradient-to-b from-white to-gray-50'
            >
              <div className='relative'>
                <div className='absolute inset-0 bg-green-500/20 blur-3xl rounded-full animate-pulse' />
                <div className='relative w-24 h-24 bg-white rounded-full shadow-2xl flex items-center justify-center mb-8 border-4 border-green-50'>
                  <CheckCircle2 size={48} className='text-green-500' />
                </div>
              </div>
              <h2 className='text-4xl font-bold text-gray-900 mb-4 tracking-tight'>Success!</h2>
              <p className='text-gray-500 max-w-xs text-lg'>Your design persona is now synchronized. Redirecting to your dashboard...</p>
            </motion.div>
          ) : (
            <>
              {/* Header */}
              <div className='px-10 pt-10 pb-6 border-b border-gray-50'>
                <div className='flex items-center justify-between mb-8'>
                  <div>
                    <span className='text-[10px] font-bold tracking-[0.3em] text-[#937c60] uppercase block mb-1 opacity-70'>
                      Phase {currentStep}
                    </span>
                    <h2 className='text-2xl font-bold text-gray-900 tracking-tight'>
                      {steps[currentStep-1].title}
                    </h2>
                  </div>
                  <button 
                    onClick={onClose} 
                    className='p-2 hover:bg-gray-50 rounded-xl transition-all active:scale-95 group'
                  >
                    <X size={20} className='text-gray-400 group-hover:text-gray-900 transition-colors' />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className='flex gap-1'>
                  {steps.map((step) => (
                    <div 
                      key={step.id} 
                      className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                        step.id <= currentStep 
                          ? 'bg-[#937c60]' 
                          : 'bg-gray-100'
                      }`}
                    />
                  ))}
                </div>
              </div>

              {/* Content area */}
              <div className='flex-1 px-10 overflow-y-auto no-scrollbar py-8'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className='space-y-8 pb-4'
                  >
                    {currentStep === 1 && (
                      <div className='space-y-6'>
                        <FormInput
                          label='What should we call you?'
                          value={formData.name}
                          onChange={(v) => updateFormData('name', v)}
                          placeholder='Full Name'
                          required
                          error={errors.name}
                        />
                        <FormSelect
                          label='Your Household'
                          value={formData.householdSize}
                          onChange={(v) => updateFormData('householdSize', v)}
                          options={[
                            { value: '1', label: 'Living Solo' },
                            { value: '2', label: 'Living with Partner' },
                            { value: '3-4', label: 'Small Family (3-4)' },
                            { value: '5+', label: 'Large Family (5+)' },
                          ]}
                          required
                          error={errors.householdSize}
                        />
                        <div className='grid grid-cols-3 gap-4'>
                          <FormSelect
                            label='Children'
                            value={formData.hasChildren}
                            onChange={(v) => updateFormData('hasChildren', v)}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                          />
                          <FormSelect
                            label='Elders'
                            value={formData.hasElders}
                            onChange={(v) => updateFormData('hasElders', v)}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                          />
                          <FormSelect
                            label='Pets'
                            value={formData.hasPets}
                            onChange={(v) => updateFormData('hasPets', v)}
                            options={[{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }]}
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 2 && (
                      <div className='space-y-8'>
                        <FormRadioGroup
                          label='Work from home status'
                          value={formData.workFromHome}
                          onChange={(v) => updateFormData('workFromHome', v)}
                          options={[
                            { value: 'full-time', label: 'Full-time' },
                            { value: 'part-time', label: 'Part-time' },
                            { value: 'never', label: 'Office-based' },
                          ]}
                          required
                          error={errors.workFromHome}
                        />
                        <FormCheckboxGroup
                          label='Top Hobbies'
                          options={[
                            { value: 'hosting', label: 'Hosting/Dinner' },
                            { value: 'gaming', label: 'Gaming Space' },
                            { value: 'cooking', label: 'Culinary' },
                            { value: 'fitness', label: 'Stretching/Fitness' },
                            { value: 'reading', label: 'Reading Nooks' },
                            { value: 'art', label: 'Creative/Art' },
                          ]}
                          values={formData.hobbies}
                          onChange={(v) => updateFormData('hobbies', v)}
                        />
                      </div>
                    )}

                    {currentStep === 3 && (
                      <div className='space-y-6'>
                        <FormTextarea
                          label='Texture & Material Preference'
                          value={formData.texturePreferences}
                          onChange={(v) => updateFormData('texturePreferences', v)}
                          placeholder='e.g. linen, soft velour, natural stones'
                          rows={2}
                        />
                        <FormRadioGroup
                          label='Acoustic Environment'
                          value={formData.acousticNeeds}
                          onChange={(v) => updateFormData('acousticNeeds', v)}
                          options={[
                            { value: 'quiet', label: 'Ultra-quiet silence' },
                            { value: 'social', label: 'Open & lively' },
                          ]}
                        />
                        <FormRadioGroup
                          label='Home Footwear'
                          value={formData.footwearCulture}
                          onChange={(v) => updateFormData('footwearCulture', v)}
                          options={[
                            { value: 'barefoot', label: 'Barefoot only' },
                            { value: 'slippers', label: 'Slippers/House shoes' },
                          ]}
                        />
                      </div>
                    )}

                    {currentStep === 4 && (
                      <div className='space-y-8'>
                        <FormCheckboxGroup
                          label='Design Languages'
                          options={[
                            { value: 'japandi', label: 'Japandi' },
                            { value: 'mcm', label: 'Mid-Century Modern' },
                            { value: 'minimal', label: 'Minimalist' },
                            { value: 'industrial', label: 'Industrial' },
                            { value: 'boho', label: 'Bohemian' },
                            { value: 'vintage', label: 'Vintage/Traditional' },
                            { value: 'desert', label: 'Modern Desert' },
                            { value: 'mediterranean', label: 'Mediterranean' },
                          ]}
                          values={formData.stylePreferences}
                          onChange={(v) => updateFormData('stylePreferences', v)}
                          required
                          minSelection={3}
                          error={errors.stylePreferences}
                        />
                        <div className='grid grid-cols-2 gap-4'>
                          <FormInput
                            label='Loves'
                            value={formData.favoredColors}
                            onChange={(v) => updateFormData('favoredColors', v)}
                            placeholder='Neutral, Sage...'
                          />
                          <FormInput
                            label='Avoids'
                            value={formData.noGoColors}
                            onChange={(v) => updateFormData('noGoColors', v)}
                            placeholder='Neon, Black...'
                          />
                        </div>
                      </div>
                    )}

                    {currentStep === 5 && (
                      <div className='space-y-8'>
                        <FormSelect
                          label='Investment Level'
                          value={formData.budgetRange}
                          onChange={(v) => updateFormData('budgetRange', v)}
                          options={[
                            { value: 'essentials', label: 'Budget Focused' },
                            { value: 'balanced', label: 'Mid-range Balance' },
                            { value: 'luxury', label: 'Premium/High-end' },
                          ]}
                          required
                          error={errors.budgetRange}
                        />
                        <FormRadioGroup
                          label='Timeline'
                          value={formData.timeline}
                          onChange={(v) => updateFormData('timeline', v)}
                          options={[
                            { value: 'fast', label: 'ASAP Transformation' },
                            { value: 'planned', label: '1-3 Months Phase' },
                            { value: 'flexible', label: 'No strict deadline' },
                          ]}
                        />
                        <FormTextarea
                          label='Final Vision Words'
                          value={formData.storagePainPoints}
                          onChange={(v) => updateFormData('storagePainPoints', v)}
                          placeholder='Any specific storage or feature requests?'
                          rows={2}
                        />
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className='px-10 py-8 border-t bg-gray-50/50 relative z-10'>
                <div className='flex items-center justify-between'>
                  <button
                    onClick={handlePrevious}
                    disabled={currentStep === 1 || isSubmitting}
                    className='group flex items-center gap-2 text-[10px] font-bold tracking-widest text-gray-400 hover:text-gray-900 disabled:opacity-0 transition-all uppercase px-2 py-1'
                  >
                    <ChevronLeft size={14} className='group-hover:-translate-x-1 transition-transform' />
                    Back
                  </button>

                  <div className='flex gap-4'>
                    {currentStep < totalSteps ? (
                      <Button
                        onClick={handleNext}
                        className='bg-gray-900 hover:bg-black text-white px-8 py-6 rounded-2xl flex items-center gap-2 text-sm font-semibold transition-all active:scale-95'
                      >
                        Continue
                        <ChevronRight size={16} />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleFinalSubmit}
                        disabled={isSubmitting}
                        className='bg-[#937c60] hover:bg-[#a68d6f] text-white px-10 py-6 rounded-2xl flex items-center gap-2 text-sm font-semibold transition-all active:scale-95 disabled:opacity-50'
                      >
                        {isSubmitting ? (
                          <div className='flex items-center gap-2'>
                            <div className='w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin' />
                            <span>Syncing...</span>
                          </div>
                        ) : (
                          <>
                            <span>Finalize Profile</span>
                            <CheckCircle2 size={16} />
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
                {errors.global && (
                  <p className='text-center text-red-500 text-xs mt-4 font-semibold uppercase'>
                    {errors.global}
                  </p>
                )}
              </div>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default AvatarOnboardingPopup
