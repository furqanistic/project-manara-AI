// File: server/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import sharp from 'sharp'
dotenv.config({ quiet: true })

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_IMAGE_MODEL = 'gemini-2.5-flash-image'
const GEMINI_TEXT_MODEL = 'gemini-2.0-flash-exp'
const USE_MOCK = process.env.USE_MOCK_GEMINI === 'true'

let genAI = null
let imageModel = null
let textModel = null

const initializeGemini = () => {
  if (!genAI && GEMINI_API_KEY && !USE_MOCK) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    imageModel = genAI.getGenerativeModel({ model: GEMINI_IMAGE_MODEL })
    textModel = genAI.getGenerativeModel({ model: GEMINI_TEXT_MODEL })
  }
}

/**
 * Parse aspect ratio string to width and height ratio
 */
const parseAspectRatio = (aspectRatio) => {
  const [width, height] = aspectRatio.split(':').map(Number)
  return { width, height }
}

/**
 * Calculate exact dimensions for a given aspect ratio
 */
const calculateDimensions = (aspectRatio, baseWidth = 1024) => {
  const { width: widthRatio, height: heightRatio } =
    parseAspectRatio(aspectRatio)
  const height = Math.round((baseWidth * heightRatio) / widthRatio)
  return { width: baseWidth, height }
}

/**
 * Crop and resize image to exact aspect ratio using Sharp
 */
