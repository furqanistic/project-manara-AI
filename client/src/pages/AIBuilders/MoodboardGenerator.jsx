import TopBar from '@/components/Layout/Topbar'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Camera,
  ChefHat,
  ChevronDown,
  Globe,
  Heart,
  Home,
  Layers,
  Palette,
  Plus,
  RotateCcw,
  Sofa,
  Sparkles,
  Undo2,
  Utensils,
} from 'lucide-react'
import React, { useEffect, useState } from 'react'

const MoodboardGenerator = () => {
  const [selectedSpace, setSelectedSpace] = useState('Living Room')
  const [selectedStyle, setSelectedStyle] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedRatio, setSelectedRatio] = useState('Landscape (4:3)')
  const [changes, setChanges] = useState('')
  const [products, setProducts] = useState([])
  const [isMobile, setIsMobile] = useState(false)

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  const spaceTypes = [
    { name: 'Living Room', icon: Sofa },
    { name: 'Bedroom', icon: Home },
    { name: 'Kitchen', icon: ChefHat },
    { name: 'Dining Room', icon: Utensils },
    { name: 'Bathroom', icon: Home },
    { name: 'Office', icon: Layers },
    { name: 'Balcony', icon: Globe },
    { name: 'Kids Room', icon: Heart },
  ]

  const styles = [
    'Modern Minimalist',
    'Scandinavian',
    'Industrial',
    'Bohemian',
    'Mid-Century Modern',
    'Traditional',
    'Contemporary',
    'Rustic',
    'Mediterranean',
    'Art Deco',
    'Transitional',
    'Farmhouse',
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
    'Bold Jewel Tones',
    'Muted Pastels',
  ]

  const ratios = [
    'Landscape (4:3)',
    'Portrait (3:4)',
    'Square (1:1)',
    'Wide (16:9)',
  ]

  const floatingElements = [
    {
      icon: Sparkles,
      position: { top: '15%', left: '5%' },
      size: 'w-6 h-6',
      color: brandColor,
      delay: 0,
    },
    {
      icon: Palette,
      position: { top: '60%', left: '8%' },
      size: 'w-5 h-5',
      color: '#3b82f6',
      delay: 1,
    },
    {
      icon: Camera,
      position: { top: '30%', left: '3%' },
      size: 'w-6 h-6',
      color: '#10b981',
      delay: 2,
    },
    {
      icon: Globe,
      position: { top: '80%', left: '10%' },
      size: 'w-4 h-4',
      color: '#f59e0b',
      delay: 1.5,
    },
  ]

  const getAspectRatioClass = (ratio) => {
    switch (ratio) {
      case 'Landscape (4:3)':
        return 'aspect-[4/3]'
      case 'Portrait (3:4)':
        return 'aspect-[3/4]'
      case 'Square (1:1)':
        return 'aspect-square'
      case 'Wide (16:9)':
        return 'aspect-video'
      default:
        return 'aspect-video'
    }
  }

  const handleGenerate = () => {
    console.log('Generating moodboard with:', {
      space: selectedSpace,
      style: selectedStyle,
      color: selectedColor,
      ratio: selectedRatio,
      changes,
      products,
    })
    // Here you would call your AI moodboard generation API
  }

  const addProduct = () => {
    const furnitureItems = [
      'Sofa',
      'Coffee Table',
      'Armchair',
      'Lamp',
      'Rug',
      'Artwork',
      'Plant',
      'Cushions',
    ]
    const randomItem =
      furnitureItems[Math.floor(Math.random() * furnitureItems.length)]
    const newProduct = `${randomItem} ${products.length + 1}`
    setProducts([...products, newProduct])
  }

  return (
    <>
      <TopBar />
      <div className='min-h-screen bg-black overflow-hidden relative'>
        {/* Background Elements */}
        <div className='absolute inset-0'>
          {/* Grid pattern */}
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

          {/* Floating elements */}
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
        <div className='relative z-10 min-h-screen pt-24 pb-8'>
          <div className='max-w-7xl mx-auto px-4'>
            <div className='grid lg:grid-cols-12 gap-6'>
              {/* Left Preview Area - Fixed/Sticky */}
              <motion.div
                className='lg:col-span-7'
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className='bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-4 lg:p-6 h-auto lg:h-[calc(100vh-8rem)] flex flex-col justify-center sticky top-24 overflow-hidden'>
                  {/* Dynamic Aspect Ratio Preview Container */}
                  <div className='w-full flex justify-center items-center'>
                    <div
                      className={`${getAspectRatioClass(
                        selectedRatio
                      )} max-w-full max-h-[70vh] lg:max-h-[calc(100vh-12rem)] bg-gradient-to-br from-white/10 to-white/5 rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-500 ease-in-out`}
                      style={{
                        width:
                          selectedRatio === 'Portrait (3:4)' ? '60%' : '100%',
                      }}
                    >
                      <div className='text-center p-4'>
                        <div className='w-12 h-12 lg:w-16 lg:h-16 mx-auto mb-3 lg:mb-4 bg-gradient-to-br from-white/10 to-white/5 rounded-full flex items-center justify-center'>
                          <Palette className='w-6 h-6 lg:w-8 lg:h-8 text-gray-400' />
                        </div>
                        <h3 className='text-base lg:text-lg font-semibold text-white mb-2'>
                          Your Moodboard Preview
                        </h3>
                        <p className='text-gray-400 text-xs lg:text-sm mb-3'>
                          Configure your preferences and generate your
                          personalized moodboard
                        </p>
                        <div className='text-xs text-gray-500'>
                          Selected: {selectedSpace}
                          {selectedStyle && ` • ${selectedStyle}`}
                          <br />
                          <span className='text-[#947d61]'>
                            Format: {selectedRatio}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Right Configuration Panel - Fixed height with scrollable content */}
              <motion.div
                className='lg:col-span-5'
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <div className='bg-black/40 backdrop-blur-2xl border border-white/10 rounded-3xl p-4 h-[calc(100vh-8rem)]'>
                  <div className='h-full overflow-y-auto space-y-6 pr-2'>
                    {/* Step 1: Choose Design Details */}
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
                          Choose your design details
                        </h3>
                      </div>

                      {/* Space Types */}
                      <div className='mb-4'>
                        <p className='text-gray-300 text-xs mb-2'>
                          What space are you designing?
                        </p>
                        <div className='grid grid-cols-2 gap-2'>
                          {spaceTypes.map((space) => {
                            const IconComponent = space.icon
                            return (
                              <motion.button
                                key={space.name}
                                onClick={() => setSelectedSpace(space.name)}
                                className={`h-8 px-2 rounded-lg border transition-all duration-300 flex items-center gap-1.5 ${
                                  selectedSpace === space.name
                                    ? 'border-[#947d61] bg-[#947d61]/20 text-white'
                                    : 'border-white/10 bg-white/5 text-gray-300 hover:border-white/20'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                              >
                                <IconComponent className='w-3 h-3 flex-shrink-0' />
                                <span className='text-xs font-medium truncate'>
                                  {space.name}
                                </span>
                              </motion.button>
                            )
                          })}
                        </div>
                      </div>

                      {/* Dropdowns */}
                      <div className='space-y-3'>
                        {/* Styles Dropdown */}
                        <div>
                          <div className='relative'>
                            <select
                              value={selectedStyle}
                              onChange={(e) => setSelectedStyle(e.target.value)}
                              className='w-full h-8 px-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#947d61]/50'
                            >
                              <option value='' className='bg-gray-900'>
                                Styles
                              </option>
                              {styles.map((style) => (
                                <option
                                  key={style}
                                  value={style}
                                  className='bg-gray-900'
                                >
                                  {style}
                                </option>
                              ))}
                            </select>
                            <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                          </div>
                        </div>

                        {/* Colors Dropdown */}
                        <div>
                          <div className='relative'>
                            <select
                              value={selectedColor}
                              onChange={(e) => setSelectedColor(e.target.value)}
                              className='w-full h-8 px-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#947d61]/50'
                            >
                              <option value='' className='bg-gray-900'>
                                Colors
                              </option>
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
                            <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                          </div>
                        </div>

                        {/* Ratio Dropdown */}
                        <div>
                          <div className='relative'>
                            <select
                              value={selectedRatio}
                              onChange={(e) => setSelectedRatio(e.target.value)}
                              className='w-full h-8 px-3 pr-8 bg-white/5 border border-white/10 rounded-lg text-white text-sm appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#947d61]/50'
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
                            <ChevronDown className='absolute right-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Step 2: Add Products */}
                    <div>
                      <div className='flex items-center gap-3 mb-3'>
                        <div
                          className='w-6 h-6 rounded-full flex items-center justify-center text-white font-semibold text-xs'
                          style={{
                            background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          }}
                        >
                          2
                        </div>
                        <h3 className='text-lg font-semibold text-white'>
                          Add Products
                        </h3>
                      </div>

                      <motion.button
                        onClick={addProduct}
                        className='w-full h-8 border-2 border-dashed border-white/20 rounded-lg text-gray-300 hover:border-[#947d61]/50 hover:text-white transition-all duration-300 flex items-center justify-center gap-2 text-sm'
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className='w-4 h-4' />
                        Add Furniture/Decor
                      </motion.button>

                      {products.length > 0 && (
                        <div className='mt-3 space-y-2'>
                          {products.map((product, index) => (
                            <div
                              key={index}
                              className='p-2 bg-white/5 rounded-md text-gray-300 text-xs'
                            >
                              {product}
                            </div>
                          ))}
                        </div>
                      )}

                      <p className='text-gray-400 text-xs mt-2'>
                        Your furniture and decor items will be integrated
                        seamlessly into the moodboard design
                      </p>
                    </div>

                    {/* Step 3: Changes */}
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
                          What changes would you like?
                        </h3>
                      </div>

                      <textarea
                        value={changes}
                        onChange={(e) => setChanges(e.target.value)}
                        placeholder="Describe changes... (e.g., 'make it warmer', 'add more plants')"
                        className='w-full p-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 resize-none h-16 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 text-sm'
                      />

                      <div className='flex flex-wrap gap-1.5 mt-2'>
                        {[
                          'lighting',
                          'furniture',
                          'textiles',
                          'plants',
                          'artwork',
                          'storage',
                        ].map((tag) => (
                          <span
                            key={tag}
                            className='px-2 py-1 bg-white/10 rounded-full text-gray-300 text-xs'
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Generate Button */}
                    <div className='pt-2'>
                      <motion.button
                        onClick={handleGenerate}
                        className='w-full h-10 px-4 text-white font-semibold rounded-xl relative overflow-hidden group'
                        style={{
                          background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                          boxShadow: `0 4px 15px ${brandColor}25`,
                        }}
                        whileHover={{
                          scale: 1.02,
                          boxShadow: `0 6px 20px ${brandColor}35`,
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{
                          type: 'spring',
                          stiffness: 400,
                          damping: 17,
                        }}
                      >
                        <div className='relative flex items-center justify-center gap-2'>
                          <Sparkles className='w-4 h-4' />
                          <span className='text-sm'>Generate</span>
                          <ArrowRight className='w-4 h-4 group-hover:translate-x-1 transition-transform' />
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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

export default MoodboardGenerator
