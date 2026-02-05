// File: project-manara-AI/server/controllers/moodboard.js
import mongoose from 'mongoose'
import { createError } from '../error.js'
import Moodboard from '../models/Moodboard.js'
import { deleteAsset, uploadImage } from '../services/cloudinaryService.js'
import { extractColorPalette } from '../services/colorExtractor.js'
import {
    buildMoodboardPrompt,
    editImage,
    generateDesignNarrative,
    generateFurniture,
    generateImage,
    generateLightingConcept,
    generateMaterials,
    generateMoodDescription,
    generateVariants,
    generateZones,
} from '../services/geminiService.js'
import {
    createCompositeMoodboard,
    getImageRegions,
} from '../services/imageCompositor.js'

// ============================================================================
// TIMEOUT WRAPPER - Prevent hanging requests
// ============================================================================

const withTimeout = (promise, timeoutMs = 120000, label = 'Operation') => {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => {
        const error = new Error(
          `${label} timed out after ${
            timeoutMs / 1000
          }s. Gemini API may be slow or quota exhausted.`
        )
        error.statusCode = 504
        reject(error)
      }, timeoutMs)
    ),
  ])
}

// ============================================================================
// PROGRESS TRACKING - SSE Management
// ============================================================================

const activeProgressStreams = new Map()

const broadcastProgress = (moodboardId, currentSteps) => {
  if (!activeProgressStreams.has(moodboardId)) return

  const clients = activeProgressStreams.get(moodboardId)
  const data = JSON.stringify({
    currentSteps,
    timestamp: new Date().toISOString(),
  })

  clients.forEach((client) => {
    try {
      client.write(`event: progress\n`)
      client.write(`data: ${data}\n\n`)
    } catch (error) {
      console.error('Error sending progress update:', error)
    }
  })
}

const broadcastComplete = (moodboardId) => {
  if (!activeProgressStreams.has(moodboardId)) return

  const clients = activeProgressStreams.get(moodboardId)
  clients.forEach((client) => {
    try {
      client.write(`event: complete\n`)
      client.write(`data: {}\n\n`)
    } catch (error) {
      console.error('Error sending completion event:', error)
    }
  })

  activeProgressStreams.delete(moodboardId)
}

// ============================================================================
// PROGRESS STREAM ENDPOINT
// ============================================================================

export const getMoodboardProgressStream = async (req, res, next) => {
  try {
    const { id } = req.params

    const moodboard = await Moodboard.findById(id)
    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only access your own moodboard progress')
      )
    }

    res.setHeader('Content-Type', 'text/event-stream')
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('Connection', 'keep-alive')

    if (!activeProgressStreams.has(id)) {
      activeProgressStreams.set(id, [])
    }

    activeProgressStreams.get(id).push(res)
    res.write(`:connected\n\n`)

    req.on('close', () => {
      const clients = activeProgressStreams.get(id)
      if (clients) {
        const index = clients.indexOf(res)
        if (index > -1) {
          clients.splice(index, 1)
        }
        if (clients.length === 0) {
          activeProgressStreams.delete(id)
        }
      }
      res.end()
    })
  } catch (error) {
    console.error('Error setting up progress stream:', error)
    next(error)
  }
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const parseAspectRatio = (aspectRatio) => {
  const [width, height] = aspectRatio.split(':').map(Number)
  return { width, height }
}

const buildColorPalettePrompt = (colors) => {
  if (!colors || colors.length === 0) return ''
  return `Color palette (must use these exact colors): ${colors.join(
    ', '
  )}. Incorporate these colors prominently in the design.`
}

// ============================================================================
// CREATE MOODBOARD
// ============================================================================

