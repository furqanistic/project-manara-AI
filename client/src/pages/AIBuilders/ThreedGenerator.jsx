import TopBar from '@/components/Layout/Topbar'
import { ThreeDRenderHistory } from '@/components/ThreeDRender/ThreeDRenderHistory'
import api from '@/config/config'
import { downloadImage } from '@/lib/downloadUtils'
import { AnimatePresence, motion } from 'framer-motion'
import {
    ArrowRight,
    Box,
    ChevronRight,
    Download,
    Eye,
    FileDown,
    History,
    Info,
    Layers,
    Loader2,
    Maximize,
    MessageSquare,
    Moon,
    MousePointer2,
    Minus,
    Palette,
    Plus,
    RotateCcw,
    ScanLine,
    Send,
    SlidersHorizontal,
    Smartphone,
    Move,
    ZoomIn,
    Shapes,
    Sun,
    Upload,
    Wand2,
    X
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation, useParams } from 'react-router-dom'

const STYLES = [
  { id: 'colorful', label: 'Vibrant Color', description: 'Distinct colors', color: '#de7c7c' },
  { id: 'architectural', label: 'Architectural White', description: 'Clean, neutral palette', color: '#8d775e' }
]

const LOADING_PHASES = [
  "Analyzing structures...",
  "Generating geometry...",
  "Simulating lighting...",
  "Rendering textures...",
  "Finalizing design..."
]

