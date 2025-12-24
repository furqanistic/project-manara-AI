import TopBar from '@/components/Layout/Topbar'
import { Box, Download, Loader2, MessageSquare, Move, Plus, RotateCw, Send, Sparkles, Upload, Wand2 } from 'lucide-react'
import React, { useEffect, useRef, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import axiosInstance from '../../config/config'

const ThreedGenerator = () => {
  const [image, setImage] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [mode, setMode] = useState('static') // 'static' | 'interactive'
  
  // Static Visualization State
  const [visualization, setVisualization] = useState(() => {
    const saved = localStorage.getItem('3d_visualization')
    return saved ? JSON.parse(saved) : null
  })

  // Interactive Scene State (GLB URL)
  const [modelUrl, setModelUrl] = useState(() => {
    return localStorage.getItem('3d_modelUrl') || null
  })
  
  const [chatHistory, setChatHistory] = useState(() => {
    const saved = localStorage.getItem('3d_chatHistory')
    return saved ? JSON.parse(saved) : []
  })
  
  // Three.js Refs
  const canvasRef = useRef(null)
  const mountRef = useRef(null)
  const sceneRef = useRef(null)
  const rendererRef = useRef(null)
  const cameraRef = useRef(null)
  const controlsRef = useRef(null)
  const frameIdRef = useRef(null)
  
  const chatEndRef = useRef(null)

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Save to localStorage
  useEffect(() => {
    if (visualization) localStorage.setItem('3d_visualization', JSON.stringify(visualization))
    else localStorage.removeItem('3d_visualization')
    
    if (modelUrl) localStorage.setItem('3d_modelUrl', modelUrl)
    else localStorage.removeItem('3d_modelUrl')
    
    localStorage.setItem('3d_chatHistory', JSON.stringify(chatHistory))
    scrollToBottom()
  }, [visualization, modelUrl, chatHistory])

  // Three.js Scene Logic
  useEffect(() => {
    if (mode !== 'interactive' || !modelUrl || !mountRef.current || !canvasRef.current) return

    // Cleanup previous scene
    if (rendererRef.current) {
      rendererRef.current.dispose()
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current)
    }

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xf8f5f2)
    sceneRef.current = scene

    // Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      100
    )
    camera.position.set(5, 5, 5)
    camera.lookAt(0, 0, 0)
    cameraRef.current = camera

    // Renderer
    const renderer = new THREE.WebGLRenderer({ 
      canvas: canvasRef.current, 
      antialias: true,
      alpha: true
    })
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.shadowMap.enabled = true
    renderer.outputColorSpace = THREE.SRGBColorSpace
    rendererRef.current = renderer

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.dampingFactor = 0.05
    controlsRef.current = controls

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 1)
    scene.add(ambientLight)

    const dirLight = new THREE.DirectionalLight(0xffffff, 2)
    dirLight.position.set(5, 10, 7)
    dirLight.castShadow = true
    scene.add(dirLight)

    // Load GLB Model
    const loader = new GLTFLoader()
    const fullUrl = modelUrl.startsWith('http') ? modelUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8800'}${modelUrl}`
    
    loader.load(fullUrl, (gltf) => {
        const model = gltf.scene
        
        // Auto-center and scale
        const box = new THREE.Box3().setFromObject(model)
        const center = box.getCenter(new THREE.Vector3())
        const size = box.getSize(new THREE.Vector3())
        
        const maxDim = Math.max(size.x, size.y, size.z)
        const scale = 3 / maxDim
        model.scale.setScalar(scale)
        
        model.position.sub(center.multiplyScalar(scale))
        model.position.y = 0 // Rest on ground
        
        scene.add(model)
        
        // Add floor grid
        const grid = new THREE.GridHelper(10, 10, 0xd4c7b8, 0xe6ded5)
        scene.add(grid)
    }, undefined, (error) => {
        console.error('An error occurred loading the model:', error)
        toast.error('Failed to load 3D model')
    })

    // Animation Loop
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate)
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    // Handle Resize
    const handleResize = () => {
      if (!mountRef.current) return
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight
      camera.updateProjectionMatrix()
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight)
    }
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      cancelAnimationFrame(frameIdRef.current)
      if (rendererRef.current) rendererRef.current.dispose()
    }
  }, [mode, modelUrl])

  const onDrop = (acceptedFiles) => {
    const file = acceptedFiles[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        setImage(reader.result)
        toast.success('Floor plan uploaded!')
      }
      reader.readAsDataURL(file)
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
    disabled: isGenerating
  })

  const handleGenerate = async (e) => {
    if (e) e.preventDefault()
    if (!image) {
      toast.error('Please upload a floor plan first')
      return
    }

    setIsGenerating(true)
    
    const msgContent = mode === 'static' 
      ? 'Generate a multi-view 3D visualization sheet' 
      : 'Generate interactive 3D model with TRELLIS.2'
      
    setChatHistory(prev => [...prev, { role: 'user', content: msgContent }])

    try {
      let response;
      
      if (mode === 'static') {
        response = await axiosInstance.post('/3d/visualize', { image })
        setVisualization(response.data.data)
      } else {
        // Interactive 3D (TripoSR)
        toast.loading('Generating 3D model... might take a minute.', { duration: 4000 })
        // Mode 'triposr' is now processed as default/fallback in backend if not 'gemini'
        response = await axiosInstance.post('/3d/generate', { 
            image,
            mode: 'trellis', 
            name: 'TRELLIS.2 Generation'
        })
        setModelUrl(response.data.data.glbUrl)
      }
      
      setChatHistory(prev => [...prev, { 
        role: 'assistant', 
        content: mode === 'static' 
          ? 'Here is your 3D design sheet showing multiple angles.' 
          : 'Interactive 3D model generated! You can now rotate and inspect it.'
      }])
      
      toast.success(mode === 'static' ? 'Visualization Ready!' : 'Model Ready!')
    } catch (error) {
      console.error(error)
      toast.error('Generation failed')
      setChatHistory(prev => [...prev, { role: 'error', content: 'Processing failed. Please try again.' }])
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNewDesign = () => {
    setImage(null)
    setVisualization(null)
    setModelUrl(null)
    setChatHistory([])
    localStorage.removeItem('3d_visualization')
    localStorage.removeItem('3d_modelUrl')
    localStorage.removeItem('3d_chatHistory')
    toast.success("Started a new session")
  }

  const handleDownload = () => {
    if (mode === 'static' && visualization) {
        const link = document.createElement('a')
        link.href = `data:${visualization.mimeType || 'image/png'};base64,${visualization.data}`
        link.download = `3d-visualization-${Date.now()}.png`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    } else if (mode === 'interactive' && modelUrl) {
        const fullUrl = modelUrl.startsWith('http') ? modelUrl : `${import.meta.env.VITE_API_URL || 'http://localhost:8800'}${modelUrl}`
        const link = document.createElement('a')
        link.href = fullUrl
        link.download = `3d-model-${Date.now()}.glb`
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }
  }

  return (
    <div className="min-h-screen bg-[#f8f5f2] selection:bg-[#937c60] selection:text-white flex flex-col font-sans">
      <TopBar />
      
      <div className="flex-1 flex flex-col pt-20 pb-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mt-5 flex flex-col sm:flex-row items-center justify-between mb-6 gap-4">
          <div className="text-center sm:text-left">
            <h1 className="text-2xl sm:text-3xl font-serif text-[#4a4036] mb-1">AI 3D Plan Viewer</h1>
            <p className="text-[#8c7b6e] text-sm">Convert floor plans into immersive 3D spaces.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleNewDesign}
              className="flex items-center gap-2 px-4 py-2 bg-white border border-[#e6ded5] rounded-xl text-[#5d5248] hover:bg-[#fbf9f7] transition-colors shadow-sm text-sm font-medium"
            >
              <Plus className="w-4 h-4" />
              <span>New Design</span>
            </button>
          </div>
        </div>

        {/* Main Workspace */}
        <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
          
          {/* Left Panel: Display Area */}
          <div className="flex-1 bg-white rounded-3xl shadow-sm border border-[#e6ded5] p-4 sm:p-6 flex flex-col relative overflow-hidden min-h-[500px] lg:min-h-0 order-1 lg:order-1 transition-all duration-300">
            
            {/* Mode Toggle at top of viewport */}
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20 flex bg-white/90 backdrop-blur-sm p-1 rounded-full border border-[#e6ded5] shadow-sm">
                <button
                    onClick={() => setMode('static')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'static' ? 'bg-[#937c60] text-white shadow-md' : 'text-[#8c7b6e] hover:bg-[#f4f0ec]'}`}
                >
                    Static View
                </button>
                <button
                    onClick={() => setMode('interactive')}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${mode === 'interactive' ? 'bg-[#937c60] text-white shadow-md' : 'text-[#8c7b6e] hover:bg-[#f4f0ec]'}`}
                >
                    Interactive 3D
                </button>
            </div>

            <div className="flex-1 relative flex items-center justify-center rounded-2xl overflow-hidden bg-[#fbf9f7] border border-[#f0ebe6]">
                {/* Content switching based on mode */}
                {mode === 'static' ? (
                    visualization ? (
                        <div className="relative group w-full h-full flex items-center justify-center">
                           <img 
                            src={`data:${visualization.mimeType};base64,${visualization.data}`} 
                            alt="3D Visualization" 
                            className="max-h-full max-w-full object-contain"
                          />
                        </div>
                    ) : image ? (
                        <div className="text-center p-8">
                            <span className="text-[#8c7b6e] text-sm">Ready to generate Static Visualization</span>
                        </div>
                    ) : null
                ) : (
                    // Interactive Mode
                    modelUrl ? (
                        <div ref={mountRef} className="w-full h-full relative cursor-move">
                            <canvas ref={canvasRef} className="w-full h-full block" />
                             {/* Controls Help Overlay */}
                             <div className="absolute bottom-4 left-4 pointer-events-none">
                                <div className="bg-white/80 backdrop-blur-sm px-3 py-2 rounded-lg border border-[#e6ded5] shadow-sm">
                                    <div className="flex items-center gap-2 text-xs text-[#5d5248]">
                                        <Move className="w-3 h-3 text-[#937c60]" />
                                        <span>Left Click + Drag to Rotate</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-[#5d5248] mt-1">
                                        <RotateCw className="w-3 h-3 text-[#937c60]" />
                                        <span>Right Click + Drag to Pan</span>
                                    </div>
                                    <div className="mt-2 text-[10px] text-[#8c7b6e] text-center w-full border-t border-[#e6ded5] pt-1">
                                        Powered by Microsoft TRELLIS.2
                                    </div>
                                </div>
                             </div>
                        </div>
                    ) : image ? (
                        <div className="text-center p-8">
                            <span className="text-[#8c7b6e] text-sm">Ready to generate Interactive Scene</span>
                        </div>
                    ) : null
                )}

                {/* Empty State / Upload Prompt (if nothing generated yet) */}
                {!visualization && !modelUrl && !image && (
                   <div 
                    {...getRootProps()} 
                    className="absolute inset-0 flex flex-col items-center justify-center cursor-pointer hover:bg-[#f4f0ec]/30 transition-colors"
                   >
                     <input {...getInputProps()} />
                     <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-[#e6ded5]">
                       <Upload className="w-8 h-8 text-[#a68970] opacity-50" />
                     </div>
                     <p className="text-[#5d5248] font-medium">Upload Floor Plan</p>
                   </div>
                )}
                
                {/* Loading State */}
                {isGenerating && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
                    <Loader2 className="w-10 h-10 text-[#937c60] animate-spin mb-3" />
                    <p className="text-[#937c60] font-medium animate-pulse">
                        {mode === 'static' ? 'Rendering Visualization...' : 'Building 3D Model...'}
                    </p>
                  </div>
                )}

                {/* Download Button (Visible if has content) */}
                {((mode === 'static' && visualization) || (mode === 'interactive' && modelUrl)) && (
                     <button 
                        onClick={handleDownload}
                        className="absolute top-4 right-4 bg-white hover:bg-[#fbf9f7] text-[#5d5248] p-2 rounded-xl shadow-md border border-[#e6ded5] transition-all z-20"
                        title={mode === 'static' ? "Download Image" : "Download GLB Model"}
                      >
                        <Download className="w-5 h-5" />
                      </button>
                )}
            </div>

            {/* Action Bar */}
            {image && (
                <div className="mt-4 flex justify-center">
                    <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="flex items-center gap-3 px-8 py-3 bg-[#937c60] text-white rounded-xl hover:bg-[#826d53] transition-all shadow-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : (mode === 'static' ? <Sparkles className="w-4 h-4" /> : <Box className="w-4 h-4" />)}
                    <span>
                        {mode === 'static' ? 'Generate Visualization' : 'Build 3D Model'}
                    </span>
                  </button>
                </div>
            )}

          </div>

          {/* Right Panel: Chat Interface */}
          <div className="lg:w-96 bg-white rounded-3xl shadow-sm border border-[#e6ded5] flex flex-col overflow-hidden h-[500px] lg:h-auto order-2 lg:order-2">
            <div className="p-4 border-b border-[#f0ebe6] bg-[#fbf9f7] flex items-center gap-2 shrink-0">
              <MessageSquare className="w-4 h-4 text-[#937c60]" />
              <span className="font-medium text-[#5d5248]">Design Assistant</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
               {chatHistory.length === 0 && (
                <div className="text-center text-gray-400 text-sm mt-8 px-4">
                  <Wand2 className="w-5 h-5 mx-auto mb-3 opacity-40" />
                  <p>Upload a plan and choose a mode to begin.</p>
                </div>
              )}
              {chatHistory.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[90%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user' ? 'bg-[#937c60] text-white rounded-br-none' : msg.role === 'error' ? 'bg-red-50 text-red-600' : 'bg-[#f4f0ec] text-[#4a4036] rounded-bl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            <div className="bg-white border-t border-[#f0ebe6] shrink-0 p-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Chat disabled in this version"
                  disabled={true}
                  className="w-full pl-4 pr-12 py-3 bg-[#f8f5f2] border-none rounded-xl text-[#4a4036] opacity-50 cursor-not-allowed text-sm"
                />
                <button disabled className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#937c60] text-white rounded-lg opacity-50">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
export default ThreedGenerator