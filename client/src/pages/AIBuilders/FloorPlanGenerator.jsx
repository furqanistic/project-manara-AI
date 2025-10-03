// File: client/src/pages/AIBuilders/FloorPlanGenerator.jsx
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
  Layers3,
  Lock,
  Maximize,
  Menu,
  MoreHorizontal,
  MousePointer,
  Move,
  PaintBucket,
  Palette,
  Plus,
  Redo,
  RotateCcw,
  RotateCw,
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
import React, { useState } from 'react'

const FloorPlanEditor = () => {
  const [selectedTool, setSelectedTool] = useState('select')
  const [selectedElement, setSelectedElement] = useState(null)
  const [showGrid, setShowGrid] = useState(true)
  const [zoomLevel, setZoomLevel] = useState(100)
  const [showElementPanel, setShowElementPanel] = useState(true)
  const [showPropertiesPanel, setShowPropertiesPanel] = useState(true)
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
      name: 'Annotations',
      visible: true,
      locked: false,
      color: '#10b981',
    },
    { id: 5, name: 'Images', visible: true, locked: false, color: '#f59e0b' },
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

  const elements = [
    {
      category: 'Structure',
      items: [
        {
          id: 'wall',
          icon: Square,
          name: 'Wall',
          description: 'Interior/exterior walls',
        },
        {
          id: 'column',
          icon: Circle,
          name: 'Column',
          description: 'Support columns',
        },
        {
          id: 'stairs',
          icon: Layers3,
          name: 'Stairs',
          description: 'Staircase elements',
        },
      ],
    },
    {
      category: 'Openings',
      items: [
        {
          id: 'door',
          icon: DoorOpen,
          name: 'Door',
          description: 'Interior/exterior doors',
        },
        {
          id: 'window',
          icon: Maximize,
          name: 'Window',
          description: 'Windows & glazing',
        },
        {
          id: 'opening',
          icon: Square,
          name: 'Opening',
          description: 'Archways & passages',
        },
      ],
    },
    {
      category: 'Kitchen & Bath',
      items: [
        {
          id: 'sink',
          icon: Circle,
          name: 'Sink',
          description: 'Kitchen/bathroom sinks',
        },
        {
          id: 'toilet',
          icon: Square,
          name: 'Toilet',
          description: 'Toilet fixtures',
        },
        {
          id: 'bathtub',
          icon: Square,
          name: 'Bathtub',
          description: 'Bathtubs & showers',
        },
        {
          id: 'counter',
          icon: Square,
          name: 'Counter',
          description: 'Kitchen countertops',
        },
      ],
    },
    {
      category: 'Furniture',
      items: [
        {
          id: 'sofa',
          icon: Square,
          name: 'Sofa',
          description: 'Sofas & seating',
        },
        {
          id: 'bed',
          icon: Square,
          name: 'Bed',
          description: 'Beds & mattresses',
        },
        {
          id: 'table',
          icon: Circle,
          name: 'Table',
          description: 'Dining & coffee tables',
        },
        {
          id: 'cabinet',
          icon: Square,
          name: 'Cabinet',
          description: 'Storage & cabinets',
        },
      ],
    },
    {
      category: 'Images & Assets',
      items: [
        {
          id: 'image-upload',
          icon: Upload,
          name: 'Upload Image',
          description: 'Custom furniture/decor images',
        },
        {
          id: 'floor-plan',
          icon: Image,
          name: 'Floor Plan',
          description: 'Import existing floor plans',
        },
      ],
    },
  ]

  // Mock canvas elements that would come from AI/JSON in the future
  const canvasElements = [
    { id: 1, type: 'wall', x: 100, y: 100, width: 200, height: 10, layer: 1 },
    { id: 2, type: 'wall', x: 100, y: 100, width: 10, height: 150, layer: 1 },
    { id: 3, type: 'wall', x: 300, y: 100, width: 10, height: 150, layer: 1 },
    { id: 4, type: 'wall', x: 100, y: 250, width: 200, height: 10, layer: 1 },
    { id: 5, type: 'door', x: 150, y: 245, width: 30, height: 15, layer: 2 },
    { id: 6, type: 'window', x: 200, y: 95, width: 40, height: 10, layer: 2 },
    // Future: user-uploaded images would have type: 'image' with src property
    // { id: 7, type: 'image', x: 120, y: 120, width: 60, height: 40, src: '/uploads/sofa.png', layer: 3 },
  ]

  const toggleLayer = (layerId) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
      )
    )
  }

  const lockLayer = (layerId) => {
    setLayers(
      layers.map((layer) =>
        layer.id === layerId ? { ...layer, locked: !layer.locked } : layer
      )
    )
  }

  const handleImageUpload = (event) => {
    const file = event.target.files[0]
    if (file) {
      // Future: This would upload to server and add to canvas
      console.log('Image uploaded:', file.name)
      // Mock adding image element to canvas
      // setCanvasElements([...canvasElements, newImageElement])
    }
  }

  const handleAIGenerate = (prompt) => {
    // Future: This would call AI API and update canvas
    console.log('AI Generate:', prompt)
    // Mock API call structure:
    // const response = await fetch('/api/generate-floorplan', {
    //   method: 'POST',
    //   body: JSON.stringify({ prompt, currentElements: canvasElements })
    // })
    // const newElements = await response.json()
    // setCanvasElements(newElements)
  }

  return (
    <div className='h-screen bg-black flex flex-col overflow-hidden'>
      {/* Top Navigation Bar */}
      <div className='bg-black/40 backdrop-blur-xl border-b border-white/10 px-4 py-3 flex items-center justify-between'>
        <div className='flex items-center gap-4'>
          <div className='text-white font-bold text-xl'>Manāra</div>
          <div className='text-gray-400 text-sm'>Floor Plan Editor</div>
          <div className='text-xs text-gray-500 bg-white/10 px-2 py-1 rounded-full'>
            AI-Powered
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
          <button className='px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors'>
            <Save className='w-4 h-4 inline mr-1' />
            Save
          </button>
          <button className='px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-white text-sm transition-colors'>
            <Share className='w-4 h-4 inline mr-1' />
            Share
          </button>
          <button
            className='px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:scale-105'
            style={{
              background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
            }}
          >
            <Download className='w-4 h-4 inline mr-1' />
            Export
          </button>
        </div>
      </div>

      <div className='flex-1 flex overflow-hidden'>
        {/* Left Toolbar */}
        <div className='w-16 bg-black/60 backdrop-blur-xl border-r border-white/10 flex flex-col'>
          {/* Drawing Tools */}
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

                  {/* Tooltip */}
                  <div className='absolute left-full ml-2 px-2 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-50 border border-white/20'>
                    {tool.name} ({tool.shortcut})
                  </div>
                </button>
              )
            })}
          </div>

          <div className='border-t border-white/10 my-2'></div>

          {/* Action Tools */}
          <div className='p-2 space-y-1'>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Undo'
            >
              <Undo className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Redo'
            >
              <Redo className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Copy'
            >
              <Copy className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Delete'
            >
              <Trash2 className='w-5 h-5' />
            </button>
          </div>

          <div className='border-t border-white/10 my-2'></div>

          {/* View Tools */}
          <div className='p-2 space-y-1'>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center group relative ${
                showGrid
                  ? 'bg-[#947d61] text-white'
                  : 'bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white'
              }`}
              title='Toggle Grid'
            >
              <Grid3X3 className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Zoom In'
            >
              <ZoomIn className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
              title='Zoom Out'
            >
              <ZoomOut className='w-5 h-5' />
            </button>
            <button
              className='w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center justify-center group relative'
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
              {elements.map((category) => (
                <div key={category.category} className='mb-4'>
                  <h4 className='text-gray-400 text-xs font-medium mb-2 px-2 uppercase tracking-wider'>
                    {category.category}
                  </h4>
                  <div className='space-y-1'>
                    {category.items.map((item) => {
                      const IconComponent = item.icon
                      return (
                        <div key={item.id} className='relative group'>
                          {item.id === 'image-upload' ? (
                            <label className='w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-dashed border-white/20 hover:border-[#947d61]/50 text-gray-300 hover:text-white transition-all flex items-center gap-3 text-sm cursor-pointer'>
                              <input
                                type='file'
                                accept='image/*'
                                onChange={handleImageUpload}
                                className='hidden'
                              />
                              <IconComponent className='w-4 h-4' />
                              <div>
                                <div className='font-medium'>{item.name}</div>
                                <div className='text-xs text-gray-500'>
                                  {item.description}
                                </div>
                              </div>
                            </label>
                          ) : (
                            <button
                              className='w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all flex items-center gap-3 text-sm group'
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData('element-type', item.id)
                                e.dataTransfer.setData(
                                  'element-name',
                                  item.name
                                )
                              }}
                            >
                              <IconComponent className='w-4 h-4 flex-shrink-0' />
                              <div className='flex-1 text-left'>
                                <div className='font-medium'>{item.name}</div>
                                <div className='text-xs text-gray-500'>
                                  {item.description}
                                </div>
                              </div>
                            </button>
                          )}

                          {/* Drag indicator */}
                          <div className='absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <MoreHorizontal className='w-4 h-4' />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}

              {/* Future AI suggestions section */}
              <div className='mt-6 p-3 bg-[#947d61]/10 border border-[#947d61]/20 rounded-lg'>
                <h5 className='text-[#947d61] text-sm font-medium mb-2'>
                  AI Suggestions
                </h5>
                <div className='text-xs text-gray-400'>
                  Based on your current layout, consider adding:
                  <div className='mt-2 space-y-1'>
                    <div className='text-white text-xs'>• Kitchen island</div>
                    <div className='text-white text-xs'>• Master bathroom</div>
                    <div className='text-white text-xs'>• Storage closet</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Canvas Area */}
        <div className='flex-1 relative bg-gray-900'>
          {/* Canvas Drop Zone */}
          <div
            className='w-full h-full relative overflow-auto'
            style={{
              backgroundImage: showGrid
                ? `
                linear-gradient(rgba(148, 125, 97, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(148, 125, 97, 0.1) 1px, transparent 1px)
              `
                : 'none',
              backgroundSize: '20px 20px',
            }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault()
              const elementType = e.dataTransfer.getData('element-type')
              const elementName = e.dataTransfer.getData('element-name')
              const rect = e.currentTarget.getBoundingClientRect()
              const x = e.clientX - rect.left
              const y = e.clientY - rect.top

              console.log(`Dropped ${elementName} at (${x}, ${y})`)
              // Future: Add element to canvas at drop position
              // This would integrate with AI API to generate proper element
            }}
          >
            <div className='relative w-full h-full min-w-[1200px] min-h-[800px]'>
              {/* Canvas Elements */}
              <svg className='absolute inset-0 w-full h-full'>
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
                        <rect
                          key={element.id}
                          x={element.x}
                          y={element.y}
                          width={element.width}
                          height={element.height}
                          fill={
                            isSelected ? brandColor : layer?.color || '#ffffff'
                          }
                          stroke={isSelected ? brandColorLight : brandColor}
                          strokeWidth={isSelected ? '2' : '1'}
                          className='cursor-pointer hover:opacity-80 transition-opacity'
                          onClick={() => setSelectedElement(element.id)}
                        />
                      )
                    } else if (element.type === 'door') {
                      return (
                        <g key={element.id}>
                          <rect
                            x={element.x}
                            y={element.y}
                            width={element.width}
                            height={element.height}
                            fill='transparent'
                            stroke={
                              isSelected
                                ? brandColorLight
                                : layer?.color || brandColor
                            }
                            strokeWidth={isSelected ? '3' : '2'}
                            className='cursor-pointer hover:opacity-80 transition-opacity'
                            onClick={() => setSelectedElement(element.id)}
                          />
                          <path
                            d={`M ${element.x} ${
                              element.y + element.height
                            } A ${element.width} ${element.width} 0 0 0 ${
                              element.x + element.width
                            } ${element.y}`}
                            fill='transparent'
                            stroke={
                              isSelected
                                ? brandColorLight
                                : layer?.color || brandColor
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
                            onClick={() => setSelectedElement(element.id)}
                          />
                          {/* Window mullions */}
                          <line
                            x1={element.x + element.width / 3}
                            y1={element.y}
                            x2={element.x + element.width / 3}
                            y2={element.y + element.height}
                            stroke={isSelected ? brandColorLight : '#3b82f6'}
                            strokeWidth='1'
                          />
                          <line
                            x1={element.x + (2 * element.width) / 3}
                            y1={element.y}
                            x2={element.x + (2 * element.width) / 3}
                            y2={element.y + element.height}
                            stroke={isSelected ? brandColorLight : '#3b82f6'}
                            strokeWidth='1'
                          />
                        </g>
                      )
                    }
                    // Future: Handle 'image' type elements here
                    // else if (element.type === 'image') {
                    //   return (
                    //     <image
                    //       key={element.id}
                    //       x={element.x}
                    //       y={element.y}
                    //       width={element.width}
                    //       height={element.height}
                    //       href={element.src}
                    //       className='cursor-pointer hover:opacity-80 transition-opacity'
                    //       onClick={() => setSelectedElement(element.id)}
                    //     />
                    //   )
                    // }
                    return null
                  })}
              </svg>

              {/* Selection handles for selected element */}
              {selectedElement && (
                <div className='absolute pointer-events-none'>
                  {(() => {
                    const element = canvasElements.find(
                      (el) => el.id === selectedElement
                    )
                    if (!element) return null

                    return (
                      <>
                        {/* Corner handles */}
                        <div
                          className='absolute w-2 h-2 bg-[#947d61] border border-white rounded-sm'
                          style={{ left: element.x - 4, top: element.y - 4 }}
                        />
                        <div
                          className='absolute w-2 h-2 bg-[#947d61] border border-white rounded-sm'
                          style={{
                            left: element.x + element.width - 4,
                            top: element.y - 4,
                          }}
                        />
                        <div
                          className='absolute w-2 h-2 bg-[#947d61] border border-white rounded-sm'
                          style={{
                            left: element.x - 4,
                            top: element.y + element.height - 4,
                          }}
                        />
                        <div
                          className='absolute w-2 h-2 bg-[#947d61] border border-white rounded-sm'
                          style={{
                            left: element.x + element.width - 4,
                            top: element.y + element.height - 4,
                          }}
                        />
                      </>
                    )
                  })()}
                </div>
              )}

              {/* Drop zone indicator */}
              <div className='absolute inset-0 pointer-events-none border-2 border-dashed border-transparent transition-colors duration-200'>
                {/* This would show when dragging elements */}
              </div>
            </div>
          </div>

          {/* Canvas Controls Overlay */}
          <div className='absolute top-4 left-4 bg-black/60 backdrop-blur-xl rounded-lg p-3 flex items-center gap-3'>
            <div className='flex items-center gap-2'>
              <ZoomOut className='w-4 h-4 text-gray-400' />
              <span className='text-white text-sm font-mono'>{zoomLevel}%</span>
              <ZoomIn className='w-4 h-4 text-gray-400' />
            </div>
            <div className='border-l border-white/20 h-4'></div>
            <div className='flex items-center gap-2'>
              <Grid3X3 className='w-4 h-4 text-gray-400' />
              <span className='text-gray-400 text-sm'>
                Grid: {showGrid ? 'On' : 'Off'}
              </span>
            </div>
            <div className='border-l border-white/20 h-4'></div>
            <div className='text-xs text-gray-500 bg-green-500/20 text-green-400 px-2 py-1 rounded-full'>
              AI Ready
            </div>
          </div>

          {/* Coordinates Display */}
          <div className='absolute bottom-4 left-4 bg-black/60 backdrop-blur-xl rounded-lg px-3 py-2'>
            <div className='text-gray-400 text-sm font-mono'>
              X: 0, Y: 0 | Scale: 1:100
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

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='text-gray-400 text-sm mb-1 block'>
                        Width
                      </label>
                      <input
                        type='number'
                        className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                        defaultValue={
                          canvasElements.find((el) => el.id === selectedElement)
                            ?.width || 0
                        }
                      />
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm mb-1 block'>
                        Height
                      </label>
                      <input
                        type='number'
                        className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                        defaultValue={
                          canvasElements.find((el) => el.id === selectedElement)
                            ?.height || 0
                        }
                      />
                    </div>
                  </div>

                  <div className='grid grid-cols-2 gap-2'>
                    <div>
                      <label className='text-gray-400 text-sm mb-1 block'>
                        X Position
                      </label>
                      <input
                        type='number'
                        className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                        defaultValue={
                          canvasElements.find((el) => el.id === selectedElement)
                            ?.x || 0
                        }
                      />
                    </div>
                    <div>
                      <label className='text-gray-400 text-sm mb-1 block'>
                        Y Position
                      </label>
                      <input
                        type='number'
                        className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 font-mono'
                        defaultValue={
                          canvasElements.find((el) => el.id === selectedElement)
                            ?.y || 0
                        }
                      />
                    </div>
                  </div>

                  <div>
                    <label className='text-gray-400 text-sm mb-1 block'>
                      Layer
                    </label>
                    <select className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-[#947d61]/50'>
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
                    <button className='flex-1 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1'>
                      <Copy className='w-4 h-4' />
                      Duplicate
                    </button>
                    <button className='flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg py-2 text-sm transition-colors flex items-center justify-center gap-1'>
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
                <Palette className='w-4 h-4' />
                AI Assistant
              </h3>

              <div className='space-y-3'>
                <textarea
                  placeholder="Describe what you want to add or modify... e.g., 'Add a kitchen island', 'Make the living room bigger', 'Add windows to the east wall'"
                  className='w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#947d61]/50 resize-none h-20'
                />

                <button
                  onClick={() => handleAIGenerate('sample prompt')}
                  className='w-full py-2 px-4 rounded-lg text-white text-sm font-medium transition-all hover:scale-105'
                  style={{
                    background: `linear-gradient(135deg, ${brandColor}, ${brandColorLight})`,
                  }}
                >
                  <ArrowRight className='w-4 h-4 inline mr-2' />
                  Generate with AI
                </button>
              </div>

              <div className='mt-3 p-3 bg-white/5 rounded-lg'>
                <div className='text-xs text-gray-400 mb-2'>Quick actions:</div>
                <div className='flex flex-wrap gap-1'>
                  {[
                    'Add bedroom',
                    'Kitchen island',
                    'More windows',
                    'Bigger bathroom',
                    'Storage room',
                  ].map((action) => (
                    <button
                      key={action}
                      onClick={() => handleAIGenerate(action)}
                      className='px-2 py-1 bg-white/10 hover:bg-[#947d61]/20 rounded text-xs text-gray-300 hover:text-white transition-colors'
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Status Bar */}
      <div className='bg-black/40 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-between text-sm'>
        <div className='flex items-center gap-4 text-gray-400'>
          <span className='text-green-400'>●</span>
          <span>Ready for editing</span>
          <span>•</span>
          <span>{canvasElements.length} elements</span>
          <span>•</span>
          <span>Scale: 1:100</span>
          <span>•</span>
          <span className='text-xs bg-[#947d61]/20 text-[#947d61] px-2 py-0.5 rounded-full'>
            AI-Enhanced
          </span>
        </div>

        <div className='flex items-center gap-4 text-gray-400'>
          <span>Grid: 20px</span>
          <span>•</span>
          <span>Snap: {selectedTool !== 'select' ? 'On' : 'Off'}</span>
          <span>•</span>
          <span>Tool: {tools.find((t) => t.id === selectedTool)?.name}</span>
        </div>
      </div>
    </div>
  )
}

export default FloorPlanEditor
