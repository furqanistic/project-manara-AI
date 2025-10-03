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
  ArrowRight,
  Camera,
  ChefHat,
  ChevronDown,
  Download,
  Edit3,
  Globe,
  Heart,
  Home,
  Layers,
  Loader2,
  Palette,
  Plus,
  RefreshCw,
  Settings,
  Sliders,
  Sofa,
  Sparkles,
  Utensils,
  X,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'

const MoodboardGenerator = () => {
  const [selectedSpace, setSelectedSpace] = useState('Living Room')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('Square (1:1)')
  const [changes, setChanges] = useState('')
  const [products, setProducts] = useState([])
  const [isMobile, setIsMobile] = useState(false)
  const [currentMoodboard, setCurrentMoodboard] = useState(null)
  const [editingImageIndex, setEditingImageIndex] = useState(null)
  const [editPrompt, setEditPrompt] = useState('')
  const [selectedImages, setSelectedImages] = useState([])
  const [regeneratePrompt, setRegeneratePrompt] = useState('')
  const [showRegeneratePanel, setShowRegeneratePanel] = useState(false)
  const [moodboardLayout, setMoodboardLayout] = useState('grid') // 'grid', 'collage', 'single'
  const [imageCount, setImageCount] = useState(4)

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

  // Updated aspect ratios based on Gemini 2.5 Flash Image support
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

  const layouts = [
    { name: 'Grid', value: 'grid', description: 'Equal-sized grid layout' },
    {
      name: 'Collage',
      value: 'collage',
      description: 'Mixed-size artistic layout',
    },
    { name: 'Single', value: 'single', description: 'One large image' },
  ]

  const getAspectRatioClass = (ratio) => {
    const ratioMap = {
      'Square (1:1)': 'aspect-square',
      'Landscape (16:9)': 'aspect-video',
      'Landscape (4:3)': 'aspect-[4/3]',
      'Portrait (9:16)': 'aspect-[9/16]',
      'Portrait (3:4)': 'aspect-[3/4]',
      'Wide (2:1)': 'aspect-[2/1]',
      'Tall (1:2)': 'aspect-[1/2]',
      'Cinema (21:9)': 'aspect-[21/9]',
      'Classic (5:4)': 'aspect-[5/4]',
      'Photo (3:2)': 'aspect-[3/2]',
    }
    return ratioMap[ratio] || 'aspect-square'
  }

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
    try {
      const spaceValue =
        spaceTypes.find((s) => s.name === selectedSpace)?.value || 'living_room'
      const styleValue =
        styles.find((s) => s.label === selectedStyle)?.value || 'modern'
      const colorPalette = selectedColor ? [selectedColor] : []

      let customPrompt = changes || ''
      if (products.length > 0) {
        customPrompt += ` Include these items: ${products.join(', ')}.`
      }

      // Create moodboard with layout and image count
      const createResult = await createMutation.mutateAsync({
        title: `${selectedStyle || 'Modern'} ${selectedSpace}`,
        style: styleValue,
        roomType: spaceValue,
        colorPalette,
        customPrompt,
        layout: moodboardLayout,
        imageCount,
        aspectRatio: getAspectRatioValue(selectedRatio),
      })

      const moodboardId = createResult.data.moodboard._id

      toast.loading('Generating your moodboard...', { id: 'generate' })

      const generateResult = await generateMutation.mutateAsync({
        moodboardId,
        data: {
          customPrompt,
          imageCount,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(generateResult.data.moodboard)
      toast.success('Moodboard generated successfully!', { id: 'generate' })
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to generate moodboard',
        { id: 'generate' }
      )
    }
  }

  const handleSelectImage = (index) => {
    setSelectedImages((prev) => {
      if (prev.includes(index)) {
        return prev.filter((i) => i !== index)
      }
      return [...prev, index]
    })
  }

  const handleRegenerateSelected = async () => {
    if (selectedImages.length === 0) {
      toast.error('Please select at least one image to regenerate')
      return
    }

    try {
      toast.loading('Regenerating selected images...', { id: 'regenerate' })

      const result = await regenerateMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: {
          imageIndices: selectedImages,
          customPrompt: regeneratePrompt,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(result.data.moodboard)
      setSelectedImages([])
      setRegeneratePrompt('')
      setShowRegeneratePanel(false)
      toast.success('Images regenerated successfully!', { id: 'regenerate' })
    } catch (error) {
      toast.error(
        error.response?.data?.message || 'Failed to regenerate images',
        { id: 'regenerate' }
      )
    }
  }

  const handleEditImage = async (imageIndex) => {
    if (!editPrompt.trim()) {
      toast.error('Please enter edit instructions')
      return
    }

    try {
      toast.loading('Editing image...', { id: 'edit' })

      const result = await editMutation.mutateAsync({
        moodboardId: currentMoodboard._id,
        data: {
          imageIndex,
          editPrompt,
          aspectRatio: getAspectRatioValue(selectedRatio),
        },
      })

      setCurrentMoodboard(result.data.moodboard)
      setEditingImageIndex(null)
      setEditPrompt('')
      toast.success('Image edited successfully!', { id: 'edit' })
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to edit image', {
        id: 'edit',
      })
    }
  }

  const downloadImage = (imageUrl, index) => {
    const link = document.createElement('a')
    link.href = imageUrl
    link.download = `moodboard-${currentMoodboard._id}-${index}.png`
    link.click()
  }

  const renderMoodboardLayout = () => {
    if (!currentMoodboard || !currentMoodboard.generatedImages?.length) {
      return null
    }

    const images = currentMoodboard.generatedImages

    if (moodboardLayout === 'single') {
      return (
        <div className='relative group'>
          <img
            src={images[0].url}
            alt='Moodboard'
            className={`w-full ${getAspectRatioClass(
              selectedRatio
            )} object-cover rounded-2xl border border-white/10`}
          />
          <MoodboardImageOverlay
            image={images[0]}
            index={0}
            onDownload={() => downloadImage(images[0].url, 0)}
            onEdit={() => setEditingImageIndex(0)}
            onSelect={() => handleSelectImage(0)}
            isSelected={selectedImages.includes(0)}
          />
        </div>
      )
    }

    if (moodboardLayout === 'collage') {
      return (
        <div className='grid grid-cols-6 grid-rows-4 gap-2 h-[600px]'>
          {images.slice(0, 5).map((img, idx) => {
            const colSpan = idx === 0 ? 'col-span-4' : 'col-span-2'
            const rowSpan =
              idx === 0 ? 'row-span-2' : idx < 3 ? 'row-span-2' : 'row-span-2'

            return (
              <div key={idx} className={`relative group ${colSpan} ${rowSpan}`}>
                <img
                  src={img.url}
                  alt={`Moodboard ${idx + 1}`}
                  className='w-full h-full object-cover rounded-lg border border-white/10'
                />
                <MoodboardImageOverlay
                  image={img}
                  index={idx}
                  onDownload={() => downloadImage(img.url, idx)}
                  onEdit={() => setEditingImageIndex(idx)}
                  onSelect={() => handleSelectImage(idx)}
                  isSelected={selectedImages.includes(idx)}
                />
              </div>
            )
          })}
        </div>
      )
    }

    // Default grid layout
    return (
      <div
        className={`grid ${
          imageCount <= 2 ? 'grid-cols-1 md:grid-cols-2' : 'grid-cols-2'
        } gap-4`}
      >
        {images.slice(0, imageCount).map((img, idx) => (
          <div key={idx} className='relative group'>
            <img
              src={img.url}
              alt={`Moodboard ${idx + 1}`}
              className={`w-full ${getAspectRatioClass(
                selectedRatio
              )} object-cover rounded-xl border border-white/10`}
            />
            <MoodboardImageOverlay
              image={img}
              index={idx}
              onDownload={() => downloadImage(img.url, idx)}
              onEdit={() => setEditingImageIndex(idx)}
              onSelect={() => handleSelectImage(idx)}
              isSelected={selectedImages.includes(idx)}
            />
            {editingImageIndex === idx && (
              <EditImageModal
                editPrompt={editPrompt}
                setEditPrompt={setEditPrompt}
                onClose={() => setEditingImageIndex(null)}
                onEdit={() => handleEditImage(idx)}
                isEditing={editMutation.isPending}
              />
            )}
          </div>
        ))}
      </div>
    )
  }

  const isGenerating = createMutation.isPending || generateMutation.isPending
  const isRegenerating = regenerateMutation.isPending

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
        </div>

        {/* Main Content */}
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
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 lg:p-6 min-h-[600px] sticky top-24'>
                  {/* Regeneration Controls */}
                  {currentMoodboard && selectedImages.length > 0 && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className='mb-4 p-4 bg-gradient-to-r from-[#947d61]/20 to-[#a68970]/20 rounded-xl border border-[#947d61]/30'
                    >
                      <div className='flex items-center justify-between mb-3'>
                        <div>
                          <h4 className='text-white font-semibold flex items-center gap-2'>
                            <RefreshCw className='w-4 h-4' />
                            {selectedImages.length} image(s) selected
                          </h4>
                          <p className='text-gray-400 text-xs mt-1'>
                            Regenerate with new settings or prompt
                          </p>
                        </div>
                        <button
                          onClick={() => setSelectedImages([])}
                          className='text-gray-400 hover:text-white'
                        >
                          <X className='w-4 h-4' />
                        </button>
                      </div>

                      <textarea
                        value={regeneratePrompt}
                        onChange={(e) => setRegeneratePrompt(e.target.value)}
                        placeholder='Optional: Add specific changes for regeneration...'
                        className='w-full p-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none h-16 mb-3 text-sm'
                      />

                      <button
                        onClick={handleRegenerateSelected}
                        disabled={isRegenerating}
                        className='w-full h-10 px-4 text-white font-semibold rounded-lg bg-gradient-to-r from-[#947d61] to-[#a68970] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2'
                      >
                        {isRegenerating ? (
                          <>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            <span>Regenerating...</span>
                          </>
                        ) : (
                          <>
                            <RefreshCw className='w-4 h-4' />
                            <span>Regenerate Selected</span>
                          </>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* Moodboard Display */}
                  <div className='w-full'>
                    {currentMoodboard &&
                    currentMoodboard.generatedImages?.length > 0 ? (
                      renderMoodboardLayout()
                    ) : (
                      <MoodboardPlaceholder
                        isGenerating={isGenerating}
                        selectedSpace={selectedSpace}
                        selectedStyle={selectedStyle}
                        selectedRatio={selectedRatio}
                        aspectRatioClass={getAspectRatioClass(selectedRatio)}
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
                <div className='bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 h-[calc(100vh-8rem)]'>
                  <div className='h-full overflow-y-auto space-y-6 pr-2'>
                    {/* Step 1: Layout Settings */}
                    <div>
                      <div className='flex items-center gap-3 mb-4'>
                        <div
                          className='w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          1
                        </div>
                        <h3 className='text-lg font-semibold text-white'>
                          Layout & Format
                        </h3>
                      </div>

                      {/* Layout Type */}
                      <div className='mb-3'>
                        <p className='text-gray-300 text-xs mb-2'>
                          Layout Type
                        </p>
                        <div className='grid grid-cols-3 gap-2'>
                          {layouts.map((layout) => (
                            <button
                              key={layout.value}
                              onClick={() => setMoodboardLayout(layout.value)}
                              disabled={isGenerating}
                              className={`p-2 rounded-lg border transition-all text-xs ${
                                moodboardLayout === layout.value
                                  ? 'border-[#947d61] bg-[#947d61]/20 text-white'
                                  : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                              }`}
                            >
                              {layout.name}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Image Count */}
                      {moodboardLayout !== 'single' && (
                        <div className='mb-3'>
                          <p className='text-gray-300 text-xs mb-2'>
                            Number of Images: {imageCount}
                          </p>
                          <input
                            type='range'
                            min='1'
                            max='6'
                            value={imageCount}
                            onChange={(e) =>
                              setImageCount(parseInt(e.target.value))
                            }
                            disabled={isGenerating}
                            className='w-full'
                          />
                        </div>
                      )}

                      {/* Aspect Ratio */}
                      <div className='mb-3'>
                        <p className='text-gray-300 text-xs mb-2'>
                          Aspect Ratio
                        </p>
                        <select
                          value={selectedRatio}
                          onChange={(e) => setSelectedRatio(e.target.value)}
                          disabled={isGenerating}
                          className='w-full h-8 px-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none'
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
                    </div>

                    {/* Step 2: Design Details */}
                    <div>
                      <div className='flex items-center gap-3 mb-4'>
                        <div
                          className='w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          2
                        </div>
                        <h3 className='text-lg font-semibold text-white'>
                          Design Details
                        </h3>
                      </div>

                      {/* Space Types */}
                      <div className='mb-4'>
                        <p className='text-gray-300 text-xs mb-2'>Space Type</p>
                        <div className='grid grid-cols-2 gap-2'>
                          {spaceTypes.map((space) => {
                            const IconComponent = space.icon
                            return (
                              <motion.button
                                key={space.name}
                                onClick={() => setSelectedSpace(space.name)}
                                disabled={isGenerating}
                                className={`h-8 px-2 rounded-lg border transition-all duration-300 flex items-center gap-1.5 disabled:opacity-50 ${
                                  selectedSpace === space.name
                                    ? 'border-[#947d61] bg-[#947d61]/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                                }`}
                                whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                                whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                              >
                                <IconComponent className='w-3 h-3' />
                                <span className='text-xs'>{space.name}</span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Style and Color */}
                      <div className='space-y-3'>
                        <select
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          disabled={isGenerating}
                          className='w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm'
                        >
                          <option value=''>Select Style</option>
                          {styles.map((style) => (
                            <option key={style.value} value={style.label}>
                              {style.label}
                            </option>
                          ))}
                        </select>

                        <select
                          value={selectedColor}
                          onChange={(e) => setSelectedColor(e.target.value)}
                          disabled={isGenerating}
                          className='w-full h-8 px-3 bg-white/5 border border-white/10 rounded-lg text-white text-sm'
                        >
                          <option value=''>Select Color Palette</option>
                          {colors.map((color) => (
                            <option key={color} value={color}>
                              {color}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Step 3: Products & Customization */}
                    <div>
                      <div className='flex items-center gap-3 mb-3'>
                        <div
                          className='w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          3
                        </div>
                        <h3 className='text-lg font-semibold text-white'>
                          Customize
                        </h3>
                      </div>

                      <textarea
                        value={changes}
                        onChange={(e) => setChanges(e.target.value)}
                        disabled={isGenerating}
                        placeholder='Describe any specific requirements...'
                        className='w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none h-16 text-sm'
                      />

                      {/* Generate Button */}
                      <motion.button
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className='w-full h-10 px-4 mt-4 text-white font-semibold rounded-xl bg-gradient-to-r from-[#947d61] to-[#a68970] disabled:opacity-50'
                        whileHover={{ scale: isGenerating ? 1 : 1.02 }}
                        whileTap={{ scale: isGenerating ? 1 : 0.98 }}
                      >
                        {isGenerating ? (
                          <div className='flex items-center justify-center gap-2'>
                            <Loader2 className='w-4 h-4 animate-spin' />
                            <span>Generating...</span>
                          </div>
                        ) : (
                          <div className='flex items-center justify-center gap-2'>
                            <Sparkles className='w-4 h-4' />
                            <span>Generate Moodboard</span>
                          </div>
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Component for image overlay controls
const MoodboardImageOverlay = ({
  image,
  index,
  onDownload,
  onEdit,
  onSelect,
  isSelected,
}) => (
  <>
    {/* Selection checkbox */}
    <div
      className={`absolute top-2 left-2 w-6 h-6 rounded border-2 flex items-center justify-center cursor-pointer transition-all ${
        isSelected
          ? 'bg-[#947d61] border-[#947d61]'
          : 'bg-black/50 border-white/50 hover:border-white'
      }`}
      onClick={onSelect}
    >
      {isSelected && (
        <svg
          className='w-4 h-4 text-white'
          fill='currentColor'
          viewBox='0 0 20 20'
        >
          <path
            fillRule='evenodd'
            d='M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z'
            clipRule='evenodd'
          />
        </svg>
      )}
    </div>

    {/* Action buttons */}
    <div className='absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
      <button
        onClick={onDownload}
        className='p-2 bg-black/80 rounded-lg hover:bg-black transition-colors'
      >
        <Download className='w-4 h-4 text-white' />
      </button>
      <button
        onClick={onEdit}
        className='p-2 bg-black/80 rounded-lg hover:bg-black transition-colors'
      >
        <Edit3 className='w-4 h-4 text-white' />
      </button>
      <button
        onClick={onSelect}
        className='p-2 bg-black/80 rounded-lg hover:bg-black transition-colors'
      >
        <RefreshCw className='w-4 h-4 text-white' />
      </button>
    </div>
  </>
)

// Component for edit modal
const EditImageModal = ({
  editPrompt,
  setEditPrompt,
  onClose,
  onEdit,
  isEditing,
}) => (
  <div className='absolute inset-0 bg-black/90 rounded-xl p-4 flex flex-col justify-center z-10'>
    <button
      onClick={onClose}
      className='absolute top-2 right-2 p-1 bg-white/10 rounded-lg hover:bg-white/20'
    >
      <X className='w-4 h-4 text-white' />
    </button>

    <h3 className='text-white font-semibold mb-3 text-sm'>Edit Image</h3>

    <textarea
      value={editPrompt}
      onChange={(e) => setEditPrompt(e.target.value)}
      placeholder='Describe edits (e.g., "remove background", "change color to blue")'
      className='w-full p-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 resize-none h-24 text-sm mb-3'
    />

    <button
      onClick={onEdit}
      disabled={isEditing}
      className='w-full h-10 px-4 text-white font-semibold rounded-lg bg-gradient-to-r from-[#947d61] to-[#a68970] hover:opacity-90 disabled:opacity-50 flex items-center justify-center gap-2'
    >
      {isEditing ? (
        <>
          <Loader2 className='w-4 h-4 animate-spin' />
          <span>Editing...</span>
        </>
      ) : (
        <>
          <Edit3 className='w-4 h-4' />
          <span>Apply Edit</span>
        </>
      )}
    </button>
  </div>
)

// Component for placeholder
const MoodboardPlaceholder = ({
  isGenerating,
  selectedSpace,
  selectedStyle,
  selectedRatio,
  aspectRatioClass,
}) => (
  <div
    className={`${aspectRatioClass} max-w-full bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 flex items-center justify-center`}
  >
    <div className='text-center p-4'>
      {isGenerating ? (
        <>
          <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#947d61] to-[#a68970] rounded-full flex items-center justify-center'>
            <Loader2 className='w-8 h-8 text-white animate-spin' />
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Generating Your Moodboard
          </h3>
          <p className='text-gray-400 text-sm'>
            Creating your personalized design...
          </p>
        </>
      ) : (
        <>
          <div className='w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center'>
            <Palette className='w-8 h-8 text-gray-400' />
          </div>
          <h3 className='text-lg font-semibold text-white mb-2'>
            Your Moodboard Preview
          </h3>
          <p className='text-gray-400 text-sm mb-3'>
            Configure settings and generate
          </p>
          <div className='text-xs text-gray-500'>
            {selectedSpace}
            {selectedStyle && ` • ${selectedStyle}`}
            <br />
            <span className='text-[#947d61]'>{selectedRatio}</span>
          </div>
        </>
      )}
    </div>
  </div>
)

export default MoodboardGenerator
