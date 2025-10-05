// File: server/controllers/moodboard.js
import mongoose from 'mongoose'
import { createError } from '../error.js'
import Moodboard from '../models/Moodboard.js'
import {
  buildMoodboardPrompt,
  editImage,
  generateImage,
} from '../services/geminiService.js'
import {
  createCompositeMoodboard,
  getImageRegions,
} from '../services/imageCompositor.js'

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

    // Force single layout and image count of 1
    const moodboardData = {
      userId: req.user._id,
      title: title.trim(),
      prompt: customPrompt || prompt || '',
      style: style || 'modern',
      roomType,
      colorPalette: colorPalette || [],
      notes,
      projectId,
      status: 'draft',
      layout: 'single', // Always single
      imageCount: 1, // Always 1 image
      aspectRatio: aspectRatio || '1:1',
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
 * Creates a single image with exact aspect ratio
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

    // Build enhanced prompt
    const enhancedPrompt =
      customPrompt ||
      buildMoodboardPrompt({
        style: moodboard.style,
        roomType: moodboard.roomType,
        colorPalette: moodboard.colorPalette,
        customPrompt: moodboard.prompt,
        layout: 'single',
        aspectRatio: aspectRatio || moodboard.aspectRatio,
      })

    // Process reference images if provided
    let processedImages = []
    if (referenceImages && Array.isArray(referenceImages)) {
      processedImages = referenceImages.map((img) => ({
        data: img.data,
        mimeType: img.mimeType || 'image/png',
      }))
    }

    console.log('Generating single moodboard image with exact aspect ratio...')

    // Generate single image with exact aspect ratio
    const result = await generateImage(
      enhancedPrompt,
      processedImages,
      aspectRatio || moodboard.aspectRatio
    )

    // Store the single generated image
    const generatedImageEntry = {
      url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
      prompt: enhancedPrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        index: 0,
        isIndividual: true,
      },
    }

    // For single layout, the composite is the same as the individual image
    const compositeMoodboardEntry = {
      url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
      prompt: enhancedPrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        isComposite: true,
        width: 1024, // Default width, will be adjusted by Sharp
        height: 1024, // Will be calculated based on aspect ratio
        imageCount: 1,
        imageRegions: [
          {
            index: 0,
            x: 0,
            y: 0,
            width: 1024,
            height: 1024,
          },
        ],
      },
    }

    moodboard.compositeMoodboard = compositeMoodboardEntry
    moodboard.generatedImages = [generatedImageEntry]
    moodboard.status = 'completed'
    await moodboard.save()

    console.log('Moodboard generated successfully with exact aspect ratio')

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
 * Regenerate the moodboard image
 */
export const regenerateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndices, customPrompt, aspectRatio } = req.body

    if (
      !imageIndices ||
      !Array.isArray(imageIndices) ||
      imageIndices.length === 0
    ) {
      return next(createError(400, 'Image indices are required'))
    }

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
      colorPalette: moodboard.colorPalette,
      customPrompt: moodboard.prompt,
      layout: 'single',
      aspectRatio: aspectRatio || moodboard.aspectRatio,
    })

    const regenerationPrompt = customPrompt
      ? `${basePrompt}. Additional requirements: ${customPrompt}`
      : basePrompt

    console.log('Regenerating moodboard image...')

    // Regenerate the single image
    const result = await generateImage(
      regenerationPrompt,
      [],
      aspectRatio || moodboard.aspectRatio
    )

    // Update the image
    const regeneratedImageEntry = {
      url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
      prompt: regenerationPrompt,
      generatedAt: new Date(),
      regenerated: true,
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        index: 0,
        isIndividual: true,
      },
    }

    moodboard.generatedImages[0] = regeneratedImageEntry

    // Update composite (same as individual for single layout)
    moodboard.compositeMoodboard = {
      url: regeneratedImageEntry.url,
      prompt: basePrompt,
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        isComposite: true,
        width: 1024,
        height: 1024,
        imageCount: 1,
        imageRegions: [
          {
            index: 0,
            x: 0,
            y: 0,
            width: 1024,
            height: 1024,
          },
        ],
      },
    }

    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
        regeneratedIndices: imageIndices,
      },
    })
  } catch (error) {
    console.error('Error regenerating moodboard images:', error)
    next(createError(500, error.message || 'Failed to regenerate images'))
  }
}

/**
 * Edit the moodboard image
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

    if (imageIndex === undefined || !moodboard.generatedImages[imageIndex]) {
      return next(createError(400, 'Invalid image index'))
    }

    const existingImage = moodboard.generatedImages[imageIndex]
    const baseImageData = existingImage.url.split(',')[1]

    console.log('Editing moodboard image...')

    // Edit the image with exact aspect ratio
    const result = await editImage(
      editPrompt,
      baseImageData,
      'image/png',
      aspectRatio || moodboard.aspectRatio
    )

    // Update the image
    const editedImageEntry = {
      url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
      prompt: `${existingImage.prompt} | Edited: ${editPrompt}`,
      generatedAt: new Date(),
      edited: true,
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        index: imageIndex,
        editPrompt: editPrompt,
        isIndividual: true,
      },
    }

    moodboard.generatedImages[imageIndex] = editedImageEntry

    // Update composite (same as individual for single layout)
    moodboard.compositeMoodboard = {
      url: editedImageEntry.url,
      prompt: moodboard.compositeMoodboard?.prompt || '',
      generatedAt: new Date(),
      metadata: {
        model: 'gemini-2.5-flash-image',
        tokens: 1290,
        aspectRatio: aspectRatio || moodboard.aspectRatio,
        isComposite: true,
        width: 1024,
        height: 1024,
        imageCount: 1,
        imageRegions: [
          {
            index: 0,
            x: 0,
            y: 0,
            width: 1024,
            height: 1024,
          },
        ],
      },
    }

    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
        editedIndex: imageIndex,
      },
    })
  } catch (error) {
    console.error('Error editing moodboard image:', error)
    next(createError(500, error.message || 'Failed to edit image'))
  }
}

/**
 * Get all moodboards for current user
 */
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

/**
 * Get single moodboard by ID
 */
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

/**
 * Update moodboard details
 */
export const updateMoodboard = async (req, res, next) => {
  try {
    const {
      title,
      style,
      roomType,
      colorPalette,
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
    if (colorPalette) moodboard.colorPalette = colorPalette
    if (notes !== undefined) moodboard.notes = notes
    if (status) moodboard.status = status
    // Force single layout
    moodboard.layout = 'single'
    moodboard.imageCount = 1
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
