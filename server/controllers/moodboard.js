// File: server/controllers/moodboard.js
import mongoose from 'mongoose'
import { createError } from '../error.js'
import Moodboard from '../models/Moodboard.js'
import {
  buildMoodboardPrompt,
  editImage,
  generateImage,
  regenerateImages,
} from '../services/geminiService.js'

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

    // Validate required fields
    if (!title) {
      if (session) await session.abortTransaction()
      return next(createError(400, 'Moodboard title is required'))
    }

    // Validate user exists
    if (!req.user || !req.user._id) {
      if (session) await session.abortTransaction()
      return next(createError(401, 'User not authenticated'))
    }

    // Create moodboard document
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
      layout: layout || 'grid',
      imageCount: imageCount || 4,
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
 */
export const generateMoodboardImages = async (req, res, next) => {
  try {
    const { id } = req.params
    const { customPrompt, referenceImages, imageCount, aspectRatio } = req.body

    // Find moodboard
    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    // Check ownership
    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only generate images for your own moodboards')
      )
    }

    // Update status to generating
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
        layout: moodboard.layout,
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

    // Generate multiple images based on imageCount
    const numImages = imageCount || moodboard.imageCount || 4
    const generatedImageEntries = []

    for (let i = 0; i < numImages; i++) {
      // Generate each image with slight variation in prompt
      const variationPrompt = `${enhancedPrompt}. Variation ${
        i + 1
      } of ${numImages}.`
      const result = await generateImage(
        variationPrompt,
        processedImages,
        aspectRatio || moodboard.aspectRatio
      )

      // Save generated image
      generatedImageEntries.push({
        url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
        prompt: variationPrompt,
        generatedAt: new Date(),
        metadata: {
          model: 'gemini-2.5-flash-image',
          tokens: 1290,
          aspectRatio: aspectRatio || moodboard.aspectRatio,
          index: i,
        },
      })
    }

    moodboard.generatedImages = generatedImageEntries
    moodboard.status = 'completed'
    await moodboard.save()

    res.status(200).json({
      status: 'success',
      data: {
        moodboard,
      },
    })
  } catch (error) {
    console.error('Error generating moodboard images:', error)

    // Update moodboard status to failed
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
 * Regenerate specific images in a moodboard
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

    // Find moodboard
    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    // Check ownership
    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(
          403,
          'You can only regenerate images for your own moodboards'
        )
      )
    }

    // Build base prompt from moodboard settings
    const basePrompt = buildMoodboardPrompt({
      style: moodboard.style,
      roomType: moodboard.roomType,
      colorPalette: moodboard.colorPalette,
      customPrompt: moodboard.prompt,
      layout: moodboard.layout,
      aspectRatio: aspectRatio || moodboard.aspectRatio,
    })

    // Combine with custom regeneration prompt if provided
    const regenerationPrompt = customPrompt
      ? `${basePrompt}. Additional requirements: ${customPrompt}`
      : basePrompt

    // Regenerate each selected image
    for (const index of imageIndices) {
      if (index >= 0 && index < moodboard.generatedImages.length) {
        // Generate new image with variation
        const variationPrompt = `${regenerationPrompt}. Regenerated variation for position ${
          index + 1
        }.`
        const result = await generateImage(
          variationPrompt,
          [],
          aspectRatio || moodboard.aspectRatio
        )

        // Replace the image at the specified index
        moodboard.generatedImages[index] = {
          url: `data:${result.images[0].mimeType};base64,${result.images[0].data}`,
          prompt: variationPrompt,
          generatedAt: new Date(),
          regenerated: true,
          metadata: {
            model: 'gemini-2.5-flash-image',
            tokens: 1290,
            aspectRatio: aspectRatio || moodboard.aspectRatio,
            index: index,
          },
        }
      }
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
 * Edit a generated moodboard image with natural language
 */
export const editMoodboardImage = async (req, res, next) => {
  try {
    const { id } = req.params
    const { imageIndex, editPrompt, aspectRatio } = req.body

    if (!editPrompt) {
      return next(createError(400, 'Edit prompt is required'))
    }

    // Find moodboard
    const moodboard = await Moodboard.findById(id)

    if (!moodboard) {
      return next(createError(404, 'Moodboard not found'))
    }

    // Check ownership
    if (moodboard.userId.toString() !== req.user._id.toString()) {
      return next(
        createError(403, 'You can only edit your own moodboard images')
      )
    }

    // Get the image to edit
    if (imageIndex === undefined || !moodboard.generatedImages[imageIndex]) {
      return next(createError(400, 'Invalid image index'))
    }

    const existingImage = moodboard.generatedImages[imageIndex]
    // Extract base64 from data URL
    const baseImageData = existingImage.url.split(',')[1]

    // Edit image using Gemini's targeted transformation capabilities
    const result = await editImage(
      editPrompt,
      baseImageData,
      'image/png',
      aspectRatio || moodboard.aspectRatio
    )

    // Replace the edited image at the same index
    moodboard.generatedImages[imageIndex] = {
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

    // Check ownership or admin access
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

    // Check ownership
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
    if (layout) moodboard.layout = layout
    if (imageCount) moodboard.imageCount = imageCount
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

    // Check ownership or admin
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