const enforceAspectRatio = async (imageBuffer, aspectRatio) => {
  try {
    const { width: targetWidth, height: targetHeight } = calculateDimensions(
      aspectRatio,
      1024
    )

    const metadata = await sharp(imageBuffer).metadata()
    const { width: imgWidth, height: imgHeight } = metadata

    const currentRatio = imgWidth / imgHeight
    const targetRatio = targetWidth / targetHeight

    console.log(
      `Current: ${imgWidth}x${imgHeight} (${currentRatio.toFixed(
        2
      )}), Target: ${targetWidth}x${targetHeight} (${targetRatio.toFixed(2)})`
    )

    if (Math.abs(currentRatio - targetRatio) < 0.01) {
      return await sharp(imageBuffer)
        .resize(targetWidth, targetHeight, {
          fit: 'fill',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer()
    }

    let cropWidth, cropHeight

    if (currentRatio > targetRatio) {
      cropHeight = imgHeight
      cropWidth = Math.round(cropHeight * targetRatio)
    } else {
      cropWidth = imgWidth
      cropHeight = Math.round(cropWidth / targetRatio)
    }

    const result = await sharp(imageBuffer)
      .extract({
        left: Math.round((imgWidth - cropWidth) / 2),
        top: Math.round((imgHeight - cropHeight) / 2),
        width: cropWidth,
        height: cropHeight,
      })
      .resize(targetWidth, targetHeight, {
        fit: 'fill',
        withoutEnlargement: false,
      })
      .png()
      .toBuffer()

    console.log(
      `Enforced aspect ratio: ${aspectRatio} (${targetWidth}x${targetHeight})`
    )
    return result
  } catch (error) {
    console.error('Error enforcing aspect ratio:', error)
    throw error
  }
}

/**
 * Generate images using Gemini 2.5 Flash Image with exact aspect ratio enforcement
 */
export const generateImage = async (
  prompt,
  referenceImages = [],
  aspectRatio = '1:1'
) => {
  try {
    if (USE_MOCK) {
      console.log('Using mock Gemini response')
      const mockImageBase64 = generateMockImage(prompt, aspectRatio)
      return {
        images: [
          {
            data: mockImageBase64,
            mimeType: 'image/png',
          },
        ],
        text: `Mock moodboard generated for: ${prompt}`,
      }
    }

    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not defined in environment variables')
    }

    initializeGemini()

    const { width: targetWidth, height: targetHeight } = calculateDimensions(
      aspectRatio,
      1024
    )

    const enhancedPrompt = `Generate an interior design moodboard image with ${aspectRatio} aspect ratio (${targetWidth}x${targetHeight} pixels). ${prompt}. Ensure the composition fills the entire frame and is optimized for this specific aspect ratio.`

    const parts = [{ text: enhancedPrompt }]

    if (referenceImages && referenceImages.length > 0) {
      referenceImages.forEach((imageData) => {
        parts.push({
          inlineData: {
            mimeType: imageData.mimeType || 'image/png',
            data: imageData.data,
          },
        })
      })
    }

    console.log(
      `Generating with Gemini 2.5 Flash Image (target: ${aspectRatio} - ${targetWidth}x${targetHeight})...`
    )

    const generationConfig = {
      temperature: 1,
      topP: 0.95,
      topK: 64,
      maxOutputTokens: 8192,
      responseModalities: ['IMAGE'],
    }

    const systemInstruction = `Generate high-quality interior design images. Maintain the ${aspectRatio} aspect ratio strictly. The output should be photorealistic with professional composition.`

    const result = await imageModel.generateContent({
      contents: [
        {
          role: 'user',
          parts,
        },
      ],
      generationConfig,
      systemInstruction,
    })

    const response = result.response
    const images = []
    let text = null

    const candidates = response.candidates || []
    if (candidates.length === 0) {
      throw new Error('No candidates returned from Gemini API')
    }

    const candidate = candidates[0]
    const contentParts = candidate.content?.parts || []

    for (const part of contentParts) {
      if (part.text) {
        text = part.text
      } else if (part.inlineData) {
        const imageBuffer = Buffer.from(part.inlineData.data, 'base64')
        const croppedBuffer = await enforceAspectRatio(imageBuffer, aspectRatio)
        const croppedBase64 = croppedBuffer.toString('base64')

        images.push({
          data: croppedBase64,
          mimeType: 'image/png',
        })
      }
    }

    if (images.length === 0) {
      throw new Error('No image generated by Gemini')
    }

    console.log(
      `Successfully generated ${images.length} image(s) with exact ${aspectRatio} aspect ratio`
    )

    return { images, text }
  } catch (error) {
    console.error('Gemini API Error:', error)

    if (error.message?.includes('quota')) {
      throw new Error(
        'Gemini API quota exceeded. Please enable billing at https://aistudio.google.com/ or set USE_MOCK_GEMINI=true in .env for testing.'
      )
    }

    if (error.message?.includes('API key')) {
      throw new Error(
        'Invalid Gemini API key. Please check your GEMINI_API_KEY in .env file.'
      )
    }

    throw new Error(`Failed to generate image: ${error.message}`)
  }
}

/**
 * Generate mood and feeling descriptions for a moodboard
 */
export const generateMoodDescription = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return getMockMoodDescription(style, roomType)
    }

    if (!GEMINI_API_KEY) {
      return getMockMoodDescription(style, roomType)
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const moodPrompt = `As an interior design expert, analyze this design concept and provide:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Please provide a JSON response with:
1. "mood" - Single descriptive word for the overall atmosphere (e.g., "Serene", "Energetic", "Sophisticated")
2. "feeling" - Brief phrase about the emotional experience (e.g., "Calm and Refreshing", "Bold and Dynamic")
3. "description" - 2-3 sentences describing the design aesthetic and its impact
4. "keywords" - Array of 4-5 descriptive keywords

Format: { "mood": "...", "feeling": "...", "description": "...", "keywords": ["..."] }`

    const result = await textModel.generateContent(moodPrompt)
    const response = result.response
    const text = response.text()

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const moodData = JSON.parse(jsonMatch[0])
      return {
        mood: moodData.mood || 'Harmonious',
        feeling: moodData.feeling || 'Comfortable and Inviting',
        description:
          moodData.description ||
          'A thoughtfully designed space that balances aesthetics with functionality.',
        keywords: moodData.keywords || [
          'Modern',
          'Elegant',
          'Refined',
          'Timeless',
        ],
      }
    }

    return getMockMoodDescription(style, roomType)
  } catch (error) {
    console.error('Error generating mood description:', error)
    return getMockMoodDescription(style, roomType)
  }
}

/**
 * Mock mood description for fallback
 */
