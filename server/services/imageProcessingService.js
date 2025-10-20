// File: server/services/imageProcessingService.js
import cv from '@techstark/opencv-js'
import sharp from 'sharp'

export const processFloorPlanImage = async (imageBuffer, mimeType) => {
  try {
    // Convert to consistent format
    const processedImage = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .toBuffer()

    // Basic edge detection to find walls
    const elements = await detectFloorPlanElements(processedImage)

    return elements
  } catch (error) {
    console.error('Image processing error:', error)

    // Return basic elements as fallback
    return [
      {
        id: Date.now() + Math.random(),
        type: 'room',
        x: 100,
        y: 100,
        width: 400,
        height: 300,
        layer: 1,
        color: '#ffffff',
        fill: 'transparent',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ]
  }
}

const detectFloorPlanElements = async (imageBuffer) => {
  // This would use OpenCV or similar for actual detection
  // For now, return placeholder elements
  const elements = []

  // Simulate detected walls
  elements.push(
    {
      id: Date.now() + Math.random(),
      type: 'wall',
      startX: 100,
      startY: 100,
      endX: 500,
      endY: 100,
      thickness: 10,
      layer: 1,
      color: '#ffffff',
    },
    {
      id: Date.now() + Math.random() + 1,
      type: 'wall',
      startX: 100,
      startY: 100,
      endX: 100,
      endY: 400,
      thickness: 10,
      layer: 1,
      color: '#ffffff',
    }
  )

  return elements
}

// ========================================

// File: server/services/dxfParser.js
export const parseDXF = async (dxfContent) => {
  const elements = []
  const lines = dxfContent.split('\n')
  let i = 0

  while (i < lines.length) {
    const line = lines[i].trim()

    if (line === 'LINE') {
      // Parse LINE entity
      const element = {
        id: Date.now() + Math.random(),
        type: 'wall',
        layer: 1,
        color: '#ffffff',
        thickness: 10,
      }

      i++
      while (i < lines.length && lines[i].trim() !== '0') {
        const code = parseInt(lines[i].trim())
        const value = lines[i + 1]?.trim()

        switch (code) {
          case 10:
            element.startX = parseFloat(value)
            break
          case 20:
            element.startY = parseFloat(value)
            break
          case 11:
            element.endX = parseFloat(value)
            break
          case 21:
            element.endY = parseFloat(value)
            break
        }
        i += 2
      }

      if (element.startX !== undefined && element.endX !== undefined) {
        elements.push(element)
      }
    } else if (line === 'LWPOLYLINE') {
      // Parse POLYLINE as room
      const element = {
        id: Date.now() + Math.random(),
        type: 'room',
        layer: 1,
        color: '#ffffff',
        fill: 'transparent',
      }

      let vertices = []
      i++
      while (i < lines.length && lines[i].trim() !== '0') {
        const code = parseInt(lines[i].trim())
        const value = lines[i + 1]?.trim()

        if (code === 10) {
          vertices.push({ x: parseFloat(value) })
        } else if (code === 20) {
          vertices[vertices.length - 1].y = parseFloat(value)
        }
        i += 2
      }

      if (vertices.length >= 4) {
        // Calculate bounding box
        const xs = vertices.map((v) => v.x)
        const ys = vertices.map((v) => v.y)
        element.x = Math.min(...xs)
        element.y = Math.min(...ys)
        element.width = Math.max(...xs) - element.x
        element.height = Math.max(...ys) - element.y
        elements.push(element)
      }
    } else {
      i++
    }
  }

  // Add timestamps
  elements.forEach((el) => {
    el.createdAt = new Date().toISOString()
    el.updatedAt = new Date().toISOString()
  })

  return elements
}
