import {
  Briefcase,
  ChevronLeft,
  ChevronRight,
  Heart,
  Palette,
  Settings,
  User,
  X,
} from 'lucide-react'
import React, { useState } from 'react'

// Reusable Components
const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  className = '',
  error = '',
}) => (
  <div className='space-y-1'>
    <label className='block text-sm font-medium text-gray-700'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className={`w-full h-8 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors ${
        error
          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
          : 'border-gray-300 focus:ring-amber-800/20 focus:border-amber-800'
      } ${className}`}
    />
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
  </div>
)

const FormSelect = ({
  label,
  value,
  onChange,
  options,
  required = false,
  placeholder = 'Select...',
  error = '',
}) => (
  <div className='space-y-1'>
    <label className='block text-sm font-medium text-gray-700'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full h-8 px-3 border rounded-md focus:outline-none focus:ring-2 transition-colors bg-white ${
        error
          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
          : 'border-gray-300 focus:ring-amber-800/20 focus:border-amber-800'
      }`}
    >
      <option value=''>{placeholder}</option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
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
  <div className='space-y-1'>
    <label className='block text-sm font-medium text-gray-700'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 transition-colors resize-none ${
        error
          ? 'border-red-500 focus:ring-red-500/20 focus:border-red-500'
          : 'border-gray-300 focus:ring-amber-800/20 focus:border-amber-800'
      }`}
    />
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
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
  <div className='space-y-2'>
    <label className='block text-sm font-medium text-gray-700'>
      {label} {required && <span className='text-red-500'>*</span>}
      {minSelection > 0 && (
        <span className='text-xs text-gray-500 ml-1'>
          (Select at least {minSelection})
        </span>
      )}
    </label>
    <div className='grid grid-cols-2 gap-2'>
      {options.map((option) => (
        <label
          key={option.value}
          className='flex items-center space-x-2 cursor-pointer'
        >
          <input
            type='checkbox'
            checked={values.includes(option.value)}
            onChange={(e) => {
              if (e.target.checked) {
                onChange([...values, option.value])
              } else {
                onChange(values.filter((v) => v !== option.value))
              }
            }}
            className='h-4 w-4 text-amber-800 border-gray-300 rounded focus:ring-amber-800/20'
          />
          <span className='text-sm text-gray-700'>{option.label}</span>
        </label>
      ))}
    </div>
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
  </div>
)

const FormRadioGroup = ({
  label,
  options,
  value,
  onChange,
  required = false,
  error = '',
}) => (
  <div className='space-y-2'>
    <label className='block text-sm font-medium text-gray-700'>
      {label} {required && <span className='text-red-500'>*</span>}
    </label>
    <div className='space-y-2'>
      {options.map((option) => (
        <label
          key={option.value}
          className='flex items-center space-x-2 cursor-pointer'
        >
          <input
            type='radio'
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
            className='h-4 w-4 text-amber-800 border-gray-300 focus:ring-amber-800/20'
          />
          <span className='text-sm text-gray-700'>{option.label}</span>
        </label>
      ))}
    </div>
    {error && <p className='text-xs text-red-500 mt-1'>{error}</p>}
  </div>
)

