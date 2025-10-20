// File: server/services/aiFloorPlanService.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export const generateFloorPlanElements = async ({
  prompt,
  currentElements,
  context,
}) => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

    // Build comprehensive prompt for AI
    const systemPrompt = `You are an expert architect and floor plan designer. Generate floor plan elements based on the user's request.
    
Current floor plan context:
- Scale: 1:${context.scale}
- Units: ${context.units}
- Grid size: 20px
- Current elements: ${currentElements.length} elements
${
  currentElements.length > 0
    ? `- Existing rooms: ${
        currentElements.filter((e) => e.type === 'room').length
      }`
    : ''
}
${
  currentElements.length > 0
    ? `- Existing walls: ${
        currentElements.filter((e) => e.type === 'wall').length
      }`
    : ''
}

User request: ${prompt}

Generate appropriate floor plan elements as a JSON array. Each element should have:
- id: unique identifier (use timestamp + random)
- type: 'wall', 'room', 'door', 'window', etc.
- Appropriate position and size properties
- layer: 1 for walls, 2 for doors/windows, 3 for furniture
- color: appropriate color for the element type

For walls: use startX, startY, endX, endY, thickness
For rooms/doors/windows: use x, y, width, height
Ensure all measurements are in pixels and align with the grid (multiples of 20).
Keep proportions realistic for the scale.

Return ONLY valid JSON array of elements, no explanation.`

    const result = await model.generateContent(systemPrompt)
    const response = result.response.text()

    // Extract JSON from response
    const jsonMatch = response.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      throw new Error('Invalid AI response format')
    }

    let elements = JSON.parse(jsonMatch[0])

    // Add unique IDs and timestamps
    elements = elements.map((el) => ({
      ...el,
      id: Date.now() + Math.random(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }))

    // Validate and adjust elements
    elements = validateAndAdjustElements(elements, currentElements, context)

    return elements
  } catch (error) {
    console.error('AI generation error:', error)

    // Fallback to rule-based generation
    return generateFallbackElements(prompt, currentElements, context)
  }
}

const validateAndAdjustElements = (elements, currentElements, context) => {
  const gridSize = 20
  const validated = []

  for (const element of elements) {
    // Ensure grid alignment
    if (element.type === 'wall') {
      element.startX = Math.round(element.startX / gridSize) * gridSize
      element.startY = Math.round(element.startY / gridSize) * gridSize
      element.endX = Math.round(element.endX / gridSize) * gridSize
      element.endY = Math.round(element.endY / gridSize) * gridSize
      element.thickness = element.thickness || 10
      element.layer = 1
      element.color = element.color || '#ffffff'
    } else if (['room', 'door', 'window'].includes(element.type)) {
      element.x = Math.round(element.x / gridSize) * gridSize
      element.y = Math.round(element.y / gridSize) * gridSize
      element.width = Math.round(element.width / gridSize) * gridSize
      element.height = Math.round(element.height / gridSize) * gridSize

      if (element.type === 'door') {
        element.layer = 2
        element.color = element.color || '#947d61'
      } else if (element.type === 'window') {
        element.layer = 2
        element.color = element.color || '#3b82f6'
      } else if (element.type === 'room') {
        element.layer = 1
        element.color = element.color || '#ffffff'
        element.fill = element.fill || 'transparent'
      }
    }

    // Check for overlaps with existing elements (basic check)
    let hasConflict = false
    if (element.type === 'room') {
      for (const existing of currentElements.filter((e) => e.type === 'room')) {
        if (checkRoomOverlap(element, existing)) {
          // Adjust position to avoid overlap
          element.x += 100
          element.y += 100
        }
      }
    }

    validated.push(element)
  }

  return validated
}

const checkRoomOverlap = (room1, room2) => {
  return !(
    room1.x >= room2.x + room2.width ||
    room1.x + room1.width <= room2.x ||
    room1.y >= room2.y + room2.height ||
    room1.y + room1.height <= room2.y
  )
}

