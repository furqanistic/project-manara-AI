import {
  ArrowRight,
  Circle,
  Copy,
  DoorOpen,
  Download,
  Eye,
  EyeOff,
  FlipHorizontal,
  FlipVertical,
  Grid3X3,
  Hand,
  Home,
  Image,
  Layers,
  Lock,
  Maximize,
  Menu,
  MoreHorizontal,
  MousePointer,
  Move,
  PaintBucket,
  Plus,
  Redo,
  Ruler,
  Save,
  Settings,
  Share,
  Square,
  Target,
  Trash2,
  Type,
  Undo,
  Unlock,
  Upload,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { toast } from 'react-hot-toast'

const FloorPlanGenerator = () => {
  // Core State Management
  const canvasRef = useRef(null)
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedElement, setSelectedElement] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [gridSize, setGridSize] = useState(20)
  const [snapToGrid, setSnapToGrid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 })
  const [showElementPanel, setShowElementPanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
  const [canvasElements, setCanvasElements] = useState([])
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [currentDrawing, setCurrentDrawing] = useState(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  const [isPanning, setIsPanning] = useState(false)
  const [panStart, setPanStart] = useState({ x: 0, y: 0 })
  const [isResizing, setIsResizing] = useState(false)
  const [resizeHandle, setResizeHandle] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [moveStart, setMoveStart] = useState(null)
  const [projectId, setProjectId] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const [measurements, setMeasurements] = useState([])
  const [scale, setScale] = useState(100) // 1:100 scale
  const [units, setUnits] = useState('meters')

  const [layers, setLayers] = useState([
    { id: 1, name: 'Walls', visible: true, locked: false, color: '#ffffff' },
    {
      id: 2,
      name: 'Doors & Windows',
      visible: true,
      locked: false,
      color: '#947d61',
    },
    {
      id: 3,
      name: 'Furniture',
      visible: true,
      locked: false,
      color: '#3b82f6',
    },
    {
      id: 4,
      name: 'Dimensions',
      visible: true,
      locked: false,
      color: '#10b981',
    },
    {
      id: 5,
      name: 'Annotations',
      visible: true,
      locked: false,
      color: '#f59e0b',
    },
  ])

  const brandColor = '#947d61'
  const brandColorLight = '#a68970'

  const tools = [
    { id: 'select', icon: MousePointer, name: 'Select', shortcut: 'V' },
    { id: 'move', icon: Hand, name: 'Pan', shortcut: 'H' },
    { id: 'wall', icon: Square, name: 'Wall', shortcut: 'W' },
    { id: 'room', icon: Home, name: 'Room', shortcut: 'R' },
    { id: 'door', icon: DoorOpen, name: 'Door', shortcut: 'D' },
    { id: 'window', icon: Maximize, name: 'Window', shortcut: 'N' },
    { id: 'measure', icon: Ruler, name: 'Measure', shortcut: 'M' },
    { id: 'text', icon: Type, name: 'Text', shortcut: 'T' },
  ]

  // Utility Functions
  const snapToGridValue = useCallback(
    (value) => {
      if (!snapToGrid) return value
      return Math.round(value / gridSize) * gridSize
    },
    [snapToGrid, gridSize]
  )

  const screenToCanvas = useCallback(
    (x, y) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: snapToGridValue((x - rect.left - panOffset.x) * (100 / zoomLevel)),
        y: snapToGridValue((y - rect.top - panOffset.y) * (100 / zoomLevel)),
      }
    },
    [panOffset, zoomLevel, snapToGridValue]
  )

  const canvasToScreen = useCallback(
    (x, y) => {
      const canvas = canvasRef.current
      if (!canvas) return { x: 0, y: 0 }
      const rect = canvas.getBoundingClientRect()
      return {
        x: (x * zoomLevel) / 100 + panOffset.x + rect.left,
        y: (y * zoomLevel) / 100 + panOffset.y + rect.top,
      }
    },
    [panOffset, zoomLevel]
  )

  const pixelsToUnits = useCallback(
    (pixels) => {
      const metersPerPixel = scale / 100
      if (units === 'meters') {
        return (pixels * metersPerPixel).toFixed(2)
      } else if (units === 'feet') {
        return (pixels * metersPerPixel * 3.28084).toFixed(2)
      }
      return pixels
    },
    [scale, units]
  )

  // History Management
  const pushToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push(JSON.parse(JSON.stringify(canvasElements)))
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
  }, [history, historyIndex, canvasElements])

  const undo = useCallback(() => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1)
      setCanvasElements(JSON.parse(JSON.stringify(history[historyIndex - 1])))
    }
  }, [history, historyIndex])

  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1)
      setCanvasElements(JSON.parse(JSON.stringify(history[historyIndex + 1])))
    }
  }, [history, historyIndex])

  // Element Management Functions
  const addElement = useCallback(
    (element) => {
      const newElement = {
        ...element,
        id: Date.now() + Math.random(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }
      setCanvasElements((prev) => [...prev, newElement])
      pushToHistory()
      return newElement
    },
    [pushToHistory]
  )

  const updateElement = useCallback(
    (id, updates) => {
      setCanvasElements((prev) =>
        prev.map((el) =>
          el.id === id
            ? { ...el, ...updates, updatedAt: new Date().toISOString() }
            : el
        )
      )
      pushToHistory()
    },
    [pushToHistory]
  )

  const deleteElement = useCallback(
    (id) => {
      setCanvasElements((prev) => prev.filter((el) => el.id !== id))
      setSelectedElement(null)
      pushToHistory()
    },
    [pushToHistory]
  )

  const duplicateElement = useCallback(() => {
    if (!selectedElement) return
    const element = canvasElements.find((el) => el.id === selectedElement)
    if (!element) return

    const newElement = {
      ...element,
      id: Date.now() + Math.random(),
      x: element.x + 20,
      y: element.y + 20,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    setCanvasElements((prev) => [...prev, newElement])
    setSelectedElement(newElement.id)
    pushToHistory()
  }, [selectedElement, canvasElements, pushToHistory])

  // Mouse Event Handlers
  const handleMouseDown = useCallback(
    (e) => {
      const canvas = canvasRef.current
      if (!canvas) return

      const pos = screenToCanvas(e.clientX, e.clientY)
      setMousePos(pos)

      if (selectedTool === 'move') {
        setIsPanning(true)
        setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y })
        canvas.style.cursor = 'grabbing'
      } else if (selectedTool === 'wall') {
        setCurrentDrawing({
          type: 'wall',
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          layer: 1,
          color: '#ffffff',
          thickness: 10,
        })
      } else if (selectedTool === 'room') {
        setCurrentDrawing({
          type: 'room',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          layer: 1,
          color: '#ffffff',
          fill: '#ffffff10',
        })
      } else if (selectedTool === 'door') {
        addElement({
          type: 'door',
          x: pos.x - 30,
          y: pos.y - 7.5,
          width: 60,
          height: 15,
          rotation: 0,
          layer: 2,
          color: '#947d61',
          swingDirection: 'inward',
          swingAngle: 90,
        })
      } else if (selectedTool === 'window') {
        addElement({
          type: 'window',
          x: pos.x - 40,
          y: pos.y - 5,
          width: 80,
          height: 10,
          layer: 2,
          color: '#3b82f6',
          style: 'double-hung',
        })
      } else if (selectedTool === 'measure') {
        setCurrentDrawing({
          type: 'measurement',
          startX: pos.x,
          startY: pos.y,
          endX: pos.x,
          endY: pos.y,
          layer: 4,
        })
      } else if (selectedTool === 'select') {
        // Check if clicking on a resize handle
        if (selectedElement) {
          const element = canvasElements.find((el) => el.id === selectedElement)
          if (element) {
            const handle = getResizeHandle(element, pos)
            if (handle) {
              setIsResizing(true)
              setResizeHandle(handle)
              return
            }
          }
        }

        // Check if clicking on an element
        const clickedElement = getElementAtPosition(pos)
        if (clickedElement) {
          setSelectedElement(clickedElement.id)
          setIsMoving(true)
          setMoveStart({
            x: pos.x - clickedElement.x,
            y: pos.y - clickedElement.y,
          })
        } else {
          setSelectedElement(null)
        }
      }
    },
    [
      selectedTool,
      screenToCanvas,
      panOffset,
      addElement,
      canvasElements,
      selectedElement,
    ]
  )

  const handleMouseMove = useCallback(
    (e) => {
      const pos = screenToCanvas(e.clientX, e.clientY)
      setMousePos(pos)

      if (isPanning) {
        setPanOffset({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        })
      } else if (currentDrawing) {
        if (
          currentDrawing.type === 'wall' ||
          currentDrawing.type === 'measurement'
        ) {
          setCurrentDrawing((prev) => ({
            ...prev,
            endX: pos.x,
            endY: pos.y,
          }))
        } else if (currentDrawing.type === 'room') {
          setCurrentDrawing((prev) => ({
            ...prev,
            width: pos.x - prev.x,
            height: pos.y - prev.y,
          }))
        }
      } else if (isMoving && selectedElement) {
        const element = canvasElements.find((el) => el.id === selectedElement)
        if (element) {
          updateElement(selectedElement, {
            x: pos.x - moveStart.x,
            y: pos.y - moveStart.y,
          })
        }
      } else if (isResizing && selectedElement) {
        handleResize(pos)
      }
    },
    [
      isPanning,
      panStart,
      currentDrawing,
      isMoving,
      selectedElement,
      screenToCanvas,
      canvasElements,
      updateElement,
      moveStart,
      isResizing,
    ]
  )

  const handleMouseUp = useCallback(() => {
    const canvas = canvasRef.current
    if (canvas && selectedTool === 'move') {
      canvas.style.cursor = 'grab'
    }

    if (currentDrawing) {
      if (currentDrawing.type === 'wall') {
        const length = Math.sqrt(
          Math.pow(currentDrawing.endX - currentDrawing.startX, 2) +
            Math.pow(currentDrawing.endY - currentDrawing.startY, 2)
        )
        if (length > 10) {
          addElement({
            ...currentDrawing,
            type: 'wall',
            id: Date.now() + Math.random(),
          })
        }
      } else if (currentDrawing.type === 'room') {
        if (
          Math.abs(currentDrawing.width) > 20 &&
          Math.abs(currentDrawing.height) > 20
        ) {
          addElement({
            ...currentDrawing,
            type: 'room',
            width: Math.abs(currentDrawing.width),
            height: Math.abs(currentDrawing.height),
            x:
              currentDrawing.width < 0
                ? currentDrawing.x + currentDrawing.width
                : currentDrawing.x,
            y:
              currentDrawing.height < 0
                ? currentDrawing.y + currentDrawing.height
                : currentDrawing.y,
          })
        }
      } else if (currentDrawing.type === 'measurement') {
        const distance = Math.sqrt(
          Math.pow(currentDrawing.endX - currentDrawing.startX, 2) +
            Math.pow(currentDrawing.endY - currentDrawing.startY, 2)
        )
        if (distance > 10) {
          setMeasurements((prev) => [
            ...prev,
            {
              ...currentDrawing,
              id: Date.now() + Math.random(),
              distance: pixelsToUnits(distance),
            },
          ])
        }
      }
      setCurrentDrawing(null)
    }

    setIsPanning(false)
    setIsMoving(false)
    setIsResizing(false)
    setResizeHandle(null)
  }, [selectedTool, currentDrawing, addElement, pixelsToUnits])

  const getElementAtPosition = useCallback(
    (pos) => {
      // Search from top to bottom (reverse order)
      for (let i = canvasElements.length - 1; i >= 0; i--) {
        const element = canvasElements[i]
        const layer = layers.find((l) => l.id === element.layer)
        if (!layer?.visible || layer?.locked) continue

        if (element.type === 'wall') {
          // Check if point is near the wall line
          const dist = pointToLineDistance(
            pos,
            { x: element.startX, y: element.startY },
            { x: element.endX, y: element.endY }
          )
          if (dist < element.thickness / 2 + 5) return element
        } else if (
          element.type === 'room' ||
          element.type === 'door' ||
          element.type === 'window'
        ) {
          if (
            pos.x >= element.x &&
            pos.x <= element.x + element.width &&
            pos.y >= element.y &&
            pos.y <= element.y + element.height
          ) {
            return element
          }
        }
      }
      return null
    },
    [canvasElements, layers]
  )

  const pointToLineDistance = (point, lineStart, lineEnd) => {
    const A = point.x - lineStart.x
    const B = point.y - lineStart.y
    const C = lineEnd.x - lineStart.x
    const D = lineEnd.y - lineStart.y

    const dot = A * C + B * D
    const lenSq = C * C + D * D
    let param = -1

    if (lenSq !== 0) param = dot / lenSq

    let xx, yy

    if (param < 0) {
      xx = lineStart.x
      yy = lineStart.y
    } else if (param > 1) {
      xx = lineEnd.x
      yy = lineEnd.y
    } else {
      xx = lineStart.x + param * C
      yy = lineStart.y + param * D
    }

    const dx = point.x - xx
    const dy = point.y - yy
    return Math.sqrt(dx * dx + dy * dy)
  }

  const getResizeHandle = (element, pos) => {
    const handles = []
    if (
      element.type === 'room' ||
      element.type === 'door' ||
      element.type === 'window'
    ) {
      handles.push(
        { type: 'nw', x: element.x, y: element.y },
        { type: 'ne', x: element.x + element.width, y: element.y },
        { type: 'sw', x: element.x, y: element.y + element.height },
        {
          type: 'se',
          x: element.x + element.width,
          y: element.y + element.height,
        }
      )
    } else if (element.type === 'wall') {
      handles.push(
        { type: 'start', x: element.startX, y: element.startY },
        { type: 'end', x: element.endX, y: element.endY }
      )
    }

    for (const handle of handles) {
      if (Math.abs(pos.x - handle.x) < 8 && Math.abs(pos.y - handle.y) < 8) {
        return handle
      }
    }
    return null
  }

  const handleResize = (pos) => {
    if (!selectedElement || !resizeHandle) return
    const element = canvasElements.find((el) => el.id === selectedElement)
    if (!element) return

    if (element.type === 'wall') {
      if (resizeHandle.type === 'start') {
        updateElement(selectedElement, { startX: pos.x, startY: pos.y })
      } else if (resizeHandle.type === 'end') {
        updateElement(selectedElement, { endX: pos.x, endY: pos.y })
      }
    } else {
      const updates = {}
      if (resizeHandle.type.includes('w')) {
        updates.width = element.width + (element.x - pos.x)
        updates.x = pos.x
      }
      if (resizeHandle.type.includes('e')) {
        updates.width = pos.x - element.x
      }
      if (resizeHandle.type.includes('n')) {
        updates.height = element.height + (element.y - pos.y)
        updates.y = pos.y
      }
      if (resizeHandle.type.includes('s')) {
        updates.height = pos.y - element.y
      }
      updateElement(selectedElement, updates)
    }
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')
        return

      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'z':
            e.preventDefault()
            if (e.shiftKey) redo()
            else undo()
            break
          case 'y':
            e.preventDefault()
            redo()
            break
          case 'd':
            e.preventDefault()
            duplicateElement()
            break
          case 's':
            e.preventDefault()
            saveFloorPlan()
            break
        }
      } else if (e.key === 'Delete' && selectedElement) {
        deleteElement(selectedElement)
      } else {
        // Tool shortcuts
        const tool = tools.find(
          (t) => t.shortcut.toLowerCase() === e.key.toLowerCase()
        )
        if (tool) {
          setSelectedTool(tool.id)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [undo, redo, duplicateElement, deleteElement, selectedElement])

  // Save/Load Functions
  const saveFloorPlan = async () => {
    setIsSaving(true)
    try {
      const floorPlanData = {
        elements: canvasElements,
        layers,
        gridSize,
        scale,
        units,
        metadata: {
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          version: '1.0.0',
        },
      }

      const response = await fetch('/api/floorplans', {
        method: projectId ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          id: projectId,
          data: floorPlanData,
          name: `Floor Plan - ${new Date().toLocaleDateString()}`,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setProjectId(result.id)
        toast.success('Floor plan saved successfully')
      } else {
        throw new Error('Failed to save floor plan')
      }
    } catch (error) {
      console.error('Save error:', error)
      toast.error('Failed to save floor plan')
    } finally {
      setIsSaving(false)
    }
  }

  const exportToDXF = () => {
    // Create DXF content
    let dxfContent = '0\nSECTION\n2\nENTITIES\n'

    canvasElements.forEach((element) => {
      if (element.type === 'wall') {
        dxfContent += `0\nLINE\n8\n${
          layers.find((l) => l.id === element.layer)?.name || 'Layer1'
        }\n`
        dxfContent += `10\n${element.startX}\n20\n${element.startY}\n30\n0\n`
        dxfContent += `11\n${element.endX}\n21\n${element.endY}\n31\n0\n`
      } else if (element.type === 'room') {
        // Export room as polyline
        dxfContent += `0\nLWPOLYLINE\n8\n${
          layers.find((l) => l.id === element.layer)?.name || 'Layer1'
        }\n`
        dxfContent += `90\n4\n70\n1\n` // 4 vertices, closed
        dxfContent += `10\n${element.x}\n20\n${element.y}\n`
        dxfContent += `10\n${element.x + element.width}\n20\n${element.y}\n`
        dxfContent += `10\n${element.x + element.width}\n20\n${
          element.y + element.height
        }\n`
        dxfContent += `10\n${element.x}\n20\n${element.y + element.height}\n`
      }
    })

    dxfContent += '0\nENDSEC\n0\nEOF'

    // Download the file
    const blob = new Blob([dxfContent], { type: 'application/dxf' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `floorplan_${new Date().getTime()}.dxf`
    a.click()
    URL.revokeObjectURL(url)

    toast.success('Floor plan exported to DXF')
  }

  const handleAIGenerate = async (prompt) => {
    try {
      toast.loading('AI is generating floor plan elements...')

      const response = await fetch(
        'http://localhost:8800/api/floorplans/generate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            prompt,
            currentElements: canvasElements,
            context: {
              scale,
              units,
              layers,
            },
          }),
        }
      )

      if (response.ok) {
        const { elements } = await response.json()
        setCanvasElements((prev) => [...prev, ...elements])
        pushToHistory()
        toast.dismiss()
        toast.success('AI generation complete')
      } else {
        throw new Error('AI generation failed')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to generate with AI')
      console.error('AI generation error:', error)
    }
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append('image', file)

    try {
      toast.loading('Processing floor plan image...')

      const response = await fetch('/api/floorplans/import-image', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      })

      if (response.ok) {
        const { elements } = await response.json()
        setCanvasElements(elements)
        pushToHistory()
        toast.dismiss()
        toast.success('Floor plan imported successfully')
      } else {
        throw new Error('Failed to import image')
      }
    } catch (error) {
      toast.dismiss()
      toast.error('Failed to import floor plan image')
      console.error('Import error:', error)
    }
  }

  // Layer management
  const toggleLayer = (layerId) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    )
  }

  const lockLayer = (layerId) => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    )
  }

  // Initialize with empty history
  useEffect(() => {
    if (history.length === 0) {
      setHistory([JSON.parse(JSON.stringify(canvasElements))])
      setHistoryIndex(0)
    }
  }, [])

  return (
    <div className='h-screen bg-black flex flex-col overflow-hidden'>
      {/* Top Navigation Bar */}
      <div className='bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='text-white font-bold text-xl'>Manāra</div>
          <div className='text-gray-400 text-sm'>Floor Plan Editor</div>
          <div className='text-xs text-gray-500 bg-green-500/20 text-green-400 px-2 py-1 rounded-full'>
            AutoCAD Compatible
          </div>
        </div>

        <div className='flex items-center gap-2'>
          <button
            onClick={() => setShowElementPanel(!showElementPanel)}
            className='p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors'
            title='Toggle Elements Panel'
          >
            <Menu className='w-4 h-4' />
          </button>
          <button
            onClick={() => setShowPropertiesPanel(!showPropertiesPanel)}
            className='p-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors'
            title='Toggle Properties Panel'
          >
            <Settings className='w-4 h-4' />
          </button>
          <div className='border-l border-white/20 h-6 mx-2'></div>
          <button
            onClick={saveFloorPlan}
            disabled={isSaving}
            className='px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors disabled:opacity-50'
          >
            <Save className='w-4 h-4 inline mr-1' />
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={exportToDXF}
            className='px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:scale-105'
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
            }}
          >
            <Download className='w-4 h-4 inline mr-1' />
            Export DXF
          </button>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Left Toolbar */}
        <div className='w-16 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col'>
          <div className='p-2 space-y-1'>
            {tools.map((tool) => {
              const IconComponent = tool.icon
              return (
                <button
                  key={tool.id}
                  onClick={() => setSelectedTool(tool.id)}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center transition-all group relative ${
                    selectedTool === tool.id
                      ? 'bg-[#947d61] text-white'
                      : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
                  }`}
                  title={`${tool.name} (${tool.shortcut})`}
                >
                  <IconComponent className='w-5 h-5' />
                  <div className='absolute left-full ml-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/20'>
                    {tool.name} ({tool.shortcut})
                  </div>
                </button>
              )
            })}
          </div>

          <div className='border-t border-white/10 my-2'></div>

          <div className='p-2 space-y-1'>
            <button
              onClick={undo}
              disabled={historyIndex <= 0}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
              title='Undo (Ctrl+Z)'
            >
              <Undo className='w-5 h-5' />
            </button>
            <button
              onClick={redo}
              disabled={historyIndex >= history.length - 1}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
              title='Redo (Ctrl+Y)'
            >
              <Redo className='w-5 h-5' />
            </button>
            <button
              onClick={duplicateElement}
              disabled={!selectedElement}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
              title='Duplicate (Ctrl+D)'
            >
              <Copy className='w-5 h-5' />
            </button>
            <button
              onClick={() => selectedElement && deleteElement(selectedElement)}
              disabled={!selectedElement}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed'
              title='Delete (Del)'
            >
              <Trash2 className='w-5 h-5' />
            </button>
          </div>

          <div className='border-t border-white/10 my-2'></div>

          <div className='p-2 space-y-1'>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center ${
                showGrid
                  ? 'bg-[#947d61] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
              title='Toggle Grid'
            >
              <Grid3X3 className='w-5 h-5' />
            </button>
            <button
              onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center'
              title='Zoom In'
            >
              <ZoomIn className='w-5 h-5' />
            </button>
            <button
              onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center'
              title='Zoom Out'
            >
              <ZoomOut className='w-5 h-5' />
            </button>
            <button
              onClick={() => {
                setZoomLevel(100)
                setPanOffset({ x: 0, y: 0 })
              }}
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center'
              title='Fit to Screen'
            >
              <Target className='w-5 h-5' />
            </button>
          </div>
        </div>

        {/* Left Elements Panel */}
        {showElementPanel && (
          <div className='w-64 bg-black/40 backdrop-blur-xl border-r border-white/10 flex flex-col'>
            <div className='p-4 border-b border-white/10 flex items-center justify-between'>
              <h3 className='text-white font-semibold'>Elements Library</h3>
              <button
                onClick={() => setShowElementPanel(false)}
                className='text-gray-400 hover:text-white transition-colors'
              >
                <X className='w-4 h-4' />
              </button>
            </div>

            <div className='flex-1 overflow-y-auto p-2'>
              <div className='space-y-4'>
                <div>
                  <h4 className='text-gray-400 text-xs font-medium mb-2 px-2 uppercase tracking-wider'>
                    Quick Add
                  </h4>
                  <div className='grid grid-cols-2 gap-2 px-2'>
                    <button
                      onClick={() => setSelectedTool('wall')}
                      className='p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs flex flex-col items-center gap-1 transition-colors'
                    >
                      <Square className='w-5 h-5' />
                      <span>Wall</span>
                    </button>
                    <button
                      onClick={() => setSelectedTool('room')}
                      className='p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs flex flex-col items-center gap-1 transition-colors'
                    >
                      <Home className='w-5 h-5' />
                      <span>Room</span>
                    </button>
                    <button
                      onClick={() => setSelectedTool('door')}
                      className='p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs flex flex-col items-center gap-1 transition-colors'
                    >
                      <DoorOpen className='w-5 h-5' />
                      <span>Door</span>
                    </button>
                    <button
                      onClick={() => setSelectedTool('window')}
                      className='p-3 bg-white/5 hover:bg-white/10 rounded-lg text-white text-xs flex flex-col items-center gap-1 transition-colors'
                    >
                      <Maximize className='w-5 h-5' />
                      <span>Window</span>
                    </button>
                  </div>
                </div>

                <div>
                  <h4 className='text-gray-400 text-xs font-medium mb-2 px-2 uppercase tracking-wider'>
                    Import
                  </h4>
                  <label className='mx-2 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#947d61]/50 text-gray-300 hover:text-white transition-all flex items-center gap-3 text-sm cursor-pointer'>
                    <input
                      type='file'
                      accept='image/*,.dxf,.dwg'
                      onChange={handleImageUpload}
                      className='hidden'
                    />
                    <Upload className='w-4 h-4' />
                    <div>
                      <div className='font-medium'>Upload Floor Plan</div>
                      <div className='text-xs text-gray-500'>
                        Image, DXF, or DWG
                      </div>
                    </div>
                  </label>
                </div>

                <div className='p-3 mx-2 bg-[#947d61]/10 border border-[#947d61]/20 rounded-lg'>
                  <h5 className='text-[#947d61] text-sm font-medium mb-2'>
                    AI Suggestions
                  </h5>
                  <div className='space-y-2'>
                    <button
                      onClick={() =>
                        handleAIGenerate(
                          'Add a master bedroom with ensuite bathroom'
                        )
                      }
                      className='w-full text-left text-xs text-gray-300 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded transition-colors'
                    >
                      Add master bedroom suite
                    </button>
                    <button
                      onClick={() =>
                        handleAIGenerate(
                          'Create an open plan kitchen and living area'
                        )
                      }
                      className='w-full text-left text-xs text-gray-300 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded transition-colors'
                    >
                      Open plan kitchen/living
                    </button>
                    <button
                      onClick={() => handleAIGenerate('Add a two car garage')}
                      className='w-full text-left text-xs text-gray-300 hover:text-white p-2 bg-white/5 hover:bg-white/10 rounded transition-colors'
                    >
                      Add two-car garage
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className='flex-1 relative bg-gray-900'>
          <div
            ref={canvasRef}
            className='w-full h-full relative overflow-hidden'
            style={{
              cursor:
                selectedTool === 'move'
                  ? 'grab'
                  : selectedTool === 'select'
                  ? 'default'
                  : 'crosshair',
              backgroundImage: showGrid
                ? `linear-gradient(rgba(148, 125, 97, 0.1) 1px, transparent 1px),
                   linear-gradient(90deg, rgba(148, 125, 97, 0.1) 1px, transparent 1px)`
                : 'none',
              backgroundSize: `${(gridSize * zoomLevel) / 100}px ${
                (gridSize * zoomLevel) / 100
              }px`,
              backgroundPosition: `${panOffset.x}px ${panOffset.y}px`,
            }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <svg
              className='absolute inset-0 w-full h-full'
              style={{
                transform: `translate(${panOffset.x}px, ${
                  panOffset.y
                }px) scale(${zoomLevel / 100})`,
              }}
            >
              {/* Render existing elements */}
              {canvasElements
                .filter(
                  (element) =>
                    layers.find((l) => l.id === element.layer)?.visible
                )
                .map((element) => {
                  const layer = layers.find((l) => l.id === element.layer)
                  const isSelected = selectedElement === element.id

                  if (element.type === 'wall') {
                    return (
                      <g key={element.id}>
                        <line
                          x1={element.startX}
                          y1={element.startY}
                          x2={element.endX}
                          y2={element.endY}
                          stroke={
                            isSelected
                              ? brandColor
                              : element.color || layer?.color
                          }
                          strokeWidth={element.thickness || 10}
                          strokeLinecap='round'
                          className='cursor-pointer hover:opacity-80 transition-opacity'
                        />
                        {isSelected && (
                          <>
                            <circle
                              cx={element.startX}
                              cy={element.startY}
                              r='6'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='2'
                            />
                            <circle
                              cx={element.endX}
                              cy={element.endY}
                              r='6'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='2'
                            />
                          </>
                        )}
                      </g>
                    )
                  } else if (element.type === 'room') {
                    return (
                      <g key={element.id}>
                        <rect
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill={element.fill || 'transparent'}
                          stroke={
                            isSelected
                              ? brandColor
                              : element.color || layer?.color
                          }
                          strokeWidth={isSelected ? '3' : '2'}
                          className='cursor-pointer hover:opacity-80 transition-opacity'
                        />
                        {isSelected && (
                          <>
                            <rect
                              x={element.x - 4}
                              y={element.y - 4}
                              width='8'
                              height='8'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='1'
                            />
                            <rect
                              x={element.x + element.width - 4}
                              y={element.y - 4}
                              width='8'
                              height='8'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='1'
                            />
                            <rect
                              x={element.x - 4}
                              y={element.y + element.height - 4}
                              width='8'
                              height='8'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='1'
                            />
                            <rect
                              x={element.x + element.width - 4}
                              y={element.y + element.height - 4}
                              width='8'
                              height='8'
                              fill={brandColor}
                              stroke='white'
                              strokeWidth='1'
                            />
                          </>
                        )}
                      </g>
                    )
                  } else if (element.type === 'door') {
                    return (
                      <g key={element.id}>
                        <rect
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill='white'
                          stroke={
                            isSelected
                              ? brandColorLight
                              : element.color || brandColor
                          }
                          strokeWidth={isSelected ? '3' : '2'}
                          className='cursor-pointer hover:opacity-80 transition-opacity'
                        />
                        <path
                          d={`M ${element.x} ${element.y + element.height} A ${
                            element.width
                          } ${element.width} 0 0 0 ${
                            element.x + element.width
                          } ${element.y}`}
                          fill='transparent'
                          stroke={
                            isSelected
                              ? brandColorLight
                              : element.color || brandColor
                          }
                          strokeWidth='1'
                          strokeDasharray='3,3'
                        />
                      </g>
                    )
                  } else if (element.type === 'window') {
                    return (
                      <g key={element.id}>
                        <rect
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill={isSelected ? brandColor + '40' : '#3b82f640'}
                          stroke={isSelected ? brandColorLight : '#3b82f6'}
                          strokeWidth={isSelected ? '3' : '2'}
                          className='cursor-pointer hover:opacity-80 transition-opacity'
                        />
                        <line
                          x1={element.x + element.width / 2}
                          y1={element.y}
                          x2={element.x + element.width / 2}
                          y2={element.y + element.height}
                          stroke={isSelected ? brandColorLight : '#3b82f6'}
                          strokeWidth='1'
                        />
                      </g>
                    )
                  }
                  return null
                })}

              {/* Render current drawing */}
              {currentDrawing && (
                <>
                  {currentDrawing.type === 'wall' && (
                    <line
                      x1={currentDrawing.startX}
                      y1={currentDrawing.startY}
                      x2={currentDrawing.endX}
                      y2={currentDrawing.endY}
                      stroke={brandColor}
                      strokeWidth='10'
                      strokeLinecap='round'
                      strokeDasharray='5,5'
                      opacity='0.7'
                    />
                  )}
                  {currentDrawing.type === 'room' && (
                    <rect
                      x={
                        currentDrawing.width < 0
                          ? currentDrawing.x + currentDrawing.width
                          : currentDrawing.x
                      }
                      y={
                        currentDrawing.height < 0
                          ? currentDrawing.y + currentDrawing.height
                          : currentDrawing.y
                      }
                      width={Math.abs(currentDrawing.width)}
                      height={Math.abs(currentDrawing.height)}
                      fill='transparent'
                      stroke={brandColor}
                      strokeWidth='2'
                      strokeDasharray='5,5'
                      opacity='0.7'
                    />
                  )}
                  {currentDrawing.type === 'measurement' && (
                    <g>
                      <line
                        x1={currentDrawing.startX}
                        y1={currentDrawing.startY}
                        x2={currentDrawing.endX}
                        y2={currentDrawing.endY}
                        stroke='#10b981'
                        strokeWidth='2'
                        markerEnd='url(#arrowhead)'
                        markerStart='url(#arrowhead)'
                      />
                      <text
                        x={(currentDrawing.startX + currentDrawing.endX) / 2}
                        y={
                          (currentDrawing.startY + currentDrawing.endY) / 2 - 10
                        }
                        fill='#10b981'
                        fontSize='14'
                        fontWeight='bold'
                        textAnchor='middle'
                      >
                        {pixelsToUnits(
                          Math.sqrt(
                            Math.pow(
                              currentDrawing.endX - currentDrawing.startX,
                              2
                            ) +
                              Math.pow(
                                currentDrawing.endY - currentDrawing.startY,
                                2
                              )
                          )
                        )}{' '}
                        {units === 'meters' ? 'm' : 'ft'}
                      </text>
                    </g>
                  )}
                </>
              )}

              {/* Render measurements */}
              {measurements.map((m) => (
                <g key={m.id}>
                  <line
                    x1={m.startX}
                    y1={m.startY}
                    x2={m.endX}
                    y2={m.endY}
                    stroke='#10b981'
                    strokeWidth='2'
                  />
                  <text
                    x={(m.startX + m.endX) / 2}
                    y={(m.startY + m.endY) / 2 - 10}
                    fill='#10b981'
                    fontSize='14'
                    fontWeight='bold'
                    textAnchor='middle'
                  >
                    {m.distance} {units === 'meters' ? 'm' : 'ft'}
                  </text>
                </g>
              ))}

              {/* Arrow marker definition */}
              <defs>
                <marker
                  id='arrowhead'
                  markerWidth='10'
                  markerHeight='7'
                  refX='9'
                  refY='3.5'
                  orient='auto'
                >
                  <polygon points='0 0, 10 3.5, 0 7' fill='#10b981' />
                </marker>
              </defs>
            </svg>
          </div>

          {/* Canvas Controls Overlay */}
          <div className='absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-lg p-3 flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <button
                onClick={() => setZoomLevel(Math.max(zoomLevel - 10, 50))}
              >
                <ZoomOut className='w-4 h-4 text-gray-400 hover:text-white cursor-pointer' />
              </button>
              <span className='text-white text-sm font-mono min-w-[50px] text-center'>
                {zoomLevel}%
              </span>
              <button
                onClick={() => setZoomLevel(Math.min(zoomLevel + 10, 200))}
              >
                <ZoomIn className='w-4 h-4 text-gray-400 hover:text-white cursor-pointer' />
              </button>
            </div>
            <div className='border-l border-white/20 h-4'></div>
            <div className='flex items-center gap-2'>
              <Grid3X3 className='w-4 h-4 text-gray-400' />
              <button
                onClick={() => setSnapToGrid(!snapToGrid)}
                className={`text-sm ${
                  snapToGrid ? 'text-green-400' : 'text-gray-400'
                } hover:text-white transition-colors`}
              >
                Snap: {snapToGrid ? 'On' : 'Off'}
              </button>
            </div>
            <div className='border-l border-white/20 h-4'></div>
            <select
              value={units}
              onChange={(e) => setUnits(e.target.value)}
              className='bg-transparent text-sm text-gray-400 hover:text-white focus:outline-none cursor-pointer'
            >
              <option value='meters'>Meters</option>
              <option value='feet'>Feet</option>
            </select>
          </div>

          {/* Coordinates Display */}
          <div className='absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-lg px-3 py-2'>
            <div className='text-gray-400 text-sm font-mono'>
              X: {mousePos.x.toFixed(0)}, Y: {mousePos.y.toFixed(0)} | Scale: 1:
              {scale} | Tool: {tools.find((t) => t.id === selectedTool)?.name}
            </div>
          </div>
        </div>

        {/* Right Properties Panel */}
        {showPropertiesPanel && (
          <div className='w-80 bg-black/40 backdrop-blur-xl border-l border-white/10 flex flex-col'>
            {/* Layers Panel */}
            <div className='border-b border-white/10'>
              <div className='p-4'>
                <div className='flex items-center justify-between mb-3'>
                  <h3 className='text-white font-semibold flex items-center gap-2'>
                    <Layers className='w-4 h-4' />
                    Layers
                  </h3>
                  <button
                    onClick={() => setShowPropertiesPanel(false)}
                    className='text-gray-400 hover:text-white transition-colors'
                  >
                    <X className='w-4 h-4' />
                  </button>
                </div>
                <div className='space-y-1'>
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      className='flex items-center gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors group'
                    >
                      <button
                        onClick={() => toggleLayer(layer.id)}
                        className='text-gray-400 hover:text-white transition-colors'
                      >
                        {layer.visible ? (
                          <Eye className='w-4 h-4' />
                        ) : (
                          <EyeOff className='w-4 h-4' />
                        )}
                      </button>
                      <div
                        className='w-3 h-3 rounded-sm border border-white/20'
                        style={{ backgroundColor: layer.color }}
                      ></div>
                      <span
                        className={`text-sm flex-1 ${
                          layer.visible ? 'text-white' : 'text-gray-500'
                        }`}
                      >
                        {layer.name}
                      </span>
                      <button
                        onClick={() => lockLayer(layer.id)}
                        className='opacity-0 group-hover:opacity-100 text-gray-500 hover:text-gray-300 transition-all'
                      >
                        {layer.locked ? (
                          <Lock className='w-3 h-3' />
                        ) : (
                          <Unlock className='w-3 h-3' />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Properties Panel */}
            <div className='flex-1 p-4 overflow-y-auto'>
              <h3 className='text-white font-semibold mb-3'>Properties</h3>

              {selectedElement ? (
                <div className='space-y-4'>
                  <div>
                    <label className='text-gray-400 text-sm mb-1 block'>
                      Element Type
                    </label>
                    <div className='text-white text-sm bg-white/10 rounded-lg px-3 py-2 font-mono'>
                      {canvasElements.find((el) => el.id === selectedElement)
                        ?.type || 'Unknown'}
                    </div>
                  </div>

                  {(() => {
                    const element = canvasElements.find(
                      (el) => el.id === selectedElement
                    )
                    if (!element) return null

                    if (element.type === 'wall') {
                      return (
                        <>
                          <div>
                            <label className='text-gray-400 text-sm mb-1 block'>
                              Length
                            </label>
                            <div className='text-white text-sm bg-white/10 rounded-lg px-3 py-2 font-mono'>
                              {pixelsToUnits(
                                Math.sqrt(
                                  Math.pow(element.endX - element.startX, 2) +
                                    Math.pow(element.endY - element.startY, 2)
                                )
                              )}{' '}
                              {units === 'meters' ? 'm' : 'ft'}
                            </div>
                          </div>
                          <div>
                            <label className='text-gray-400 text-sm mb-1 block'>
                              Thickness
                            </label>
                            <input
                              type='number'
                              value={element.thickness || 10}
                              onChange={(e) =>
                                updateElement(element.id, {
                                  thickness: parseInt(e.target.value),
                                })
                              }
                              className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                            />
                          </div>
                        </>
                      )
                    } else if (
                      element.type === 'room' ||
                      element.type === 'door' ||
                      element.type === 'window'
                    ) {
                      return (
                        <>
                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <label className='text-gray-400 text-sm mb-1 block'>
                                Width
                              </label>
                              <div className='text-white text-sm bg-white/10 rounded-lg px-3 py-2 font-mono'>
                                {pixelsToUnits(element.width)}{' '}
                                {units === 'meters' ? 'm' : 'ft'}
                              </div>
                            </div>
                            <div>
                              <label className='text-gray-400 text-sm mb-1 block'>
                                Height
                              </label>
                              <div className='text-white text-sm bg-white/10 rounded-lg px-3 py-2 font-mono'>
                                {pixelsToUnits(element.height)}{' '}
                                {units === 'meters' ? 'm' : 'ft'}
                              </div>
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <label className='text-gray-400 text-sm mb-1 block'>
                                X Position
                              </label>
                              <input
                                type='number'
                                value={element.x.toFixed(0)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    x: parseFloat(e.target.value),
                                  })
                                }
                                className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                              />
                            </div>
                            <div>
                              <label className='text-gray-400 text-sm mb-1 block'>
                                Y Position
                              </label>
                              <input
                                type='number'
                                value={element.y.toFixed(0)}
                                onChange={(e) =>
                                  updateElement(element.id, {
                                    y: parseFloat(e.target.value),
                                  })
                                }
                                className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                              />
                            </div>
                          </div>
                        </>
                      )
                    }
                    return null
                  })()}

                  <div>
                    <label className='text-gray-400 text-sm mb-1 block'>
                      Layer
                    </label>
                    <select
                      value={
                        canvasElements.find((el) => el.id === selectedElement)
                          ?.layer || 1
                      }
                      onChange={(e) =>
                        updateElement(selectedElement, {
                          layer: parseInt(e.target.value),
                        })
                      }
                      className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50'
                    >
                      {layers.map((layer) => (
                        <option
                          key={layer.id}
                          value={layer.id}
                          className='bg-gray-900'
                        >
                          {layer.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className='flex gap-2'>
                    <button
                      onClick={duplicateElement}
                      className='flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1'
                    >
                      <Copy className='w-4 h-4' />
                      Duplicate
                    </button>
                    <button
                      onClick={() => deleteElement(selectedElement)}
                      className='flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1'
                    >
                      <Trash2 className='w-4 h-4' />
                      Delete
                    </button>
                  </div>
                </div>
              ) : (
                <div className='text-gray-500 text-sm text-center py-8'>
                  <MousePointer className='w-8 h-8 mx-auto mb-2 opacity-50' />
                  Select an element to edit its properties
                </div>
              )}
            </div>

            {/* AI Assistant Panel */}
            <div className='border-t border-white/10 p-4'>
              <h3 className='text-white font-semibold mb-3 flex items-center gap-2'>
                <Home className='w-4 h-4' />
                AI Assistant
              </h3>

              <div className='space-y-3'>
                <textarea
                  id='ai-prompt'
                  placeholder="Describe what you want to add or modify... e.g., 'Add a 3-bedroom house layout', 'Create an office space with conference room', 'Add bathroom next to the bedroom'"
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 resize-none h-20'
                />

                <button
                  onClick={() => {
                    const prompt = document.getElementById('ai-prompt').value
                    if (prompt) handleAIGenerate(prompt)
                  }}
                  className='w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-all hover:scale-105'
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                  }}
                >
                  <ArrowRight className='w-4 h-4 inline mr-2' />
                  Generate with AI
                </button>
              </div>

              <div className='mt-3 text-xs text-gray-400'>
                Elements: {canvasElements.length} | History: {historyIndex + 1}/
                {history.length}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className='bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-between text-sm'>
        <div className='flex items-center gap-4 text-gray-400'>
          <span className='text-green-400'>●</span>
          <span>Ready</span>
          <span>•</span>
          <span>{canvasElements.length} elements</span>
          <span>•</span>
          <span>Scale: 1:{scale}</span>
          <span>•</span>
          <span className='text-xs bg-[#947d61]/20 text-[#947d61] px-2 py-0.5 rounded-full'>
            AutoCAD DXF Export Ready
          </span>
        </div>

        <div className='flex items-center gap-4 text-gray-400'>
          <span>Grid: {gridSize}px</span>
          <span>•</span>
          <span>Snap: {snapToGrid ? 'On' : 'Off'}</span>
          <span>•</span>
          <span>Zoom: {zoomLevel}%</span>
        </div>
      </div>
    </div>
  )
}

export default FloorPlanGenerator
