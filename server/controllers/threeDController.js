import { createError } from '../error.js'
import ThreeDModel from '../models/ThreeDModel.js'
import { generate3DModel } from '../services/threeDService.js'

export const generate3D = async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return next(createError(400, 'Image is required'))
    }

    let imageBuffer
    let mimeType

    if (req.file) {
      imageBuffer = req.file.buffer
      mimeType = req.file.mimetype
    } else {
      // Handle base64 image
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '')
      imageBuffer = Buffer.from(base64Data, 'base64')
      mimeType = req.body.mimeType || 'image/png'
    }

    console.log(`Starting 3D generation for user ${req.user.id}...`)

    const result = await generate3DModel(imageBuffer, mimeType)

    const newThreeD = new ThreeDModel({
      userId: req.user.id,
      name: req.body.name || `3D Model - ${new Date().toLocaleDateString()}`,
      sourceImage: req.body.image || 'uploaded_image', // In real app, we'd save this image too
      glbUrl: result.url,
      glbPath: result.path,
      status: 'completed',
    })

    await newThreeD.save()

    res.status(200).json({
      status: 'success',
      data: newThreeD,
    })
  } catch (error) {
    console.error('Error in generate3D controller:', error)
    next(createError(500, error.message || 'Failed to generate 3D model'))
  }
}

export const getMyThreeDModels = async (req, res, next) => {
  try {
    const models = await ThreeDModel.find({ userId: req.user.id, isDeleted: false })
      .sort({ createdAt: -1 })

    res.status(200).json({
      status: 'success',
      data: models,
    })
  } catch (error) {
    console.error('Error getting 3D models:', error)
    next(createError(500, 'Failed to get 3D models'))
  }
}

export const deleteThreeDModel = async (req, res, next) => {
  try {
    const model = await ThreeDModel.findById(req.params.id)

    if (!model) {
      return next(createError(404, '3D Model not found'))
    }

    if (model.userId.toString() !== req.user.id) {
      return next(createError(403, 'You can only delete your own models'))
    }

    model.isDeleted = true
    model.deletedAt = new Date()
    await model.save()

    res.status(200).json({
      status: 'success',
      message: '3D Model deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting 3D model:', error)
    next(createError(500, 'Failed to delete 3D model'))
  }
}