const getMockMoodDescription = (style, roomType) => {
  const moodMap = {
    modern: { mood: 'Sleek', feeling: 'Clean and Contemporary' },
    minimalist: { mood: 'Serene', feeling: 'Calm and Focused' },
    scandinavian: { mood: 'Cozy', feeling: 'Warm and Inviting' },
    industrial: { mood: 'Bold', feeling: 'Raw and Authentic' },
    bohemian: { mood: 'Eclectic', feeling: 'Free-spirited and Artistic' },
    traditional: { mood: 'Elegant', feeling: 'Timeless and Refined' },
    contemporary: { mood: 'Sophisticated', feeling: 'Polished and Current' },
    rustic: { mood: 'Natural', feeling: 'Grounded and Organic' },
    luxury: { mood: 'Opulent', feeling: 'Sumptuous and Prestigious' },
  }

  const moodInfo = moodMap[style] || {
    mood: 'Harmonious',
    feeling: 'Balanced and Comfortable',
  }

  return {
    ...moodInfo,
    description: `This ${style} ${
      roomType?.replace(/_/g, ' ') || 'space'
    } creates an inviting atmosphere through thoughtful design choices and cohesive color harmony.`,
    keywords: [
      style.charAt(0).toUpperCase() + style.slice(1),
      'Refined',
      'Balanced',
      'Intentional',
    ],
  }
}

/**
 * Generate a mock image for testing with exact aspect ratio
 */
const generateMockImage = (prompt, aspectRatio = '1:1') => {
  const { width, height } = calculateDimensions(aspectRatio, 1200)

  const safePrompt = prompt
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .substring(0, 60)

  const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#947d61;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#a68970;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="${width}" height="${height}" fill="url(#grad)"/>
  
  <rect x="50" y="50" width="${Math.round(width / 3.5)}" height="${Math.round(
    height / 2.5
  )}" fill="rgba(255,255,255,0.1)" rx="10"/>
  <rect x="${Math.round(width / 2.5)}" y="50" width="${Math.round(
    width / 3.5
  )}" height="${Math.round(
    height / 2.5
  )}" fill="rgba(255,255,255,0.1)" rx="10"/>
  
  <text x="${
    width / 2
  }" y="100" font-family="Arial, sans-serif" font-size="32" font-weight="bold" fill="white" text-anchor="middle">
    MOCK MOODBOARD (${aspectRatio})
  </text>
  
  <text x="${
    width / 2
  }" y="150" font-family="Arial, sans-serif" font-size="18" fill="rgba(255,255,255,0.9)" text-anchor="middle">
    ${width}x${height} - Enable billing for real AI generation
  </text>
  
  <text x="${width / 2}" y="${
    height - 50
  }" font-family="Arial, sans-serif" font-size="16" fill="rgba(255,255,255,0.7)" text-anchor="middle">
    ${safePrompt}...
  </text>
</svg>`

  return Buffer.from(svg).toString('base64')
}

/**
 * Edit an existing image
 */
export const editImage = async (
  prompt,
  imageData,
  mimeType = 'image/png',
  aspectRatio = '1:1'
) => {
  try {
    const editPrompt = `Apply the following targeted transformation to this image: ${prompt}. Maintain the composition and ${aspectRatio} aspect ratio while making only the requested changes.`

    return await generateImage(
      editPrompt,
      [{ data: imageData, mimeType }],
      aspectRatio
    )
  } catch (error) {
    console.error('Image editing error:', error.message)
    throw error
  }
}

/**
 * Generate comprehensive design narrative
 */
export const generateDesignNarrative = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return getMockDesignNarrative(style, roomType)
    }

    if (!GEMINI_API_KEY) {
      return getMockDesignNarrative(style, roomType)
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const narrativePrompt = `As an interior design expert, create a comprehensive design narrative for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Please provide a JSON response with:
1. "narrative" - 1-2 compelling sentences describing the overall design concept and approach (150-250 characters)
2. "vibe" - The emotional atmosphere this design creates (20-40 words)
3. "lifestyle" - How this design serves the client's lifestyle (20-40 words)

