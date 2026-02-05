import fs from 'fs'
import { createError } from '../error.js'
import ThreeDModel from '../models/ThreeDModel.js'
import { uploadImage, uploadRaw } from '../services/cloudinaryService.js'
import { generateThreeDVisualization } from '../services/geminiService.js'
import { generateHunyuan3DModel } from '../services/huggingFaceService.js'

export const generate3D = async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return next(createError(400, 'Image is required'))
    }

    const { name } = req.body
    let imageBuffer
    let mimeType
    let sourceImageUrl = req.body.image

    if (req.file) {
      imageBuffer = req.file.buffer
      mimeType = req.file.mimetype
      // Upload source image to cloudinary if it's a file
      const sourceUpload = await uploadImage(imageBuffer, 'manara-ai/source-images')
      sourceImageUrl = sourceUpload.secure_url
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      // Handle base64 image
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '')
      imageBuffer = Buffer.from(base64Data, 'base64')
      mimeType = req.body.mimeType || 'image/png'
      
      const sourceUpload = await uploadImage(req.body.image, 'manara-ai/source-images')
      sourceImageUrl = sourceUpload.secure_url
    } else {
        // Already a URL or handled elsewhere
    }

    console.log(`Starting Hunyuan3D-2.1 generation for user ${req.user.id}...`)

    const result = await generateHunyuan3DModel(imageBuffer, mimeType, req.body)

    // Upload GLB to Cloudinary
    console.log('Uploading GLB to Cloudinary...')
    const glbBuffer = fs.readFileSync(result.path)
    const glbUpload = await uploadRaw(glbBuffer, 'manara-ai/3d-models')

    const newThreeD = new ThreeDModel({
        userId: req.user._id,
        name: name || `3D Model - ${new Date().toLocaleDateString()}`,
        sourceImage: sourceImageUrl,
        glbUrl: glbUpload.secure_url,
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


export const generateVisualization = async (req, res, next) => {
  try {
    if (!req.file && !req.body.image) {
      return next(createError(400, 'Image is required'))
    }

    let imageBuffer
    let mimeType
    let sourceImageUrl = req.body.image

    if (req.file) {
      imageBuffer = req.file.buffer
      mimeType = req.file.mimetype
      
      const sourceUpload = await uploadImage(imageBuffer, 'manara-ai/source-images')
      sourceImageUrl = sourceUpload.secure_url
    } else if (req.body.image && req.body.image.startsWith('data:')) {
      const base64Data = req.body.image.replace(/^data:image\/\w+;base64,/, '')
      imageBuffer = Buffer.from(base64Data, 'base64')
      mimeType = req.body.mimeType || 'image/png'

      const sourceUpload = await uploadImage(req.body.image, 'manara-ai/source-images')
      sourceImageUrl = sourceUpload.secure_url
    } else {
        // Fallback for non-base64 image strings if necessary
    }

    console.log(`Starting 3D visualization generation for user ${req.user.id}...`)

    const result = await generateThreeDVisualization(imageBuffer, mimeType, req.body)

    // Upload generated image to Cloudinary
    console.log('Uploading visualization to Cloudinary...')
    const visualizationBase64 = `data:${result.images[0].mimeType};base64,${result.images[0].data}`
    const visualizationUpload = await uploadImage(visualizationBase64, 'manara-ai/visualizations')

    // Save to database
    let model;
    const { projectId, style, prompt } = req.body;
    
    // Create new version object
    const newVersion = {
        style: style || 'architectural',
        image: {
            url: visualizationUpload.secure_url,
            data: null, // We can stop storing base64
            mimeType: result.images[0].mimeType
        },
        prompt: prompt || (style === 'architectural' ? 'Architectural Synthesis' : 'Vibrant Color Synthesis'),
        timestamp: new Date()
    };

    if (projectId) {
        // Find existing model and add version
        model = await ThreeDModel.findOne({ _id: projectId, userId: req.user.id });
        if (!model) {
             return next(createError(404, 'Project not found'));
        }
        model.versions.push(newVersion);
        // Update main preview image to latest
        model.sourceImage = sourceImageUrl; 
    } else {
        // Create new model
        model = new ThreeDModel({
            userId: req.user._id,
            name: `3D Project - ${new Date().toLocaleString()}`,
            sourceImage: sourceImageUrl,
            status: 'completed',
            versions: [newVersion]
        });
    }

    console.log(`Saving 3D model for user ${req.user._id}...`)
    await model.save();
    console.log('3D model saved successfully:', model._id)

    res.status(200).json({
      status: 'success',
      data: {
          url: visualizationUpload.secure_url,
          mimeType: result.images[0].mimeType
      },
      model: model, 
      message: '3D visualization generated and saved successfully',
    })
  } catch (error) {
    console.error('Error in generateVisualization controller:', error)
    next(createError(500, error.message || 'Failed to generate 3D visualization'))
  }
}

export const getMyThreeDModels = async (req, res, next) => {
  try {
    console.log(`Fetching 3D models for user ${req.user._id}...`)
    const models = await ThreeDModel.find({ userId: req.user._id, isDeleted: false })
      .sort({ createdAt: -1 })

    console.log(`Found ${models.length} models for user ${req.user._id}`)

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
