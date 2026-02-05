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

const STYLES = [
  { id: 'architectural', label: 'Architectural White', description: 'Clean, minimalist neutral palette', color: '#8d775e' },
  { id: 'colorful', label: 'Vibrant Color', description: 'Distinct colors for rooms & furniture', color: '#de7c7c' }
]

const ThreedGenerator = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [historyOpen, setHistoryOpen] = useState(false)
  const [showChat, setShowChat] = useState(false)
  
  // State for the current project
  const [sourceImage, setSourceImage] = useState(null)
  const [versions, setVersions] = useState([]) // Array of { style, image, timestamp, prompt }
  const [currentVersionIndex, setCurrentVersionIndex] = useState(-1)
  
  const [uploadProgress, setUploadProgress] = useState(0)
  const [selectedStyle, setSelectedStyle] = useState('architectural')
  const [prompt, setPrompt] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  
  const fileInputRef = useRef(null)
  const chatContainerRef = useRef(null)

  useEffect(() => {
    // Check for dark mode initially and listen for changes
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Observer to watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [chatHistory, showChat])

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
        setChatHistory([])
        setPrompt('')
        setShowChat(false)
      }
      reader.readAsDataURL(file)
    }
  }

  const addToLocalHistory = (projectData) => {
    try {
      const existing = JSON.parse(localStorage.getItem('threed_history_gallery') || '[]')
      // Update if same ID exists, else prepend
      const index = existing.findIndex(item => item.id === projectData.id)
      let updated
      if (index > -1) {
        updated = [...existing]
        updated[index] = projectData
      } else {
        updated = [projectData, ...existing].slice(0, 50)
      }
      localStorage.setItem('threed_history_gallery', JSON.stringify(updated))
    } catch (e) {
      console.error("History saving failed", e)
    }
  }

  const handleGenerate = async (e, customIterationPrompt = null) => {
    if (e) e.preventDefault()
    
    if (!sourceImage) {
      toast.error('Please upload a floor plan first')
      return
    }

    const isIteration = !!customIterationPrompt || !!prompt.trim();
    const currentPrompt = customIterationPrompt || prompt;

    setIsGenerating(true)
    setUploadProgress(0)
    
    if (isIteration) {
      setChatHistory(prev => [...prev, { role: 'user', content: currentPrompt }])
      setPrompt('')
    }

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return prev + 10
        })
      }, 300)

      const response = await api.post('/3d/visualize', {
        image: sourceImage,
        mimeType: sourceImage.split(';')[0].split(':')[1],
        style: selectedStyle,
        prompt: isIteration ? currentPrompt : null
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (response.data && response.data.data) {
        const newImageData = response.data.data
        const newVersion = {
          style: isIteration ? 'Edit' : selectedStyle,
          image: newImageData,
          timestamp: new Date().toISOString(),
          prompt: currentPrompt || (selectedStyle === 'architectural' ? 'Architectural Synthesis' : 'Colorful Synthesis')
        }

        const updatedVersions = [...versions, newVersion]
        setVersions(updatedVersions)
        setCurrentVersionIndex(updatedVersions.length - 1)

        // Save project to history
        const projectId = versions.length === 0 ? Date.now().toString() : chatHistory[0]?.projectId || Date.now().toString()
        const projectData = {
          id: projectId,
          timestamp: new Date().toISOString(),
          sourceImage: sourceImage,
          versions: updatedVersions,
          style: selectedStyle // Last used style
        }
        addToLocalHistory(projectData)

        if (isIteration) {
          setChatHistory(prev => [...prev, { role: 'assistant', content: 'Design updated based on your request.', projectId }])
        } else {
          toast.success('3D visualization synthesized successfully')
        }
      } else {
        throw new Error('Invalid response from server')
      }
    } catch (err) {
      console.error('Generation Error:', err)
      toast.error(err.response?.data?.message || 'Synthesis failed. Please try again.')
      if (isIteration) {
        setChatHistory(prev => [...prev, { role: 'error', content: 'Neural engine encountered an error during iteration.' }])
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleLoadFromVault = (item) => {
    setSourceImage(item.sourceImage)
    setVersions(item.versions || [])
    setCurrentVersionIndex((item.versions?.length || 0) - 1)
    setSelectedStyle(item.style || 'architectural')
    setChatHistory([{ role: 'system', content: `Restored project from ${new Date(item.timestamp).toLocaleDateString()}` }])
    setShowChat(false)
    toast.success("Project restored from vault")
  }

  const handleDownload = () => {
    const currentRender = versions[currentVersionIndex]?.image
    if (!currentRender) return
    const link = document.createElement('a')
    link.href = `data:${currentRender.mimeType || 'image/png'};base64,${currentRender.data}`
    link.download = `manara-3d-render-${Date.now()}.png`
    link.click()
  }

  const handleReset = () => {
    setSourceImage(null)
    setVersions([])
    setCurrentVersionIndex(-1)
    setUploadProgress(0)
    setChatHistory([])
    setPrompt('')
    setShowChat(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const currentVersion = versions[currentVersionIndex]

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0a0a0a] text-[#2d2a26] dark:text-white flex flex-col font-sans selection:bg-[#8d775e]/20 selection:text-[#8d775e] transition-colors duration-500">
      <TopBar />
      
      <ThreeDRenderHistory 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        onLoadItem={handleLoadFromVault}
      />

      <div className="flex-1 flex flex-col pt-16">
        
        {/* Minimalist Professional Header */}
        <header className="px-8 py-12 bg-white dark:bg-[#0a0a0a] border-b border-[#e8e2dc] dark:border-white/10 transition-colors duration-500">
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div className="space-y-4 max-w-3xl">
              <div className="flex items-center gap-2 text-[#8d775e] font-bold tracking-[0.2em] text-[10px] uppercase">
                <Box className="w-3.5 h-3.5" />
                <span>Spatial Intelligence Studio</span>
              </div>
              
              <h1 className="text-5xl font-serif font-medium tracking-tight text-[#1a1816] dark:text-white">
                3D <span className="text-[#8d775e] italic">Renders</span>
              </h1>
              
              <p className="text-[#6b6257] dark:text-gray-400 text-lg font-light leading-relaxed">
                Architectural intelligence that translates 2D floor plans into <span className="font-medium text-[#2d2a26] dark:text-white">photorealistic 3D isometric visualizations</span> in seconds.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
               <button 
                onClick={() => setHistoryOpen(true)}
                className='flex items-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-black rounded-full text-sm font-bold hover:bg-black dark:hover:bg-gray-200 transition-all shadow-xl'
              >
                <History size={16} />
                Vault
              </button>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FDFCFB] dark:bg-[#111] border border-[#e8e2dc] dark:border-white/10 rounded-full text-xs font-medium text-[#6b6257] dark:text-gray-300">
                <Shapes className="w-3.5 h-3.5 text-[#8d775e]" />
                Isometric
              </div>
            </div>
          </div>
        </header>

        {/* Studio Workspace */}
        <main className="flex-1 bg-[#F9F7F5] dark:bg-[#0a0a0a] p-4 md:p-8 transition-colors duration-500">
          <div className="max-w-[1600px] mx-auto">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              
              {/* Left: Control Panel */}
              <div className={`space-y-6 transition-all duration-500 ${showChat ? 'lg:col-span-3' : 'lg:col-span-4'}`}>
                
                {/* File Upload */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[32px] border border-[#e8e2dc] dark:border-white/10 shadow-sm transition-colors duration-500">
                  <h3 className="text-lg font-bold mb-6 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <Upload className="w-4 h-4 text-[#8d775e]" />
                       Blueprint
                    </div>
                    {sourceImage && (
                       <button onClick={handleReset} className="text-[10px] font-bold text-red-500 uppercase tracking-widest hover:underline">Reset</button>
                    )}
                  </h3>
                  
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className={`
                      aspect-video rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all duration-300
                      ${sourceImage ? 'border-[#8d775e] bg-[#8d775e]/5' : 'border-[#e8e2dc] dark:border-white/10 hover:border-[#8d775e]/50 hover:bg-[#FDFCFB] dark:hover:bg-white/5'}
                    `}
                  >
                    {sourceImage ? (
                      <img src={sourceImage} alt="Uploaded Floor Plan" className="w-full h-full object-contain rounded-xl p-2" />
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-[#6b6257] dark:text-gray-400">
                        <Plus className="w-8 h-8 text-[#8d775e]/40" />
                        <span className="text-sm font-medium">Select Floor Plan Image</span>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileSelect} 
                    />
                  </div>
                </div>

                {/* Style Selector */}
                <div className="bg-white dark:bg-[#111] p-8 rounded-[32px] border border-[#e8e2dc] dark:border-white/10 shadow-sm transition-colors duration-500">
                  <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                    <Palette className="w-4 h-4 text-[#8d775e]" />
                    Visual Style
                  </h3>
                  
                  <div className="space-y-3">
                    {STYLES.map((style) => (
                      <button
                        key={style.id}
                        onClick={() => setSelectedStyle(style.id)}
                        className={`
                          w-full p-4 rounded-2xl border transition-all duration-300 text-left
                          ${selectedStyle === style.id 
                            ? 'border-[#8d775e] bg-[#8d775e]/5 ring-1 ring-[#8d775e]/30' 
                            : 'border-[#e8e2dc] dark:border-white/10 hover:bg-gray-50 dark:hover:bg-white/5'}
                        `}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-bold text-sm tracking-tight">{style.label}</span>
                          <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: style.color }} />
                        </div>
                        <p className="text-[11px] text-[#6b6257] dark:text-gray-500 font-medium">{style.description}</p>
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={!sourceImage || isGenerating}
                    className={`
                      w-full mt-8 py-4 rounded-2xl flex items-center justify-center gap-3 text-sm font-bold transition-all duration-300
                      ${!sourceImage || isGenerating 
                        ? 'bg-gray-100 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
                        : 'bg-[#8d775e] text-white shadow-lg shadow-[#8d775e]/20 hover:scale-[1.02] active:scale-95'}
                    `}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Synthesizing {uploadProgress}%</span>
                      </>
                    ) : (
                      <>
                        <Wand2 className="w-4 h-4" />
                        <span>{versions.length > 0 ? 'Generate Alternative' : 'Generate 3D Render'}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Right: Render Canvas & Chat */}
              <div className={`flex flex-col h-full gap-6 transition-all duration-500 ${showChat ? 'lg:col-span-9' : 'lg:col-span-8'}`}>
                
                <div className={`grid grid-cols-1 ${showChat ? 'lg:grid-cols-12' : 'lg:grid-cols-1'} gap-6 h-full items-start`}>
                  
                  {/* Main Canvas Area */}
                  <div className={`bg-white dark:bg-[#111] border border-[#e8e2dc] dark:border-white/10 shadow-[0_10px_40px_rgba(141,119,94,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden flex flex-col rounded-[48px] transition-all duration-500 shrink-0 ${showChat ? 'lg:col-span-8 h-[750px]' : 'h-[850px]'}`}>
                    {/* Browser-like Toolbar */}
                    <div className="h-14 bg-white dark:bg-[#111] border-b border-[#f3f0ed] dark:border-white/5 flex items-center justify-between px-8 transition-colors duration-500 shrink-0">
                      <div className="flex items-center gap-4">
                        <div className="flex gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                          <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                        </div>
                        <div className="h-4 w-[1px] bg-[#f3f0ed] dark:bg-white/10"></div>
                        <span className="text-[10px] font-bold tracking-widest text-[#8d775e]/60 uppercase flex items-center gap-2">
                          <Eye className="w-3 h-3" />
                          {currentVersion ? `Render Version ${currentVersionIndex + 1}` : 'Awaiting initialization'}
                        </span>
                      </div>

                      {/* Version Switcher Pins */}
                      {versions.length > 1 && (
                         <div className="flex items-center gap-1.5 p-1 bg-stone-50 dark:bg-white/5 rounded-full border border-gray-100 dark:border-white/10">
                            {versions.map((_, i) => (
                               <button
                                  key={i}
                                  onClick={() => setCurrentVersionIndex(i)}
                                  className={`w-6 h-6 rounded-full text-[10px] font-bold transition-all ${
                                     currentVersionIndex === i 
                                     ? 'bg-[#8d775e] text-white shadow-md' 
                                     : 'text-gray-400 hover:bg-gray-200 dark:hover:bg-white/10'
                                  }`}
                               >
                                  {i + 1}
                               </button>
                            ))}
                         </div>
                      )}

                      <div className="flex items-center gap-3">
                        {currentVersion && !showChat && (
                          <button 
                            onClick={() => setShowChat(true)}
                            className="flex items-center gap-2 text-xs font-bold text-white bg-[#8d775e] hover:bg-[#8d775e]/90 px-4 py-2 rounded-full transition-all shadow-lg"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            Make Changes
                          </button>
                        )}
                        {currentVersion && (
                          <button 
                            onClick={handleDownload}
                            className="flex items-center gap-2 text-xs font-bold text-[#8d775e] hover:bg-[#8d775e]/5 px-3 py-1.5 rounded-full transition-all"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Export
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Canvas Area */}
                    <div className="flex-1 relative bg-[#fdfdfd] dark:bg-[#151515] flex items-center justify-center p-8 overflow-hidden">
                      <AnimatePresence mode="wait">
                        {currentVersion ? (
                          <motion.div
                            key={currentVersionIndex}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="w-full h-full flex items-center justify-center"
                          >
                            <img 
                              src={`data:${currentVersion.image.mimeType || 'image/png'};base64,${currentVersion.image.data}`} 
                              alt="3D Floor Plan Render" 
                              className="max-w-full max-h-full object-contain rounded-2xl shadow-2xl relative z-10 transition-all duration-500"
                            />
                            
                            {/* Style Badge overlay */}
                            <div className="absolute top-4 right-4 bg-white/80 dark:bg-black/80 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-20 shadow-lg">
                               <span className="text-[10px] font-bold text-[#8d775e] uppercase tracking-[0.2em]">
                                  {currentVersion.style} Style
                               </span>
                            </div>
                          </motion.div>
                        ) : isGenerating && !chatHistory.length ? (
                          <motion.div
                            key="loading"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="flex flex-col items-center gap-6"
                          >
                            <div className="relative w-24 h-24">
                              <div className="absolute inset-0 border-4 border-[#8d775e]/10 rounded-full"></div>
                              <div className="absolute inset-0 border-4 border-[#8d775e] border-t-transparent rounded-full animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center p-4">
                                <img src="/min-logo.png" alt="Manara Logo" className="w-full h-full object-contain animate-pulse" />
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <h3 className="text-xl font-serif text-[#1a1816] dark:text-white">Synthesizing Geometry</h3>
                              <div className="flex items-center gap-1">
                                <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce"></span>
                              </div>
                            </div>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="empty"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="flex flex-col items-center gap-6 max-w-sm text-center"
                          >
                            <div className="w-20 h-20 rounded-[28px] bg-[#8d775e]/5 flex items-center justify-center text-[#8d775e]/30">
                              <Box className="w-10 h-10" />
                            </div>
                            <div className="space-y-2">
                               <h4 className="text-xl font-medium text-gray-900 dark:text-white">Neural Synthesis</h4>
                               <p className="text-sm text-gray-400 leading-relaxed font-light">
                                 Upload a blueprint on the left to begin.
                               </p>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  {/* Iterative Chat Interface (Conditional) */}
                  <AnimatePresence>
                    {showChat && (
                      <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 50 }}
                        className="lg:col-span-4 bg-white dark:bg-[#111] rounded-[48px] border border-gray-100 dark:border-white/5 shadow-xl flex flex-col overflow-hidden h-[750px]"
                      >
                        <div className="p-6 border-b border-gray-50 dark:border-white/5 flex items-center justify-between shrink-0">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-[#8d775e]/10 flex items-center justify-center text-[#8d775e]">
                              <MessageSquare size={20} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 dark:text-white text-sm">Iteration Assistant</h4>
                            </div>
                          </div>
                          <button 
                            onClick={() => setShowChat(false)}
                            className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X size={20} />
                          </button>
                        </div>

                        {/* Chat Thread */}
                        <div 
                          ref={chatContainerRef}
                          className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide"
                        >
                          {!chatHistory.length && (
                            <div className="h-full flex flex-col items-center justify-center opacity-30 text-center space-y-4">
                              <History size={40} className="text-gray-400" />
                              <p className="text-xs font-medium">Ready for structural edits</p>
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
                                max-w-[85%] px-5 py-4 rounded-[28px] text-[13px] font-medium leading-relaxed shadow-sm
                                ${msg.role === 'user' 
                                  ? 'bg-gray-900 dark:bg-white text-white dark:text-black rounded-tr-none' 
                                  : 'bg-stone-50 dark:bg-white/5 text-gray-700 dark:text-gray-300 rounded-tl-none border border-gray-100 dark:border-white/5'}
                                ${msg.role === 'error' ? 'bg-red-500 text-white' : ''}
                              `}>
                                {msg.content}
                              </div>
                            </motion.div>
                          ))}
                          {isGenerating && (
                            <div className="flex justify-start">
                              <div className="bg-stone-50 dark:bg-white/5 rounded-[28px] rounded-tl-none border border-gray-100 dark:border-white/5 px-5 py-3">
                                <Loader2 className="w-4 h-4 animate-spin text-[#8d775e]" />
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Input Workspace */}
                        <div className="p-6 pt-0 shrink-0">
                          <form 
                            onSubmit={handleGenerate} 
                            className="relative bg-stone-50 dark:bg-white/10 rounded-2xl border border-gray-100 dark:border-white/10 overflow-hidden"
                          >
                            <input 
                              type="text" 
                              value={prompt}
                              onChange={(e) => setPrompt(e.target.value)}
                              placeholder="Describe changes..."
                              disabled={isGenerating || !sourceImage}
                              className="w-full bg-transparent pl-6 pr-14 py-4 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:outline-none transition-all"
                            />
                            <button 
                              type="submit"
                              disabled={!prompt.trim() || isGenerating || !sourceImage}
                              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#8d775e] text-white rounded-xl flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-30 disabled:scale-100"
                            >
                              <ArrowRight size={18} />
                            </button>
                          </form>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>

            {/* Feature Highlights */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Architectural Vault</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Never lose a concept. All your 3D Synthesis projects are automatically vaulted.
                 </p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Multi-Version Canvas</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Switch between design styles and iterations instantly to compare spatial impacts.
                 </p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Iterative Precision</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Refine specific architectural elements as you need using our integrated Iteration Assistant.
                 </p>
               </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default ThreedGenerator