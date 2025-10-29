// File: client/src/pages/AIBuilders/MoodboardGenerator.jsx
import TopBar from '@/components/Layout/Topbar'
import { useCreateMoodboard, useGenerateMoodboard } from '@/hooks/useMoodboard'
import {
  DesignNarrativeCard,
  MaterialsCard,
  FurnitureCard,
  LightingConceptCard,
  ZonesCard,
  VariantsCard,
} from '@/components/Moodboard/MoodboardDetails'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ChefHat,
  Download,
  Globe,
  Heart,
  Home,
  Layers,
  Maximize2,
  Palette,
  RefreshCw,
  Sofa,
  Sparkles,
  Utensils,
  Wand2,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const MoodboardGenerator = () => {
  const [selectedSpace, setSelectedSpace] = useState('Living Room')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('Landscape (16:9)')
  const [changes, setChanges] = useState('')
  const [isMobile, setIsMobile] = useState(false)
  const [currentMoodboard, setCurrentMoodboard] = useState(null)
  const [showImageModal, setShowImageModal] = useState(false)
  const [loadingState, setLoadingState] = useState(null)

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  // React Query hooks
  const createMutation = useCreateMoodboard()
  const generateMutation = useGenerateMoodboard()

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
    'Landscape (16:9)',
    'Wide (21:9)',
    'Classic (4:3)',
    'Square (1:1)',
  ]

  const getAspectRatioValue = (ratio) => {
    const ratioValues = {
      'Square (1:1)': '1:1',
      'Landscape (16:9)': '16:9',
      'Classic (4:3)': '4:3',
      'Wide (21:9)': '21:9',
    }
    return ratioValues[ratio] || '16:9'
  }

  const handleGenerate = async () => {
    console.log('🚀 Generate button clicked!')

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
      const colorPreferences = selectedColor ? [selectedColor] : []

      const createPayload = {
        title: `${selectedStyle || 'Modern'} ${selectedSpace}`,
        style: styleValue,
        roomType: spaceValue,
        colorPreferences,
        customPrompt: changes.trim(),
        layout: 'collage', // Always collage style like reference image
        imageCount: 1, // Single composite moodboard
        aspectRatio: getAspectRatioValue(selectedRatio),
      }

      console.log('📦 Creating moodboard with:', createPayload)

      const createResult = await createMutation.mutateAsync(createPayload)
      console.log('✅ Moodboard created:', createResult)

      const moodboardId = createResult.data.moodboard._id

      const generatePayload = {
        customPrompt: changes.trim(),
        imageCount: 1,
        aspectRatio: getAspectRatioValue(selectedRatio),
      }

      console.log('🎨 Generating moodboard:', moodboardId, generatePayload)

      const generateResult = await generateMutation.mutateAsync({
        moodboardId,
        data: generatePayload,
      })

      console.log('✅ Moodboard generated:', generateResult)

      setCurrentMoodboard(generateResult.data.moodboard)
      setLoadingState(null)
      toast.success('Moodboard generated successfully!')
    } catch (error) {
      console.error('❌ Generation error:', error)
      setLoadingState(null)
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
      console.log('🔄 Regenerating moodboard')

      const generatePayload = {
        customPrompt: changes.trim() || currentMoodboard.prompt,
        imageCount: 1,
        aspectRatio: getAspectRatioValue(selectedRatio),
      }

      const generateResult = await generateMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: generatePayload,
      })

      setCurrentMoodboard(generateResult.data.moodboard)
      setLoadingState(null)
      toast.success('Moodboard regenerated successfully!')
    } catch (error) {
      console.error('❌ Regeneration error:', error)
      setLoadingState(null)
      toast.error('Failed to regenerate moodboard')
    }
  }

  const downloadMoodboard = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) return

    console.log('💾 Downloading moodboard')
    const link = document.createElement('a')
    link.href = currentMoodboard.compositeMoodboard.url
    link.download = `moodboard-${currentMoodboard._id}.png`
    link.click()
    toast.success('Moodboard downloaded!')
  }

  const renderMoodboard = () => {
    if (!currentMoodboard?.compositeMoodboard?.url) {
      return null
    }

    const composite = currentMoodboard.compositeMoodboard

    return (
      <div className='relative group h-full flex flex-col gap-4'>
        {/* Moodboard Image */}
        <div className='relative max-w-full'>
          <div className='relative inline-block'>
            <img
              src={composite.url}
              alt='Moodboard'
              className='max-w-full max-h-[calc(100vh-350px)] rounded-2xl border border-white/10 shadow-2xl cursor-pointer'
              onClick={() => setShowImageModal(true)}
            />

            {/* Action buttons */}
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

        {/* Color Palette & Mood */}
        {composite.metadata?.colorPalette &&
          composite.metadata.colorPalette.length > 0 && (
            <ColorPaletteMoodCard
              colorPalette={composite.metadata.colorPalette}
              moodDescription={composite.metadata.moodDescription}
            />
          )}

        {/* Design Narrative */}
        {currentMoodboard.designNarrative && (
          <DesignNarrativeCard narrative={currentMoodboard.designNarrative} />
        )}

        {/* Materials */}
        {currentMoodboard.materials && (
          <MaterialsCard materials={currentMoodboard.materials} />
        )}

        {/* Furniture */}
        {currentMoodboard.furniture && (
          <FurnitureCard furniture={currentMoodboard.furniture} />
        )}

        {/* Lighting Concept */}
        {currentMoodboard.lightingConcept && (
          <LightingConceptCard
            lightingConcept={currentMoodboard.lightingConcept}
          />
        )}

        {/* Zones */}
        {currentMoodboard.zones && currentMoodboard.zones.length > 0 && (
          <ZonesCard zones={currentMoodboard.zones} />
        )}

        {/* Variants */}
        {currentMoodboard.variants && currentMoodboard.variants.length > 0 && (
          <VariantsCard variants={currentMoodboard.variants} />
        )}

        {/* Regenerate Button */}
        <motion.button
          onClick={handleRegenerate}
          disabled={loadingState === 'generating'}
          className='w-full h-12 px-6 text-white font-bold rounded-xl bg-gradient-to-r from-[#947d61] to-[#a68970] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2 transition-all'
          whileHover={{ scale: loadingState ? 1 : 1.02 }}
          whileTap={{ scale: loadingState ? 1 : 0.98 }}
        >
          <RefreshCw className='w-5 h-5' />
          <span>Generate New Variation</span>
        </motion.button>
      </div>
    )
  }

  const isGenerating = createMutation.isPending || generateMutation.isPending

  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-black overflow-hidden relative'>
        {/* Background pattern */}
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
                        <LoadingAnimation />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Moodboard Display */}
                  <div className='w-full h-full flex items-center justify-center'>
                    {currentMoodboard?.compositeMoodboard ? (
                      renderMoodboard()
                    ) : (
                      <MoodboardPlaceholder
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
                <ConfigurationPanel
                  selectedSpace={selectedSpace}
                  setSelectedSpace={setSelectedSpace}
                  selectedStyle={selectedStyle}
                  setSelectedStyle={setSelectedStyle}
                  selectedColor={selectedColor}
                  setSelectedColor={setSelectedColor}
                  selectedRatio={selectedRatio}
                  setSelectedRatio={setSelectedRatio}
                  changes={changes}
                  setChanges={setChanges}
                  onGenerate={handleGenerate}
                  isGenerating={isGenerating}
                  spaceTypes={spaceTypes}
                  styles={styles}
                  colors={colors}
                  ratios={ratios}
                  brandColor={brandColor}
                  brandColorLight={brandColorLight}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && currentMoodboard?.compositeMoodboard?.url && (
        <ImageModal
          imageUrl={currentMoodboard.compositeMoodboard.url}
          onClose={() => setShowImageModal(false)}
          onDownload={downloadMoodboard}
        />
      )}
    </>
  )
}