const AvatarOnboardingPopup = ({ isOpen, onClose, onSubmit }) => {
  const [currentStep, setCurrentStep] = useState(1)
  const [errors, setErrors] = useState({})
  const [formData, setFormData] = useState({
    // Step 1: Basic Info
    name: '',
    pronouns: '',
    householdSize: '',
    hasChildren: '',
    hasElders: '',
    hasPets: '',

    // Step 2: Work & Lifestyle
    workFromHome: '',
    hoursAtHome: '',
    hobbies: [],
    lifestylePriorities: '',

    // Step 3: Preferences & Accessibility
    allergies: '',
    texturePreferences: '',
    acousticNeeds: '',
    footwearCulture: '',

    // Step 4: Style & Aesthetics
    stylePreferences: [],
    referenceLinks: '',
    antiReference: '',
    favoredColors: '',
    noGoColors: '',
    metalFinishes: '',

    // Step 5: Practical Needs
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
    // Clear error when user starts typing/selecting
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  // Validation functions for each step
  const validateStep = (step) => {
    const newErrors = {}

    switch (step) {
      case 1:
        if (!formData.name.trim()) {
          newErrors.name = 'Name is required'
        }
        if (!formData.householdSize) {
          newErrors.householdSize = 'Please select household size'
        }
        break

      case 2:
        if (!formData.workFromHome) {
          newErrors.workFromHome = 'Please select your work from home status'
        }
        break

      case 4:
        if (formData.stylePreferences.length < 3) {
          newErrors.stylePreferences =
            'Please select at least 3 style preferences'
        }
        if (formData.stylePreferences.length > 5) {
          newErrors.stylePreferences =
            'Please select no more than 5 style preferences'
        }
        break

      case 5:
        if (!formData.budgetRange) {
          newErrors.budgetRange = 'Budget range is required'
        }
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const steps = [
    { id: 1, title: 'Basic Info', icon: User },
    { id: 2, title: 'Lifestyle', icon: Briefcase },
    { id: 3, title: 'Preferences', icon: Heart },
    { id: 4, title: 'Style', icon: Palette },
    { id: 5, title: 'Practical', icon: Settings },
  ]

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1)
      }
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      // Clear errors when going back
      setErrors({})
    }
  }

  const handleSubmit = () => {
    if (validateStep(currentStep)) {
      onSubmit(formData)
      onClose()
    }
  }

  if (!isOpen) return null

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className='space-y-4'>
            <FormInput
              label='Full Name'
              value={formData.name}
              onChange={(value) => updateFormData('name', value)}
              placeholder='Enter your full name'
              required
              error={errors.name}
            />

            <FormSelect
              label='Pronouns'
              value={formData.pronouns}
              onChange={(value) => updateFormData('pronouns', value)}
              options={[
                { value: 'he/him', label: 'He/Him' },
                { value: 'she/her', label: 'She/Her' },
                { value: 'they/them', label: 'They/Them' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' },
              ]}
              error={errors.pronouns}
            />

            <FormSelect
              label='Household Size'
              value={formData.householdSize}
              onChange={(value) => updateFormData('householdSize', value)}
              options={[
                { value: '1', label: '1 person' },
                { value: '2', label: '2 people' },
                { value: '3-4', label: '3-4 people' },
                { value: '5+', label: '5+ people' },
              ]}
              required
              error={errors.householdSize}
            />

            <div className='grid grid-cols-3 gap-4'>
              <FormSelect
                label='Children'
                value={formData.hasChildren}
                onChange={(value) => updateFormData('hasChildren', value)}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                error={errors.hasChildren}
              />

              <FormSelect
                label='Elders'
                value={formData.hasElders}
                onChange={(value) => updateFormData('hasElders', value)}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                error={errors.hasElders}
              />

              <FormSelect
                label='Pets'
                value={formData.hasPets}
                onChange={(value) => updateFormData('hasPets', value)}
                options={[
                  { value: 'yes', label: 'Yes' },
                  { value: 'no', label: 'No' },
                ]}
                error={errors.hasPets}
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className='space-y-4'>
            <FormRadioGroup
              label='Do you work from home?'
              value={formData.workFromHome}
              onChange={(value) => updateFormData('workFromHome', value)}
              options={[
                { value: 'full-time', label: 'Full-time' },
                { value: 'part-time', label: 'Part-time' },
                { value: 'occasionally', label: 'Occasionally' },
                { value: 'never', label: 'Never' },
              ]}
              required
              error={errors.workFromHome}
            />

            <FormSelect
              label='Hours at home daily'
              value={formData.hoursAtHome}
              onChange={(value) => updateFormData('hoursAtHome', value)}
              options={[
                { value: '0-4', label: '0-4 hours' },
                { value: '4-8', label: '4-8 hours' },
                { value: '8-12', label: '8-12 hours' },
                { value: '12+', label: '12+ hours' },
              ]}
              error={errors.hoursAtHome}
            />

            <FormCheckboxGroup
              label='Hobbies & Activities'
              options={[
                { value: 'hosting', label: 'Hosting' },
                { value: 'gaming', label: 'Gaming' },
                { value: 'music', label: 'Music' },
                { value: 'cooking', label: 'Cooking' },
                { value: 'yoga', label: 'Yoga/Exercise' },
                { value: 'reading', label: 'Reading' },
                { value: 'crafts', label: 'Arts/Crafts' },
                { value: 'gardening', label: 'Gardening' },
              ]}
              values={formData.hobbies}
              onChange={(value) => updateFormData('hobbies', value)}
              error={errors.hobbies}
            />

            <FormRadioGroup
              label='Lifestyle Priorities'
              value={formData.lifestylePriorities}
              onChange={(value) => updateFormData('lifestylePriorities', value)}
              options={[
                { value: 'durability', label: 'Durability over luxury' },
                { value: 'luxury', label: 'Luxury over durability' },
                { value: 'low-maintenance', label: 'Low-maintenance' },
                { value: 'statement', label: 'Statement pieces' },
                { value: 'sustainability', label: 'Sustainability focused' },
              ]}
              error={errors.lifestylePriorities}
            />
          </div>
        )

      case 3:
        return (
          <div className='space-y-4'>
            <FormInput
              label='Allergies or Sensitivities'
              value={formData.allergies}
              onChange={(value) => updateFormData('allergies', value)}
              placeholder='e.g., dust, certain fabrics, fragrances'
            />

            <FormTextarea
              label='Texture Preferences'
              value={formData.texturePreferences}
              onChange={(value) => updateFormData('texturePreferences', value)}
              placeholder='Textures you love or avoid (e.g., velvet, rough woods, smooth surfaces)'
              rows={2}
            />

            <FormRadioGroup
              label='Acoustic & Privacy Needs'
              value={formData.acousticNeeds}
              onChange={(value) => updateFormData('acousticNeeds', value)}
              options={[
                { value: 'quiet', label: 'Need quiet spaces' },
                { value: 'moderate', label: 'Moderate noise okay' },
                { value: 'open', label: 'Open and social' },
                { value: 'sound-absorption', label: 'Need sound absorption' },
              ]}
            />

            <FormRadioGroup
              label='Footwear Culture'
              value={formData.footwearCulture}
              onChange={(value) => updateFormData('footwearCulture', value)}
              options={[
                { value: 'barefoot', label: 'Barefoot household' },
                { value: 'slippers', label: 'Slippers/socks' },
                { value: 'shoes-okay', label: 'Shoes okay indoors' },
                { value: 'mixed', label: 'Mixed preferences' },
              ]}
            />
          </div>
        )

      case 4:
        return (
          <div className='space-y-4'>
            <FormCheckboxGroup
              label='Style Preferences'
              options={[
                { value: 'japandi', label: 'Japandi' },
                { value: 'mid-century', label: 'Mid-Century Modern' },
                { value: 'minimal', label: 'Minimal' },
                { value: 'scandinavian', label: 'Scandinavian' },
                { value: 'industrial', label: 'Industrial' },
                { value: 'boho', label: 'Bohemian' },
                { value: 'traditional', label: 'Traditional' },
                { value: 'contemporary', label: 'Contemporary' },
                { value: 'rustic', label: 'Rustic/Farmhouse' },
                { value: 'maximalist', label: 'Maximalist' },
              ]}
              values={formData.stylePreferences}
              onChange={(value) => updateFormData('stylePreferences', value)}
              required
              minSelection={3}
              error={errors.stylePreferences}
            />

            <FormTextarea
              label='Reference Links'
              value={formData.referenceLinks}
              onChange={(value) => updateFormData('referenceLinks', value)}
              placeholder='Paste 3 inspiration links (Pinterest, Instagram, etc.)'
              rows={2}
              error={errors.referenceLinks}
            />

            <FormInput
              label='Anti-Reference'
              value={formData.antiReference}
              onChange={(value) => updateFormData('antiReference', value)}
              placeholder="Link or description of what you DON'T want"
              error={errors.antiReference}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormInput
                label='Favored Colors'
                value={formData.favoredColors}
                onChange={(value) => updateFormData('favoredColors', value)}
                placeholder='e.g., earth tones, blues'
                error={errors.favoredColors}
              />

              <FormInput
                label='No-Go Colors'
                value={formData.noGoColors}
                onChange={(value) => updateFormData('noGoColors', value)}
                placeholder='e.g., bright orange, neon'
                error={errors.noGoColors}
              />
            </div>

            <FormSelect
              label='Preferred Metal Finishes'
              value={formData.metalFinishes}
              onChange={(value) => updateFormData('metalFinishes', value)}
              options={[
                { value: 'brass', label: 'Brass/Gold' },
                { value: 'chrome', label: 'Chrome/Silver' },
                { value: 'black', label: 'Matte Black' },
                { value: 'copper', label: 'Copper/Rose Gold' },
                { value: 'mixed', label: 'Mixed metals okay' },
              ]}
              error={errors.metalFinishes}
            />
          </div>
        )

      case 5:
        return (
          <div className='space-y-4'>
            <FormTextarea
              label='Storage Pain Points'
              value={formData.storagePainPoints}
              onChange={(value) => updateFormData('storagePainPoints', value)}
              placeholder='What constantly clutters your space? (e.g., papers, toys, clothes)'
              rows={2}
              error={errors.storagePainPoints}
            />

            <FormRadioGroup
              label='Smart Home Preference'
              value={formData.smartHomePreference}
              onChange={(value) => updateFormData('smartHomePreference', value)}
              options={[
                { value: 'yes-advanced', label: 'Yes, I love tech' },
                { value: 'yes-basic', label: 'Yes, but keep it simple' },
                { value: 'maybe', label: 'Open to suggestions' },
                { value: 'no', label: 'Prefer traditional' },
              ]}
              error={errors.smartHomePreference}
            />

            <FormInput
              label='AV/Tech Requirements'
              value={formData.avRequirements}
              onChange={(value) => updateFormData('avRequirements', value)}
              placeholder='TV size, sound system, gaming setup, etc.'
              error={errors.avRequirements}
            />

            <div className='grid grid-cols-2 gap-4'>
              <FormSelect
                label='Budget Range'
                value={formData.budgetRange}
                onChange={(value) => updateFormData('budgetRange', value)}
                options={[
                  { value: 'under-5k', label: 'Under $5K' },
                  { value: '5k-15k', label: '$5K - $15K' },
                  { value: '15k-30k', label: '$15K - $30K' },
                  { value: '30k-50k', label: '$30K - $50K' },
                  { value: '50k+', label: '$50K+' },
                ]}
                required
                error={errors.budgetRange}
              />

              <FormSelect
                label='Timeline'
                value={formData.timeline}
                onChange={(value) => updateFormData('timeline', value)}
                options={[
                  { value: 'asap', label: 'ASAP' },
                  { value: '1-3months', label: '1-3 months' },
                  { value: '3-6months', label: '3-6 months' },
                  { value: '6+months', label: '6+ months' },
                  { value: 'flexible', label: 'Flexible' },
                ]}
                error={errors.timeline}
              />
            </div>

            <FormRadioGroup
              label='Decision Making Style'
              value={formData.decisionStyle}
              onChange={(value) => updateFormData('decisionStyle', value)}
              options={[
                {
                  value: 'fast-iterations',
                  label: 'Fast iterations, quick decisions',
                },
                { value: 'thorough-options', label: 'Want to see all options' },
                {
                  value: 'collaborative',
                  label: 'Collaborative decision making',
                },
                {
                  value: 'need-approval',
                  label: 'Need partner/family approval',
                },
              ]}
              error={errors.decisionStyle}
            />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-3xl h-[700px] flex flex-col'>
        {/* Header */}
        <div className='bg-gradient-to-r from-[#7a654f] to-[#61503f] text-white p-6 rounded-t-2xl'>
          <div className='flex items-center justify-between mb-4'>
            <h2 className='text-2xl font-bold'>Manāra's Avatar</h2>
            <button
              onClick={onClose}
              className='p-2 hover:bg-white/10 rounded-full transition-colors'
            >
              <X size={20} />
            </button>
          </div>

          {/* Progress Steps */}
          <div className='flex items-center justify-between'>
            {steps.map((step, index) => {
              const Icon = step.icon
              const isActive = currentStep === step.id
              const isCompleted = currentStep > step.id

              return (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive
                        ? 'bg-white text-amber-800 border-white'
                        : isCompleted
                        ? 'bg-amber-200 text-amber-800 border-amber-200'
                        : 'border-white/50 text-white/70'
                    }`}
                  >
                    <Icon size={16} />
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`w-12 h-0.5 mx-2 transition-colors ${
                        isCompleted ? 'bg-amber-200' : 'bg-white/30'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>

          <div className='mt-3'>
            <p className='text-white/90 text-sm'>
              {steps[currentStep - 1].title}
            </p>
            <div className='w-full bg-white/20 rounded-full h-1 mt-2'>
              <div
                className='bg-white h-1 rounded-full transition-all duration-300'
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className='flex-1 p-6 overflow-y-auto'>{renderStep()}</div>

        {/* Footer */}
        <div className='p-6 border-t bg-gray-50 rounded-b-2xl'>
          <div className='flex justify-between'>
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className='flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors'
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                className='bg-gradient-to-r from-[#7a654f] to-[#61503f] text-white px-6 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2'
              >
                <span>Complete Setup</span>
              </button>
            ) : (
              <button
                onClick={handleNext}
                className='bg-gradient-to-r from-[#7a654f] to-[#61503f] text-white px-4 py-2 rounded-lg hover:shadow-lg transition-all duration-200 flex items-center space-x-2'
              >
                <span>Next</span>
                <ChevronRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AvatarOnboardingPopup