const ThreedGenerator = () => {
  const [step, setStep] = useState('config') // 'config' | 'result'
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isMobileChatOpen, setMobileChatOpen] = useState(false)
  const [isConvertingTo3D, setIsConvertingTo3D] = useState(false)
  const [meshyModelUrl, setMeshyModelUrl] = useState(null)
  const [meshyProgress, setMeshyProgress] = useState(0)
  const [resultTab, setResultTab] = useState('image') // 'image' or '3d'
  const modelRef = useRef(null)
  const viewerContainerRef = useRef(null)
  const pollingRef = useRef(null)
  const location = useLocation()
  const { id } = useParams()
  
  // State for the current project
  const [sourceImage, setSourceImage] = useState(null)
  const [versions, setVersions] = useState([]) 
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState('architectural')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [currentProjectId, setCurrentProjectId] = useState(null)
  
  // 3D Viewer Control States
  const [showHelp, setShowHelp] = useState(false)
  const [autoRotateEnabled, setAutoRotateEnabled] = useState(true)
  const [firstTime3DView, setFirstTime3DView] = useState(true)
  const [viewerSettingsOpen, setViewerSettingsOpen] = useState(false)
  const [viewerFov, setViewerFov] = useState(45)
  const [viewerExposure, setViewerExposure] = useState(1.2)
  const [viewerShadow, setViewerShadow] = useState(1)
  const [viewerRotateSpeed, setViewerRotateSpeed] = useState(30)
  
  const fileInputRef = useRef(null)
  const chatContainerRef = useRef(null)

  // Sync theme
  useEffect(() => {
    const checkDarkMode = () => setIsDarkMode(document.documentElement.classList.contains('dark'))
    checkDarkMode()
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory])

  // Handle deep-linking
  useEffect(() => {
    if (location.state?.reset) {
        handleReset();
        window.history.replaceState({}, document.title);
    } else if (location.state?.project) {
        handleLoadFromHistory(location.state.project);
        window.history.replaceState({}, document.title);
    } else if (location.state?.sourceImage) {
        setSourceImage(location.state.sourceImage);
    }
  }, [location, currentProjectId])

  // Handle direct ID loading
  useEffect(() => {
    const loadProjectById = async () => {
      if (id && !currentProjectId) {
        try {
          const response = await api.get(`/3d/projects/${id}`)
          if (response.data?.data) {
            handleLoadFromHistory(response.data.data)
          }
        } catch (err) {
          console.error('Error loading project by ID:', err)
          toast.error('Could not find the requested project')
        }
      }
    }
    loadProjectById()
  }, [id, currentProjectId])

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file', { id: 'file-type-error' })
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setSourceImage(event.target.result)
        setVersions([])
        setCurrentVersionIndex(-1)
        setCurrentProjectId(null)
        setChatHistory([])
        setPrompt('')
        setStep('config')
      }
      reader.readAsDataURL(file)
    }
  }

  const handleGenerate = async (overriddenPrompt = null) => {
    if (!sourceImage) {
      toast.error('Please upload a floor plan first', { id: 'no-source-image' })
      return
    }

    const isIteration = step === 'result' || !!overriddenPrompt || !!prompt.trim();
    const currentPrompt = overriddenPrompt || prompt;

    if (isIteration && !currentPrompt.trim() && !overriddenPrompt) {
      toast.error("Please describe your changes", { id: 'missing-prompt' })
      return
    }

    setIsGenerating(true)
    setUploadProgress(0)
    setResultTab('image')
    setMeshyModelUrl(null)
    
    if (isIteration) {
      setChatHistory(prev => [...prev, { role: 'user', content: currentPrompt }])
      setPrompt('')
    }

    try {
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 300)

      const payload = {
        image: sourceImage,
        mimeType: sourceImage.split(';')[0].split(':')[1],
        style: selectedStyle,
        prompt: isIteration ? currentPrompt : null,
      }

      if (currentProjectId) payload.projectId = currentProjectId;

      const response = await api.post('/3d/visualize', payload)
      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.data && response.data.model) {
        const updatedModel = response.data.model
        setVersions(updatedModel.versions || [])
        setCurrentVersionIndex((updatedModel.versions?.length || 1) - 1)
        if (!currentProjectId) setCurrentProjectId(updatedModel._id)
        
        if (isIteration) {
          setChatHistory(prev => [...prev, { role: 'assistant', content: 'Design updated based on your request.' }])
        } else {
          setStep('result')
          toast.success('3D visualization ready', { id: 'gen-success' })
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synthesis failed', { id: 'gen-error' })
      if (isIteration) setChatHistory(prev => [...prev, { role: 'error', content: 'Neural engine error.' }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLoadFromHistory = (item) => {
    setVersions(item.versions || [])
    setCurrentVersionIndex((item.versions?.length || 0) - 1)
    setSourceImage(item.sourceImage)
    setCurrentProjectId(item._id)
    setChatHistory(item.chatHistory || [])
    setStep('result')
    setMeshyModelUrl(item.glbUrl || null)
    
    // Check if we need to resume polling
    if (item.meshyStatus === 'pending' && item.meshyTaskId) {
      setMeshyModelUrl(null)
      setMeshyProgress(0)
      setResultTab('image')
      setIsConvertingTo3D(false)
      startPolling(item.meshyTaskId, item._id)
    } else if (item.meshyStatus === 'succeeded' && item.glbUrl) {
      setMeshyProgress(100)
      setMeshyModelUrl(item.glbUrl)
      setResultTab('3d')
    } else {
      setMeshyProgress(0)
      setResultTab('image')
    }

    toast.success("Project restored", { id: 'project-restored' })
  }

  const startPolling = (taskId, pId = currentProjectId) => {
    if (pollingRef.current) clearInterval(pollingRef.current)
    setIsConvertingTo3D(true)
    
    pollingRef.current = setInterval(async () => {
      try {
        const response = await api.get(`/3d/meshy/status/${taskId}?projectId=${pId}`)
        const taskData = response.data.data
        
        setMeshyProgress(taskData.progress || 0)

        if (taskData.status === 'SUCCEEDED') {
          clearInterval(pollingRef.current)
          // Fetch the updated model to get the Cloudinary GLB URL
          const modelResponse = await api.get(`/3d/my-models`)
          const updatedModel = modelResponse.data.data.find(m => m._id === pId)
          if (updatedModel?.glbUrl) {
            setMeshyModelUrl(updatedModel.glbUrl)
            setResultTab('3d')
          }
          setIsConvertingTo3D(false)
          toast.success('3D object ready!', { id: 'meshy-success' })
        } else if (taskData.status === 'FAILED' || taskData.status === 'EXPIRED') {
          clearInterval(pollingRef.current)
          setIsConvertingTo3D(false)
          toast.error('3D conversion failed on Meshy', { id: 'meshy-fail' })
        }
      } catch (err) {
        console.error('Polling error:', err)
      }
    }, 3000)
  }

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current)
    }
  }, [])

  const handleConvertTo3D = async () => {
    const currentRender = versions[currentVersionIndex]?.image
    if (!currentRender) {
      toast.error('No image to convert', { id: 'no-render' })
      return
    }

    setIsConvertingTo3D(true)
    setMeshyProgress(0)
    setResultTab('3d')
    
    try {
      const payload = {
        image: currentRender.url || `data:${currentRender.mimeType};base64,${currentRender.data}`,
        mimeType: currentRender.mimeType,
        projectId: currentProjectId
      }

      const response = await api.post('/3d/meshy/generate', payload)
      const { meshyTaskId } = response.data.data
      
      if (meshyTaskId) {
        startPolling(meshyTaskId, currentProjectId)
      }
    } catch (err) {
      toast.error(err.response?.data?.message || '3D conversion failed', { id: 'meshy-error' })
      setIsConvertingTo3D(false)
    }
  }

  const handleDownload = async () => {
    const currentRender = versions[currentVersionIndex]?.image
    if (!currentRender) return
    const imageUrl = currentRender.url || `data:${currentRender.mimeType || 'image/png'};base64,${currentRender.data}`

    const toastId = toast.loading("Preparing download...")
    const success = await downloadImage(imageUrl, `manara-3d-${Date.now()}`)
    
    if (success) {
      toast.success("Download started", { id: toastId })
    } else {
      toast.error("Download failed", { id: toastId })
    }
  }

  const handleDownloadGLB = async () => {
    if (!meshyModelUrl) return
    try {
      toast.loading('Preparing 3D model...', { id: 'download-glb' })
      const response = await fetch(meshyModelUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `manara-design-${Date.now()}.glb`)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('Download started!', { id: 'download-glb' })
    } catch (err) {
      console.error('Download error:', err)
      // Fallback
      const link = document.createElement('a')
      link.href = meshyModelUrl
      link.download = `manara-design-${Date.now()}.glb`
      link.target = "_blank"
      link.click()
      toast.success('Download opened in new tab', { id: 'download-glb' })
    }
  }

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen?.()
      return
    }
    const target = viewerContainerRef.current || modelRef.current
    if (target && target.requestFullscreen) target.requestFullscreen()
  }

  // 3D Viewer Control Functions
  const handleResetCamera = () => {
    if (modelRef.current) {
      modelRef.current.resetTurntableRotation()
      modelRef.current.cameraOrbit = '0deg 75deg 105%'
      modelRef.current.fieldOfView = '45deg'
      setViewerFov(45)
      toast.success('Camera reset', { id: 'camera-reset', duration: 1500 })
    }
  }

  const handleZoomIn = () => {
    if (modelRef.current) {
      const currentFOV = parseFloat(modelRef.current.fieldOfView) || viewerFov
      const nextFov = Math.max(20, currentFOV - 5)
      modelRef.current.fieldOfView = `${nextFov}deg`
      setViewerFov(nextFov)
    }
  }

  const handleZoomOut = () => {
    if (modelRef.current) {
      const currentFOV = parseFloat(modelRef.current.fieldOfView) || viewerFov
      const nextFov = Math.min(80, currentFOV + 5)
      modelRef.current.fieldOfView = `${nextFov}deg`
      setViewerFov(nextFov)
    }
  }

  const toggleAutoRotate = () => {
    setAutoRotateEnabled(!autoRotateEnabled)
    if (modelRef.current) {
      if (!autoRotateEnabled) {
        modelRef.current.setAttribute('auto-rotate', '')
      } else {
        modelRef.current.removeAttribute('auto-rotate')
      }
    }
  }

  const handleSetView = (orbit) => {
    if (modelRef.current) {
      modelRef.current.cameraOrbit = orbit
    }
  }

  // Show help overlay only when the user asks
  useEffect(() => {
    if (meshyModelUrl && resultTab === '3d' && firstTime3DView) {
      setFirstTime3DView(false)
    }
  }, [meshyModelUrl, firstTime3DView, resultTab])

  const handleReset = () => {
    setSourceImage(null)
    setVersions([])
    setCurrentVersionIndex(-1)
    setCurrentProjectId(null)
    setChatHistory([])
    setPrompt('')
    setMeshyModelUrl(null)
    setStep('config')
    if (fileInputRef.current) fileInputRef.current.value = ''
    toast.success("New project workspace ready", { id: 'workspace-reset' })
  }

  const toggleMobileView = () => setStep(step === 'config' ? 'result' : 'config')

  const currentVersion = versions[currentVersionIndex]

  return (
    <div className='h-screen overflow-hidden bg-[#FDFCFB] dark:bg-[#070707] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans transition-colors duration-500 flex flex-col'>
      <TopBar />
      
      <ThreeDRenderHistory 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        onLoadItem={handleLoadFromHistory}
      />

      <main className='flex-1 relative flex flex-col md:flex-row pt-16 h-full overflow-hidden'>
        
        {/* Sidebar Controls */}
        <aside className={`
          fixed md:relative top-16 md:top-0 inset-x-0 bottom-0 md:inset-auto z-40 md:z-10
          w-full md:w-[320px] lg:w-[350px] bg-white dark:bg-[#0c0c0c] border-r border-[#E5E5E7] dark:border-[#2D2D2F]
          transition-transform duration-500 ease-in-out flex flex-col
          ${(step === 'config' || isMobileChatOpen) ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          <div className='flex items-center justify-between p-5 border-b border-[#E5E5E7] dark:border-[#2D2D2F]'>
            <div className='flex items-center gap-2'>
              <h2 className='font-black tracking-tighter text-base uppercase'>Manara 3D STUDIO</h2>
            </div>
            <div className='flex items-center gap-1'>
              <button onClick={() => setHistoryOpen(true)} className='p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400'>
                <History size={16} />
              </button>
              <button onClick={handleReset} className='p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400'>
                <Plus size={16} />
              </button>
              <button onClick={() => setIsMobileChatOpen(false)} className={`md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg text-gray-400 ${step === 'result' ? 'block' : 'hidden'}`}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-hidden relative flex flex-col'>
            {step === 'config' ? (
              <div className='flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide'>
                <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} className='space-y-6'>
                  <section className='space-y-3'>
                    <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Floor Plan</label>
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className={`aspect-video rounded-2xl border-2 border-dashed flex items-center justify-center cursor-pointer transition-all ${sourceImage ? 'border-[#8d775e] bg-[#8d775e]/5' : 'border-[#E5E5E7] dark:border-white/10'}`}
                    >
                      {sourceImage ? <img src={sourceImage} className='h-full object-contain p-2' /> : <div className='text-center text-gray-400'><Plus size={24} className='mx-auto mb-2 opacity-50'/><span className='text-[10px] font-bold uppercase'>Upload Plan</span></div>}
                      <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                  </section>

                  <section className='space-y-3'>
                    <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Style</label>
                    <div className='grid grid-cols-1 gap-2'>
                      {STYLES.map((st) => (
                        <button
                          key={st.id}
                          onClick={() => setSelectedStyle(st.id)}
                          className={`w-full p-4 rounded-xl border transition-all text-left ${selectedStyle === st.id ? 'border-[#8d775e] bg-[#8d775e]/5' : 'border-transparent bg-gray-50 dark:bg-white/5'}`}
                        >
                          <div className='flex items-center justify-between mb-1'>
                            <span className='font-bold text-xs'>{st.label}</span>
                            <div className='w-2 h-2 rounded-full' style={{backgroundColor: st.color}} />
                          </div>
                          <p className='text-[10px] text-gray-400'>{st.description}</p>
                        </button>
                      ))}
                    </div>
                  </section>
                </motion.div>
              </div>
            ) : (
              <div ref={chatContainerRef} className='flex-1 overflow-y-auto p-5 scrollbar-hide space-y-4 flex flex-col'>
                {chatHistory.length === 0 ? (
                  <div className='flex-1 flex flex-col items-center justify-center text-center p-6 space-y-4 opacity-50'>
                    <div className='w-12 h-12 rounded-full bg-[#8d775e]/10 flex items-center justify-center text-[#8d775e]'>
                      <MessageSquare size={20} />
                    </div>
                    <div className='space-y-1'>
                      <p className='text-[11px] font-bold uppercase tracking-widest'>Iteration Assistant</p>
                      <p className='text-[10px] leading-relaxed'>Type below to request structural changes, <br/> style modifications, or refinements.</p>
                    </div>
                  </div>
                ) : (
                  chatHistory.map((msg, i) => (
                    <motion.div key={i} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-3.5 rounded-2xl text-[12px] font-semibold ${msg.role === 'user' ? 'bg-[#8d775e] text-white rounded-tr-none' : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5'}`}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className='p-4 border-t border-[#E5E5E7] dark:border-[#2D2D2F] bg-[#FDFCFB] dark:bg-[#0c0c0c]'>
            <div className='relative'>
              <input 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={step === 'config' ? "Describe your vision (optional)..." : "E.g., 'Add a pool', 'Change materials'..."}
                className='w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl pl-4 pr-10 py-3 h-11 text-[12px] focus:ring-1 focus:ring-[#8d775e]/50'
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
              />
              <button 
                onClick={() => handleGenerate()}
                disabled={isGenerating || (step === 'config' && !sourceImage)}
                className='absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg bg-[#8d775e] text-white flex items-center justify-center'
              >
                {isGenerating ? <Loader2 size={14} className='animate-spin' /> : <ArrowRight size={16} />}
              </button>
            </div>
          </div>
        </aside>

        {/* Canvas Area */}
        <section className='flex-1 relative bg-[#f5f5f5] dark:bg-[#050505] flex flex-col'>
          <div className='hidden md:flex items-center justify-between px-6 py-3 border-b border-[#E5E5E7] dark:border-[#2D2D2F] bg-white/50 dark:bg-black/50 backdrop-blur-md z-10'>
            <div className='flex items-center gap-3'>
              <span className='text-[9px] font-black uppercase tracking-tighter text-[#8d775e]'>
                {currentVersion ? `Version ${currentVersionIndex + 1}` : 'Isometric View'}
              </span>
              {versions.length > 1 && (
                 <div className="flex gap-1.5">
                    {versions.map((_, i) => (
                       <button key={i} onClick={() => setCurrentVersionIndex(i)} className={`w-5 h-5 rounded-full text-[9px] font-bold transition-all ${currentVersionIndex === i ? 'bg-[#8d775e] text-white scale-110' : 'bg-gray-200 dark:bg-white/10 text-gray-400'}`}>{i + 1}</button>
                    ))}
                 </div>
              )}
            </div>
            {currentVersion && (
              <div className='flex items-center gap-2'>
                {!meshyModelUrl && (
                  <motion.button 
                    onClick={handleConvertTo3D} 
                    disabled={isConvertingTo3D}
                    initial={{ scale: 1 }}
                    animate={{ 
                      scale: [1, 1.04, 1],
                      boxShadow: [
                        "0px 0px 10px rgba(141, 119, 94, 0.2)",
                        "0px 0px 30px rgba(141, 119, 94, 0.6)",
                        "0px 0px 10px rgba(141, 119, 94, 0.2)"
                      ]
                    }}
                    transition={{ 
                      duration: 1.5, 
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    whileHover={{ scale: 1.08, boxShadow: "0px 0px 40px rgba(141, 119, 94, 0.8)" }}
                    whileTap={{ scale: 0.92 }}
                    className='flex items-center gap-2.5 px-5 py-2 bg-gradient-to-r from-[#8d775e] via-[#a68d71] to-[#8d775e] bg-[length:200%_auto] text-white rounded-xl text-[10px] font-black hover:bg-right transition-all duration-500 shadow-2xl relative overflow-hidden group'
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                      initial={{ x: "-100%" }}
                      animate={{ x: "200%" }}
                      transition={{ duration: 1.2, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
                    />
                    <div className='p-1 bg-white/20 rounded-lg group-hover:rotate-12 transition-transform duration-300'>
                      {isGenerating || isConvertingTo3D ? <Loader2 size={12} className='animate-spin' /> : <Box size={14} />}
                    </div>
                    <span className='tracking-[0.1em]'>CONVERT DESIGN TO 3D MODEL</span>
                  </motion.button>
                )}
                <motion.button 
                  onClick={handleDownload} 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className='flex items-center gap-2.5 px-5 py-2 bg-white dark:bg-white/10 border border-[#E5E5E7] dark:border-[#2D2D2F] rounded-xl text-[10px] font-black hover:bg-gray-50 dark:hover:bg-white/15 transition-all shadow-sm'
                >
                  <div className='p-1 bg-gray-100 dark:bg-white/10 rounded-lg'>
                    <Download size={14} /> 
                  </div>
                  <span className='tracking-[0.1em]'>EXPORT RENDER IMAGE</span>
                </motion.button>
              </div>
            )}
          </div>

          <div className='flex-1 relative flex flex-col overflow-hidden'>
            <AnimatePresence mode='wait'>
              {isGenerating ? (
                <motion.div key='loading' className='text-center space-y-4'>
                  <div className='relative w-16 h-16 mx-auto flex items-center justify-center'>
                    <div className='absolute inset-0 border-t-2 border-[#8d775e] rounded-full animate-spin' />
                    <Box size={24} className='text-[#8d775e] animate-pulse' />
                  </div>
                  <p className='text-[10px] font-black uppercase tracking-widest animate-pulse'>{LOADING_PHASES[Math.floor(uploadProgress/20)]}</p>
                </motion.div>
              ) : currentVersion ? (
                <motion.div key='content' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='flex-1 w-full flex flex-col p-3 md:p-5 overflow-hidden'>
                  
                  {(meshyModelUrl || isConvertingTo3D) && (
                    <div className='flex items-center justify-center mb-4 shrink-0'>
                      <div className='flex bg-gray-100 dark:bg-white/5 p-1 rounded-xl border border-gray-200 dark:border-white/10'>
                        <button
                          onClick={() => setResultTab('image')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${resultTab === 'image' ? 'bg-white dark:bg-white/10 shadow-sm text-[#8d775e]' : 'text-gray-400'}`}
                        >
                          3D Render
                        </button>
                        <button
                          onClick={() => setResultTab('3d')}
                          className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all ${resultTab === '3d' ? 'bg-white dark:bg-white/10 shadow-sm text-[#8d775e]' : 'text-gray-400'}`}
                        >
                          Interactive 3D
                        </button>
                      </div>
                    </div>
                  )}

                  <div className='flex-1 relative w-full overflow-hidden'>
                    <div className='absolute inset-0'>
                      {(!meshyModelUrl || resultTab === 'image') && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='w-full h-full bg-white dark:bg-white/5 rounded-3xl overflow-hidden border border-[#E5E5E7] dark:border-white/5 flex flex-col items-center justify-center relative'>
                          <img 
                            src={currentVersion.image?.url || `data:${currentVersion.image?.mimeType};base64,${currentVersion.image?.data}`} 
                            className='max-h-full max-w-full object-contain p-4' 
                          />
                        </motion.div>
                      )}
                      
                      {meshyModelUrl && resultTab === '3d' && (
                        <motion.div ref={viewerContainerRef} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='w-full h-full relative bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#0a0a0a] dark:to-[#1a1a1a] rounded-3xl overflow-hidden border border-[#E5E5E7] dark:border-white/5 shadow-2xl'>
                          {/* Right Side Controls */}
                          <div className='absolute top-4 right-4 z-20 flex flex-col gap-2'>
                            <button
                              onClick={handleFullscreen}
                              className='p-3 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl hover:bg-white dark:hover:bg-black/90 transition-all shadow-lg border border-white/20 dark:border-white/10'
                              title="Fullscreen"
                            >
                              <Maximize size={18} className='text-gray-700 dark:text-gray-300' />
                            </button>

                            <button
                              onClick={handleDownloadGLB}
                              className='p-3 bg-[#8d775e] text-white backdrop-blur-md rounded-xl hover:bg-[#7a6650] transition-all shadow-lg border border-white/10'
                              title="Download 3D Model (.glb)"
                            >
                              <FileDown size={18} />
                            </button>
                          </div>

                          {/* Left Side Controls - Interaction Panel */}
                          <div className='absolute top-4 left-4 z-20 flex flex-col gap-2'>
                            {/* Help/Info Button */}
                            <button
                              onClick={() => setShowHelp(!showHelp)}
                              className='p-3 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl hover:bg-white dark:hover:bg-black/90 transition-all shadow-lg border border-white/20 dark:border-white/10'
                              title="Show Controls"
                            >
                              <Info size={18} className='text-gray-700 dark:text-gray-300' />
                            </button>

                            {/* Settings Button */}
                            <button
                              onClick={() => setViewerSettingsOpen(!viewerSettingsOpen)}
                              className={`p-3 backdrop-blur-md rounded-xl transition-all shadow-lg border ${
                                viewerSettingsOpen
                                  ? 'bg-[#8d775e] border-white/10 text-white'
                                  : 'bg-white/90 dark:bg-black/80 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300'
                              }`}
                              title={viewerSettingsOpen ? "Hide Settings" : "Show Settings"}
                            >
                              <SlidersHorizontal size={18} />
                            </button>

                            {/* Zoom Controls */}
                            <div className='bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl shadow-lg border border-white/20 dark:border-white/10 overflow-hidden'>
                              <button
                                onClick={handleZoomIn}
                                className='p-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-all border-b border-gray-200 dark:border-white/10'
                                title="Zoom In"
                              >
                                <Plus size={18} className='text-gray-700 dark:text-gray-300' />
                              </button>
                              <button
                                onClick={handleZoomOut}
                                className='p-3 hover:bg-gray-100 dark:hover:bg-white/10 transition-all'
                                title="Zoom Out"
                              >
                                <Minus size={18} className='text-gray-700 dark:text-gray-300' />
                              </button>
                            </div>

                            {/* Reset Camera */}
                            <button
                              onClick={handleResetCamera}
                              className='p-3 bg-white/90 dark:bg-black/80 backdrop-blur-md rounded-xl hover:bg-white dark:hover:bg-black/90 transition-all shadow-lg border border-white/20 dark:border-white/10'
                              title="Reset Camera"
                            >
                              <RotateCcw size={18} className='text-gray-700 dark:text-gray-300' />
                            </button>

                            {/* Auto-Rotate Toggle */}
                            <button
                              onClick={toggleAutoRotate}
                              className={`p-3 backdrop-blur-md rounded-xl transition-all shadow-lg border ${
                                autoRotateEnabled 
                                  ? 'bg-[#8d775e] border-white/10 text-white' 
                                  : 'bg-white/90 dark:bg-black/80 border-white/20 dark:border-white/10 text-gray-700 dark:text-gray-300'
                              }`}
                              title={autoRotateEnabled ? "Disable Auto-Rotate" : "Enable Auto-Rotate"}
                            >
                              <RotateCcw size={18} className={autoRotateEnabled ? 'animate-spin' : ''} style={{ animationDuration: '3s' }} />
                            </button>
                          </div>

                          {/* Settings Panel */}
                          <AnimatePresence>
                            {viewerSettingsOpen && (
                              <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className='absolute bottom-4 left-4 z-20 w-[260px] bg-white/95 dark:bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4'
                              >
                                <div className='flex items-center justify-between mb-3'>
                                  <p className='text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400'>Viewer Settings</p>
                                  <button
                                    onClick={() => setViewerSettingsOpen(false)}
                                    className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all'
                                  >
                                    <X size={14} className='text-gray-500 dark:text-gray-400' />
                                  </button>
                                </div>

                                <div className='space-y-3'>
                                  <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>View Preset</span>
                                      <span className='text-[9px] text-gray-400'>Quick angles</span>
                                    </div>
                                    <div className='grid grid-cols-4 gap-2'>
                                      <button onClick={() => handleSetView('0deg 75deg 105%')} className='py-1 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all'>Front</button>
                                      <button onClick={() => handleSetView('90deg 75deg 105%')} className='py-1 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all'>Side</button>
                                      <button onClick={() => handleSetView('0deg 10deg 105%')} className='py-1 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all'>Top</button>
                                      <button onClick={() => handleSetView('45deg 60deg 110%')} className='py-1 rounded-lg text-[9px] font-bold bg-gray-100 dark:bg-white/10 text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-white/20 transition-all'>Iso</button>
                                    </div>
                                  </div>

                                  <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>Zoom</span>
                                      <span className='text-[9px] text-gray-400'>{viewerFov}° FOV</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="20"
                                      max="80"
                                      value={viewerFov}
                                      onChange={(e) => {
                                        const nextFov = Number(e.target.value)
                                        setViewerFov(nextFov)
                                        if (modelRef.current) modelRef.current.fieldOfView = `${nextFov}deg`
                                      }}
                                      className='w-full accent-[#8d775e]'
                                    />
                                  </div>

                                  <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>Lighting</span>
                                      <span className='text-[9px] text-gray-400'>{viewerExposure.toFixed(1)}x</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0.6"
                                      max="2.0"
                                      step="0.1"
                                      value={viewerExposure}
                                      onChange={(e) => setViewerExposure(Number(e.target.value))}
                                      className='w-full accent-[#8d775e]'
                                    />
                                  </div>

                                  <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>Shadows</span>
                                      <span className='text-[9px] text-gray-400'>{viewerShadow.toFixed(1)}</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="0"
                                      max="2"
                                      step="0.1"
                                      value={viewerShadow}
                                      onChange={(e) => setViewerShadow(Number(e.target.value))}
                                      className='w-full accent-[#8d775e]'
                                    />
                                  </div>

                                  <div className='space-y-1'>
                                    <div className='flex items-center justify-between'>
                                      <span className='text-[10px] font-semibold text-gray-600 dark:text-gray-300'>Auto-Rotate Speed</span>
                                      <span className='text-[9px] text-gray-400'>{viewerRotateSpeed}°/s</span>
                                    </div>
                                    <input
                                      type="range"
                                      min="5"
                                      max="60"
                                      step="5"
                                      value={viewerRotateSpeed}
                                      onChange={(e) => setViewerRotateSpeed(Number(e.target.value))}
                                      className='w-full accent-[#8d775e]'
                                    />
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          {/* Help Panel */}
                          <AnimatePresence>
                            {showHelp && (
                              <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className='absolute bottom-4 left-4 z-30 w-[260px] bg-white/95 dark:bg-black/85 backdrop-blur-md rounded-2xl border border-white/20 dark:border-white/10 shadow-2xl p-4'
                              >
                                <div className='flex items-center justify-between mb-3'>
                                  <p className='text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-gray-400'>3D Viewer Controls</p>
                                  <button
                                    onClick={() => setShowHelp(false)}
                                    className='p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-white/10 transition-all'
                                  >
                                    <X size={14} className='text-gray-500 dark:text-gray-400' />
                                  </button>
                                </div>

                                <div className='space-y-3 text-[11px] text-gray-700 dark:text-gray-300'>
                                  <div className='flex items-start gap-3'>
                                    <div className='p-2 bg-[#8d775e]/10 rounded-lg shrink-0'>
                                      <MousePointer2 size={16} className='text-[#8d775e]' />
                                    </div>
                                    <div>
                                      <p className='font-semibold text-gray-900 dark:text-white'>Rotate</p>
                                      <p className='text-[10px] text-gray-600 dark:text-gray-400'>Click and drag to rotate the model</p>
                                    </div>
                                  </div>

                                  <div className='flex items-start gap-3'>
                                    <div className='p-2 bg-[#8d775e]/10 rounded-lg shrink-0'>
                                      <ZoomIn size={16} className='text-[#8d775e]' />
                                    </div>
                                    <div>
                                      <p className='font-semibold text-gray-900 dark:text-white'>Zoom</p>
                                      <p className='text-[10px] text-gray-600 dark:text-gray-400'>Scroll or use +/− buttons and the Zoom slider</p>
                                    </div>
                                  </div>

                                  <div className='flex items-start gap-3'>
                                    <div className='p-2 bg-[#8d775e]/10 rounded-lg shrink-0'>
                                      <Move size={16} className='text-[#8d775e]' />
                                    </div>
                                    <div>
                                      <p className='font-semibold text-gray-900 dark:text-white'>Pan</p>
                                      <p className='text-[10px] text-gray-600 dark:text-gray-400'>Right-click and drag (Desktop)</p>
                                    </div>
                                  </div>

                                  <div className='flex items-start gap-3'>
                                    <div className='p-2 bg-[#8d775e]/10 rounded-lg shrink-0'>
                                      <Smartphone size={16} className='text-[#8d775e]' />
                                    </div>
                                    <div>
                                      <p className='font-semibold text-gray-900 dark:text-white'>Touch</p>
                                      <p className='text-[10px] text-gray-600 dark:text-gray-400'>One finger to rotate, two to zoom/pan</p>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                          <model-viewer
                            ref={modelRef}
                            src={meshyModelUrl}
                            alt="3D generated model"
                            ar
                            ar-modes="webxr scene-viewer quick-look"
                            camera-controls
                            auto-rotate={autoRotateEnabled ? '' : undefined}
                            auto-rotate-speed={viewerRotateSpeed}
                            shadow-intensity={viewerShadow}
                            exposure={viewerExposure}
                            field-of-view={`${viewerFov}deg`}
                            min-field-of-view="20deg"
                            max-field-of-view="80deg"
                            style={{ width: '100%', height: '100%' }}
                            className='rounded-3xl'
                          >
                            <button
                              slot="ar-button"
                              className='absolute bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 bg-white dark:bg-black/90 border border-gray-200 dark:border-white/10 rounded-full text-sm font-bold text-gray-900 dark:text-white backdrop-blur-md shadow-2xl hover:scale-105 transition-transform flex items-center gap-2'
                            >
                              <ScanLine size={16} />
                              View in Your Space
                            </button>
                          </model-viewer>
                        </motion.div>
                      )}

                      {isConvertingTo3D && resultTab === '3d' && (
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='w-full h-full bg-white/50 dark:bg-black/50 backdrop-blur-sm rounded-3xl border border-[#E5E5E7] dark:border-white/5 flex flex-col items-center justify-center p-8 text-center'>
                          <div className='relative w-20 h-20 mb-6'>
                            <svg className="w-full h-full transform -rotate-90">
                              <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-gray-200 dark:text-white/10" />
                              <circle cx="40" cy="40" r="36" stroke="#8d775e" strokeWidth="4" fill="transparent" strokeDasharray={226} strokeDashoffset={226 - (226 * meshyProgress) / 100} className="transition-all duration-500" />
                            </svg>
                            <div className='absolute inset-0 flex items-center justify-center font-black text-xs'>{meshyProgress}%</div>
                          </div>
                          <h4 className='font-bold text-xs uppercase tracking-widest'>Generating 3D Object...</h4>
                          <p className='text-[10px] text-gray-400 mt-2 max-w-[200px]'>You can safely close this page or check other projects; we'll keep building it for you in the background.</p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='flex-1 w-full h-full flex flex-col items-center justify-center text-center p-6'>
                  <div className='space-y-6 max-w-xs flex flex-col items-center'>
                    <div className='w-20 h-20 bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-[#8d775e]'><Box size={32} /></div>
                    <div className='space-y-2'>
                        <h3 className='text-xl font-black italic tracking-tighter'>Ready for 3D?</h3>
                        <p className='text-gray-400 text-xs'>Upload your plan to generate an immersive isometric render.</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {!isMobileChatOpen && (
            <div className='md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] flex gap-2 z-50'>
              {step === 'result' ? (
                <button onClick={() => setIsMobileChatOpen(true)} className='h-12 flex-1 bg-white dark:bg-[#1a1a1a] text-black dark:text-white border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-xl'><MessageSquare size={16} /> Chat</button>
              ) : (
                <button onClick={toggleMobileView} className='h-12 flex-1 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase flex items-center justify-center gap-2 shadow-xl'><ArrowRight size={16} /> Preview</button>
              )}
              {currentVersion && <button onClick={handleDownload} className='h-12 w-12 bg-white dark:bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-xl'><Download size={18} /></button>}
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default ThreedGenerator
