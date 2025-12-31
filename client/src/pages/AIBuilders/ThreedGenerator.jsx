import TopBar from '@/components/Layout/Topbar'
import { Box, Sparkles, Zap } from 'lucide-react'
import React, { useEffect } from 'react'

const ThreedGenerator = () => {
  useEffect(() => {
    // Dynamically load the Gradio script
    const script = document.createElement('script')
    script.type = 'module'
    script.src = 'https://gradio.s3-us-west-2.amazonaws.com/4.44.0/gradio.js'
    script.async = true
    document.body.appendChild(script)

    return () => {
      // Cleanup script if component unmounts
      document.body.removeChild(script)
    }
  }, [])

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <TopBar />
      
      <div className="flex-1 flex flex-col pt-20 h-screen overflow-hidden">
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden">
          
          {/* Left Sidebar: Info & Branding */}
          <div className="lg:w-[400px] border-r border-slate-200 bg-white flex flex-col overflow-y-auto shrink-0 shadow-sm z-10">
            <div className="p-6 space-y-8">
              
              {/* Header */}
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-indigo-600 font-bold tracking-tight text-xs uppercase">
                  <Zap className="w-3.5 h-3.5" />
                  <span>Powered by Hunyuan3D 2.1</span>
                </div>
                <h1 className="text-2xl font-black text-slate-900">TRELLIS 3D</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Generate high-fidelity textured 3D assets from a single image or text using the Hunyuan3D 2.1 engine.
                </p>
              </div>

              <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 space-y-3">
                <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs uppercase">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Pro Tip</span>
                </div>
                <p className="text-indigo-900/70 text-xs leading-relaxed">
                  For best results, use a clear image with a high resolution. You can also try text-to-3D generation if supported by the Space.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">About this tool</h3>
                <p className="text-slate-500 text-xs leading-relaxed">
                  This interface embeds the latest Hunyuan3D 2.1 model directly from Hugging Face, ensuring you always have access to the most stable and updated generation engine.
                </p>
              </div>
            </div>
          </div>

          {/* Right Area: Embedded Gradio App */}
          <div className="flex-1 bg-slate-50 relative flex flex-col p-4 lg:p-8 min-h-0 overflow-hidden">
            <div className="flex-1 relative bg-white rounded-[2.5rem] border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.02)] overflow-hidden">
                <gradio-app src="https://manarad-hunyuan3d-2-1.hf.space"></gradio-app>
            </div>
            
            {/* Version Info Footer */}
            <div className="mt-4 flex justify-between items-center text-[10px] font-medium text-slate-400 uppercase tracking-[0.2em] px-2 shrink-0">
                <span>TRELLIS 3D Generator</span>
                <span>Embedded via Gradio</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ThreedGenerator