Format: { "narrative": "...", "vibe": "...", "lifestyle": "..." }`

    const result = await textModel.generateContent(narrativePrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const narrativeData = JSON.parse(jsonMatch[0])
      return {
        narrative: narrativeData.narrative || '',
        vibe: narrativeData.vibe || '',
        lifestyle: narrativeData.lifestyle || '',
      }
    }

    return getMockDesignNarrative(style, roomType)
  } catch (error) {
    console.error('Error generating design narrative:', error)
    return getMockDesignNarrative(style, roomType)
  }
}

/**
 * Generate materials specifications
 */
export const generateMaterials = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return normalizeMaterialsData(getMockMaterials(style, roomType))
    }

    if (!GEMINI_API_KEY) {
      return normalizeMaterialsData(getMockMaterials(style, roomType))
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const materialsPrompt = `As an interior design expert, specify materials for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Provide a JSON response with material specifications for:
1. "floors" - 1-2 flooring options (type, finish, color, texture, maintenance, source)
2. "walls" - 1-2 wall finish options (type, finish, color, texture, maintenance, source)
3. "tiles" - 1-2 tile options if applicable (type, finish, color, texture, maintenance, source)
4. "fabrics" - 2-3 fabric swatches (type, color, texture, maintenance, source)
5. "metals" - 1-2 metal finishes (type, finish, notes)
6. "woods" - 1-2 wood finishes (type, finish, color, texture, notes)

IMPORTANT: For maintenance field, use ONLY lowercase values: "low", "medium", or "high" (no other text)

Format: { "floors": [...], "walls": [...], "tiles": [...], "fabrics": [...], "metals": [...], "woods": [...] }`

    const result = await textModel.generateContent(materialsPrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const materialsData = JSON.parse(jsonMatch[0])
      return normalizeMaterialsData(materialsData)
    }

    return normalizeMaterialsData(getMockMaterials(style, roomType))
  } catch (error) {
    console.error('Error generating materials:', error)
    return normalizeMaterialsData(getMockMaterials(style, roomType))
  }
}

/**
 * Generate furniture specifications
 */
export const generateFurniture = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return getMockFurniture(style, roomType)
    }

    if (!GEMINI_API_KEY) {
      return getMockFurniture(style, roomType)
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const furniturePrompt = `As an interior design expert, specify furniture for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Provide a JSON response with:
1. "heroPieces" - 3-5 must-have furniture pieces with:
   - name (required)
   - category (seating/tables/storage/beds/lighting/decor/other)
   - dimensions (length, width, height in cm)
   - scaleNotes (how it fits the space)
   - source (where to buy/brand)
   - brand
   - placement (where in room)
   - isHero: true

2. "alternates" - 1-2 alternative options per category with same structure, isHero: false

Format: { "heroPieces": [...], "alternates": [...] }`

    const result = await textModel.generateContent(furniturePrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getMockFurniture(style, roomType)
  } catch (error) {
    console.error('Error generating furniture:', error)
    return getMockFurniture(style, roomType)
  }
}

/**
 * Generate lighting concept
 */
export const generateLightingConcept = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return getMockLighting(style, roomType)
    }

    if (!GEMINI_API_KEY) {
      return getMockLighting(style, roomType)
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const lightingPrompt = `As an interior design expert, create a lighting concept for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Provide a JSON response with:
1. "ambient" - 1-2 ambient lighting fixtures (name, type, placement, kelvin, lumens, notes, source)
2. "task" - 1-2 task lighting fixtures (same structure)
3. "accent" - 1-2 accent lighting fixtures (same structure)
4. "dayMood" - {description: how space feels during day, lightingNotes: natural light strategy}
5. "nightMood" - {description: how space feels at night, lightingNotes: artificial lighting strategy}

Types: pendant, chandelier, recessed, wall_sconce, floor_lamp, table_lamp, track, strip, other
Kelvin range: 2700K (warm) to 5000K (cool)

