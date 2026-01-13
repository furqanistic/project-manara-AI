import TopBar from '@/components/Layout/Topbar'
import { Box, ChevronRight, Download, Info, Layers, Maximize2, Shapes, Wand2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'

const ThreedGenerator = () => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const gradioRef = useRef(null)

  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://gradio.s3-us-west-2.amazonaws.com/4.44.0/gradio.js'
    script.async = true
    document.body.appendChild(script)

    // Check for dark mode initially and listen for changes
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'))
    }
    
    checkDarkMode()
    
    // Observer to watch for class changes on html element
    const observer = new MutationObserver(checkDarkMode)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
      observer.disconnect()
    }
  }, [])

  useEffect(() => {
    const handleLoad = () => {
      console.log('Gradio app rendered')
      setIsLoading(false)
    }

    const gradioElement = gradioRef.current
    if (gradioElement) {
      gradioElement.addEventListener('render', handleLoad)
      return () => {
        gradioElement.removeEventListener('render', handleLoad)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#FDFCFB] dark:bg-[#0a0a0a] text-[#2d2a26] dark:text-white flex flex-col font-sans selection:bg-[#8d775e]/20 selection:text-[#8d775e] transition-colors duration-500">
      <TopBar />
      
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
                Manara <span className="text-[#8d775e] italic">AI</span>
              </h1>
              
              <p className="text-[#6b6257] dark:text-gray-400 text-lg font-light leading-relaxed">
                Architectural intelligence that translates raw imagination into <span className="font-medium text-[#2d2a26] dark:text-white">photorealistic, executable spaces</span> in seconds.
              </p>
            </div>

            {/* Feature Pills */}
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FDFCFB] dark:bg-[#111] border border-[#e8e2dc] dark:border-white/10 rounded-full text-xs font-medium text-[#6b6257] dark:text-gray-300">
                <Shapes className="w-3.5 h-3.5 text-[#8d775e]" />
                Gen Shape
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#FDFCFB] dark:bg-[#111] border border-[#e8e2dc] dark:border-white/10 rounded-full text-xs font-medium text-[#6b6257] dark:text-gray-300">
                <Layers className="w-3.5 h-3.5 text-[#8d775e]" />
                Textured
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-[#8d775e]/5 dark:bg-[#8d775e]/10 border border-[#8d775e]/20 dark:border-[#8d775e]/30 rounded-full text-xs font-bold text-[#8d775e]">
                GLB • OBJ • PLY • STL
              </div>
            </div>
          </div>
        </header>

        {/* Studio Workspace */}
        <main className="flex-1 bg-[#F9F7F5] dark:bg-[#0a0a0a] p-4 md:p-8 transition-colors duration-500">
          <div className="max-w-[1600px] mx-auto">
            
            {/* The Tool Container */}
            <div className="bg-white dark:bg-[#111] border border-[#e8e2dc] dark:border-white/10 shadow-[0_10px_40px_rgba(141,119,94,0.08)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.3)] overflow-hidden transition-colors duration-500">
               {/* Browser-like Toolbar */}
               <div className="h-12 bg-white dark:bg-[#111] border-b border-[#f3f0ed] dark:border-white/5 flex items-center justify-between px-6 transition-colors duration-500">
                 <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                      <div className="w-2.5 h-2.5 rounded-full bg-[#8d775e]/20"></div>
                    </div>
                    <div className="h-4 w-[1px] bg-[#f3f0ed] dark:bg-white/10"></div>
                    <span className="text-[10px] font-bold tracking-widest text-[#8d775e]/60 uppercase flex items-center gap-2">
                       <Wand2 className="w-3 h-3" />
                       3D Generation Studio
                    </span>
                 </div>
                 <div className="flex items-center gap-2 text-[10px] text-[#6b6257] dark:text-gray-400 font-medium">
                    <span className="px-2 py-0.5 bg-[#FDFCFB] dark:bg-white/5 border border-[#ede7e0] dark:border-white/10 rounded">V2.1 Engine</span>
                 </div>
               </div>

               {/* 
                  The Embed space needs height. 
                  Setting a large min-height to ensure the user can see everything.
                  Removing rounded corners at the bottom to avoid the "white space" issue mentioned.
                  Using key to force re-render when theme changes to update the gradio app theme
               */}
                <div className="w-full relative bg-white dark:bg-[#151515]" style={{ minHeight: '900px', height: '110vh' }}>
                   {isLoading && (
                     <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#FDFCFB] dark:bg-[#0a0a0a] z-50">
                       <div className="relative w-24 h-24 mb-6">
                         <div className="absolute inset-0 border-4 border-[#8d775e]/10 rounded-full"></div>
                         <div className="absolute inset-0 border-4 border-[#8d775e] border-t-transparent rounded-full animate-spin"></div>
                         <div className="absolute inset-0 flex items-center justify-center p-4">
                            <img src="/min-logo.png" alt="Manara Logo" className="w-full h-full object-contain animate-pulse" />
                         </div>
                       </div>
                       <div className="flex flex-col items-center gap-2">
                         <h3 className="text-xl font-serif text-[#1a1816] dark:text-white">Initializing Manara Studio</h3>
                         <div className="flex items-center gap-1">
                            <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                            <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-[#8d775e] rounded-full animate-bounce"></span>
                         </div>
                         <p className="text-xs text-[#8d775e]/60 font-medium tracking-[0.2em] uppercase mt-4">Calibrating Spatial Engine</p>
                       </div>
                     </div>
                   )}
                   <gradio-app 
                    ref={gradioRef}
                    src="https://manarad-furnara-connect.hf.space"
                    theme_mode={isDarkMode ? "dark" : "light"}
                   ></gradio-app>
                </div>
            </div>

            {/* Integration Guide Section - Post Tool */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 pb-20">
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Architectural Workflow</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Exported models are fully compatible with <strong className="text-gray-900 dark:text-white">Rhino, Revit,</strong> and <strong className="text-gray-900 dark:text-white">SketchUp</strong> for seamless BIM integration.
                 </p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Visualisation</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Optimized topology for <strong className="text-gray-900 dark:text-white">Unreal Engine 5</strong> Nanite and <strong className="text-gray-900 dark:text-white">Chaos V-Ray</strong> rendering.
                 </p>
               </div>
               <div className="space-y-3">
                 <h4 className="text-xs font-bold text-[#8d775e] uppercase tracking-widest">Prototyping</h4>
                 <p className="text-sm text-[#6b6257] dark:text-gray-400 leading-relaxed">
                   Use the high-precision <strong className="text-gray-900 dark:text-white">STL</strong> exports for physical architecture models and 3D scale prints.
                 </p>
               </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="px-8 py-6 bg-white dark:bg-[#0a0a0a] border-t border-[#e8e2dc] dark:border-white/10 transition-colors duration-500">
           <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] uppercase tracking-[0.3em] font-semibold text-[#8d775e]/40 dark:text-[#8d775e]/60">
              <div className="flex items-center gap-4">
                <span>© {new Date().getFullYear()} Manara AI</span>
                <ChevronRight className="w-3 h-3 translate-y-[-1px]" />
                <span>Conceptual Intelligence</span>
              </div>
              <div className="flex items-center gap-6">
                 <span className="flex items-center gap-1.5 normal-case tracking-normal text-[#6b6257]/60 dark:text-gray-500">
                    <Info className="w-3 h-3" />
                    For best results, use neutral background images
                 </span>
              </div>
           </div>
        </footer>

      </div>
    </div>
  )
}

export default ThreedGenerator