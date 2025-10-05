// File: server/services/geminiService.js
import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import sharp from 'sharp'
dotenv.config({ quiet: true })

const GEMINI_API_KEY = process.env.GEMINI_API_KEY
const GEMINI_MODEL = 'gemini-2.5-flash-image'
const USE_MOCK = process.env.USE_MOCK_GEMINI === 'true'

let genAI = null
let model = null

const initializeGemini = () => {
  if (!genAI && GEMINI_API_KEY && !USE_MOCK) {
    genAI = new GoogleGenerativeAI(GEMINI_API_KEY)
    model = genAI.getGenerativeModel({ model: GEMINI_MODEL })
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
 * @param {string} aspectRatio - Aspect ratio (e.g., '16:9')
 * @param {number} baseWidth - Base width to calculate from
 */
const calculateDimensions = (aspectRatio, baseWidth = 1024) => {
  const { width: widthRatio, height: heightRatio } =
    parseAspectRatio(aspectRatio)
  const height = Math.round((baseWidth * heightRatio) / widthRatio)
  return { width: baseWidth, height }
}

/**
 * Crop and resize image to exact aspect ratio using Sharp
 * @param {Buffer} imageBuffer - Image buffer
 * @param {string} aspectRatio - Target aspect ratio
 */
const enforceAspectRatio = async (imageBuffer, aspectRatio) => {
  try {
    const { width: targetWidth, height: targetHeight } = calculateDimensions(
      aspectRatio,
      1024
    )

    // Get image metadata
    const metadata = await sharp(imageBuffer).metadata()
    const { width: imgWidth, height: imgHeight } = metadata

    // Calculate current aspect ratio
    const currentRatio = imgWidth / imgHeight
    const targetRatio = targetWidth / targetHeight

    console.log(
      `Current: ${imgWidth}x${imgHeight} (${currentRatio.toFixed(
        2
      )}), Target: ${targetWidth}x${targetHeight} (${targetRatio.toFixed(2)})`
    )

    // If aspect ratios match (within tolerance), just resize
    if (Math.abs(currentRatio - targetRatio) < 0.01) {
      return await sharp(imageBuffer)
        .resize(targetWidth, targetHeight, {
          fit: 'fill',
          withoutEnlargement: false,
        })
        .png()
        .toBuffer()
    }

    // Calculate crop dimensions to match target ratio
    let cropWidth, cropHeight

    if (currentRatio > targetRatio) {
      // Image is too wide - crop width
      cropHeight = imgHeight
      cropWidth = Math.round(cropHeight * targetRatio)
    } else {
      // Image is too tall - crop height
      cropWidth = imgWidth
      cropHeight = Math.round(cropWidth / targetRatio)
    }

    // Center crop and resize
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
 * @param {string} prompt - Text prompt describing the desired image
 * @param {Array} referenceImages - Optional array of base64 encoded images
 * @param {string} aspectRatio - Aspect ratio (e.g., '16:9', '1:1', '4:3')
 * @returns {Promise<Object>} Generated image data with exact aspect ratio
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

    // Build enhanced prompt with aspect ratio guidance
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

    const result = await model.generateContent({
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
        // Convert base64 to buffer
        const imageBuffer = Buffer.from(part.inlineData.data, 'base64')

        // Enforce exact aspect ratio using Sharp
        const croppedBuffer = await enforceAspectRatio(imageBuffer, aspectRatio)

        // Convert back to base64
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
 * Edit an existing image using Gemini's targeted transformation
 * @param {string} prompt - Edit instruction
 * @param {string} imageData - Base64 encoded image to edit
 * @param {string} mimeType - Image MIME type
 * @param {string} aspectRatio - Aspect ratio for the edited image
 * @returns {Promise<Object>} Edited image data with exact aspect ratio
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
 * Regenerate specific images with variations
 * @param {Array} imageIndices - Indices of images to regenerate
 * @param {string} basePrompt - Base prompt for regeneration
 * @param {string} customPrompt - Additional custom requirements
 * @param {string} aspectRatio - Aspect ratio for regenerated images
 * @returns {Promise<Array>} Array of regenerated images with exact aspect ratio
 */
export const regenerateImages = async (
  imageIndices,
  basePrompt,
  customPrompt = '',
  aspectRatio = '1:1'
) => {
  try {
    const regeneratedImages = []

    for (const index of imageIndices) {
      const variationPrompt = customPrompt
        ? `${basePrompt}. Additional: ${customPrompt}. Create variation ${
            index + 1
          }.`
        : `${basePrompt}. Create variation ${index + 1}.`

      const result = await generateImage(variationPrompt, [], aspectRatio)
      regeneratedImages.push({ index, ...result.images[0] })
    }

    return regeneratedImages
  } catch (error) {
    console.error('Image regeneration error:', error.message)
    throw error
  }
}

/**
 * Build an enhanced moodboard prompt based on user preferences
 * @param {Object} options - Moodboard generation options
 * @returns {string} Enhanced prompt
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
    prompt += `. Use a color palette featuring ${colorPalette.join(', ')}`
  }

  if (layout === 'single') {
    prompt +=
      ', presented as a single comprehensive interior design visualization'
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