export const createMoodboard = async (req, res, next) => {
  let session = null

  try {
    console.log('📝 Creating moodboard...')
    session = await mongoose.startSession()
    session.startTransaction()

    const {
      title,
      prompt,
      style,
      roomType,
      colorPalette,
      colorPreferences,
      notes,
      projectId,
      customPrompt,
      layout,
      imageCount,
      aspectRatio,
      paletteColors,
    } = req.body

    if (!title) {
      if (session) await session.abortTransaction()
      return next(createError(400, 'Moodboard title is required'))
    }

    if (!req.user || !req.user._id) {
      if (session) await session.abortTransaction()
      return next(createError(401, 'User not authenticated'))
    }

    const moodboardData = {
      userId: req.user._id,
      title: title.trim(),
      prompt: customPrompt || prompt || '',
      style: style || 'modern',
      roomType,
      colorPreferences: colorPreferences || colorPalette || [],
      paletteColors: paletteColors || [],
      colorPalette: [],
      notes,
      projectId,
      status: 'draft',
      layout: 'collage',
      imageCount: 1,
      aspectRatio: aspectRatio || '16:9',
    }

    const [newMoodboard] = await Moodboard.create([moodboardData], { session })

    await session.commitTransaction()

    console.log('✅ Moodboard created:', newMoodboard._id)

    res.status(201).json({
      status: 'success',
      data: {
        moodboard: newMoodboard,
      },
    })
  } catch (error) {
    if (session) {
      await session.abortTransaction()
    }
    console.error('Error creating moodboard:', error)
    next(createError(500, error.message || 'Failed to create moodboard'))
  } finally {
    if (session) {
      session.endSession()
    }
  }
}

// ============================================================================
// GENERATE MOODBOARD IMAGES
// ============================================================================

