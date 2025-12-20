import { FloorPlanHistory } from '@/components/FloorPlan/FloorPlanHistory'
import TopBar from '@/components/Layout/Topbar'
import api from '@/config/config'
import { Download, History, Image as ImageIcon, Loader2, MessageSquare, Plus, Send, Sparkles, Wand2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

const SUGGESTIONS = [
  { label: "Modern Apartment", prompt: "Modern 2-bedroom apartment with an open-concept kitchen and large balcony" },
  { label: "Cozy Studio", prompt: "Cozy studio apartment layout with a dedicated home office corner" },
  { label: "Luxury Penthouse", prompt: "Luxury 3-bedroom penthouse with spacious master suite and walk-in closet" },
  { label: "Retail Cafe", prompt: "Small cafe floor plan with seating for 20 and a service counter" },
  { label: "Kitchen Island", prompt: "Add a large kitchen island with bar seating" },
  { label: "Home Gym", prompt: "Convert the second bedroom into a home gym and office" },
]

const FloorPlanGenerator = () => {
  // Initialize state from localStorage if available
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImage, setGeneratedImage] = useState(() => {
    const saved = localStorage.getItem('fp_generatedImage')
    return saved ? JSON.parse(saved) : null
  })
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('fp_chatHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  const [historyOpen, setHistoryOpen] = useState(false)
  
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Save to localStorage on changes
  useEffect(() => {
    if (generatedImage) {
      localStorage.setItem('fp_generatedImage', JSON.stringify(generatedImage))
    } else {
      localStorage.removeItem('fp_generatedImage')
    }
  }, [generatedImage])

  useEffect(() => {
    localStorage.setItem('fp_chatHistory', JSON.stringify(chatHistory))
    scrollToBottom()
  }, [chatHistory])

  const handleNewChat = () => {
    setGeneratedImage(null)
    setChatHistory([])
    setPrompt('')
    localStorage.removeItem('fp_generatedImage')
    localStorage.removeItem('fp_chatHistory')
    toast.success("Started a new session")
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
      // Add to beginning
      const updated = [newItem, ...existing].slice(0, 50) // Keep last 50
      localStorage.setItem('fp_history_gallery', JSON.stringify(updated))
    } catch (e) {
      console.error("Failed to save to history gallery", e)
    }
  }

  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    
    const promptToUse = prompt
    if (!promptToUse.trim()) return

    setIsGenerating(true)
    
    // Add user message to chat history
    const newMessage = { role: 'user', content: promptToUse }
    setChatHistory(prev => [...prev, newMessage])
    
    setPrompt('')

    // Generate new image
    try {
      let response;
      if (!generatedImage) {
        // First generation
        response = await api.post('/floorplans/generate-image', {
          prompt: promptToUse,
          aspectRatio: '1:1'
        })
      } else {
        // Modification (Edit)
        response = await api.post('/floorplans/edit-image', {
          prompt: promptToUse,
          image: generatedImage.data, // Base64
          aspectRatio: '1:1'
        })
      }

      const data = response.data
      const image = data.image || data.data?.image
      
      if (!image) throw new Error('No image received from server')

      // Update current main image
      setGeneratedImage(image)
      addToHistoryGallery(image, promptToUse)
      
      // Add AI response to chat
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: generatedImage 
          ? 'I\'ve updated the floor plan. Check the history to see previous versions.' 
          : 'Here is your generated floor plan.'
      }])

    } catch (err) {
      console.error('Generation error:', err)
      toast.error(err.response?.data?.message || 'Failed to generate floor plan')
      setChatHistory(prev => [...prev, { role: 'error', content: 'Sorry, I encountered an error while processing your request.' }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    const link = document.createElement('a')
    // Fix: Ensure correct base64 prefix
    link.href = `data:${generatedImage.mimeType || 'image/png'};base64,${generatedImage.data}`
    link.download = `floor-plan-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const loadFromHistory = (item) => {
    setGeneratedImage(item.image)
    setPrompt('')
    setChatHistory(prev => [...prev, { 
      role: 'system', 
      content: `Loaded version from ${new Date(item.timestamp).toLocaleTimeString()}` 
    }])
    toast.success("Floor plan restored from history")
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] selection:bg-[#937c60] selection:text-white flex flex-col">
      <TopBar />
      
      <FloorPlanHistory 
        isOpen={historyOpen} 
        onClose={() => setHistoryOpen(false)}
        onLoadItem={loadFromHistory}
      />
      
      <div className="flex-1 flex flex-col pt-20 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#4a4036] mb-1">AI Floor Plan Generator</h1>
            <p className="text-[#8c7b6e] text-sm">Describe your layout, iterate with AI.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleNewChat}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e6ded5] rounded-xl text-[#5d5248] hover:bg-[#fbf9f7] transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Chat</span>
            </button>
            <button 
              onClick={() => setHistoryOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#937c60] text-white rounded-xl hover:bg-[#826d53] transition-colors shadow-sm text-sm font-medium"
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Panel: Image Display - Order 1 on Mobile */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#e6ded5] p-4 sm:p-6 flex items-center justify-center relative overflow-hidden min-h-[350px] lg:min-h-0 order-1 lg:order-1 transition-all duration-300">
            {generatedImage ? (
              <div className="relative w-full h-full flex items-center justify-center group">
                <img 
                  src={`data:${generatedImage.mimeType};base64,${generatedImage.data}`} 
                  alt="Generated Floor Plan" 
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
                <button 
                  onClick={handleDownload}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-white text-[#937c60] p-2 rounded-full shadow-lg transition-all duration-200 border border-[#e6ded5]"
                  title="Download Image"
                >
                  <Download className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="text-center p-8 text-[#a68970]/60 max-w-md">
                <div className="w-20 h-20 bg-[#f8f5f2] rounded-full flex items-center justify-center mx-auto mb-6">
                  <Wand2 className="w-8 h-8 opacity-50" />
                </div>
                <h3 className="text-xl font-medium text-[#5d5248] mb-2">Create your first floor plan</h3>
                <p className="text-sm leading-relaxed opacity-80">
                  Start by typing a description or choose a suggestion below. You can ask for modifications like "add a window" or "make it bigger" in the chat.
                </p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-10 transition-all duration-300">
                <Loader2 className="w-10 h-10 text-[#937c60] animate-spin mb-3" />
                <p className="text-[#937c60] font-medium animate-pulse">Generating your masterpiece...</p>
              </div>
            )}
          </div>

          {/* Right Panel: Chat Interface - Order 2 on Mobile */}
          <div className="lg:w-96 bg-white rounded-3xl shadow-sm border border-[#e6ded5] flex flex-col overflow-hidden h-[500px] lg:h-auto order-2 lg:order-2">
            <div className="p-4 border-b border-[#f0ebe6] bg-[#fbf9f7] flex items-center gap-2 shrink-0">
              <MessageSquare className="w-4 h-4 text-[#937c60]" />
              <span className="font-medium text-[#5d5248]">Design Assistant</span>
            </div>

            {/* Chat History */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8 px-4">
                  <Sparkles className="w-5 h-5 mx-auto mb-3 opacity-40" />
                  <p>AI is ready to help you design.</p>
                </div>
              )}
              
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`
                    max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm
                    ${msg.role === 'user' 
                      ? 'bg-[#937c60] text-white rounded-br-none' 
                      : msg.role === 'system'
                        ? 'bg-gray-100 text-gray-500 text-xs py-2 italic text-center w-full rounded-lg'
                        : 'bg-[#f4f0ec] text-[#4a4036] rounded-bl-none'}
                    ${msg.role === 'error' ? 'bg-red-50 text-red-600 border border-red-100' : ''}
                  `}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions & Input Area */}
            <div className="bg-white border-t border-[#f0ebe6] shrink-0">
               {/* Suggestion Chips */}
               <div className="px-4 pt-3 pb-1 overflow-x-auto flex gap-2 no-scrollbar">
                    {SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        onClick={() => setPrompt(suggestion.prompt)}
                        disabled={isGenerating}
                        className="whitespace-nowrap flex items-center gap-1.5 px-3 py-1.5 bg-[#f8f5f2] hover:bg-[#efebe5] text-[#8c7b6e] text-xs rounded-full transition-colors border border-[#e6ded5] shrink-0 group"
                      >
                        <Sparkles className="w-3 h-3 opacity-50 group-hover:text-[#937c60]" />
                        {suggestion.label}
                      </button>
                    ))}
               </div>

              <div className="p-4">
                <form onSubmit={(e) => handleGenerate(e)} className="relative">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={generatedImage ? "Describe changes..." : "Describe your floor plan..."}
                    disabled={isGenerating}
                    className="w-full pl-4 pr-12 py-3 bg-[#f8f5f2] border-none rounded-xl text-[#4a4036] placeholder-[#a68970]/50 focus:ring-2 focus:ring-[#937c60]/20 transition-all outline-none text-sm"
                  />
                  <button 
                    type="submit"
                    disabled={!prompt.trim() || isGenerating}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#937c60] text-white rounded-lg hover:bg-[#826d53] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default FloorPlanGenerator