Format: { "ambient": [...], "task": [...], "accent": [...], "dayMood": {...}, "nightMood": {...} }`

    const result = await textModel.generateContent(lightingPrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getMockLighting(style, roomType)
  } catch (error) {
    console.error('Error generating lighting:', error)
    return getMockLighting(style, roomType)
  }
}

/**
 * Generate zones/layout diagram
 */
export const generateZones = async ({ style, roomType, prompt }) => {
  try {
    if (USE_MOCK) {
      return getMockZones(roomType)
    }

    if (!GEMINI_API_KEY) {
      return getMockZones(roomType)
    }

    initializeGemini()

    const zonesPrompt = `As an interior design expert, define functional zones for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Design Brief: ${prompt}

Provide a JSON response with 2-4 zones, each with:
- name (required, e.g., "Seating Area", "Dining Zone")
- purpose (what happens here)
- focalPoint (visual anchor)
- flowDirection (how people move through)

Format: [{ "name": "...", "purpose": "...", "focalPoint": "...", "flowDirection": "..." }, ...]`

    const result = await textModel.generateContent(zonesPrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getMockZones(roomType)
  } catch (error) {
    console.error('Error generating zones:', error)
    return getMockZones(roomType)
  }
}

/**
 * Generate variant options (A/B alternatives)
 */
export const generateVariants = async ({
  style,
  roomType,
  colorPalette,
  prompt,
}) => {
  try {
    if (USE_MOCK) {
      return getMockVariants(style)
    }

    if (!GEMINI_API_KEY) {
      return getMockVariants(style)
    }

    initializeGemini()

    const colorNames = colorPalette.map((c) => c.name).join(', ')

    const variantsPrompt = `As an interior design expert, create 2 design variants for:

Design Details:
- Style: ${style}
- Room Type: ${roomType?.replace(/_/g, ' ')}
- Color Palette: ${colorNames}
- Design Brief: ${prompt}

Provide a JSON response with 2 variant options (e.g., "Option A: Warm Minimal" vs "Option B: Textured Minimal"):
Each variant should have:
- name (required, e.g., "Option A: Warm Minimal")
- description (how this variant differs)
- differences (array of 3-4 key differences)