// Supporting Components
const LoadingAnimation = () => (
  <div className='text-center'>
    <div className='relative w-24 h-24 mx-auto mb-6'>
      <div className='absolute inset-0 rounded-full border-4 border-[#947d61]/20'></div>
      <div className='absolute inset-0 rounded-full border-4 border-[#947d61] border-t-transparent animate-spin'></div>
      <div className='absolute inset-0 flex items-center justify-center'>
        <Wand2 className='w-10 h-10 text-[#947d61] animate-pulse' />
      </div>
    </div>
    <h3 className='text-2xl font-bold text-white mb-3'>
      Creating Your Moodboard
    </h3>
    <p className='text-gray-400 mb-6'>
      AI is crafting your professional interior design collage...
    </p>
    <div className='flex items-center justify-center gap-2'>
      {[0, 0.2, 0.4].map((delay, i) => (
        <div
          key={i}
          className='w-3 h-3 bg-[#947d61] rounded-full animate-bounce'
          style={{ animationDelay: `${delay}s` }}
        ></div>
      ))}
    </div>
  </div>
)

const ColorPaletteMoodCard = ({ colorPalette, moodDescription }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className='bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6'
  >
    {/* Mood Description */}
    {moodDescription && (
      <div className='mb-6'>
        <div className='flex items-center gap-2 mb-3'>
          <Sparkles className='w-5 h-5 text-[#947d61]' />
          <h3 className='text-lg font-semibold text-white'>
            {moodDescription.mood}
          </h3>
          <span className='text-gray-400 text-sm'>
            • {moodDescription.feeling}
          </span>
        </div>
        <p className='text-gray-300 text-sm mb-3'>
          {moodDescription.description}
        </p>
        <div className='flex flex-wrap gap-2'>
          {moodDescription.keywords?.map((keyword, index) => (
            <span
              key={index}
              className='px-3 py-1 bg-[#947d61]/20 border border-[#947d61]/30 rounded-full text-xs text-gray-300'
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>
    )}

    {/* Color Palette */}
    <div>
      <div className='flex items-center gap-2 mb-3'>
        <Palette className='w-5 h-5 text-[#947d61]' />
        <h3 className='text-lg font-semibold text-white'>Color Palette</h3>
      </div>
      <div className='grid grid-cols-5 gap-2'>
        {colorPalette.map((color, index) => (
          <div key={index} className='group relative'>
            <div
              className='w-full aspect-square rounded-lg shadow-md cursor-pointer transition-transform hover:scale-110'
              style={{ backgroundColor: color.hex }}
              title={`${color.name} - ${color.percentage}%`}
            />
            <div className='absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/90 text-white text-xs px-2 py-1 rounded whitespace-nowrap pointer-events-none z-10'>
              {color.name}
              <br />
              {color.hex}
            </div>
          </div>
        ))}
      </div>
    </div>
  </motion.div>
)

const ConfigurationPanel = ({
  selectedSpace,
  setSelectedSpace,
  selectedStyle,
  setSelectedStyle,
  selectedColor,
  setSelectedColor,
  selectedRatio,
  setSelectedRatio,
  changes,
  setChanges,
  onGenerate,
  isGenerating,
  spaceTypes,
  styles,
  colors,
  ratios,
  brandColor,
  brandColorLight,
}) => (
  <div className='bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 lg:p-6 max-h-[calc(100vh-8rem)] overflow-y-auto'>
    <div className='space-y-6'>
      {/* Aspect Ratio */}
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
          <h3 className='text-xl font-semibold text-white'>Moodboard Size</h3>
        </div>
        <select
          value={selectedRatio}
          onChange={(e) => setSelectedRatio(e.target.value)}
          disabled={isGenerating}
          className='w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#947d61]'
        >
          {ratios.map((ratio) => (
            <option key={ratio} value={ratio} className='bg-gray-900'>
              {ratio}
            </option>
          ))}
        </select>
      </div>

      {/* Space Type */}
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
          <h3 className='text-xl font-semibold text-white'>Space Type</h3>
        </div>
        <div className='grid grid-cols-2 gap-2'>
          {spaceTypes.map((space) => {
            const IconComponent = space.icon
            return (
              <button
                key={space.name}
                onClick={() => setSelectedSpace(space.name)}
                disabled={isGenerating}
                className={`h-10 px-3 rounded-xl border transition-all flex items-center gap-2 ${
                  selectedSpace === space.name
                    ? 'border-[#947d61] bg-[#947d61]/20 text-white'
                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                }`}
              >
                <IconComponent className='w-4 h-4' />
                <span className='text-sm'>{space.name}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Style & Color */}
      <div>
        <div className='flex items-center gap-3 mb-4'>
          <div
            className='w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm'
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
            }}
          >
            3
          </div>
          <h3 className='text-xl font-semibold text-white'>Style & Colors</h3>
        </div>
        <div className='space-y-3'>
          <select
            value={selectedStyle}
            onChange={(e) => setSelectedStyle(e.target.value)}
            disabled={isGenerating}
            className='w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#947d61]'
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
            className='w-full h-11 px-4 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-[#947d61]'
          >
            <option value=''>Select Color Palette (Optional)</option>
            {colors.map((color) => (
              <option key={color} value={color} className='bg-gray-900'>
                {color}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Vision */}
      <div>
        <div className='flex items-center gap-3 mb-3'>
          <div
            className='w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm'
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
            }}
          >
            4
          </div>
          <h3 className='text-xl font-semibold text-white'>Your Vision</h3>
          <span className='text-red-400 text-xs font-semibold'>*Required</span>
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
        />
        {!changes.trim() && (
          <p className='text-red-400 text-xs mt-2 flex items-center gap-1'>
            <span className='w-1 h-1 bg-red-400 rounded-full'></span>
            Please describe your desired moodboard
          </p>
        )}
        <button
          onClick={onGenerate}
          disabled={isGenerating || !changes.trim()}
          className='w-full h-12 px-6 mt-4 text-white font-bold rounded-xl bg-gradient-to-r from-[#947d61] to-[#a68970] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2'
        >
          <Sparkles className='w-5 h-5' />
          <span>Generate Moodboard</span>
        </button>
      </div>
    </div>
  </div>
)

const MoodboardPlaceholder = ({
  selectedSpace,
  selectedStyle,
  selectedRatio,
}) => (
  <div className='text-center p-8'>
    <Palette className='w-16 h-16 mx-auto mb-4 text-gray-400' />
    <h3 className='text-2xl font-bold text-white mb-3'>Ready to Create</h3>
    <p className='text-gray-400 mb-4'>
      Professional collage-style moodboard with multiple images, colors, and
      mood
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
      <p className='flex items-center justify-center gap-2'>
        <span className='w-2 h-2 bg-[#947d61] rounded-full'></span>
        Collage Style with Color Palette
      </p>
    </div>
  </div>
)

const ImageModal = ({ imageUrl, onClose, onDownload }) => (
  <div
    className='fixed inset-0 bg-black z-50 flex items-center justify-center'
    onClick={onClose}
  >
    <button
      onClick={onClose}
      className='absolute top-6 right-6 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors z-10'
    >
      <X className='w-6 h-6 text-white' />
    </button>
    <button
      onClick={(e) => {
        e.stopPropagation()
        onDownload()
      }}
      className='absolute top-6 right-20 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-full flex items-center gap-2 transition-colors z-10'
    >
      <Download className='w-5 h-5 text-white' />
      <span className='text-white text-sm font-medium'>Download</span>
    </button>
    <img
      src={imageUrl}
      alt='Full View'
      className='max-w-[95vw] max-h-[95vh] object-contain'
      onClick={(e) => e.stopPropagation()}
    />
  </div>
)

export default MoodboardGenerator
