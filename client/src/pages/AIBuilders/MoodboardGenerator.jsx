// File: client/src/pages/AIBuilders/MoodboardGenerator.jsx
import TopBar from '@/components/Layout/Topbar'
import {
  useCreateMoodboard,
  useEditMoodboardImage,
  useGenerateMoodboard,
  useRegenerateImage,
} from '@/hooks/useMoodboard'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChefHat,
  Download,
  Edit3,
  Globe,
  Heart,
  Home,
  Layers,
  Loader2,
  Maximize2,
  Palette,
  RefreshCw,
  Sofa,
  Sparkles,
  Utensils,
  Wand2,
  X,
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

const MoodboardGenerator = () => {
  const [selectedSpace, setSelectedSpace] = useState('Living Room')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('Square (1:1)')
  const [changes, setChanges] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [currentMoodboard, setCurrentMoodboard] = useState(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  const [showImageModal, setShowImageModal] = useState(false)
  const [loadingState, setLoadingState] = useState(null)

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  // React Query hooks
  const createMutation = useCreateMoodboard()
  const generateMutation = useGenerateMoodboard()
  const editMutation = useEditMoodboardImage()
  const regenerateMutation = useRegenerateImage()

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const spaceTypes = [
    { name: 'Living Room', icon: Sofa, value: 'living_room' },
    { name: 'Bedroom', icon: Home, value: 'bedroom' },
    { name: 'Kitchen', icon: ChefHat, value: 'kitchen' },
    { name: 'Dining Room', icon: Utensils, value: 'dining_room' },
    { name: 'Bathroom', icon: Home, value: 'bathroom' },
    { name: 'Office', icon: Layers, value: 'office' },
    { name: 'Balcony', icon: Globe, value: 'outdoor' },
    { name: 'Kids Room', icon: Heart, value: 'bedroom' },
  ]

  const styles = [
    { label: 'Modern Minimalist', value: 'minimalist' },
    { label: 'Scandinavian', value: 'scandinavian' },
    { label: 'Industrial', value: 'industrial' },
    { label: 'Bohemian', value: 'bohemian' },
    { label: 'Mid-Century Modern', value: 'mid-century' },
    { label: 'Traditional', value: 'traditional' },
    { label: 'Contemporary', value: 'contemporary' },
    { label: 'Rustic', value: 'rustic' },
    { label: 'Luxury', value: 'luxury' },
  ]

  const colors = [
    'Neutral Tones',
    'Warm Earth',
    'Cool Blues',
    'Monochrome',
    'Vibrant Accents',
    'Pastel Palette',
    'Deep & Rich',
    'Natural Green',
    'Soft Grays',
    'Warm Whites',
  ]

  const ratios = [
    'Square (1:1)',
    'Landscape (16:9)',
    'Landscape (4:3)',
    'Portrait (9:16)',
    'Portrait (3:4)',
    'Wide (2:1)',
    'Tall (1:2)',
    'Cinema (21:9)',
    'Classic (5:4)',
    'Photo (3:2)',
  ]

  const getAspectRatioValue = (ratio) => {
    const ratioValues = {
      'Square (1:1)': '1:1',
      'Landscape (16:9)': '16:9',
      'Landscape (4:3)': '4:3',
      'Portrait (9:16)': '9:16',
      'Portrait (3:4)': '3:4',
      'Wide (2:1)': '2:1',
      'Tall (1:2)': '1:2',
      'Cinema (21:9)': '21:9',
      'Classic (5:4)': '5:4',
      'Photo (3:2)': '3:2',
    }
    return ratioValues[ratio] || '1:1'
  }

  const handleGenerate = async () => {
    if (!changes.trim()) {
      toast.error('Please describe your design requirements')
      return
    }

    try {
      setLoadingState('generating')

      const spaceValue =
        spaceTypes.find((s) => s.name === selectedSpace)?.value || 'living_room'
      const styleValue =
        styles.find((s) => s.label === selectedStyle)?.value || 'modern'
      const colorPalette = selectedColor ? [selectedColor] : []

      let customPrompt = changes.trim()

      const createResult = await createMutation.mutateAsync({
        title: `${selectedStyle || 'Modern'} ${selectedSpace}`,
        style: styleValue,
        roomType: spaceValue,
        colorPalette,
        customPrompt,
        layout: 'single',
        imageCount: 1,
        aspectRatio: getAspectRatioValue(selectedRatio),
      })

      const moodboardId = createResult.data.moodboard._id

      const generateResult = await generateMutation.mutateAsync({
        moodboardId,
        data: {
          customPrompt,
          imageCount: 1,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(generateResult.data.moodboard)
      setLoadingState(null)
      toast.success('Moodboard generated successfully!')
    } catch (error) {
      setLoadingState(null)
      toast.error(
        error.response?.data?.message || 'Failed to generate moodboard'
      )
    }
  }

  const handleRegenerateSelected = async () => {
    try {
      setLoadingState('regenerating')

      const result = await regenerateMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: {
          imageIndices: [0],
          customPrompt: regeneratePrompt,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(result.data.moodboard)
      setRegeneratePrompt('')
      setLoadingState(null)
      toast.success('Image regenerated successfully!')
    } catch (error) {
      setLoadingState(null)
      toast.error(
        error.response?.data?.message || 'Failed to regenerate images'
      )
    }
  }

  const handleEditImage = async () => {
    if (!editPrompt.trim()) {
      toast.error('Please enter edit instructions')
      return
    }

    try {
      setLoadingState('editing')

      const result = await editMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: {
          imageIndex: 0,
          editPrompt,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(result.data.moodboard)
      setEditPrompt('')
      setLoadingState(null)
      toast.success('Image edited successfully!')
    } catch (error) {
      setLoadingState(null)
      toast.error(error.response?.data?.message || 'Failed to edit image')
    }
  }

  const downloadMoodboard = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) return

    const link = document.createElement('a')
    link.href = currentMoodboard.compositeMoodboard.url
    link.download = `moodboard-${currentMoodboard._id}.png`
    link.click()
  }

  const renderMoodboard = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) {
      return null
    }

    const composite = currentMoodboard.compositeMoodboard

    return (
      <div className='relative group h-full flex items-center justify-center'>
        <div className='relative max-w-full max-h-full'>
          <img
            src={composite.url}
            alt='Moodboard'
            className='max-w-full max-h-[calc(100vh-250px)] rounded-2xl border border-white/10 cursor-pointer shadow-2xl'
            onClick={() => setShowImageModal(true)}
          />

          <div className='absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowImageModal(true)
              }}
              className='p-3 bg-black/80 backdrop-blur-sm rounded-lg hover:bg-black transition-colors'
              title='View full size'
            >
              <Maximize2 className='w-5 h-5 text-white' />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                downloadMoodboard()
              }}
              className='p-3 bg-black/80 backdrop-blur-sm rounded-lg hover:bg-black transition-colors'
              title='Download'
            >
              <Download className='w-5 h-5 text-white' />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const isGenerating = createMutation.isPending || generateMutation.isPending
  const isRegenerating = regenerateMutation.isPending
  const isEditing = editMutation.isPending

  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-black overflow-hidden relative'>
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
        </div>

        <div className='relative z-10 min-h-screen pt-24 pb-8'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid lg:grid-cols-12 gap-6'>
              {/* Left Preview Area */}
              <motion.div
                className='lg:col-span-7'
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 lg:p-6 min-h-[600px] sticky top-24 relative'>
                  {/* Loading Overlay */}
                  <AnimatePresence>
                    {loadingState && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className='absolute inset-0 bg-black/90 backdrop-blur-md rounded-3xl z-50 flex items-center justify-center'
                      >
                        <div className='text-center'>
                          <div className='relative w-24 h-24 mx-auto mb-6'>
                            <div className='absolute inset-0 rounded-full border-4 border-[#947d61]/20'></div>
                            <div className='absolute inset-0 rounded-full border-4 border-[#947d61] border-t-transparent animate-spin'></div>
                            <div className='absolute inset-0 flex items-center justify-center'>
                              {loadingState === 'generating' && (
                                <Wand2 className='w-10 h-10 text-[#947d61] animate-pulse' />
                              )}
                              {loadingState === 'editing' && (
                                <Edit3 className='w-10 h-10 text-[#947d61] animate-pulse' />
                              )}
                              {loadingState === 'regenerating' && (
                                <RefreshCw className='w-10 h-10 text-[#947d61] animate-pulse' />
                              )}
                            </div>
                          </div>
                          <h3 className='text-2xl font-bold text-white mb-3'>
                            {loadingState === 'generating' &&
                              'Creating Your Moodboard'}
                            {loadingState === 'editing' && 'Editing Image'}
                            {loadingState === 'regenerating' &&
                              'Regenerating Design'}
                          </h3>
                          <p className='text-gray-400 mb-6'>
                            {loadingState === 'generating' &&
                              'AI is crafting your perfect interior design...'}
                            {loadingState === 'editing' &&
                              'Applying your changes...'}
                            {loadingState === 'regenerating' &&
                              'Creating a new variation...'}
                          </p>
                          <div className='flex items-center justify-center gap-2'>
                            <div
                              className='w-3 h-3 bg-[#947d61] rounded-full animate-bounce'
                              style={{ animationDelay: '0s' }}
                            ></div>
                            <div
                              className='w-3 h-3 bg-[#947d61] rounded-full animate-bounce'
                              style={{ animationDelay: '0.2s' }}
                            ></div>
                            <div
                              className='w-3 h-3 bg-[#947d61] rounded-full animate-bounce'
                              style={{ animationDelay: '0.4s' }}
                            ></div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Edit Controls */}
                  {currentMoodboard && !loadingState && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mb-4 p-4 bg-gradient-to-r from-[#947d61]/20 to-[#a68970]/20 rounded-xl border border-[#947d61]/30'
                    >
                      <h4 className='text-white font-semibold flex items-center gap-2 mb-3'>
                        <Sparkles className='w-4 h-4' />
                        Refine Your Moodboard
                      </h4>

                      <textarea
                        value={editPrompt}
                        onChange={(e) => setEditPrompt(e.target.value)}
                        placeholder='Describe specific edits (e.g., "change sofa color to navy blue", "add indoor plants")'
                        className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none h-20 mb-3 text-sm focus:outline-none focus:border-[#947d61]'
                      />
                      <button
                        onClick={handleEditImage}
                        disabled={isEditing || !editPrompt.trim()}
                        className='w-full h-10 px-4 mb-3 text-white font-semibold rounded-lg bg-gradient-to-r from-[#947d61] to-[#a68970] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all'
                      >
                        <Edit3 className='w-4 h-4' />
                        <span>Edit Image</span>
                      </button>

                      <div className='border-t border-white/10 pt-3 mt-3'>
                        <textarea
                          value={regeneratePrompt}
                          onChange={(e) => setRegeneratePrompt(e.target.value)}
                          placeholder='Optional: Add variations for regeneration (e.g., "brighter lighting", "more minimalist")'
                          className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none h-20 mb-3 text-sm focus:outline-none focus:border-[#947d61]'
                        />

                        <button
                          onClick={handleRegenerateSelected}
                          disabled={isRegenerating}
                          className='w-full h-10 px-4 text-white font-semibold rounded-lg bg-gradient-to-r from-[#947d61] to-[#a68970] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all'
                        >
                          <RefreshCw className='w-4 h-4' />
                          <span>Regenerate</span>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* Moodboard Display */}
                  <div className='w-full h-full flex items-center justify-center'>
                    {currentMoodboard?.compositeMoodboard ? (
                      renderMoodboard()
                    ) : (
                      <MoodboardPlaceholder
                        isGenerating={isGenerating}
                        selectedSpace={selectedSpace}
                        selectedStyle={selectedStyle}
                        selectedRatio={selectedRatio}
                      />
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Right Configuration Panel */}
              <motion.div
                className='lg:col-span-5'
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className='bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 lg:p-6 h-[calc(100vh-8rem)]'>
                  <div className='h-full overflow-y-auto space-y-6 pr-2 scrollbar-thin scrollbar-thumb-[#947d61] scrollbar-track-transparent'>
                    {/* Step 1 */}
                    <div>
                      <div className='flex items-center gap-3 mb-4'>
                        <div
                          className='w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          1
                        </div>
                        <h3 className='text-xl font-semibold text-white'>
                          Aspect Ratio
                        </h3>
                      </div>

                      <select
                        value={selectedRatio}
                        onChange={(e) => setSelectedRatio(e.target.value)}
                        disabled={isGenerating}
                        className='w-full h-11 px-4 pr-10 bg-white/5 border border-white/10 rounded-xl text-white text-sm appearance-none focus:outline-none focus:border-[#947d61] transition-all cursor-pointer'
                      >
                        {ratios.map((ratio) => (
                          <option
                            key={ratio}
                            value={ratio}
                            className='bg-gray-900'
                          >
                            {ratio}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Step 2 */}
                    <div>
                      <div className='flex items-center gap-3 mb-4'>
                        <div
                          className='w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          2
                        </div>
                        <h3 className='text-xl font-semibold text-white'>
                          Design Details
                        </h3>
                      </div>

                      <div className='mb-4'>
                        <p className='text-gray-300 text-sm mb-3 font-medium'>
                          Space Type
                        </p>
                        <div className='grid grid-cols-2 gap-2'>
                          {spaceTypes.map((space) => {
                            const IconComponent = space.icon
                            return (
                              <motion.button
                                key={space.name}
                                onClick={() => setSelectedSpace(space.name)}
                                disabled={isGenerating}
                                className={`h-10 px-3 rounded-xl border transition-all duration-300 flex items-center gap-2 disabled:opacity-50 ${
                                  selectedSpace === space.name
                                    ? 'border-[#947d61] bg-[#947d61]/20 text-white shadow-lg'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20 hover:bg-white/10'
                                }`}
                                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                              >
                                <IconComponent className='w-4 h-4' />
                                <span className='text-sm'>{space.name}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      <div className='space-y-3'>
                        <select
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          disabled={isGenerating}
                          className='w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#947d61] transition-all cursor-pointer'
                        >
                          <option value=''>Select Style</option>
                          {styles.map((style) => (
                            <option
                              key={style.value}
                              value={style.label}
                              className='bg-gray-900'
                            >
                              {style.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          disabled={isGenerating}
                          className='w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-[#947d61] transition-all cursor-pointer'
                        >
                          <option value=''>Select Color Palette</option>
                          {colors.map((color) => (
                            <option
                              key={color}
                              value={color}
                              className='bg-gray-900'
                            >
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Step 3 */}
                    <div>
                      <div className='flex items-center gap-3 mb-3'>
                        <div
                          className='w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          3
                        </div>
                        <h3 className='text-xl font-semibold text-white'>
                          Your Vision
                        </h3>
                        <span className='text-red-400 text-xs font-semibold'>
                          *Required
                        </span>
                      </div>

                      <textarea
                        value={changes}
                        onChange={(e) => setChanges(e.target.value)}
                        disabled={isGenerating}
                        placeholder='Describe your design vision in detail... (e.g., "Modern living room with large windows, neutral colors, wooden furniture, plants, and natural lighting")'
                        className={`w-full p-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 resize-none h-32 text-sm focus:outline-none transition-all ${
                          !changes.trim() && !isGenerating
                            ? 'border-red-400/50 focus:border-red-400'
                            : 'border-white/10 focus:border-[#947d61]'
                        }`}
                        required
                      />
                      {!changes.trim() && (
                        <p className='text-red-400 text-xs mt-2 flex items-center gap-1'>
                          <span className='w-1 h-1 bg-red-400 rounded-full'></span>
                          Please describe your desired moodboard
                        </p>
                      )}

                      <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating || !changes.trim()}
                        className='w-full h-12 px-6 mt-4 text-white font-bold rounded-xl bg-gradient-to-r from-[#947d61] to-[#a68970] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all'
                        whileHover={{
                          scale: isGenerating || !changes.trim() ? 1 : 1.02,
                        }}
                        whileTap={{
                          scale: isGenerating || !changes.trim() ? 1 : 0.98,
                        }}
                      >
                        <div className='flex items-center justify-center gap-2'>
                          <Sparkles className='w-5 h-5' />
                          <span>Generate Moodboard</span>
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && currentMoodboard?.compositeMoodboard?.url && (
        <div
          className='fixed inset-0 bg-black z-50 flex items-center justify-center'
          onClick={() => setShowImageModal(false)}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowImageModal(false)}
            className='absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10'
          >
            <X className='w-6 h-6 text-white' />
          </button>

          {/* Download Button */}
          <button
            onClick={(e) => {
              e.stopPropagation()
              downloadMoodboard()
            }}
            className='absolute top-6 right-20 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 transition-colors z-10'
          >
            <Download className='w-5 h-5 text-white' />
            <span className='text-white text-sm font-medium'>Download</span>
          </button>

          {/* Image */}
          <img
            src={currentMoodboard.compositeMoodboard.url}
            alt='Moodboard Full View'
            className='max-w-[95vw] max-h-[95vh] object-contain'
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  )
}

const MoodboardPlaceholder = ({
  isGenerating,
  selectedSpace,
  selectedStyle,
  selectedRatio,
}) => (
  <div className='w-full h-full flex items-center justify-center p-8'>
    <div className='text-center max-w-md'>
      <div className='w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-white/10 to-white/5 rounded-2xl flex items-center justify-center'>
        <Palette className='w-10 h-10 text-gray-400' />
      </div>
      <h3 className='text-2xl font-bold text-white mb-3'>Ready to Create</h3>
      <p className='text-gray-400 mb-4'>
        Configure your preferences and generate your custom interior design
        moodboard
      </p>
      <div className='text-sm text-gray-500 space-y-1'>
        <p className='flex items-center justify-center gap-2'>
          <span className='w-2 h-2 bg-[#947d61] rounded-full'></span>
          {selectedSpace}
        </p>
        {selectedStyle && (
          <p className='flex items-center justify-center gap-2'>
            <span className='w-2 h-2 bg-[#947d61] rounded-full'></span>
            {selectedStyle}
          </p>
        )}
        <p className='flex items-center justify-center gap-2'>
          <span className='w-2 h-2 bg-[#947d61] rounded-full'></span>
          {selectedRatio}
        </p>
      </div>
    </div>
  </div>
)

export default MoodboardGenerator