Format: [{ "name": "...", "description": "...", "differences": ["...", "..."] }, ...]`

    const result = await textModel.generateContent(variantsPrompt)
    const response = result.response
    const text = response.text()

    const jsonMatch = text.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0])
    }

    return getMockVariants(style)
  } catch (error) {
    console.error('Error generating variants:', error)
    return getMockVariants(style)
  }
}

// Mock data functions for fallback
const getMockDesignNarrative = (style, roomType) => ({
  narrative: `This ${style} ${
    roomType?.replace(/_/g, ' ') || 'space'
  } embraces a thoughtful balance of form and function, creating an environment that feels both intentional and welcoming.`,
  vibe: `A refined atmosphere that combines ${style} aesthetics with comfortable, livable design elements that invite daily use.`,
  lifestyle: `Designed for modern living, this space supports both relaxation and productivity while maintaining a cohesive aesthetic that reflects personal style.`,
})

const getMockMaterials = (style, roomType) => ({
  floors: [
    {
      type: 'Engineered Hardwood',
      finish: 'Matte',
      color: 'Natural Oak',
      texture: 'Smooth with subtle grain',
      maintenance: 'medium',
      source: 'Local flooring supplier',
      notes: 'Durable and timeless',
    },
  ],
  walls: [
    {
      type: 'Paint',
      finish: 'Eggshell',
      color: 'Warm White',
      texture: 'Smooth',
      maintenance: 'low',
      source: 'Benjamin Moore',
      notes: 'Easy to maintain',
    },
  ],
  tiles: [
    {
      type: 'Ceramic',
      finish: 'Glazed',
      color: 'Neutral Gray',
      texture: 'Smooth',
      maintenance: 'low',
      source: 'Local tile shop',
      notes: 'Water-resistant',
    },
  ],
  fabrics: [
    {
      type: 'Linen',
      color: 'Natural',
      texture: 'Textured weave',
      maintenance: 'medium',
      source: 'Fabric store',
      notes: 'Breathable and elegant',
    },
    {
      type: 'Cotton',
      color: 'Soft Gray',
      texture: 'Smooth',
      maintenance: 'low',
      source: 'Fabric store',
      notes: 'Easy care',
    },
  ],
  metals: [
    {
      type: 'Brass',
      finish: 'Brushed',
      notes: 'Warm metallic accent',
    },
  ],
  woods: [
    {
      type: 'Walnut',
      finish: 'Natural',
      color: 'Rich brown',
      texture: 'Visible grain',
      notes: 'Adds warmth and depth',
    },
  ],
})

/**
 * Normalize materials data to ensure maintenance values are lowercase
 */
const normalizeMaterialsData = (materials) => {
  if (!materials) return materials

  const normalizeMaintenance = (item) => {
    if (item && item.maintenance) {
      // Extract just low/medium/high from strings like "High (washable)"
      const maintenanceValue = item.maintenance.toLowerCase().trim()
      if (maintenanceValue.includes('low')) {
        item.maintenance = 'low'
      } else if (maintenanceValue.includes('medium')) {
        item.maintenance = 'medium'
      } else if (maintenanceValue.includes('high')) {
        item.maintenance = 'high'
      } else {
        item.maintenance = 'medium' // default fallback
      }
    }
    return item
  }

  return {
    floors: materials.floors?.map(normalizeMaintenance) || [],
    walls: materials.walls?.map(normalizeMaintenance) || [],
    tiles: materials.tiles?.map(normalizeMaintenance) || [],
    fabrics: materials.fabrics?.map(normalizeMaintenance) || [],
    metals: materials.metals || [],
    woods: materials.woods || [],
  }
}

const getMockFurniture = (style, roomType) => ({
  heroPieces: [
    {
      name: 'Sectional Sofa',
      category: 'seating',
      dimensions: { length: 240, width: 160, height: 85, unit: 'cm' },
      scaleNotes: 'Anchors the space, proportional to room size',
      source: 'West Elm',
      brand: 'West Elm',
      placement: 'Against main wall',
      isHero: true,
    },
    {
      name: 'Coffee Table',
      category: 'tables',
      dimensions: { length: 120, width: 60, height: 45, unit: 'cm' },
      scaleNotes: 'Centered in seating area',
      source: 'CB2',
      brand: 'CB2',
      placement: 'Center of seating zone',
      isHero: true,
    },
    {
      name: 'Statement Floor Lamp',
      category: 'lighting',
      dimensions: { length: 40, width: 40, height: 165, unit: 'cm' },
      scaleNotes: 'Provides ambient lighting',
      source: 'Lumens',
      brand: 'Lumens',
      placement: 'Corner accent',
      isHero: true,
    },
  ],
  alternates: [
    {
      name: 'Modular Sofa',
      category: 'seating',
      dimensions: { length: 220, width: 150, height: 80, unit: 'cm' },
      scaleNotes: 'Alternative configuration',
      source: 'Article',
      brand: 'Article',
      placement: 'Against main wall',
      isHero: false,
    },
  ],
})

const getMockLighting = (style, roomType) => ({
  ambient: [
    {
      name: 'Recessed LED Ceiling Lights',
      type: 'recessed',
      placement: 'Evenly spaced ceiling',
      kelvin: 3000,
      lumens: 800,
      notes: 'Dimmable for mood control',
      source: 'Philips Hue',
    },
  ],
  task: [
    {
      name: 'Reading Floor Lamp',
      type: 'floor_lamp',
      placement: 'Next to seating',
      kelvin: 3500,
      lumens: 600,
      notes: 'Adjustable arm',
      source: 'Lamps Plus',
    },
  ],
  accent: [
    {
      name: 'LED Strip Lighting',
      type: 'strip',
      placement: 'Under shelving',
      kelvin: 2700,
      lumens: 400,
      notes: 'Creates ambient glow',
      source: 'Govee',
    },
  ],
  dayMood: {
    description: 'Bright and airy with natural light flooding the space',
    lightingNotes:
      'Maximize natural light through windows, use sheer curtains to diffuse harsh sunlight',
  },
  nightMood: {
    description: 'Warm and intimate with layered lighting',
    lightingNotes:
      'Combine ambient ceiling lights (dimmed to 50%), task lighting for functionality, and accent lighting for atmosphere',
  },
})

const getMockZones = (roomType) => {
  const zoneMap = {
    living_room: [
      {
        name: 'Seating Area',
        purpose: 'Conversation and relaxation',
        focalPoint: 'Fireplace or TV',
        flowDirection: 'Open circulation around furniture',
      },
      {
        name: 'Reading Nook',
        purpose: 'Quiet retreat',
        focalPoint: 'Window view',
        flowDirection: 'Semi-private corner',
      },
    ],
    bedroom: [
      {
        name: 'Sleeping Zone',
        purpose: 'Rest and sleep',
        focalPoint: 'Bed as centerpiece',
        flowDirection: 'Clear path to bed',
      },
      {
        name: 'Dressing Area',
        purpose: 'Getting ready',
        focalPoint: 'Wardrobe or closet',
        flowDirection: 'Access to storage',
      },
    ],
    kitchen: [
      {
        name: 'Cooking Zone',
        purpose: 'Food preparation',
        focalPoint: 'Stove and countertop',
        flowDirection: 'Work triangle flow',
      },
      {
        name: 'Dining Area',
        purpose: 'Meals and gathering',
        focalPoint: 'Dining table',
        flowDirection: 'Easy access from kitchen',
      },
    ],
  }

  return (
    zoneMap[roomType] || [
      {
        name: 'Main Area',
        purpose: 'Primary function',
        focalPoint: 'Central feature',
        flowDirection: 'Natural circulation',
      },
    ]
  )
}

const getMockVariants = (style) => [
  {
    name: `Option A: Warm ${
      style.charAt(0).toUpperCase() + style.slice(1)
    }`,
    description: 'Emphasizes warmth through wood tones and soft textures',
    differences: [
      'Warmer color temperature (3000K lighting)',
      'Natural wood finishes',
      'Textured fabrics (linen, wool)',
      'Earthy accent colors',
    ],
  },
  {
    name: `Option B: Cool ${
      style.charAt(0).toUpperCase() + style.slice(1)
    }`,
    description: 'Focuses on clean lines and cooler tones',
    differences: [
      'Cooler color temperature (4000K lighting)',
      'Metal and glass accents',
      'Smooth, sleek fabrics',
      'Neutral to cool accent colors',
    ],
  },
]

/**
 * Build an enhanced moodboard prompt
 */
export const buildMoodboardPrompt = ({
  style,
  roomType,
  colorPalette,
  customPrompt,
  layout,
  aspectRatio,
}) => {
  let prompt = ''

  if (style && style !== 'custom') {
    prompt += `Create a ${style} style interior design moodboard`
  } else {
    prompt += 'Create an interior design moodboard'
  }

  if (roomType) {
    const formattedRoomType = roomType.replace(/_/g, ' ')
    prompt += ` for a ${formattedRoomType}`
  }

  if (colorPalette && colorPalette.length > 0) {
    // Handle both string arrays and color object arrays
    const colors =
      Array.isArray(colorPalette) &&
      typeof colorPalette[0] === 'object' &&
      colorPalette[0]?.name
        ? colorPalette.map((c) => c.name).join(', ')
        : colorPalette.join(', ')
    prompt += `. Use a color palette featuring ${colors}`
  }

  if (layout === 'single') {
    prompt +=
      ', presented as a single comprehensive interior design visualization'
  } else if (layout === 'grid') {
    prompt += ', with clean professional composition'
  } else if (layout === 'collage') {
    prompt += ', with artistic and dynamic composition'
  }

  if (aspectRatio && aspectRatio !== '1:1') {
    const { width, height } = parseAspectRatio(aspectRatio)
    if (width > height) {
      prompt += `. Compose the scene in a ${aspectRatio} landscape format, utilizing the horizontal space for a panoramic view`
    } else if (height > width) {
      prompt += `. Compose the scene in a ${aspectRatio} portrait format, emphasizing vertical elements and height`
    }
  }

  if (customPrompt) {
    prompt += `. ${customPrompt}`
  }

  prompt += `. Professional interior design photography with high-quality materials, realistic textures, proper lighting, and attention to architectural details. Photorealistic rendering with depth and atmosphere.`

  return prompt.trim()
}