const generateFallbackElements = (prompt, currentElements, context) => {
  const elements = []
  const gridSize = 20
  const baseX = currentElements.length > 0 ? 400 : 100
  const baseY = currentElements.length > 0 ? 100 : 100

  // Simple rule-based generation based on keywords
  const promptLower = prompt.toLowerCase()

  if (promptLower.includes('bedroom')) {
    const roomWidth = 200
    const roomHeight = 180

    // Create room walls
    elements.push(
      {
        id: Date.now() + Math.random(),
        type: 'wall',
        startX: baseX,
        startY: baseY,
        endX: baseX + roomWidth,
        endY: baseY,
        thickness: 10,
        layer: 1,
        color: '#ffffff',
      },
      {
        id: Date.now() + Math.random() + 1,
        type: 'wall',
        startX: baseX,
        startY: baseY,
        endX: baseX,
        endY: baseY + roomHeight,
        thickness: 10,
        layer: 1,
        color: '#ffffff',
      },
      {
        id: Date.now() + Math.random() + 2,
        type: 'wall',
        startX: baseX + roomWidth,
        startY: baseY,
        endX: baseX + roomWidth,
        endY: baseY + roomHeight,
        thickness: 10,
        layer: 1,
        color: '#ffffff',
      },
      {
        id: Date.now() + Math.random() + 3,
        type: 'wall',
        startX: baseX,
        startY: baseY + roomHeight,
        endX: baseX + roomWidth,
        endY: baseY + roomHeight,
        thickness: 10,
        layer: 1,
        color: '#ffffff',
      }
    )

    // Add door
    elements.push({
      id: Date.now() + Math.random() + 4,
      type: 'door',
      x: baseX + roomWidth / 2 - 30,
      y: baseY + roomHeight - 7.5,
      width: 60,
      height: 15,
      layer: 2,
      color: '#947d61',
      swingDirection: 'inward',
    })

    // Add window
    elements.push({
      id: Date.now() + Math.random() + 5,
      type: 'window',
      x: baseX + 20,
      y: baseY - 5,
      width: 80,
      height: 10,
      layer: 2,
      color: '#3b82f6',
    })
  } else if (promptLower.includes('bathroom')) {
    const roomWidth = 120
    const roomHeight = 100

    // Create smaller bathroom
    elements.push({
      id: Date.now() + Math.random(),
      type: 'room',
      x: baseX,
      y: baseY,
      width: roomWidth,
      height: roomHeight,
      layer: 1,
      color: '#ffffff',
      fill: 'transparent',
      roomType: 'bathroom',
    })

    // Add door
    elements.push({
      id: Date.now() + Math.random() + 1,
      type: 'door',
      x: baseX + roomWidth / 2 - 30,
      y: baseY + roomHeight - 7.5,
      width: 60,
      height: 15,
      layer: 2,
      color: '#947d61',
    })
  } else if (promptLower.includes('kitchen')) {
    const roomWidth = 240
    const roomHeight = 200

    // Create kitchen room
    elements.push({
      id: Date.now() + Math.random(),
      type: 'room',
      x: baseX,
      y: baseY,
      width: roomWidth,
      height: roomHeight,
      layer: 1,
      color: '#ffffff',
      fill: 'transparent',
      roomType: 'kitchen',
    })

    // Add multiple windows
    elements.push({
      id: Date.now() + Math.random() + 1,
      type: 'window',
      x: baseX + 40,
      y: baseY - 5,
      width: 80,
      height: 10,
      layer: 2,
      color: '#3b82f6',
    })

    elements.push({
      id: Date.now() + Math.random() + 2,
      type: 'window',
      x: baseX + 140,
      y: baseY - 5,
      width: 80,
      height: 10,
      layer: 2,
      color: '#3b82f6',
    })
  } else if (promptLower.includes('garage')) {
    const garageWidth = 300
    const garageHeight = 240

    elements.push({
      id: Date.now() + Math.random(),
      type: 'room',
      x: baseX,
      y: baseY,
      width: garageWidth,
      height: garageHeight,
      layer: 1,
      color: '#ffffff',
      fill: 'transparent',
      roomType: 'garage',
    })

    // Add garage door (wider)
    elements.push({
      id: Date.now() + Math.random() + 1,
      type: 'door',
      x: baseX + 50,
      y: baseY + garageHeight - 10,
      width: 200,
      height: 20,
      layer: 2,
      color: '#947d61',
      doorType: 'garage',
    })
  } else {
    // Default: add a generic room
    elements.push({
      id: Date.now() + Math.random(),
      type: 'room',
      x: baseX,
      y: baseY,
      width: 160,
      height: 140,
      layer: 1,
      color: '#ffffff',
      fill: 'transparent',
    })
  }

  // Add timestamps
  elements.forEach((el) => {
    el.createdAt = new Date().toISOString()
    el.updatedAt = new Date().toISOString()
  })

  return elements
}
