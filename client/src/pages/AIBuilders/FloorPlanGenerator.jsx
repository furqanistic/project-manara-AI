import { AnimatePresence, motion } from 'framer-motion'
import {
  ArrowRight,
  Box,
  ChevronRight,
  Download,
  History,
  Info,
  Layers,
  Loader2,
  Maximize2,
  MessageSquare,
  Plus,
  RotateCcw,
  Send,
  Shapes,
  Sparkles,
  Wand2
} from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'
import { FloorPlanHistory } from '../../components/FloorPlan/FloorPlanHistory'
import TopBar from '../../components/Layout/Topbar'
import api from '../../config/config'

const SUGGESTIONS = [
  { label: "Modern Apartment", prompt: "Modern 2-bedroom apartment with an open-concept kitchen and large balcony" },
  { label: "Cozy Studio", prompt: "Cozy studio apartment layout with a dedicated home office corner" },
  { label: "Luxury Penthouse", prompt: "Luxury 3-bedroom penthouse with spacious master suite and walk-in closet" },
  { label: "Retail Cafe", prompt: "Small cafe floor plan with seating for 20 and a service counter" },
]

const FloorPlanGenerator = () => {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(false)
  
  const [generatedImage, setGeneratedImage] = useState(() => {
    const saved = localStorage.getItem('fp_generatedImage')
    return saved ? JSON.parse(saved) : null
  })
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('fp_chatHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  const chatEndRef = useRef(null)
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
  }, [generatedImage, chatHistory])

  const handleNewChat = () => {
    setGeneratedImage(null)
    setChatHistory([])
    setPrompt('')
    toast.success("New project started")
  }

  const addToHistoryGallery = (image, promptText) => {
    try {
      const existing = JSON.parse(localStorage.getItem('fp_history_gallery') || '[]')
      const newItem = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        prompt: promptText,
        image: image
      }
      const updated = [newItem, ...existing].slice(0, 50)
      localStorage.setItem('fp_history_gallery', JSON.stringify(updated))
    } catch (e) {
      console.error("History saving failed", e)
    }
  }

  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!prompt.trim()) return

    const currentPrompt = prompt
    setIsGenerating(true)
    setChatHistory(prev => [...prev, { role: 'user', content: currentPrompt }])
    setPrompt('')

    try {
      let response
      if (!generatedImage) {
        response = await api.post('/floorplans/generate-image', { prompt: currentPrompt, aspectRatio: '1:1' })
      } else {
        response = await api.post('/floorplans/edit-image', { 
          prompt: currentPrompt, 
          image: generatedImage.data, 
          aspectRatio: '1:1' 
        })
      }

      const image = response.data.image || response.data.data?.image
      if (!image) throw new Error('Generation failed')

      setGeneratedImage(image)
      addToHistoryGallery(image, currentPrompt)
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: generatedImage ? "Project updated based on your feedback." : "Initial floor plan synthesized." 
      }])
    } catch (err) {
      toast.error(err.response?.data?.message || 'Synthesis failed')
      setChatHistory(prev => [...prev, { role: 'error', content: 'Neural engine encountered an error.' }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    link.href = `data:${generatedImage.mimeType || 'image/png'};base64,${generatedImage.data}`
    link.download = `manara-plan-${Date.now()}.png`
    link.click()
  }

  const loadFromHistory = (item) => {
    setGeneratedImage(item.image)
    setChatHistory(prev => [...prev, { role: 'system', content: `Restored version from ${new Date(item.timestamp).toLocaleTimeString()}` }])
    toast.success("Snapshot restored")
  }

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"] selection:bg-[#8d775e]/10 overflow-x-hidden transition-colors duration-500'>
      <TopBar />
      
      <FloorPlanHistory 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        onLoadItem={loadFromHistory}
      />

      {/* Cinematic Ambient Background */}
      <div className='absolute inset-0 overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] right-[-5%] w-[70%] h-[70%] rounded-full bg-[#8d775e]/5 dark:bg-[#8d775e]/10 blur-[140px]' />
        <div className='absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] rounded-full bg-[#b8a58c]/3 dark:bg-[#b8a58c]/5 blur-[120px]' />
      {/* Grain Overlay */}
        <div className='absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none' 
             style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/carbon-fibre.png")' }} />
      </div>

      <main className='relative z-10 max-w-[1600px] mx-auto px-6 md:px-12 pt-24 pb-24'>
        
        {/* Header Section */}
        <div className='flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-10'>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className='space-y-6'
          >
            <div className='flex items-center gap-4'>
              <div className='w-12 h-[1px] bg-[#8d775e]'></div>
              <span className='text-[10px] font-bold tracking-[0.5em] text-[#8d775e] uppercase'>Spatial Synthesis Studio</span>
            </div>
            <h1 className='text-5xl md:text-7xl font-bold text-gray-900 dark:text-white tracking-tightest leading-[0.85]'>
              Neural <br />
              <span className='text-[#8d775e] font-serif italic'>Floor Plans.</span>
            </h1>
            <p className='text-gray-400 dark:text-gray-500 font-medium text-lg max-w-xl leading-relaxed'>
              Transform architectural concepts into high-precision layouts through advanced neural mapping.
            </p>
          </motion.div>

          {/* Action Pills */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='flex flex-wrap gap-3'
          >
            <button 
              onClick={handleNewChat}
              className='flex items-center gap-2 px-6 py-3 bg-white dark:bg-white/5 border border-[#e8e2dc] dark:border-white/10 rounded-full text-sm font-bold text-[#8d775e] hover:bg-gray-50 dark:hover:bg-white/10 transition-all shadow-sm'
            >
              <Plus size={16} />
              New Project
            </button>
            <button 
              onClick={() => setHistoryOpen(true)}
              className='flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-all shadow-xl'
            >
              <History size={16} />
              Vault
            </button>
          </motion.div>
        </div>

        {/* Main Interface Grid */}
        <div className='grid xl:grid-cols-12 gap-10 items-stretch'>
          
          {/* Left: Canvas Area */}
          <motion.div 
            className='xl:col-span-8'
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className='rounded-[48px] overflow-hidden h-[800px] flex flex-col relative group'>
              
               {/* Browser-like Toolbar */}
               <div className='h-14 bg-white/5 dark:bg-white/5 backdrop-blur-md border border-gray-100/10 dark:border-white/5 flex items-center justify-between px-8 rounded-t-[48px]'>
                <div className='flex items-center gap-6'>
                  <div className='flex gap-1.5'>
                    <div className='w-2.5 h-2.5 rounded-full bg-[#8d775e]/30'></div>
                    <div className='w-2.5 h-2.5 rounded-full bg-[#8d775e]/30'></div>
                    <div className='w-2.5 h-2.5 rounded-full bg-[#8d775e]/30'></div>
                  </div>
                  <div className='h-4 w-[1px] bg-gray-200 dark:bg-white/10'></div>
                  <span className='text-[10px] font-bold tracking-[0.2em] text-[#8d775e]/60 uppercase'>
                    {generatedImage ? 'Active Layout: HD Synthesis' : 'Awaiting initialization...'}
                  </span>
                </div>
                
                {generatedImage && (
                  <button 
                    onClick={handleDownload}
                    className='text-[#8d775e] hover:bg-[#8d775e]/10 p-2 rounded-full transition-all'
                    title="Download Assets"
                  >
                    <Download size={18} />
                  </button>
                )}
              </div>

              {/* The Visualizer Canvas */}
              <div className='flex-1 relative flex items-center justify-center p-6'>
                <AnimatePresence mode='wait'>
                  {generatedImage ? (
                    <motion.div 
                      key='generated'
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className='relative w-full h-full flex items-center justify-center'
                    >
                      <div className='relative max-h-full aspect-square'>
                        <img 
                          src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                          alt="Layout Synthesis" 
                          className='max-h-full w-auto object-contain rounded-2xl relative z-10'
                        />
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div 
                      key='empty'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className='text-center space-y-8 max-w-sm'
                    >
                      <div className='w-24 h-24 bg-white/5 dark:bg-white/5 border border-gray-100/10 dark:border-white/5 rounded-[32px] flex items-center justify-center text-[#8d775e]/40 mx-auto transform -rotate-12'>
                         <Wand2 size={40} />
                      </div>
                      <div className='space-y-4'>
                        <h3 className='text-3xl font-light text-gray-900 dark:text-white tracking-tight'>Start Synthesis.</h3>
                        <p className='text-gray-400 dark:text-gray-500 font-medium text-sm leading-relaxed'>
                          Our engine converts natural language into executable architectural data. Upload a reference or describe your spatial vision.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Loading Overlay */}
                <AnimatePresence>
                  {isGenerating && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className='absolute inset-0 bg-[#faf8f6]/95 dark:bg-[#0a0a0a]/95 backdrop-blur-md z-30 flex flex-col items-center justify-center'
                    >
                      <div className='relative w-32 h-32 mb-8'>
                        <motion.div 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                          className='absolute inset-0 border-t-2 border-[#8d775e] rounded-full'
                        />
                        <div className='absolute inset-4 rounded-full bg-[#8d775e]/5 flex items-center justify-center'>
                           <img src="/min-logo.png" alt="Manara" className='w-12 h-12 object-contain animate-pulse' />
                        </div>
                      </div>
                      <p className='text-[#8d775e] font-bold tracking-[0.3em] uppercase text-xs animate-pulse'>Synthesizing Geometry...</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right: Studio Controls */}
          <motion.div 
            className='xl:col-span-4 flex flex-col gap-6'
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
          >
            {/* Assistant Panel */}
            <div className='flex-1 bg-white dark:bg-[#111] rounded-[48px] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col overflow-hidden h-[800px]'>
              <div className='p-8 border-b border-gray-50 dark:border-white/5 flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className='w-10 h-10 rounded-xl bg-[#8d775e]/10 flex items-center justify-center text-[#8d775e]'>
                    <MessageSquare size={20} />
                  </div>
                  <div>
                    <h4 className='font-bold text-gray-900 dark:text-white text-sm'>Synthesis Assistant</h4>
                    <p className='text-[10px] text-green-500 font-bold uppercase tracking-widest'>Engine Active</p>
                  </div>
                </div>
              </div>

              {/* Chat Thread */}
              <div 
                ref={chatContainerRef}
                className='flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide'
              >
                {chatHistory.length === 0 && (
                  <div className='h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4'>
                    <Shapes size={40} className='text-gray-400' />
                    <p className='text-sm font-medium'>Awaiting neural parameters</p>
                  </div>
                )}
                
                {chatHistory.map((msg, i) => (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={i} 
                    className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className={`
                      max-w-[90%] px-5 py-4 rounded-[28px] text-[13px] font-medium leading-relaxed shadow-sm
                      ${msg.role === 'user' 
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none' 
                        : msg.role === 'system'
                          ? 'bg-gray-100 dark:bg-white/5 text-gray-400 text-[10px] py-2 px-4 uppercase tracking-widest border border-dashed border-gray-200 dark:border-white/10 w-full text-center rounded-xl'
                          : 'bg-stone-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5'}
                      ${msg.role === 'error' ? 'bg-red-500 text-white' : ''}
                    `}>
                      {msg.content}
                    </div>
                  </motion.div>
                ))}
                <div ref={chatEndRef} />
              </div>

              {/* Input Workspace */}
              <div className='p-8 pt-0'>
                <div className='bg-stone-50 dark:bg-white/5 rounded-[32px] p-6 space-y-6 border border-gray-100 dark:border-white/5'>
                  {/* Suggestions Grid */}
                  <div className='grid grid-cols-2 gap-2'>
                    {SUGGESTIONS.map((s, i) => (
                      <button 
                        key={i}
                        onClick={() => setPrompt(s.prompt)}
                        className='text-[9px] font-bold uppercase tracking-widest py-3 px-4 bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl text-gray-400 dark:text-gray-500 hover:text-[#8d775e] dark:hover:text-white hover:border-[#8d775e]/30 transition-all'
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  <form onSubmit={handleGenerate} className='relative'>
                    <input 
                      type="text" 
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={generatedImage ? "Iterate on layout..." : "Describe spatial intent..."}
                      disabled={isGenerating}
                      className='w-full bg-white dark:bg-white/10 border border-gray-100 dark:border-white/10 rounded-2xl pl-6 pr-14 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-[#8d775e]/30 transition-all'
                    />
                    <button 
                      type="submit"
                      disabled={!prompt.trim() || isGenerating}
                      className='absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8d775e] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-30'
                    >
                      {isGenerating ? <Loader2 size={18} className='animate-spin' /> : <ArrowRight size={18} />}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Workflow Guide */}
            <div className='bg-white dark:bg-[#111] rounded-[32px] p-6 border border-gray-100 dark:border-white/5 shadow-sm space-y-4'>
               <div className='flex items-center gap-3 text-[#8d775e]'>
                  <Info size={16} />
                  <span className='text-[10px] font-bold uppercase tracking-widest'>Optimization Guide</span>
               </div>
               <p className='text-[11px] text-gray-400 dark:text-gray-500 leading-relaxed'>
                  For high-fidelity results, specify dimensions and light orientation. Neural maps are compatible with standard BIM workflows.
               </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Aesthetic Side Accents */}
      {!isDarkMode && (
        <div className='fixed left-10 top-1/2 -translate-y-1/2 h-64 flex flex-col items-center justify-between opacity-10 pointer-events-none'>
          <div className='w-[1px] h-24 bg-[#8d775e]' />
          <span className='[writing-mode:vertical-lr] text-[10px] font-bold tracking-[0.8em] uppercase text-[#8d775e]'>Manara Studio</span>
          <div className='w-[1px] h-24 bg-[#8d775e]' />
        </div>
      )}
    </div>
  )
}

export default FloorPlanGenerator