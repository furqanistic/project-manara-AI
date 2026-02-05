import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronDown,
  Download,
  History,
  Home,
  Layers,
  Layout,
  Loader2,
  Maximize2,
  MessageSquare,
  Palette,
  Plus,
  RotateCcw,
  Send,
  Settings,
  Share2,
  Sparkles,
  Trash2,
  Wand2,
  X
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { useLocation } from 'react-router-dom'
import { FloorPlanHistory } from '../../components/FloorPlan/FloorPlanHistory'
import TopBar from '../../components/Layout/Topbar'
import api from '../../config/config'

const BUILDING_TYPES = [
  { id: 'apartment', label: 'Apartment', icon: Layout },
  { id: 'studio', label: 'Studio', icon: Home },
  { id: 'office', label: 'Office', icon: Layers },
  { id: 'villa', label: 'Villa', icon: Home },
]

const SCALES_BY_TYPE = {
  apartment: [
    { id: 'studio', label: 'Studio', description: 'Open living' },
    { id: '1-bed', label: '1 Bedroom', description: 'Compact' },
    { id: '2-bed', label: '2 Bedroom', description: 'Balanced' },
    { id: '3-bed', label: '3+ Bedroom', description: 'Spacious' },
  ],
  studio: [
    { id: 'minimalist', label: 'Minimalist', description: 'Essential' },
    { id: 'open', label: 'Open Concept', description: 'Fluid' },
    { id: 'divided', label: 'Smart Division', description: 'Optimized' },
  ],
  office: [
    { id: 'private', label: 'Private Suite', description: 'Focused' },
    { id: 'co-working', label: 'Co-working', description: 'Collaborative' },
    { id: 'conference', label: 'Meeting Hub', description: 'Group' },
    { id: 'open-plan', label: 'Open Plan', description: 'Modern' },
  ],
  villa: [
    { id: 'single', label: 'Single Story', description: 'Accessible' },
    { id: 'duplex', label: 'Duplex', description: 'Two levels' },
    { id: 'mansion', label: 'Estate', description: 'Luxurious' },
  ]
}

const STYLES = [
  { id: 'architectural', label: 'Architectural', color: 'bg-blue-500' },
  { id: 'modern', label: 'Modern Minimal', color: 'bg-stone-800' },
  { id: 'industrial', label: 'Industrial Raw', color: 'bg-orange-900' },
  { id: 'classic', label: 'Classic Elegance', color: 'bg-amber-700' },
]

