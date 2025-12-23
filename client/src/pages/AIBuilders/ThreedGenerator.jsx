import axiosInstance from '@/config/config'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ChevronRight,
  Download,
  FileUp,
  RotateCcw,
  Sparkles,
  Trash2,
  View,
} from 'lucide-react'
import React, { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { toast } from 'react-hot-toast'
import { Link } from 'react-router-dom'

// Import model-viewer as a side effect
import '@google/model-viewer'

const BRAND_COLOR = '#947d61'
const BRAND_COLOR_LIGHT = '#a68970'
const BRAND_COLOR_DARK = '#7d6850'

const ThreedGenerator = () => {
  const [image, setImage] = useState(null) // { file, preview }
  const [isGenerating, setIsGenerating] = useState(false)
  const [result, setResult] = useState(null) // { glbUrl, sourceImage, name }
  const [progress, setProgress] = useState(0)

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      setImage({
        file,
        preview: URL.createObjectURL(file),
      })
      setResult(null)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png'],
    },
    multiple: false,
  })

  const removeImage = () => {
    setImage(null)
    setResult(null)
  }

  const handleGenerate = async () => {
    if (!image) {
      toast.error('Please upload an image first')
      return
    }

    setIsGenerating(true)
    setProgress(10)

    const formData = new FormData()
    formData.append('image', image.file)
    formData.append('name', `3D Model - ${image.file.name}`)

    let interval = null

    try {
      // Simulate progress since Gradio takes some time
      interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) return prev
          return prev + 1
        })
      }, 1000)

      const response = await axiosInstance.post('/3d/generate', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      clearInterval(interval)
      interval = null
      setProgress(100)

      if (response.data?.status === 'success') {
        setResult(response.data.data)
        toast.success('3D Model generated successfully!')
      }
    } catch (error) {
      console.error('Generation error:', error)
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to generate 3D model. The AI service may be busy - please try again.'
      toast.error(errorMessage)
      setProgress(0)
    } finally {
      if (interval) {
        clearInterval(interval)
      }
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!result?.glbUrl) return

    const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8800'
    const link = document.createElement('a')
    link.href = `${baseUrl}${result.glbUrl}`
    link.download = result.name || 'model.glb'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className='min-h-screen bg-[#faf9f8] text-[#2d2a26] pb-20'>
      {/* Header */}
      <header className='px-6 py-4 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-[#e8e4e0]'>
        <div className='flex items-center gap-4'>
          <Link
            to='/'
            className='p-2 hover:bg-[#f3f1ee] rounded-full transition-colors'
          >
            <ArrowLeft className='w-5 h-5' />
          </Link>
          <div className='flex items-center gap-2'>
            <div
              className='w-8 h-8 rounded-lg flex items-center justify-center'
              style={{ backgroundColor: BRAND_COLOR }}
            >
              <View className='w-5 h-5 text-white' />
            </div>
            <h1 className='text-xl font-bold tracking-tight'>3D Transformer</h1>
          </div>
        </div>

        <nav className='hidden md:flex items-center gap-6 text-sm font-medium'>
          <Link to='/visualizer' className='text-[#947d61]'>
            AI Transform
          </Link>
          <Link to='/moodboard' className='hover:text-[#947d61] transition-colors'>
            Moodboards
          </Link>
          <Link to='/floorplans' className='hover:text-[#947d61] transition-colors'>
            Floor Plans
          </Link>
        </nav>

        <div className='flex items-center gap-3'>
          <button className='px-4 py-2 text-sm font-semibold rounded-full border border-[#e8e4e0] hover:bg-[#f3f1ee] transition-colors'>
            History
          </button>
        </div>
      </header>

      <main className='max-w-6xl mx-auto px-6 pt-12'>
        <div className='grid lg:grid-cols-2 gap-12'>
          {/* Left Column: Upload & Controls */}
          <div className='flex flex-col gap-8'>
            <div className='space-y-4'>
              <h2 className='text-4xl font-extrabold tracking-tight lg:text-5xl'>
                Image to <span style={{ color: BRAND_COLOR }}>3D</span>
              </h2>
              <p className='text-lg text-[#6b665f] max-w-md'>
                Upload a clear image of an object or furniture piece to transform
                it into a high-quality 3D GLB model in seconds.
              </p>
            </div>

            <div className='space-y-6'>
              {!image ? (
                <div
                  {...getRootProps()}
                  className={`
                    border-2 border-dashed rounded-3xl p-12 flex flex-col items-center justify-center gap-4 cursor-pointer transition-all
                    ${
                      isDragActive
                        ? 'border-[#947d61] bg-[#947d61]/5 scale-[1.02]'
                        : 'border-[#e8e4e0] bg-white hover:border-[#947d61]/50 hover:bg-[#faf9f8]'
                    }
                  `}
                >
                  <input {...getInputProps()} />
                  <div className='w-16 h-16 rounded-2xl bg-[#f3f1ee] flex items-center justify-center'>
                    <FileUp className='w-8 h-8 text-[#947d61]' />
                  </div>
                  <div className='text-center'>
                    <p className='text-lg font-bold'>Click or drag image</p>
                    <p className='text-sm text-[#6b665f]'>
                      Supports JPG, PNG (Max 10MB)
                    </p>
                  </div>
                </div>
              ) : (
                <div className='relative rounded-3xl overflow-hidden bg-white shadow-xl border border-[#e8e4e0] group'>
                  <img
                    src={image.preview}
                    alt='Preview'
                    className='w-full aspect-square object-contain p-8'
                  />
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4'>
                    <button
                      onClick={removeImage}
                      className='p-3 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-colors'
                    >
                      <Trash2 className='w-6 h-6' />
                    </button>
                  </div>
                  <div className='absolute bottom-4 left-4 right-4 bg-white/80 backdrop-blur-md p-3 rounded-2xl flex items-center justify-between'>
                    <span className='text-sm font-semibold truncate'>
                      {image.file.name}
                    </span>
                    <button
                      onClick={removeImage}
                      className='text-[#6b665f] hover:text-red-500 transition-colors'
                    >
                      <RotateCcw className='w-4 h-4' />
                    </button>
                  </div>
                </div>
              )}

              <button
                onClick={handleGenerate}
                disabled={!image || isGenerating}
                className={`
                  w-full py-5 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg
                  ${
                    !image || isGenerating
                      ? 'bg-[#e8e4e0] text-[#a6a099] cursor-not-allowed'
                      : 'text-white hover:shadow-xl active:scale-[0.98]'
                  }
                `}
                style={{
                  backgroundColor: !image || isGenerating ? '#e8e4e0' : BRAND_COLOR,
                }}
              >
                {isGenerating ? (
                  <>
                    <div className='w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin' />
                    <span>Generating Model {progress}%</span>
                  </>
                ) : (
                  <>
                    <Sparkles className='w-6 h-6' />
                    <span>Start Transformation</span>
                  </>
                )}
              </button>

              <div className='flex items-center gap-2 p-4 bg-[#f3f1ee] rounded-2xl text-xs text-[#6b665f]'>
                <span className='w-2 h-2 rounded-full bg-green-500 animate-pulse' />
                Powered by TripoSR & Stability AI
              </div>
            </div>
          </div>

          {/* Right Column: 3D Preview */}
          <div className='flex flex-col gap-6 h-full min-h-[500px]'>
            <div className='flex-1 relative rounded-[40px] overflow-hidden bg-[#ededed] shadow-inner border border-[#e8e4e0]'>
              <AnimatePresence mode='wait'>
                {result ? (
                  <motion.div
                    key='result'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='w-full h-full relative'
                  >
                    <model-viewer
                      src={`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8800'}${result.glbUrl}`}
                      alt={result.name}
                      auto-rotate
                      camera-controls
                      shadow-intensity='1'
                      environment-image='neutral'
                      exposure='1'
                      style={{
                        width: '100%',
                        height: '100%',
                        backgroundColor: '#ededed',
                      }}
                    >
                      <div className='absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3'>
                        <button
                          onClick={handleDownload}
                          className='px-6 py-3 bg-white shadow-lg rounded-full font-bold flex items-center gap-2 hover:bg-[#f3f1ee] active:scale-[0.95] transition-all'
                        >
                          <Download className='w-5 h-5' />
                          Download .GLB
                        </button>
                      </div>
                    </model-viewer>
                  </motion.div>
                ) : (
                  <motion.div
                    key='placeholder'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='w-full h-full flex flex-col items-center justify-center p-12 text-center gap-6'
                  >
                    <div className='w-24 h-24 rounded-[32px] bg-white shadow-xl flex items-center justify-center'>
                      <View className='w-12 h-12 text-[#947d61] opacity-20' />
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-xl font-bold'>3D Canvas</h3>
                      <p className='text-[#6b665f] text-sm max-w-[240px]'>
                        Your generated 3D model will appear here. You can rotate,
                        zoom, and interact with it.
                      </p>
                    </div>

                    {isGenerating && (
                      <div className='absolute inset-0 bg-[#ededed]/80 backdrop-blur-sm flex flex-col items-center justify-center p-12 transition-all'>
                        <div className='w-64 h-2 bg-white rounded-full overflow-hidden mb-4'>
                          <motion.div
                            className='h-full bg-[#947d61]'
                            initial={{ width: 0 }}
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                        <p className='font-bold text-[#947d61]'>
                          Analyzing geometry...
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className='grid grid-cols-3 gap-4'>
              {[
                { label: 'Textures', icon: '🎨', active: true },
                { label: 'Geometry', icon: '📐', active: true },
                { label: 'Export', icon: '📦', active: true },
              ].map((item, i) => (
                <div
                  key={i}
                  className='p-4 rounded-3xl bg-white border border-[#e8e4e0] flex flex-col items-center gap-1 shadow-sm'
                >
                  <span className='text-xl'>{item.icon}</span>
                  <span className='text-[10px] font-bold uppercase tracking-widest text-[#a6a099]'>
                    {item.label}
                  </span>
                  <div className='w-1 h-1 rounded-full bg-[#947d61]' />
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer / Features */}
      <section className='max-w-6xl mx-auto px-6 mt-24 border-t border-[#e8e4e0] pt-12'>
        <div className='grid md:grid-cols-3 gap-12'>
          <div className='space-y-4'>
            <div className='w-12 h-12 rounded-2xl bg-[#947d61]/10 flex items-center justify-center'>
              <Sparkles className='w-6 h-6 text-[#947d61]' />
            </div>
            <h4 className='text-lg font-bold'>Instant Mesh</h4>
            <p className='text-sm text-[#6b665f]'>
              Transform high-resolution photos into optimized 3D meshes ready for
              real-time rendering and AR.
            </p>
          </div>
          <div className='space-y-4'>
            <div className='w-12 h-12 rounded-2xl bg-[#947d61]/10 flex items-center justify-center'>
              <Download className='w-6 h-6 text-[#947d61]' />
            </div>
            <h4 className='text-lg font-bold'>Universal Format</h4>
            <p className='text-sm text-[#6b665f]'>
              Download your models in GLB format, fully compatible with Blender,
              Unity, Unreal Engine, and WebGL.
            </p>
          </div>
          <div className='space-y-4'>
            <div className='w-12 h-12 rounded-2xl bg-[#947d61]/10 flex items-center justify-center'>
              <RotateCcw className='w-6 h-6 text-[#947d61]' />
            </div>
            <h4 className='text-lg font-bold'>AI Enhanced</h4>
            <p className='text-sm text-[#6b665f]'>
              Advanced machine learning models preserve proportions while
              reconstructing complex textures and details.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}

export default ThreedGenerator