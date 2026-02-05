import TopBar from '@/components/Layout/Topbar'
import { ThreeDRenderHistory } from '@/components/ThreeDRender/ThreeDRenderHistory'
import api from '@/config/config'
import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Box,
  ChevronRight,
  Download,
  Eye,
  History,
  Info,
  Layers,
  Loader2,
  MessageSquare,
  Palette,
  Plus,
  RotateCcw,
  Send,
  Shapes,
  Upload,
  Wand2,
  X
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'

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
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const location = useLocation()
  
  // State for the current project
  const [sourceImage, setSourceImage] = useState(null)
  const [versions, setVersions] = useState([]) 
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState('architectural')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [currentProjectId, setCurrentProjectId] = useState(null)
  
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
    }
  }, [location.state]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file')
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
      toast.error('Please upload a floor plan first')
      return
    }

    const isIteration = step === 'result' || !!overriddenPrompt || !!prompt.trim();
    const currentPrompt = overriddenPrompt || prompt;

    if (isIteration && !currentPrompt.trim() && !overriddenPrompt) {
      toast.error("Please describe your changes")
      return
    }

    setIsGenerating(true)
    setUploadProgress(0)
    
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
          toast.success('3D visualization ready')
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synthesis failed')
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
    toast.success("Project restored", { id: 'project-restored' })
  }

  const handleDownload = () => {
    const currentRender = versions[currentVersionIndex]?.image
    if (!currentRender) return
    const link = document.createElement('a')
    link.href = currentRender.url || `data:${currentRender.mimeType || 'image/png'};base64,${currentRender.data}`
    link.download = `manara-3d-${Date.now()}.png`
    link.click()
  }

  const handleReset = () => {
    setSourceImage(null)
    setVersions([])
    setCurrentVersionIndex(-1)
    setCurrentProjectId(null)
    setChatHistory([])
    setPrompt('')
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
            {currentVersion && <button onClick={handleDownload} className='flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/10 border border-[#E5E5E7] dark:border-[#2D2D2F] rounded-lg text-[10px] font-black hover:bg-gray-50'><Download size={12} /> EXPORT</button>}
          </div>

          <div className='flex-1 relative flex items-center justify-center p-4 md:p-6'>
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
                <motion.div key='image' initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className='relative max-w-full max-h-full shadow-2xl rounded-[24px] overflow-hidden'>
                  <img src={currentVersion.image?.url || `data:${currentVersion.image?.mimeType};base64,${currentVersion.image?.data}`} className='max-h-[80vh] w-auto object-contain' />
                </motion.div>
              ) : (
                <motion.div key='empty' initial={{ opacity: 0 }} animate={{ opacity: 1 }} className='text-center space-y-6 max-w-xs'>
                  <div className='w-20 h-20 mx-auto bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-[#8d775e]'><Box size={32} /></div>
                  <div className='space-y-2'><h3 className='text-xl font-black italic tracking-tighter'>Ready for 3D?</h3><p className='text-gray-400 text-xs'>Upload your plan to generate an immersive isometric render.</p></div>
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