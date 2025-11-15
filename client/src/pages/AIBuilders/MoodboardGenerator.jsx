// File: client/src/pages/AIBuilders/MoodboardGenerator.jsx
import TopBar from '@/components/Layout/Topbar'
import {
  useCreateMoodboard,
  useGenerateMoodboard,
  useGenerateMoodboardDescriptions,
} from '@/hooks/useMoodboard'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ChefHat,
  Download,
  Edit3,
  FileText,
  Home,
  Layers,
  Lightbulb,
  Maximize2,
  RefreshCw,
  Sofa,
  Sparkles,
  Utensils,
  Wand2,
  X,
} from 'lucide-react'
import React, { useState } from 'react'
import { toast } from 'react-hot-toast'
import {
  BRAND_COLOR,
  BRAND_COLOR_DARK,
  BRAND_COLOR_LIGHT,
  COLOR_PALETTES,
  DESIGN_STYLES,
  SPACE_TYPES,
  getColorDescriptionForPalette,
} from '../../components/Moodboard/Moodboardconfig.js'
import BeautifulLoader from '@/components/Moodboard/BeautifulLoader.jsx'
import { StepSpace } from '@/components/Moodboard/StepSpace.jsx'

const MoodboardGenerator = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedSpace, setSelectedSpace] = useState('Living Room')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('Neutral Tones')
  const [changes, setChanges] = useState('')
  const [currentMoodboard, setCurrentMoodboard] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [loadingState, setLoadingState] = useState(null)
  const [progressSteps, setProgressSteps] = useState([])
  const [generationPhase, setGenerationPhase] = useState(null) // 'image' or 'descriptions'
  const createMutation = useCreateMoodboard()
  const generateMutation = useGenerateMoodboard()
  const generateDescriptionsMutation = useGenerateMoodboardDescriptions()

  const handleGenerate = async () => {
    if (!changes.trim()) {
      toast.error('Please describe your design requirements')
      return
    }

    try {
      // ========== PHASE 1: Generate Image (Fast) ==========
      setLoadingState('generating')
      setGenerationPhase('image')
      setProgressSteps(['Creating moodboard draft'])

      const spaceValue =
        SPACE_TYPES.find((s) => s.name === selectedSpace)?.value ||
        'living_room'
      const styleValue =
        DESIGN_STYLES.find((s) => s.label === selectedStyle)?.value || 'modern'

      const colorDescription = getColorDescriptionForPalette(selectedColor)

      const createPayload = {
        title: `${selectedStyle || 'Modern'} ${selectedSpace}`,
        style: styleValue,
        roomType: spaceValue,
        colorPreferences: [selectedColor],
        customPrompt: changes.trim(),
        layout: 'collage',
        imageCount: 1,
        // Let AI choose aspect ratio naturally
      }

      const createResult = await createMutation.mutateAsync(createPayload)
      const moodboardId = createResult.data.moodboard._id

      setProgressSteps(['Moodboard created', 'Generating image...'])

      const enhancedCustomPrompt = `${changes.trim()}. Color scheme: ${colorDescription}`

      const generatePayload = {
        customPrompt: enhancedCustomPrompt,
        imageCount: 1,
        // Let AI choose aspect ratio naturally
      }

      // Generate image (Phase 1)
      const generateResult = await generateMutation.mutateAsync({
        moodboardId,
        data: generatePayload,
      })

      // Image is ready! Show it to the user
      setCurrentMoodboard(generateResult.data.moodboard)
      setProgressSteps(['Image generated', 'Colors extracted', 'Image ready!'])
      setLoadingState(null)
      setGenerationPhase(null)
      toast.success('Moodboard image ready! Generating details...')
      setCurrentStep(3)

      // ========== PHASE 2: Generate Descriptions (Background) ==========
      // Start Phase 2 immediately but don't block the UI
      setGenerationPhase('descriptions')

      try {
        const descriptionsResult =
          await generateDescriptionsMutation.mutateAsync(moodboardId)

        // Update moodboard with all descriptions
        setCurrentMoodboard(descriptionsResult.data.moodboard)
        setGenerationPhase(null)
        toast.success('All details generated successfully!')
      } catch (descError) {
        console.error('Description generation error:', descError)
        setGenerationPhase(null)
        // Don't show error toast - image is already shown
        toast("Some details couldn't be generated, but your image is ready!", {
          icon: '⚠️',
        })
      }
    } catch (error) {
      console.error('Generation error:', error)
      setProgressSteps([])
      setLoadingState(null)
      setGenerationPhase(null)
      toast.error(
        error.response?.data?.message ||
          error.message ||
          'Failed to generate moodboard'
      )
    }
  }

  const handleRegenerate = async () => {
    if (!currentMoodboard) {
      toast.error('No moodboard to regenerate')
      return
    }

    try {
      setLoadingState('generating')

      const colorDescription = getColorDescriptionForPalette(selectedColor)
      const enhancedCustomPrompt = changes.trim()
        ? `${changes.trim()}. Color scheme: ${colorDescription}`
        : currentMoodboard.prompt

      const generatePayload = {
        customPrompt: enhancedCustomPrompt,
        imageCount: 1,
        aspectRatio: '16:9',
      }

      const generateResult = await generateMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: generatePayload,
      })

      setCurrentMoodboard(generateResult.data.moodboard)
      setLoadingState(null)
      toast.success('Moodboard regenerated successfully!')
    } catch (error) {
      console.error('Regeneration error:', error)
      setLoadingState(null)
      toast.error('Failed to regenerate moodboard')
    }
  }

  const downloadMoodboardImage = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) return

    const link = document.createElement('a')
    link.href = currentMoodboard.compositeMoodboard.url
    link.download = `moodboard-${currentMoodboard._id}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    toast.success('Image downloaded successfully!')
  }

  const downloadMoodboardPDF = async () => {
    if (!currentMoodboard) return

    try {
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas')).default

      toast.loading('Generating PDF...', { id: 'pdf-generation' })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15

      // Title
      pdf.setFontSize(24)
      pdf.setTextColor(147, 124, 96)
      pdf.text(currentMoodboard.title, margin, 20)

      // Date
      pdf.setFontSize(10)
      pdf.setTextColor(100, 100, 100)
      pdf.text(
        `Created: ${new Date(currentMoodboard.createdAt).toLocaleDateString()}`,
        margin,
        28
      )

      // Image
      if (currentMoodboard.compositeMoodboard?.url) {
        const imgData = currentMoodboard.compositeMoodboard.url
        const imgWidth = pageWidth - 2 * margin
        const imgHeight = (imgWidth * 9) / 16
        pdf.addImage(imgData, 'PNG', margin, 35, imgWidth, imgHeight)
      }

      let yPosition = 35 + ((pageWidth - 2 * margin) * 9) / 16 + 15

      // Style and Room Type
      pdf.setFontSize(12)
      pdf.setTextColor(0, 0, 0)
      pdf.text(`Style: ${currentMoodboard.style}`, margin, yPosition)
      yPosition += 7
      pdf.text(`Room Type: ${currentMoodboard.roomType}`, margin, yPosition)
      yPosition += 10

      // Design Narrative
      if (currentMoodboard.designNarrative?.narrative) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.setTextColor(147, 124, 96)
        pdf.text('Design Narrative', margin, yPosition)
        yPosition += 7

        pdf.setFontSize(10)
        pdf.setTextColor(0, 0, 0)
        const narrativeLines = pdf.splitTextToSize(
          currentMoodboard.designNarrative.narrative,
          pageWidth - 2 * margin
        )
        pdf.text(narrativeLines, margin, yPosition)
        yPosition += narrativeLines.length * 5 + 10
      }

      // Color Palette
      if (currentMoodboard.colorPalette?.length > 0) {
        if (yPosition > pageHeight - 40) {
          pdf.addPage()
          yPosition = 20
        }

        pdf.setFontSize(14)
        pdf.setTextColor(147, 124, 96)
        pdf.text('Color Palette', margin, yPosition)
        yPosition += 10

        currentMoodboard.colorPalette.slice(0, 5).forEach((color, idx) => {
          const hexColor = color.hex.replace('#', '')
          const r = parseInt(hexColor.substr(0, 2), 16)
          const g = parseInt(hexColor.substr(2, 2), 16)
          const b = parseInt(hexColor.substr(4, 2), 16)

          pdf.setFillColor(r, g, b)
          pdf.rect(margin + idx * 35, yPosition, 30, 15, 'F')

          pdf.setFontSize(8)
          pdf.setTextColor(0, 0, 0)
          pdf.text(color.name, margin + idx * 35, yPosition + 20)
          pdf.text(color.hex, margin + idx * 35, yPosition + 25)
        })

        yPosition += 35
      }

      // Materials
      if (currentMoodboard.materials) {
        const materialsEntries = Object.entries(currentMoodboard.materials)
        const hasContent = materialsEntries.some(
          ([_, items]) => items && items.length > 0
        )

        if (hasContent) {
          pdf.addPage()
          yPosition = 20

          pdf.setFontSize(16)
          pdf.setTextColor(147, 124, 96)
          pdf.text('Materials', margin, yPosition)
          yPosition += 10

          materialsEntries.forEach(([key, items]) => {
            if (!items || items.length === 0) return

            if (yPosition > pageHeight - 30) {
              pdf.addPage()
              yPosition = 20
            }

            pdf.setFontSize(12)
            pdf.setTextColor(0, 0, 0)
            pdf.text(
              key.charAt(0).toUpperCase() + key.slice(1).replace('_', ' '),
              margin,
              yPosition
            )
            yPosition += 7

            items.forEach((item) => {
              if (yPosition > pageHeight - 20) {
                pdf.addPage()
                yPosition = 20
              }

              pdf.setFontSize(10)
              pdf.text(`• ${item.type}`, margin + 5, yPosition)
              yPosition += 5
            })

            yPosition += 5
          })
        }
      }

      // Furniture
      if (currentMoodboard.furniture?.heroPieces?.length > 0) {
        pdf.addPage()
        yPosition = 20

        pdf.setFontSize(16)
        pdf.setTextColor(147, 124, 96)
        pdf.text('Furniture', margin, yPosition)
        yPosition += 10

        currentMoodboard.furniture.heroPieces.forEach((piece) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage()
            yPosition = 20
          }

          pdf.setFontSize(12)
          pdf.setTextColor(0, 0, 0)
          pdf.text(`• ${piece.name}`, margin, yPosition)
          yPosition += 6

          pdf.setFontSize(10)
          pdf.setTextColor(100, 100, 100)
          pdf.text(`  Category: ${piece.category}`, margin, yPosition)
          yPosition += 10
        })
      }

      pdf.save(`moodboard-${currentMoodboard._id}.pdf`)
      toast.success('PDF downloaded successfully!', { id: 'pdf-generation' })
    } catch (error) {
      console.error('Error generating PDF:', error)
      toast.error('Failed to generate PDF', { id: 'pdf-generation' })
    }
  }

  const steps = [
    { number: 1, title: 'Space' },
    { number: 2, title: 'Style' },
    { number: 3, title: 'Colors' },
    { number: 4, title: 'Vision' },
  ]

  const useProgressTracking = (moodboardId, onProgress) => {
    useEffect(() => {
      if (!moodboardId) return

      const eventSource = new EventSource(
        `/api/moodboards/${moodboardId}/progress-stream`
      )

      eventSource.addEventListener('progress', (event) => {
        try {
          const data = JSON.parse(event.data)
          onProgress(data.currentSteps)
        } catch (error) {
          console.error('Error parsing progress event:', error)
        }
      })

      eventSource.addEventListener('complete', () => {
        eventSource.close()
        onProgress([]) // Clear progress
      })

      eventSource.addEventListener('error', () => {
        eventSource.close()
      })

      return () => {
        eventSource.close()
      }
    }, [moodboardId, onProgress])
  }

  const isGenerating = createMutation.isPending || generateMutation.isPending

  return (
    <>
      <TopBar />
      {loadingState === 'generating' && (
        <BeautifulLoader
          progressSteps={progressSteps}
          phase={generationPhase}
        />
      )}
      <div className='min-h-screen bg-gradient-to-br from-gray-50 to-gray-100'>
        {currentStep < 3 ? (
          <WizardFlow
            currentStep={currentStep}
            setCurrentStep={setCurrentStep}
            steps={steps}
            selectedSpace={selectedSpace}
            setSelectedSpace={setSelectedSpace}
            selectedStyle={selectedStyle}
            setSelectedStyle={setSelectedStyle}
            selectedColor={selectedColor}
            setSelectedColor={setSelectedColor}
            changes={changes}
            setChanges={setChanges}
            onGenerate={handleGenerate}
            isGenerating={isGenerating}
          />
        ) : (
          <ResultView
            currentMoodboard={currentMoodboard}
            onRegenerate={handleRegenerate}
            onDownload={downloadMoodboardImage}
            onDownloadPDF={downloadMoodboardPDF}
            onBackToCreate={() => setCurrentStep(0)}
            loadingState={loadingState}
            generationPhase={generationPhase}
            showImageModal={showImageModal}
            setShowImageModal={setShowImageModal}
            showEditModal={showEditModal}
            setShowEditModal={setShowEditModal}
            setCurrentMoodboard={setCurrentMoodboard}
          />
        )}
      </div>
    </>
  )
}
{/* <BeautifulLoader/> */}

const WizardFlow = ({
  currentStep,
  setCurrentStep,
  steps,
  selectedSpace,
  setSelectedSpace,
  selectedStyle,
  setSelectedStyle,
  selectedColor,
  setSelectedColor,
  changes,
  setChanges,
  onGenerate,
  isGenerating,
}) => {
  const canProceed = () => {
    switch (currentStep) {
      case 0:
        return !!selectedSpace
      case 1:
        return !!selectedStyle
      case 2:
        return !!selectedColor && changes.trim().length > 0
      default:
        return false
    }
  }

  return (
    <div className='h-screen flex flex-col pt-28'>
      <div className='max-w-6xl mx-auto px-6 w-full flex-shrink-0'>
        <div className='flex items-center justify-between mb-8'>
          {steps.map((step, idx) => (
            <div key={step.number} className='flex items-center flex-1'>
              <motion.div
                className='flex items-center w-full'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: idx * 0.1 }}
              >
                <div
                  className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all flex-shrink-0`}
                  style={{
                    backgroundColor:
                      currentStep >= idx ? BRAND_COLOR : '#e5e7eb',
                    color: currentStep >= idx ? 'white' : '#9ca3af',
                  }}
                >
                  {currentStep > idx ? (
                    <CheckCircle2 className='w-5 h-5' />
                  ) : (
                    step.number
                  )}
                </div>
                <span
                  className='ml-3 text-sm font-semibold'
                  style={{
                    color: currentStep >= idx ? BRAND_COLOR : '#9ca3af',
                  }}
                >
                  {step.title}
                </span>
                {idx < steps.length - 1 && (
                  <div
                    className={`flex-1 h-0.5 mx-4 rounded transition-all`}
                    style={{
                      backgroundColor:
                        currentStep > idx ? BRAND_COLOR : '#e5e7eb',
                    }}
                  />
                )}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      <div className='flex-1 overflow-y-auto'>
        <div className='max-w-6xl mx-auto px-6 pb-6'>
          <AnimatePresence mode='wait'>
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className='bg-white rounded-2xl shadow-xl p-10'
            >
              {currentStep === 0 && (
                <StepSpace
                  selectedSpace={selectedSpace}
                  setSelectedSpace={setSelectedSpace}
                />
              )}

              {currentStep === 1 && (
                <StepStyle
                  selectedStyle={selectedStyle}
                  setSelectedStyle={setSelectedStyle}
                />
              )}

              {currentStep === 2 && (
                <StepColorsAndVision
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  changes={changes}
                  setChanges={setChanges}
                />
              )}
            </motion.div>
          </AnimatePresence>

          <div className='flex gap-4 mt-6 justify-between'>
            <button
              onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0 || isGenerating}
              className='flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all'
            >
              <ArrowLeft className='w-5 h-5' />
              Back
            </button>

            {currentStep < 2 ? (
              <button
                onClick={() => setCurrentStep(currentStep + 1)}
                disabled={!canProceed() || isGenerating}
                className='flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all'
                style={{ backgroundColor: BRAND_COLOR }}
                onMouseEnter={(e) =>
                  (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                }
                onMouseLeave={(e) =>
                  (e.target.style.backgroundColor = BRAND_COLOR)
                }
              >
                Next
                <ArrowRight className='w-5 h-5' />
              </button>
            ) : (
              <button
                onClick={onGenerate}
                disabled={!canProceed() || isGenerating}
                className='flex items-center gap-2 px-8 py-3 rounded-lg font-semibold text-white hover:shadow-lg disabled:opacity-50 transition-all'
                style={{
                  background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
                }}
              >
                {isGenerating ? (
                  <>
                    <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin' />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className='w-5 h-5' />
                    Generate Moodboard
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


const StepStyle = ({ selectedStyle, setSelectedStyle }) => {
  const styleIcons = {
    'Modern Minimalist': '⬜',
    Contemporary: '✨',
    Scandinavian: '🧊',
    Industrial: '⚙️',
    Traditional: '👑',
    Transitional: '⚖️',
    'Mid-Century Modern': '🛋️',
    Bohemian: '🌸',
    'Art Deco': '💎',
    'Industrial Chic': '🏭',
    Rustic: '🌾',
    Coastal: '🌊',
    Mediterranean: '☀️',
    Japanese: '🌸',
    Luxury: '✨',
  }

  return (
    <div>
      <div className='text-center mb-12'>
        <h2 className='text-4xl font-bold text-gray-900 mb-3'>
          What's your design style?
        </h2>
        <p className='text-lg text-gray-600'>
          Choose the aesthetic that resonates with you
        </p>
      </div>

      <div className='grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4'>
        {DESIGN_STYLES.map((style) => (
          <motion.button
            key={style.value}
            onClick={() => setSelectedStyle(style.label)}
            whileHover={{ scale: 1.08, y: -8 }}
            whileTap={{ scale: 0.92 }}
            className={`relative group p-6 rounded-2xl transition-all duration-300 overflow-hidden`}
            style={{
              background:
                selectedStyle === style.label
                  ? `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`
                  : 'white',
              boxShadow:
                selectedStyle === style.label
                  ? `0 20px 40px ${BRAND_COLOR}30`
                  : '0 2px 8px rgba(0,0,0,0.08)',
              border:
                selectedStyle === style.label ? 'none' : '1px solid #e5e7eb',
            }}
          >
            {/* Background gradient animation on hover */}
            <motion.div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{
                background:
                  selectedStyle !== style.label
                    ? `linear-gradient(135deg, ${BRAND_COLOR}08, ${BRAND_COLOR_LIGHT}08)`
                    : 'transparent',
              }}
            />

            {/* Icon */}
            <div className='relative z-10 mb-4 text-center'>
              <motion.div
                animate={
                  selectedStyle === style.label ? { scale: [1, 1.2, 1] } : {}
                }
                transition={{ duration: 0.6, repeat: Infinity }}
                className='text-4xl'
              >
                {styleIcons[style.label] || '🎨'}
              </motion.div>
            </div>

            {/* Content */}
            <div className='relative z-10 text-center'>
              <h3
                className={`font-bold text-base mb-1 transition-colors ${
                  selectedStyle === style.label ? 'text-white' : 'text-gray-900'
                }`}
              >
                {style.label}
              </h3>
              <p
                className={`text-xs transition-colors ${
                  selectedStyle === style.label
                    ? 'text-white/80'
                    : 'text-gray-600'
                }`}
              >
                {style.description}
              </p>
            </div>

            {/* Selection checkmark */}
            {selectedStyle === style.label && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.1, type: 'spring', bounce: 0.5 }}
                className='absolute top-3 right-3 z-20'
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className='w-6 h-6 rounded-full bg-white flex items-center justify-center shadow-lg'
                >
                  <CheckCircle2
                    className='w-5 h-5'
                    style={{ color: BRAND_COLOR }}
                  />
                </motion.div>
              </motion.div>
            )}

            {/* Hover shine effect */}
            <motion.div
              className='absolute inset-0 opacity-0 group-hover:opacity-20'
              style={{
                background: `linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.8) 50%, transparent 70%)`,
                transform: 'translateX(-100%)',
              }}
              whileHover={{
                x: '100%',
              }}
              transition={{ duration: 0.6 }}
            />
          </motion.button>
        ))}
      </div>

      {/* Style count indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className='mt-8 text-center text-sm text-gray-500'
      >
        {selectedStyle ? (
          <span>
            Selected:{' '}
            <span style={{ color: BRAND_COLOR }} className='font-semibold'>
              {selectedStyle}
            </span>
          </span>
        ) : (
          <span>Select a style to continue →</span>
        )}
      </motion.div>
    </div>
  )
}

const StepColorsAndVision = ({
  selectedColor,
  setSelectedColor,
  changes,
  setChanges,
}) => (
  <div>
    <div className='text-center mb-10'>
      <h2 className='text-4xl font-bold text-gray-900 mb-3'>
        Colors & Your Vision
      </h2>
      <p className='text-lg text-gray-600'>
        Select your palette and describe your design
      </p>
    </div>

    <div className='grid lg:grid-cols-2 gap-8'>
      <div>
        <label className='block text-sm font-semibold text-gray-900 mb-4'>
          Color Palette
        </label>
        <div className='grid grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2'>
          {COLOR_PALETTES.map((palette) => (
            <motion.button
              key={palette.name}
              onClick={() => setSelectedColor(palette.name)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-3 rounded-xl border-2 transition-all text-left`}
              style={{
                borderColor:
                  selectedColor === palette.name ? BRAND_COLOR : '#e5e7eb',
                backgroundColor:
                  selectedColor === palette.name ? `${BRAND_COLOR}15` : 'white',
              }}
            >
              <div className='flex items-start justify-between mb-2'>
                <h3 className='font-semibold text-gray-900 text-sm'>
                  {palette.name}
                </h3>
                {selectedColor === palette.name && (
                  <div
                    className='w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0'
                    style={{ backgroundColor: BRAND_COLOR }}
                  >
                    <CheckCircle2 className='w-4 h-4 text-white' />
                  </div>
                )}
              </div>
              <div className='flex gap-1'>
                {palette.colors.map((color, idx) => (
                  <div
                    key={idx}
                    className='flex-1 h-8 rounded'
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      <div>
        <label className='block text-sm font-semibold text-gray-900 mb-4'>
          Your Design Vision *
        </label>
        <textarea
          value={changes}
          onChange={(e) => setChanges(e.target.value)}
          placeholder='Describe your design vision in detail. For example: "Modern office with natural wood elements, warm lighting, comfortable seating, plants, and professional minimalist aesthetic..."'
          className='w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none resize-none h-[400px] text-gray-900 placeholder-gray-400'
          style={{
            borderColor: changes.trim() ? BRAND_COLOR : '#e5e7eb',
          }}
        />
        <p className='text-xs text-gray-500 mt-2'>
          {changes.length} characters • More details = better results
        </p>
      </div>
    </div>
  </div>
)

const ResultView = ({
  currentMoodboard,
  onRegenerate,
  onDownload,
  onDownloadPDF,
  onBackToCreate,
  loadingState,
  generationPhase,
  showImageModal,
  setShowImageModal,
  showEditModal,
  setShowEditModal,
  setCurrentMoodboard,
}) => {
  const [activeTab, setActiveTab] = useState('overview')

  if (!currentMoodboard?.compositeMoodboard?.url) {
    return (
      <div className='min-h-screen pt-32 pb-12'>
        <div className='max-w-4xl mx-auto px-4'>
          <div className='text-center py-20'>
            <div
              className='w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4'
              style={{ backgroundColor: `${BRAND_COLOR}20` }}
            >
              <Sparkles className='w-8 h-8' style={{ color: BRAND_COLOR }} />
            </div>
            <h2 className='text-2xl font-bold text-gray-900 mb-2'>
              Generating Your Moodboard
            </h2>
            <p className='text-gray-600 mb-8'>
              Our AI is creating your beautiful design collage...
            </p>
            <LoadingAnimation />
          </div>
        </div>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'materials', label: 'Materials' },
    { id: 'furniture', label: 'Furniture' },
    { id: 'lighting', label: 'Lighting' },
    { id: 'layout', label: 'Layout' },
  ]

  return (
    <div className='min-h-screen pt-32 pb-12'>
      {/* Phase 2 Loading Banner */}
      {generationPhase === 'descriptions' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className='fixed top-20 left-0 right-0 z-50 bg-gradient-to-r from-amber-900 via-amber-900 to-brown-950 shadow-lg'
        >
          <div className='max-w-7xl mx-auto px-4 py-3 flex items-center justify-center gap-3'>
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className='w-5 h-5 text-white' />
            </motion.div>
            <span className='text-white font-medium'>
              Generating detailed descriptions in background...
            </span>
            <span className='text-white/80 text-sm'>
              (Materials, Furniture, Lighting, Zones)
            </span>
          </div>
        </motion.div>
      )}
      <div className='max-w-7xl mx-auto px-4'>
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className='mb-8 flex items-center justify-between'
        >
          <div>
            <h1 className='text-4xl font-bold text-gray-900 mb-2'>
              {currentMoodboard.title}
            </h1>
            <p className='text-gray-500'>
              Created on{' '}
              {new Date(currentMoodboard.createdAt).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onBackToCreate}
            className='px-6 py-3 rounded-lg font-semibold text-gray-700 bg-white border border-gray-200 hover:bg-gray-50 transition-all'
          >
            Create New
          </button>
        </motion.div>

        <div className='grid lg:grid-cols-3 gap-8'>
          <div className='lg:col-span-2 space-y-8'>
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className='relative group bg-black rounded-2xl overflow-hidden shadow-lg'
            >
              <img
                src={currentMoodboard.compositeMoodboard.url}
                alt='Moodboard'
                className='w-full h-full object-contain cursor-pointer hover:opacity-95 transition-opacity'
                onClick={() => setShowImageModal(true)}
              />

              <div className='absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowImageModal(true)}
                  className='p-3 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all'
                  title='View full size'
                >
                  <Maximize2
                    className='w-5 h-5'
                    style={{ color: BRAND_COLOR }}
                  />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowEditModal(true)}
                  className='p-3 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all'
                  title='Edit moodboard'
                >
                  <Edit3 className='w-5 h-5' style={{ color: BRAND_COLOR }} />
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onDownload}
                  className='p-3 bg-white/95 hover:bg-white rounded-lg shadow-lg transition-all'
                  title='Download'
                >
                  <Download
                    className='w-5 h-5'
                    style={{ color: BRAND_COLOR }}
                  />
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='bg-white rounded-2xl shadow-lg overflow-hidden'
            >
              <div className='border-b border-gray-200 px-6 pt-6'>
                <div className='flex gap-2 overflow-x-auto'>
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`px-4 py-3 font-medium transition-all whitespace-nowrap relative`}
                      style={{
                        color: activeTab === tab.id ? BRAND_COLOR : '#9ca3af',
                      }}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div
                          className='absolute bottom-0 left-0 right-0 h-0.5'
                          style={{ backgroundColor: BRAND_COLOR }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className='p-6'>
                <AnimatePresence mode='wait'>
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <TabContent
                      tabId={activeTab}
                      moodboard={currentMoodboard}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          </div>

          <div className='space-y-6'>
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className='bg-white rounded-2xl shadow-lg p-6 sticky top-32'
            >
              <h3 className='text-lg font-bold text-gray-900 mb-4'>Actions</h3>

              <div className='space-y-3'>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditModal(true)}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 text-white font-semibold rounded-lg transition-all'
                  style={{ backgroundColor: BRAND_COLOR }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = BRAND_COLOR_DARK)
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = BRAND_COLOR)
                  }
                >
                  <Edit3 className='w-5 h-5' />
                  Edit Moodboard
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onRegenerate}
                  disabled={loadingState === 'generating'}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all disabled:opacity-50'
                >
                  <RefreshCw className='w-5 h-5' />
                  New Variation
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownload}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all'
                >
                  <Download className='w-5 h-5' />
                  Download Image
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onDownloadPDF}
                  className='w-full flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-900 font-semibold rounded-lg transition-all'
                >
                  <FileText className='w-5 h-5' />
                  Download PDF
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className='space-y-4'
            >
              <div className='bg-white rounded-xl p-5 shadow-lg'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                  Design Style
                </p>
                <p className='text-sm font-semibold text-gray-900'>
                  {currentMoodboard.style}
                </p>
              </div>

              <div className='bg-white rounded-xl p-5 shadow-lg'>
                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2'>
                  Room Type
                </p>
                <p className='text-sm font-semibold text-gray-900'>
                  {currentMoodboard.roomType}
                </p>
              </div>

              {currentMoodboard.colorPalette?.length > 0 && (
                <div className='bg-white rounded-xl p-5 shadow-lg'>
                  <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3'>
                    Color Palette
                  </p>
                  <div className='flex gap-2'>
                    {currentMoodboard.colorPalette
                      .slice(0, 5)
                      .map((color, idx) => (
                        <div
                          key={idx}
                          className='flex-1 h-10 rounded-lg shadow border border-gray-200 cursor-pointer hover:shadow-md transition-shadow'
                          style={{ backgroundColor: color.hex }}
                          title={`${color.name} - ${color.hex}`}
                        />
                      ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>

      {showImageModal && currentMoodboard?.compositeMoodboard?.url && (
        <ImageModal
          imageUrl={currentMoodboard.compositeMoodboard.url}
          onClose={() => setShowImageModal(false)}
          onDownload={onDownload}
        />
      )}

      {showEditModal && (
        <EditModal
          moodboard={currentMoodboard}
          onClose={() => setShowEditModal(false)}
          onSave={(updatedMoodboard) => {
            setCurrentMoodboard(updatedMoodboard)
            setShowEditModal(false)
          }}
        />
      )}
    </div>
  )
}

const EditModal = ({ moodboard, onClose, onSave }) => {
  const [editPrompt, setEditPrompt] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  const handleEdit = async () => {
    if (!editPrompt.trim()) {
      toast.error('Please describe the changes you want')
      return
    }

    setIsEditing(true)
    try {
      const response = await fetch(`/api/moodboards/${moodboard._id}/edit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageIndex: 0,
          editPrompt: editPrompt.trim(),
        }),
      })

      const data = await response.json()

      if (data.status === 'success') {
        toast.success('Moodboard edited successfully!')
        onSave(data.data.moodboard)
      } else {
        throw new Error(data.message || 'Failed to edit moodboard')
      }
    } catch (error) {
      console.error('Edit error:', error)
      toast.error(error.message || 'Failed to edit moodboard')
    } finally {
      setIsEditing(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className='fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4'
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8'
      >
        <div className='flex items-center justify-between mb-6'>
          <h2 className='text-2xl font-bold text-gray-900'>
            Edit Your Moodboard
          </h2>
          <button
            onClick={onClose}
            className='p-2 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-6 h-6 text-gray-500' />
          </button>
        </div>

        <div className='mb-6'>
          <label className='block text-sm font-semibold text-gray-900 mb-3'>
            Describe Your Changes
          </label>
          <textarea
            value={editPrompt}
            onChange={(e) => setEditPrompt(e.target.value)}
            placeholder='Example: "Make it more minimalist", "Add more plants", "Use warmer tones", "Focus on natural materials"...'
            className='w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none resize-none h-40 text-gray-900 placeholder-gray-400'
            style={{
              borderColor: editPrompt.trim() ? BRAND_COLOR : '#e5e7eb',
            }}
          />
          <p className='text-xs text-gray-500 mt-2'>
            Be specific about what you'd like to change
          </p>
        </div>

        <div className='flex gap-3'>
          <button
            onClick={onClose}
            disabled={isEditing}
            className='flex-1 px-6 py-3 rounded-lg font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 transition-all'
          >
            Cancel
          </button>
          <button
            onClick={handleEdit}
            disabled={!editPrompt.trim() || isEditing}
            className='flex-1 px-6 py-3 rounded-lg font-semibold text-white disabled:opacity-50 transition-all'
            style={{
              background: `linear-gradient(135deg, ${BRAND_COLOR}, ${BRAND_COLOR_LIGHT})`,
            }}
          >
            {isEditing ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin inline-block mr-2' />
                Editing...
              </>
            ) : (
              <>Apply Changes</>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

const TabContent = ({ tabId, moodboard }) => {
  const narrative = moodboard.designNarrative
  const colorPalette = moodboard.colorPalette || []
  const moodDescription =
    moodboard.compositeMoodboard?.metadata?.moodDescription

  if (tabId === 'overview') {
    return (
      <div className='space-y-6'>
        {narrative?.narrative && (
          <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
            <h3 className='text-lg font-bold text-gray-900 mb-4'>
              Design Narrative
            </h3>
            <p className='text-gray-700 leading-relaxed mb-4'>
              {narrative.narrative}
            </p>

            <div className='grid md:grid-cols-2 gap-4'>
              {narrative.vibe && (
                <div className='bg-white rounded-lg p-4 border border-gray-200'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                    The Vibe
                  </h4>
                  <p className='text-gray-700 text-sm'>{narrative.vibe}</p>
                </div>
              )}
              {narrative.lifestyle && (
                <div className='bg-white rounded-lg p-4 border border-gray-200'>
                  <h4 className='text-sm font-semibold text-gray-900 mb-2'>
                    Lifestyle Fit
                  </h4>
                  <p className='text-gray-700 text-sm'>{narrative.lifestyle}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {(moodDescription || colorPalette.length > 0) && (
          <div className='bg-gray-50 rounded-xl p-6 border border-gray-200'>
            {moodDescription && (
              <div className='mb-6'>
                <h3 className='text-lg font-bold text-gray-900 mb-2'>
                  {moodDescription.mood}
                </h3>
                <p className='text-sm text-gray-600 mb-3'>
                  {moodDescription.feeling}
                </p>
                <p className='text-gray-700'>{moodDescription.description}</p>
              </div>
            )}

            {colorPalette.length > 0 && (
              <div>
                <h4 className='text-lg font-bold text-gray-900 mb-4'>
                  Color Palette
                </h4>
                <div className='grid grid-cols-5 gap-3'>
                  {colorPalette.map((color, index) => (
                    <div key={index} className='text-center'>
                      <div
                        className='w-full h-20 rounded-lg shadow-md border border-gray-200 mb-2 cursor-pointer hover:shadow-lg transition-shadow'
                        style={{ backgroundColor: color.hex }}
                        title={`${color.name} - ${color.hex}`}
                      />
                      <div className='text-xs font-medium text-gray-900'>
                        {color.name}
                      </div>
                      <div className='text-xs text-gray-500'>{color.hex}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    )
  }

  if (tabId === 'materials') {
    return (
      <div className='space-y-4'>
        {moodboard.materials ? (
          Object.entries(moodboard.materials).map(([key, items]) => {
            if (!items || items.length === 0) return null
            return (
              <div key={key}>
                <h4 className='font-semibold text-gray-900 mb-3 capitalize'>
                  {key.replace('_', ' ')}
                </h4>
                <div className='space-y-3'>
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className='bg-gray-50 rounded-lg p-4 border border-gray-200'
                    >
                      <div className='font-medium text-gray-900'>
                        {item.type}
                      </div>
                      {item.finish && (
                        <div className='text-sm text-gray-600'>
                          Finish: {item.finish}
                        </div>
                      )}
                      {item.texture && (
                        <div className='text-sm text-gray-600'>
                          Texture: {item.texture}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <p className='text-gray-500'>No materials specified</p>
        )}
      </div>
    )
  }

  if (tabId === 'furniture') {
    return (
      <div>
        {moodboard.furniture?.heroPieces?.length ? (
          <div className='space-y-3'>
            {moodboard.furniture.heroPieces.map((piece, idx) => (
              <div
                key={idx}
                className='bg-gray-50 rounded-lg p-4 border border-gray-200'
              >
                <h4 className='font-semibold text-gray-900 mb-1'>
                  {piece.name}
                </h4>
                <p className='text-sm text-gray-600 capitalize mb-2'>
                  {piece.category}
                </p>
                {piece.dimensions && (
                  <div className='text-sm text-gray-700 font-mono'>
                    {piece.dimensions.length} × {piece.dimensions.width} ×{' '}
                    {piece.dimensions.height} {piece.dimensions.unit || 'cm'}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className='text-gray-500'>No furniture specified</p>
        )}
      </div>
    )
  }

  if (tabId === 'lighting') {
    return (
      <div className='space-y-4'>
        {moodboard.lightingConcept ? (
          <div className='grid md:grid-cols-2 gap-4'>
            {moodboard.lightingConcept.dayMood && (
              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <h3 className='font-semibold text-gray-900 mb-2'>Daytime</h3>
                <p className='text-sm text-gray-700'>
                  {moodboard.lightingConcept.dayMood.description}
                </p>
              </div>
            )}
            {moodboard.lightingConcept.nightMood && (
              <div className='bg-gray-50 rounded-lg p-4 border border-gray-200'>
                <h3 className='font-semibold text-gray-900 mb-2'>Nighttime</h3>
                <p className='text-sm text-gray-700'>
                  {moodboard.lightingConcept.nightMood.description}
                </p>
              </div>
            )}
          </div>
        ) : (
          <p className='text-gray-500'>No lighting concept specified</p>
        )}
      </div>
    )
  }

  if (tabId === 'layout') {
    return (
      <div className='grid md:grid-cols-2 gap-4'>
        {moodboard.zones?.length ? (
          moodboard.zones.map((zone, idx) => (
            <div
              key={idx}
              className='bg-gray-50 rounded-lg p-4 border border-gray-200'
            >
              <h3 className='font-semibold text-gray-900 mb-3'>{zone.name}</h3>
              <div className='space-y-2'>
                {zone.purpose && (
                  <div>
                    <div className='text-xs text-gray-500 mb-1'>Purpose</div>
                    <div className='text-sm text-gray-700'>{zone.purpose}</div>
                  </div>
                )}
                {zone.focalPoint && (
                  <div>
                    <div className='text-xs text-gray-500 mb-1'>
                      Focal Point
                    </div>
                    <div className='text-sm text-gray-700'>
                      {zone.focalPoint}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className='text-gray-500'>No layout zones specified</p>
        )}
      </div>
    )
  }

  return null
}

const LoadingAnimation = () => (
  <div className='flex flex-col items-center gap-6'>
    <div className='relative w-20 h-20'>
      <div className='absolute inset-0 rounded-full border-4 border-gray-200'></div>
      <div
        className='absolute inset-0 rounded-full border-4 border-t-transparent animate-spin'
        style={{ borderTopColor: BRAND_COLOR }}
      ></div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <Wand2
          className='w-8 h-8 animate-pulse'
          style={{ color: BRAND_COLOR }}
        />
      </div>
    </div>
    <div className='flex gap-1'>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className='w-2 h-2 rounded-full animate-bounce'
          style={{ backgroundColor: BRAND_COLOR, animationDelay: `${delay}s` }}
        ></div>
      ))}
    </div>
  </div>
)

const ImageModal = ({ imageUrl, onClose, onDownload }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className='fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4'
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.9 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.9 }}
      onClick={(e) => e.stopPropagation()}
      className='relative max-w-5xl'
    >
      <button
        onClick={onClose}
        className='absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10'
      >
        <X className='w-6 h-6 text-white' />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDownload()
        }}
        className='absolute top-4 right-16 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 transition-colors z-10'
      >
        <Download className='w-5 h-5 text-white' />
        <span className='text-white text-sm font-medium'>Download</span>
      </button>
      <img
        src={imageUrl}
        alt='Full View'
        className='max-w-[95vw] max-h-[95vh] object-contain rounded-lg'
      />
    </motion.div>
  </motion.div>
)

export default MoodboardGenerator