const FloorPlanGenerator = () => {
  const [step, setStep] = useState('config') // 'config' | 'result'
  const [config, setConfig] = useState({
    buildingType: 'apartment',
    scale: '2-bed',
    style: 'architectural',
    prompt: ''
  })
  
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [showHistoryMobile, setShowHistoryMobile] = useState(false)
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false)
  const location = useLocation()
  
  const [generatedImage, setGeneratedImage] = useState(() => {
    if (location.state?.reset) return null;
    const saved = localStorage.getItem('fp_generatedImage')
    return saved ? JSON.parse(saved) : null
  })
  
  const [chatHistory, setChatHistory] = useState(() => {
    if (location.state?.reset) return [];
    const saved = localStorage.getItem('fp_chatHistory')
    return saved ? JSON.parse(saved) : []
  })
  
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

  // Persistence
  useEffect(() => {
    localStorage.setItem('fp_generatedImage', generatedImage ? JSON.stringify(generatedImage) : '')
    localStorage.setItem('fp_chatHistory', JSON.stringify(chatHistory))
    if (generatedImage && step === 'config') setStep('result')
  }, [generatedImage, chatHistory])

  useEffect(() => {
    if (location.state?.reset) {
        handleNewProject();
        // Clear the state so refreshing doesn't keep resetting if we implement that
        window.history.replaceState({}, document.title);
    } else if (location.state?.project) {
        loadFromHistory(location.state.project);
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleNewProject = () => {
    setGeneratedImage(null)
    setChatHistory([])
    setStep('config')
    setConfig({ ...config, prompt: '' })
    toast.success("New project workspace ready")
  }

  const handleTypeChange = (typeId) => {
    const defaultScale = SCALES_BY_TYPE[typeId][0].id
    setConfig({ ...config, buildingType: typeId, scale: defaultScale })
  }

  const handleGenerate = async (overriddenPrompt = null) => {
    const currentPrompt = overriddenPrompt || config.prompt
    if (!currentPrompt.trim() && !overriddenPrompt) {
      toast.error("Please describe your vision")
      return
    }

    setIsGenerating(true)
    if (step === 'config') setStep('result')
    
    const displayPrompt = overriddenPrompt || `${config.buildingType} ${config.scale} plan in ${config.style} style: ${currentPrompt}`
    setChatHistory(prev => [...prev, { role: 'user', content: displayPrompt }])

    try {
      let response
      if (!generatedImage) {
        response = await api.post('/floorplans/generate-image', { 
            prompt: displayPrompt, 
            aspectRatio: '1:1' 
        })
      } else {
        response = await api.post('/floorplans/edit-image', { 
          prompt: currentPrompt, 
          image: generatedImage.url || generatedImage.data, 
          aspectRatio: '1:1' 
        })
      }

      const image = response.data.image || response.data.data?.image
      if (!image) throw new Error('Generation failed')

      setGeneratedImage(image)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: generatedImage ? "I've updated the layout for you." : `Your ${config.buildingType} plan is ready!` 
      }])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synthesis failed')
      setChatHistory(prev => [...prev, { role: 'error', content: 'Connection to AI designer interrupted.' }])
    } finally {
      setIsGenerating(false)
      setConfig(prev => ({ ...prev, prompt: '' }))
    }
  }

  const handleDownload = async () => {
    if (!generatedImage) return
    let imageUrl = generatedImage.url || `data:${generatedImage.mimeType || 'image/png'};base64,${generatedImage.data}`

    const toastId = toast.loading("Preparing download...")

    try {
      // 1. Data URL branch
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a')
        link.href = imageUrl
        link.download = `manara-plan-${Date.now()}.png`
        link.click()
        toast.success("Download started", { id: toastId })
        return
      }

      // 2. Cloudinary specific force-download (server-side)
      if (imageUrl.includes('cloudinary.com')) {
        imageUrl = imageUrl.replace('/upload/', '/upload/fl_attachment/')
      }

      // 3. Attempt Blob fetch
      try {
        const response = await fetch(imageUrl, { mode: 'cors' })
        if (!response.ok) throw new Error('Network response was not ok')
        
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `manara-plan-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        window.URL.revokeObjectURL(url)
        
        toast.success("Download started", { id: toastId })
      } catch (innerErr) {
        // 4. Fallback to transformed URL with fl_attachment
        const link = document.createElement('a')
        link.href = imageUrl
        link.target = '_blank'
        link.download = `manara-plan-${Date.now()}.png`
        link.click()
        toast.success("Download initiated", { id: toastId })
      }
    } catch (err) {
      console.error("Export failed", err)
      toast.error("Unable to force download. Opening plan...", { id: toastId })
      window.open(imageUrl, '_blank')
    }
  }

  const loadFromHistory = (item) => {
    const imageToLoad = item.image || { url: item.thumbnail, mimeType: 'image/png' };
    setGeneratedImage(imageToLoad)
    setStep('result')
    
    toast.success("Session restored", { id: 'session-restored' })
  }

  const toggleMobileView = () => {
    if (step === 'config') {
      setStep('result')
      setIsMobileChatOpen(false)
    } else {
      setStep('config')
      setIsMobileChatOpen(false)
    }
  }

  return (
    <div className='h-screen overflow-hidden bg-[#FDFCFB] dark:bg-[#070707] text-[#1D1D1F] dark:text-[#F5F5F7] font-sans transition-colors duration-500 flex flex-col'>
      <TopBar />
      
      <FloorPlanHistory 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        onLoadItem={loadFromHistory}
      />

      {/* Main Container */}
      <main className='flex-1 relative flex flex-col md:flex-row pt-16 h-full overflow-hidden'>
        
        {/* Left Section: Controls & Config (Compact Sidebar) */}
        <aside className={`
          fixed md:relative top-16 md:top-0 inset-x-0 bottom-0 md:inset-auto z-40 md:z-10
          w-full md:w-[320px] lg:w-[350px] bg-white dark:bg-[#0c0c0c] border-r border-[#E5E5E7] dark:border-[#2D2D2F]
          transition-transform duration-500 ease-in-out flex flex-col
          ${step === 'result' && 'md:translate-x-0'}
          ${(step === 'config' || showHistoryMobile || (step === 'result' && isMobileChatOpen)) ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          
          <div className='flex items-center justify-between p-5 border-b border-[#E5E5E7] dark:border-[#2D2D2F]'>
            <div className='flex items-center gap-2'>
              <h2 className='font-black tracking-tighter text-base uppercase'>Manara Floor Planner</h2>
            </div>
            <div className='flex items-center gap-1'>
              <button 
                onClick={() => setHistoryOpen(true)}
                className='p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400'
              >
                <History size={16} />
              </button>
              <button 
                onClick={handleNewProject}
                className='p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400'
              >
                <Plus size={16} />
              </button>
              
              {/* Mobile Close Button */}
              <button 
                onClick={() => setIsMobileChatOpen(false)}
                className={`md:hidden p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors text-gray-400 ${step === 'result' ? 'block' : 'hidden'}`}
              >
                <X size={16} />
              </button>
            </div>
          </div>

          <div className='flex-1 overflow-hidden relative flex flex-col'>
            {step === 'config' ? (
              <div className='flex-1 overflow-y-auto p-5 space-y-6 scrollbar-hide'>
              <motion.div  
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className='space-y-6'
              >
                {/* Building Type */}
                <section className='space-y-3'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Type</label>
                  <div className='grid grid-cols-2 gap-2'>
                    {BUILDING_TYPES.map((type) => (
                      <button
                        key={type.id}
                        onClick={() => handleTypeChange(type.id)}
                        className={`
                          flex items-center gap-3 p-3 rounded-2xl border transition-all text-xs font-bold
                          ${config.buildingType === type.id 
                            ? 'border-[#8d775e] bg-[#8d775e]/5 text-[#8d775e]' 
                            : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}
                        `}
                      >
                        <type.icon size={14} />
                        {type.label}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Dynamic Scale */}
                <section className='space-y-3'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Select Size</label>
                  <div className='grid grid-cols-1 gap-1.5'>
                    {SCALES_BY_TYPE[config.buildingType].map((scale) => (
                      <button
                        key={scale.id}
                        onClick={() => setConfig({ ...config, scale: scale.id })}
                        className={`
                          w-full flex items-center justify-between p-3 rounded-xl border transition-all
                          ${config.scale === scale.id 
                            ? 'border-[#8d775e] bg-[#8d775e]/5' 
                            : 'border-transparent bg-gray-50 dark:bg-white/5 hover:bg-gray-100 dark:hover:bg-white/10'}
                        `}
                      >
                        <div className='text-left'>
                          <p className='font-bold text-[11px]'>{scale.label}</p>
                          <p className='text-[9px] text-gray-400'>{scale.description}</p>
                        </div>
                        {config.scale === scale.id && <Check size={12} className='text-[#8d775e]' />}
                      </button>
                    ))}
                  </div>
                </section>

                {/* Style */}
                <section className='space-y-3'>
                  <label className='text-[10px] font-black uppercase tracking-widest text-gray-400'>Style</label>
                  <div className='flex flex-wrap gap-1.5'>
                    {STYLES.map((st) => (
                      <button
                        key={st.id}
                        onClick={() => setConfig({ ...config, style: st.id })}
                        className={`
                          px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border
                          ${config.style === st.id 
                            ? 'border-[#8d775e] bg-[#8d775e] text-white' 
                            : 'border-transparent bg-gray-100 dark:bg-white/5 text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'}
                        `}
                      >
                        {st.label}
                      </button>
                    ))}
                  </div>
                </section>
              </motion.div>
              </div>
            ) : (
              <div 
                ref={chatContainerRef}
                className='flex-1 overflow-y-auto p-5 scrollbar-hide space-y-4 flex flex-col'
              >
                <div className='space-y-3 pb-16'>
                  {chatHistory.map((msg, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`
                        max-w-[90%] p-3.5 rounded-2xl text-[12px] font-semibold leading-relaxed
                        ${msg.role === 'user' 
                          ? 'bg-[#8d775e] text-white rounded-tr-none shadow-lg shadow-[#8d775e]/10' 
                          : msg.role === 'system'
                            ? 'bg-transparent text-gray-400 text-[9px] uppercase tracking-widest border border-dashed border-gray-200 dark:border-white/10 w-full text-center rounded-lg py-1.5'
                            : 'bg-gray-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5'}
                      `}>
                        {msg.content}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input Area (Compact) */}
          <div className='p-4 border-t border-[#E5E5E7] dark:border-[#2D2D2F] bg-[#FDFCFB] dark:bg-[#0c0c0c]'>
            <div className='relative flex flex-col gap-2'>
               <div className='relative'>
                <input 
                  type="text"
                  value={config.prompt}
                  onChange={(e) => setConfig({ ...config, prompt: e.target.value })}
                  placeholder={step === 'config' ? `Tell us more about your ${config.buildingType}...` : "What would you like to change?"}
                  className='w-full bg-gray-100 dark:bg-white/5 border-none rounded-xl pl-4 pr-10 py-3 h-11 text-[12px] placeholder:text-gray-400 focus:ring-1 focus:ring-[#8d775e]/50 transition-all font-medium'
                  onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                />
                <button 
                  onClick={() => handleGenerate()}
                  disabled={isGenerating || (step === 'config' && !config.prompt.trim())}
                  className={`
                    absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-[#8d775e] text-white hover:scale-105 active:scale-95 disabled:opacity-20
                  `}
                >
                  {isGenerating ? <Loader2 size={14} className='animate-spin' /> : <ArrowRight size={16} />}
                </button>
               </div>
               
               {step === 'result' && (
                 <div className='flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide'>
                    {['Add Balcony', 'Open Plan', 'Luxury Bath'].map((tag) => (
                      <button 
                        key={tag}
                        onClick={() => handleGenerate(`Requesting ${tag}`)}
                        className='shrink-0 px-2.5 py-1 bg-gray-100 dark:bg-white/10 rounded-lg text-[9px] font-black text-gray-400 hover:text-[#8d775e] transition-colors whitespace-nowrap'
                      >
                        {tag}
                      </button>
                    ))}
                 </div>
               )}
            </div>
          </div>
        </aside>

        {/* Right Section: Canvas / Full View */}
        <section className='flex-1 relative bg-[#f5f5f5] dark:bg-[#050505] flex flex-col'>
          
          {/* Desktop Canvas Header */}
          <div className='hidden md:flex items-center justify-between px-6 py-3 border-b border-[#E5E5E7] dark:border-[#2D2D2F] bg-white/50 dark:bg-black/50 backdrop-blur-md z-10'>
            <div className='flex items-center gap-3'>
              <span className='text-[9px] font-black uppercase tracking-tighter text-[#8d775e]'>
                High Quality • Standard View
              </span>
            </div>
            
            <div className='flex items-center gap-2'>
              {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className='flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-white/10 border border-[#E5E5E7] dark:border-[#2D2D2F] rounded-lg text-[10px] font-black hover:bg-gray-50 transition-all'
                >
                  <Download size={12} />
                  EXPORT
                </button>
              )}
            </div>
          </div>

          {/* Visualizer */}
          <div className={`flex-1 relative flex ${generatedImage ? 'items-start' : 'items-center'} justify-center p-4 md:p-6 md:pt-4`}>
             <AnimatePresence mode='wait'>
                {generatedImage ? (
                  <motion.div 
                    key='image'
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className='relative max-w-full max-h-full group shadow-2xl rounded-[24px] overflow-hidden'
                  >
                    <img 
                      src={generatedImage.url || `data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                      alt="Floor Plan" 
                      className='max-h-[85vh] w-auto object-contain cursor-crosshair'
                    />
                  </motion.div>
                ) : (
                  <motion.div 
                    key='empty'
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className='text-center space-y-6 max-w-xs'
                  >
                    <div className='relative w-20 h-20 mx-auto'>
                        <div className='absolute inset-0 bg-[#8d775e]/20 blur-2xl rounded-full opacity-50' />
                        <div className='relative w-full h-full bg-white dark:bg-white/5 border border-gray-100 dark:border-white/10 rounded-2xl flex items-center justify-center text-[#8d775e] group-hover:rotate-6 transition-transform duration-500'>
                           <Layout size={32} />
                        </div>
                    </div>
                    <div className='space-y-2'>
                      <h3 className='text-xl font-black italic tracking-tighter'>Let's design your space.</h3>
                      <p className='text-gray-400 text-xs leading-relaxed'>
                        Select your {config.buildingType} details on the left to get started.
                      </p>
                    </div>
                  </motion.div>
                )}
             </AnimatePresence>

             {/* Dynamic Loader */}
             <AnimatePresence>
                {isGenerating && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className='absolute inset-0 bg-white/60 dark:bg-black/80 backdrop-blur-xl z-30 flex flex-col items-center justify-center'
                  >
                    <div className='relative w-16 h-16 mb-4 flex items-center justify-center'>
                       <div className='absolute inset-0 border-t-2 border-[#8d775e] rounded-full animate-spin' />
                       <img 
                          src="/logoicon.png" 
                          alt="Processing" 
                          className='w-8 h-8 object-contain animate-pulse'
                       />
                    </div>
                    <p className='text-[10px] font-black uppercase tracking-[0.3em] animate-pulse'>Designing</p>
                  </motion.div>
                )}
             </AnimatePresence>
          </div>

          {/* Mobile Overlay Actions */}
          {!isMobileChatOpen && (
          <div className='md:hidden fixed bottom-10 left-1/2 -translate-x-1/2 w-[90%] flex gap-2 z-50 pointer-events-none'>
             <div className='flex-1 flex gap-2 pointer-events-auto'>
                {step === 'result' && (
                  <button 
                     onClick={() => setIsMobileChatOpen(true)}
                     className='h-12 flex-1 bg-white dark:bg-[#1a1a1a] text-black dark:text-white border border-gray-200 dark:border-white/10 rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2'
                  >
                     <MessageSquare size={16} />
                     Chat
                  </button>
                )}
                
                {step === 'config' && (
                <button 
                  onClick={toggleMobileView}
                  className='h-12 flex-1 bg-black dark:bg-white text-white dark:text-black rounded-xl text-xs font-black uppercase tracking-widest shadow-xl flex items-center justify-center gap-2'
                >
                  <ArrowRight size={16} />
                  Preview
                </button>
                )}
             </div>
             
             {generatedImage && (
                <button 
                  onClick={handleDownload}
                  className='h-12 w-12 bg-white dark:bg-white/10 border border-white/20 rounded-xl flex items-center justify-center shadow-xl pointer-events-auto'
                >
                  <Download size={18} />
                </button>
             )}
          </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default FloorPlanGenerator