export const generateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const {
      customPrompt,
      referenceImages,
      imageCount,
      aspectRatio,
      paletteColors,
    } = req.body

    console.log('🎨 Starting moodboard generation...')

    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only generate images for your own moodboards')
      )
    }

    moodboard.status = 'generating'
    await moodboard.save({ validateBeforeSave: false })

    const numImages = 1
    // Let AI choose aspect ratio naturally if not specified
    const targetAspectRatio = aspectRatio || moodboard.aspectRatio || null

    let basePrompt = buildMoodboardPrompt({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: moodboard.colorPreferences,
      customPrompt: moodboard.prompt,
      layout: 'collage',
      aspectRatio: targetAspectRatio,
    })

    const colorsToUse = paletteColors || moodboard.paletteColors
    if (colorsToUse && colorsToUse.length > 0) {
      const colorPaletteInstruction = buildColorPalettePrompt(colorsToUse)
      basePrompt = `${basePrompt}. ${colorPaletteInstruction}`
    }

    const enhancedPrompt = customPrompt
      ? `${basePrompt}. User requirements: ${customPrompt}`
      : basePrompt

    let processedImages = []
    if (referenceImages && Array.isArray(referenceImages)) {
      processedImages = referenceImages.map((img) => ({
        data: img.data,
        mimeType: img.mimeType || 'image/png',
      }))
    }

    console.log('🖼️  Generating image with Gemini 2.5 Flash...')
    console.log('📋 Prompt:', enhancedPrompt.substring(0, 100) + '...')

    // Generate image with timeout
    const result = await withTimeout(
      generateImage(enhancedPrompt, processedImages, targetAspectRatio),
      180000, // 3 minute timeout for image generation
      'Image generation'
    )

    const imageData = result.images[0].data
    const base64Image = `data:${result.images[0].mimeType};base64,${imageData}`
    
    console.log('☁️ Uploading generated image to Cloudinary...')
    const uploadResult = await uploadImage(base64Image, 'manara-ai/moodboards')
    const imageUrl = uploadResult.secure_url

    console.log('✅ Image generated successfully')

    // PROGRESS: Color extraction
    broadcastProgress(id, ['Image generated'])
    console.log('🎨 Extracting color palette...')

    const palette = await extractColorPalette(imageData)

    const generatedImageEntry = {
      url: imageUrl,
      prompt: enhancedPrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: targetAspectRatio,
        index: 0,
        isIndividual: false,
        colorPalette: palette,
      },
    }

    const compositeColorPalette = palette

    // PROGRESS: Mood description (quick generation for preview)
    broadcastProgress(id, ['Image generated', 'Extracting colors'])
    console.log('💭 Generating mood description...')

    const moodDescription = await withTimeout(
      generateMoodDescription({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Mood description'
    )

    console.log('✅ Quick generation complete (image + mood)')

    const compositeMoodboardEntry = {
      url: imageUrl,
      prompt: enhancedPrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: targetAspectRatio,
        isComposite: true,
        width: 1024,
        height: Math.round(
          1024 *
            (parseAspectRatio(targetAspectRatio).height /
              parseAspectRatio(targetAspectRatio).width)
        ),
        imageCount: 1,
        imageRegions: [],
        colorPalette: compositeColorPalette,
        moodDescription,
      },
    }

    moodboard.compositeMoodboard = compositeMoodboardEntry
    moodboard.generatedImages = [generatedImageEntry]
    moodboard.colorPalette = compositeColorPalette
    moodboard.status = 'image_generated' // Partial completion
    await moodboard.save()

    // PROGRESS: Image complete
    broadcastProgress(id, ['Image generated', 'Colors extracted', 'Ready'])

    console.log('🎉 Phase 1 complete! Image ready for viewing.')

    res.status(200).json({
      status: 'success',
      phase: 'image_generated',
      message: 'Image generated successfully. Descriptions will be generated next.',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('❌ Error generating moodboard:', error.message)
    broadcastComplete(req.params.id)

    try {
      const moodboard = await Moodboard.findById(req.params.id)
      if (moodboard) {
        moodboard.status = 'failed'
        await moodboard.save({ validateBeforeSave: false })
      }
    } catch (updateError) {
      console.error('Error updating moodboard status:', updateError)
    }

    // Check if it's a timeout or quota error
    if (error.statusCode === 504 || error.message.includes('timeout')) {
      return next(
        createError(
          504,
          'Request timed out. Gemini API may be busy. Please try again or check your API quota at https://console.cloud.google.com'
        )
      )
    }

    if (error.message?.includes('quota')) {
      return next(
        createError(
          429,
          'Gemini API quota exceeded. Please enable billing at https://aistudio.google.com/'
        )
      )
    }

    next(createError(500, error.message || 'Failed to generate moodboard'))
  }
}

// ============================================================================
// GENERATE MOODBOARD DESCRIPTIONS (Phase 2 - Deferred)
// ============================================================================

export const generateMoodboardDescriptions = async (req, res, next) => {
  try {
    const { id } = req.params

    console.log('📝 Starting description generation (Phase 2)...')

    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only generate descriptions for your own moodboards')
      )
    }

    if (!moodboard.compositeMoodboard?.url) {
      return next(createError(400, 'Please generate the moodboard image first'))
    }

    // Update status to show descriptions are being generated
    moodboard.status = 'generating_descriptions'
    await moodboard.save({ validateBeforeSave: false })

    const compositeColorPalette = moodboard.colorPalette || []
    const enhancedPrompt = moodboard.compositeMoodboard.prompt || moodboard.prompt

    // PROGRESS: Design narrative
    broadcastProgress(id, ['Generating design narrative'])
    console.log('📖 Generating design narrative...')
    const designNarrative = await withTimeout(
      generateDesignNarrative({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Design narrative'
    )

    moodboard.designNarrative = designNarrative
    await moodboard.save({ validateBeforeSave: false })

    // PROGRESS: Materials
    broadcastProgress(id, ['Generating design narrative', 'Generating materials'])
    console.log('🏗️  Generating materials...')
    const materials = await withTimeout(
      generateMaterials({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Materials generation'
    )

    moodboard.materials = materials
    await moodboard.save({ validateBeforeSave: false })

    // PROGRESS: Furniture
    broadcastProgress(id, [
      'Generating design narrative',
      'Generating materials',
      'Generating furniture',
    ])
    console.log('🛋️  Generating furniture...')
    const furniture = await withTimeout(
      generateFurniture({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Furniture generation'
    )

    moodboard.furniture = furniture
    await moodboard.save({ validateBeforeSave: false })

    // PROGRESS: Lighting
    broadcastProgress(id, [
      'Generating design narrative',
      'Generating materials',
      'Generating furniture',
      'Generating lighting',
    ])
    console.log('💡 Generating lighting concept...')
    const lightingConcept = await withTimeout(
      generateLightingConcept({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Lighting generation'
    )

    moodboard.lightingConcept = lightingConcept
    await moodboard.save({ validateBeforeSave: false })

    // PROGRESS: Zones
    broadcastProgress(id, [
      'Generating design narrative',
      'Generating materials',
      'Generating furniture',
      'Generating lighting',
      'Generating zones',
    ])
    console.log('🗺️  Generating zones...')
    const zones = await withTimeout(
      generateZones({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Zones generation'
    )

    moodboard.zones = zones
    await moodboard.save({ validateBeforeSave: false })

    // PROGRESS: Variants
    broadcastProgress(id, [
      'Generating design narrative',
      'Generating materials',
      'Generating furniture',
      'Generating lighting',
      'Generating zones',
      'Generating variants',
    ])
    console.log('🔄 Generating variants...')
    const variants = await withTimeout(
      generateVariants({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: compositeColorPalette,
        prompt: enhancedPrompt,
      }),
      60000,
      'Variants generation'
    )

    moodboard.variants = variants
    moodboard.status = 'completed'
    await moodboard.save()

    // PROGRESS: Complete
    broadcastComplete(id)

    console.log('🎉 All descriptions generated successfully!')

    res.status(200).json({
      status: 'success',
      phase: 'descriptions_complete',
      message: 'All descriptions generated successfully',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('❌ Error generating descriptions:', error.message)
    broadcastComplete(req.params.id)

    try {
      const moodboard = await Moodboard.findById(req.params.id)
      if (moodboard) {
        moodboard.status = 'descriptions_failed'
        await moodboard.save({ validateBeforeSave: false })
      }
    } catch (updateError) {
      console.error('Error updating moodboard status:', updateError)
    }

    // Check if it's a timeout or quota error
    if (error.statusCode === 504 || error.message.includes('timeout')) {
      return next(
        createError(
          504,
          'Request timed out. Gemini API may be busy. Please try again or check your API quota at https://console.cloud.google.com'
        )
      )
    }

    if (error.message?.includes('quota')) {
      return next(
        createError(
          429,
          'Gemini API quota exceeded. Please enable billing at https://aistudio.google.com/'
        )
      )
    }

    next(createError(500, error.message || 'Failed to generate descriptions'))
  }
}

// ============================================================================
// REGENERATE MOODBOARD IMAGES (existing code - unchanged)
// ============================================================================

export const regenerateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndices, customPrompt, aspectRatio, paletteColors } = req.body

    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(
          403,
          'You can only regenerate images for your own moodboards'
        )
      )
    }

    let basePrompt = buildMoodboardPrompt({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: moodboard.colorPreferences,
      customPrompt: moodboard.prompt,
      layout: 'collage',
      aspectRatio: aspectRatio || moodboard.aspectRatio,
    })

    const colorsToUse = paletteColors || moodboard.paletteColors
    if (colorsToUse && colorsToUse.length > 0) {
      const colorPaletteInstruction = buildColorPalettePrompt(colorsToUse)
      basePrompt = `${basePrompt}. ${colorPaletteInstruction}`
    }

    const regenerationPrompt = customPrompt
      ? `${basePrompt}. Additional requirements: ${customPrompt}`
      : basePrompt

    console.log('🔄 Regenerating moodboard...')

    const result = await withTimeout(
      generateImage(
        regenerationPrompt,
        [],
        aspectRatio || moodboard.aspectRatio
      ),
      180000,
      'Image regeneration'
    )

    const imageData = result.images[0].data
    const base64Image = `data:${result.images[0].mimeType};base64,${imageData}`

    console.log('☁️ Uploading regenerated image to Cloudinary...')
    const uploadResult = await uploadImage(base64Image, 'manara-ai/moodboards')
    const imageUrl = uploadResult.secure_url

    const palette = await extractColorPalette(imageData)

    const moodDescription = await withTimeout(
      generateMoodDescription({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: palette,
        prompt: basePrompt,
      }),
      60000,
      'Mood description'
    )

    const regeneratedImageEntry = {
      url: imageUrl,
      prompt: regenerationPrompt,
      generatedAt: new Date(),
      regenerated: true,
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        index: 0,
        isIndividual: false,
        colorPalette: palette,
      },
    }

    moodboard.generatedImages[0] = regeneratedImageEntry

    const targetAspectRatio = aspectRatio || moodboard.aspectRatio
    moodboard.compositeMoodboard = {
      url: imageUrl,
      prompt: basePrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: targetAspectRatio,
        isComposite: true,
        width: 1024,
        height: Math.round(
          1024 *
            (parseAspectRatio(targetAspectRatio).height /
              parseAspectRatio(targetAspectRatio).width)
        ),
        imageCount: 1,
        imageRegions: [],
        colorPalette: palette,
        moodDescription,
      },
    }

    moodboard.colorPalette = palette
    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
        regeneratedIndices: [0],
      },
    })
  } catch (error) {
    console.error('Error regenerating moodboard:', error.message)
    next(createError(500, error.message || 'Failed to regenerate images'))
  }
}

// ============================================================================
// EDIT MOODBOARD IMAGE (existing code - unchanged)
// ============================================================================

export const editMoodboardImage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndex, editPrompt, aspectRatio, paletteColors } = req.body

    if (!editPrompt) {
      return next(createError(400, 'Edit prompt is required'))
    }

    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only edit your own moodboard images')
      )
    }

    if (!moodboard.generatedImages || moodboard.generatedImages.length === 0) {
      return next(createError(400, 'No moodboard image to edit'))
    }

    const existingImage = moodboard.generatedImages[0]
    const baseImageData = existingImage.url.split(',')[1]

    let fullEditPrompt = editPrompt
    const colorsToUse = paletteColors || moodboard.paletteColors
    if (colorsToUse && colorsToUse.length > 0) {
      const colorPaletteInstruction = buildColorPalettePrompt(colorsToUse)
      fullEditPrompt = `${editPrompt}. ${colorPaletteInstruction}`
    }

    console.log('✏️  Editing moodboard image...')

    const result = await withTimeout(
      editImage(
        fullEditPrompt,
        baseImageData,
        'image/png',
        aspectRatio || moodboard.aspectRatio
      ),
      180000,
      'Image editing'
    )

    const imageData = result.images[0].data
    const base64Image = `data:${result.images[0].mimeType};base64,${imageData}`

    console.log('☁️ Uploading edited image to Cloudinary...')
    const uploadResult = await uploadImage(base64Image, 'manara-ai/moodboards')
    const imageUrl = uploadResult.secure_url

    const palette = await extractColorPalette(imageData)

    const moodDescription = await withTimeout(
      generateMoodDescription({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: palette,
        prompt: `${existingImage.prompt} | Edited: ${editPrompt}`,
      }),
      60000,
      'Mood description'
    )

    const editedImageEntry = {
      url: imageUrl,
      prompt: `${existingImage.prompt} | Edited: ${editPrompt}`,
      generatedAt: new Date(),
      edited: true,
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        index: 0,
        editPrompt: editPrompt,
        isIndividual: false,
        colorPalette: palette,
      },
    }

    moodboard.generatedImages[0] = editedImageEntry

    const targetAspectRatio = aspectRatio || moodboard.aspectRatio
    moodboard.compositeMoodboard = {
      url: imageUrl,
      prompt: moodboard.compositeMoodboard?.prompt || '',
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: targetAspectRatio,
        isComposite: true,
        width: 1024,
        height: Math.round(
          1024 *
            (parseAspectRatio(targetAspectRatio).height /
              parseAspectRatio(targetAspectRatio).width)
        ),
        imageCount: 1,
        imageRegions: [],
        colorPalette: palette,
        moodDescription,
      },
    }

    moodboard.colorPalette = palette
    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
        editedIndex: 0,
      },
    })
  } catch (error) {
    console.error('Error editing moodboard image:', error.message)
    next(createError(500, error.message || 'Failed to edit image'))
  }
}

