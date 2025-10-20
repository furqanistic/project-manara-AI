// File: server/controllers/moodboard.js
import mongoose from 'mongoose'
import { createError } from '../error.js'
import Moodboard from '../models/Moodboard.js'
import { extractColorPalette } from '../services/colorExtractor.js'
import {
  buildMoodboardPrompt,
  editImage,
  generateImage,
  generateMoodDescription,
} from '../services/geminiService.js'
import {
  createCompositeMoodboard,
  getImageRegions,
} from '../services/imageCompositor.js'

/**
 * Helper to parse aspect ratio
 */
const parseAspectRatio = (aspectRatio) => {
  const [width, height] = aspectRatio.split(':').map(Number)
  return { width, height }
}

/**
 * Create a new moodboard
 */
export const createMoodboard = async (req, res, next) => {
  let session = null

  try {
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
    } = req.body

    if (!title) {
      if (session) await session.abortTransaction()
      return next(createError(400, 'Moodboard title is required'))
    }

    if (!req.user || !req.user._id) {
      if (session) await session.abortTransaction()
      return next(createError(401, 'User not authenticated'))
    }

    // Always use collage layout with single composite image
    const moodboardData = {
      userId: req.user._id,
      title: title.trim(),
      prompt: customPrompt || prompt || '',
      style: style || 'modern',
      roomType,
      colorPreferences: colorPreferences || colorPalette || [],
      colorPalette: [], // Will be filled after generation
      notes,
      projectId,
      status: 'draft',
      layout: 'collage', // Always collage style
      imageCount: 1, // Always single composite moodboard
      aspectRatio: aspectRatio || '16:9',
    }

    const [newMoodboard] = await Moodboard.create([moodboardData], { session })

    await session.commitTransaction()

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

/**
 * Generate moodboard images using Gemini 2.5 Flash Image
 */
export const generateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { customPrompt, referenceImages, imageCount, aspectRatio } = req.body

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

    const numImages = 1 // Always generate single composite moodboard
    const targetAspectRatio = aspectRatio || moodboard.aspectRatio || '16:9'

    // Build enhanced prompt
    const enhancedPrompt =
      customPrompt ||
      buildMoodboardPrompt({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: moodboard.colorPreferences, // Use color preferences for prompt
        customPrompt: moodboard.prompt,
        layout: 'collage', // Always collage style
        aspectRatio: targetAspectRatio,
      })

    // Process reference images if provided
    let processedImages = []
    if (referenceImages && Array.isArray(referenceImages)) {
      processedImages = referenceImages.map((img) => ({
        data: img.data,
        mimeType: img.mimeType || 'image/png',
      }))
    }

    console.log('Generating single composite moodboard...')

    // Generate single composite moodboard image
    const result = await generateImage(
      enhancedPrompt,
      processedImages,
      targetAspectRatio
    )

    const imageData = result.images[0].data
    const imageUrl = `data:${result.images[0].mimeType};base64,${imageData}`

    // Extract color palette from the generated moodboard
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

    // For single moodboard, the composite IS the generated image
    const compositeColorPalette = palette

    // Generate mood description using Gemini
    const moodDescription = await generateMoodDescription({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: compositeColorPalette,
      prompt: enhancedPrompt,
    })

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
    moodboard.status = 'completed'
    await moodboard.save()

    console.log(
      'Composite moodboard generated successfully with color palette and mood'
    )

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('Error generating moodboard images:', error)

    try {
      const moodboard = await Moodboard.findById(req.params.id)
      if (moodboard) {
        moodboard.status = 'failed'
        await moodboard.save({ validateBeforeSave: false })
      }
    } catch (updateError) {
      console.error('Error updating moodboard status:', updateError)
    }

    next(createError(500, error.message || 'Failed to generate moodboard'))
  }
}

/**
 * Regenerate the moodboard (creates a new variation)
 */
export const regenerateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndices, customPrompt, aspectRatio } = req.body

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

    // Build base prompt
    const basePrompt = buildMoodboardPrompt({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: moodboard.colorPreferences,
      customPrompt: moodboard.prompt,
      layout: 'collage',
      aspectRatio: aspectRatio || moodboard.aspectRatio,
    })

    const regenerationPrompt = customPrompt
      ? `${basePrompt}. Additional requirements: ${customPrompt}`
      : basePrompt

    console.log('Regenerating moodboard with new variation...')

    // Regenerate the single composite moodboard
    const result = await generateImage(
      regenerationPrompt,
      [],
      aspectRatio || moodboard.aspectRatio
    )

    const imageData = result.images[0].data
    const imageUrl = `data:${result.images[0].mimeType};base64,${imageData}`

    // Extract color palette
    const palette = await extractColorPalette(imageData)

    // Generate new mood description
    const moodDescription = await generateMoodDescription({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: palette,
      prompt: basePrompt,
    })

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

    // Update composite (same as the generated image)
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
    console.error('Error regenerating moodboard images:', error)
    next(createError(500, error.message || 'Failed to regenerate images'))
  }
}

/**
 * Edit the moodboard (apply modifications)
 */
export const editMoodboardImage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndex, editPrompt, aspectRatio } = req.body

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

    console.log('Editing moodboard with modifications...')

    // Edit the image with exact aspect ratio
    const result = await editImage(
      editPrompt,
      baseImageData,
      'image/png',
      aspectRatio || moodboard.aspectRatio
    )

    const imageData = result.images[0].data
    const imageUrl = `data:${result.images[0].mimeType};base64,${imageData}`

    // Extract color palette
    const palette = await extractColorPalette(imageData)

    // Generate new mood description
    const moodDescription = await generateMoodDescription({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: palette,
      prompt: `${existingImage.prompt} | Edited: ${editPrompt}`,
    })

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

    // Update composite (same as edited image for single moodboard)
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
    console.error('Error editing moodboard image:', error)
    next(createError(500, error.message || 'Failed to edit image'))
  }
}

// ... rest of the controller methods (getUserMoodboards, getMoodboardById, updateMoodboard, deleteMoodboard) remain the same
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

    // Update fields
    if (title) moodboard.title = title.trim()
    if (style) moodboard.style = style
    if (roomType) moodboard.roomType = roomType
    if (colorPreferences) moodboard.colorPreferences = colorPreferences
    // colorPalette is auto-generated, don't allow manual updates
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

    moodboard.isDeleted = true
    await moodboard.save()

    res.status(204).json({
      status: 'success',
      data: null,
    })
  } catch (error) {
    console.error('Error deleting moodboard:', error)
    next(error)
  }
}