// ============================================================================
// GET USER MOODBOARDS (existing code - unchanged)
// ============================================================================

export const getUserMoodboards = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 10
    const skip = (page - 1) * limit

    const moodboards = await Moodboard.find({ userId: req.user._id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 })
      .populate('userId', 'name email')

    const totalMoodboards = await Moodboard.countDocuments({
      userId: req.user._id,
    })

    res.status(200).json({
      status: 'success',
      results: moodboards.length,
      totalResults: totalMoodboards,
      totalPages: Math.ceil(totalMoodboards / limit),
      currentPage: page,
      data: {
        moodboards,
      },
    })
  } catch (error) {
    console.error('Error fetching moodboards:', error)
    next(error)
  }
}

// ============================================================================
// GET MOODBOARD BY ID (existing code - unchanged)
// ============================================================================

export const getMoodboardById = async (req, res, next) => {
  try {
    const moodboard = await Moodboard.findById(req.params.id).populate(
      'userId',
      'name email'
    )

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (
      moodboard.userId._id.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(createError(403, 'You can only access your own moodboards'))
    }

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('Error fetching moodboard:', error)
    next(error)
  }
}

// ============================================================================
// UPDATE MOODBOARD (existing code - unchanged)
// ============================================================================

export const updateMoodboard = async (req, res, next) => {
  try {
    const {
      title,
      style,
      roomType,
      colorPalette,
      colorPreferences,
      notes,
      status,
      layout,
      imageCount,
      aspectRatio,
    } = req.body

    const moodboard = await Moodboard.findById(req.params.id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(createError(403, 'You can only update your own moodboards'))
    }

    if (title) moodboard.title = title.trim()
    if (style) moodboard.style = style
    if (roomType) moodboard.roomType = roomType
    if (colorPreferences) moodboard.colorPreferences = colorPreferences
    if (notes !== undefined) moodboard.notes = notes
    if (status) moodboard.status = status
    if (layout) moodboard.layout = layout
    if (imageCount)
      moodboard.imageCount = Math.min(Math.max(parseInt(imageCount), 1), 6)
    if (aspectRatio) moodboard.aspectRatio = aspectRatio

    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('Error updating moodboard:', error)
    next(error)
  }
}

// ============================================================================
// DELETE MOODBOARD (existing code - unchanged)
// ============================================================================

export const deleteMoodboard = async (req, res, next) => {
  try {
    const moodboard = await Moodboard.findById(req.params.id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    if (
      moodboard.userId.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      return next(createError(403, 'You can only delete your own moodboards'))
    }

    // Delete images from Cloudinary
    if (moodboard.compositeMoodboard?.url) {
      await deleteAsset(moodboard.compositeMoodboard.url).catch(err => 
        console.error('Error deleting composite moodboard from Cloudinary:', err)
      )
    }

    if (moodboard.generatedImages && moodboard.generatedImages.length > 0) {
      for (const img of moodboard.generatedImages) {
        if (img.url) {
          await deleteAsset(img.url).catch(err => 
            console.error('Error deleting generated image from Cloudinary:', err)
          )
        }
      }
    }

    moodboard.isDeleted = true
    await moodboard.save()

    res.status(200).json({
      status: 'success',
      message: 'Moodboard deleted successfully',
      data: null,
    })
  } catch (error) {
    console.error('Error deleting moodboard:', error)
    next(error)
  }
}
