// File: server/controllers/floorPlan.js
import { createError } from '../error.js'
import FloorPlan from '../models/FloorPlan.js'
import { generateFloorPlanElements } from '../services/aiFloorPlanService.js'

import {
    exportToDXF,
    exportToPDF,
    exportToPNG,
} from '../services/exportService.js'
import { editImage, generateImage } from '../services/geminiService.js'
import {
    parseDXF,
    processFloorPlanImage,
} from '../services/imageProcessingService.js'

export const createFloorPlan = async (req, res, next) => {
  try {
    const { name, data, projectId } = req.body

    const floorPlan = new FloorPlan({
      userId: req.user.id,
      projectId,
      name: name || `Floor Plan - ${new Date().toLocaleDateString()}`,
      elements: data?.elements || [],
      layers: data?.layers || undefined,
      gridSize: data?.gridSize || 20,
      scale: data?.scale || 100,
      units: data?.units || 'meters',
    })

    await floorPlan.save()

    res.status(201).json({
      status: 'success',
      id: floorPlan._id,
      data: floorPlan,
    })
  } catch (error) {
    console.error('Error creating floor plan:', error)
    next(createError(500, 'Failed to create floor plan'))
  }
}

export const getFloorPlan = async (req, res, next) => {
  try {
    const floorPlan = await FloorPlan.findById(req.params.id)
      .populate('userId', 'name email')
      .populate('sharedWith.userId', 'name email')

    if (!floorPlan || floorPlan.isDeleted) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (!floorPlan.canUserView(req.user.id)) {
      return next(createError(403, 'Access denied'))
    }

    res.status(200).json({
      status: 'success',
      data: floorPlan,
    })
  } catch (error) {
    console.error('Error getting floor plan:', error)
    next(createError(500, 'Failed to get floor plan'))
  }
}

export const updateFloorPlan = async (req, res, next) => {
  try {
    const { data, name } = req.body
    const floorPlan = await FloorPlan.findById(req.params.id)

    if (!floorPlan || floorPlan.isDeleted) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (!floorPlan.canUserEdit(req.user.id)) {
      return next(
        createError(403, 'You do not have permission to edit this floor plan')
      )
    }

    // Add current state to history before updating
    floorPlan.addToHistory('update', floorPlan.elements, req.user.id)

    // Update fields
    if (data?.elements) floorPlan.elements = data.elements
    if (data?.layers) floorPlan.layers = data.layers
    if (data?.gridSize) floorPlan.gridSize = data.gridSize
    if (data?.scale) floorPlan.scale = data.scale
    if (data?.units) floorPlan.units = data.units
    if (name) floorPlan.name = name

    floorPlan.lastModifiedBy = req.user.id

    await floorPlan.save()

    res.status(200).json({
      status: 'success',
      id: floorPlan._id,
      data: floorPlan,
    })
  } catch (error) {
    console.error('Error updating floor plan:', error)
    next(createError(500, 'Failed to update floor plan'))
  }
}

export const deleteFloorPlan = async (req, res, next) => {
  try {
    const floorPlan = await FloorPlan.findById(req.params.id)

    if (!floorPlan) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (floorPlan.userId.toString() !== req.user.id) {
      return next(createError(403, 'You can only delete your own floor plans'))
    }

    floorPlan.isDeleted = true
    floorPlan.deletedAt = new Date()
    await floorPlan.save()

    res.status(200).json({
      status: 'success',
      message: 'Floor plan deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting floor plan:', error)
    next(createError(500, 'Failed to delete floor plan'))
  }
}

export const getUserFloorPlans = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, status = 'all' } = req.query
    const skip = (page - 1) * limit

    const query = {
      $or: [{ userId: req.user.id }, { 'sharedWith.userId': req.user.id }],
      isDeleted: false,
    }

    if (status !== 'all') {
      query.status = status
    }

    const floorPlans = await FloorPlan.find(query)
      .select(
        'name status thumbnail createdAt updatedAt roomCount wallCount totalArea'
      )
      .populate('userId', 'name')
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))

    const total = await FloorPlan.countDocuments(query)

    res.status(200).json({
      status: 'success',
      results: floorPlans.length,
      totalResults: total,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      data: floorPlans,
    })
  } catch (error) {
    console.error('Error getting user floor plans:', error)
    next(createError(500, 'Failed to get floor plans'))
  }
}

export const shareFloorPlan = async (req, res, next) => {
  try {
    const { userId, permission = 'view' } = req.body
    const floorPlan = await FloorPlan.findById(req.params.id)

    if (!floorPlan) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (floorPlan.userId.toString() !== req.user.id) {
      return next(createError(403, 'You can only share your own floor plans'))
    }

    // Check if already shared with this user
    const existingShare = floorPlan.sharedWith.find(
      (share) => share.userId.toString() === userId
    )

    if (existingShare) {
      existingShare.permission = permission
    } else {
      floorPlan.sharedWith.push({
        userId,
        permission,
        sharedAt: new Date(),
      })
    }

    await floorPlan.save()

    res.status(200).json({
      status: 'success',
      message: 'Floor plan shared successfully',
    })
  } catch (error) {
    console.error('Error sharing floor plan:', error)
    next(createError(500, 'Failed to share floor plan'))
  }
}

export const exportFloorPlan = async (req, res, next) => {
  try {
    const { format = 'dxf' } = req.body
    const floorPlan = await FloorPlan.findById(req.params.id)

    if (!floorPlan) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (!floorPlan.canUserView(req.user.id)) {
      return next(createError(403, 'Access denied'))
    }

    let fileData, mimeType, filename

    switch (format) {
      case 'dxf':
        fileData = await exportToDXF(floorPlan)
        mimeType = 'application/dxf'
        filename = `${floorPlan.name.replace(/[^a-z0-9]/gi, '_')}.dxf`
        break
      case 'pdf':
        fileData = await exportToPDF(floorPlan)
        mimeType = 'application/pdf'
        filename = `${floorPlan.name.replace(/[^a-z0-9]/gi, '_')}.pdf`
        break
      case 'png':
        fileData = await exportToPNG(floorPlan)
        mimeType = 'image/png'
        filename = `${floorPlan.name.replace(/[^a-z0-9]/gi, '_')}.png`
        break
      default:
        return next(createError(400, 'Unsupported export format'))
    }

    // Record export in history
    floorPlan.exports.push({
      format,
      timestamp: new Date(),
    })
    await floorPlan.save()

    res.set({
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Length': fileData.length,
    })

    res.send(fileData)
  } catch (error) {
    console.error('Error exporting floor plan:', error)
    next(createError(500, 'Failed to export floor plan'))
  }
}

export const generateWithAI = async (req, res, next) => {
  try {
    const { prompt, currentElements = [], context } = req.body

    if (!prompt) {
      return next(createError(400, 'Prompt is required'))
    }

    // Generate elements using AI
    const generatedElements = await generateFloorPlanElements({
      prompt,
      currentElements,
      context,
      userId: req.user.id,
    })

    res.status(200).json({
      status: 'success',
      elements: generatedElements,
      message: `Generated ${generatedElements.length} new elements`,
    })
  } catch (error) {
    console.error('Error generating with AI:', error)
    next(createError(500, 'Failed to generate floor plan elements with AI'))
  }
}

export const importFromImage = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, 'No image file provided'))
    }

    // Process the image and extract floor plan elements
    const elements = await processFloorPlanImage(
      req.file.buffer,
      req.file.mimetype
    )

    res.status(200).json({
      status: 'success',
      elements,
      message: `Imported ${elements.length} elements from image`,
    })
  } catch (error) {
    console.error('Error importing from image:', error)
    next(createError(500, 'Failed to import floor plan from image'))
  }
}

export const importFromDXF = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(createError(400, 'No DXF file provided'))
    }

    // Parse DXF file
    const elements = await parseDXF(req.file.buffer.toString())

    res.status(200).json({
      status: 'success',
      elements,
      message: `Imported ${elements.length} elements from DXF`,
    })
  } catch (error) {
    console.error('Error importing from DXF:', error)
    next(createError(500, 'Failed to import floor plan from DXF'))
  }
}

export const autoSave = async (req, res, next) => {
  try {
    const { elements } = req.body
    const floorPlan = await FloorPlan.findById(req.params.id)

    if (!floorPlan) {
      return next(createError(404, 'Floor plan not found'))
    }

    if (!floorPlan.canUserEdit(req.user.id)) {
      return next(createError(403, 'Access denied'))
    }

    floorPlan.elements = elements
    floorPlan.lastModifiedBy = req.user.id
    await floorPlan.save()

    res.status(200).json({
      status: 'success',
      message: 'Auto-saved successfully',
      timestamp: new Date(),
    })
  } catch (error) {
    console.error('Error auto-saving:', error)
    next(createError(500, 'Failed to auto-save'))
  }
}

export const generateFloorPlanImage = async (req, res, next) => {
  try {
    const { prompt, aspectRatio = '1:1' } = req.body

    if (!prompt) {
      return next(createError(400, 'Prompt is required'))
    }

    const enhancedPrompt = `STRICT INSTRUCTION: Generate a high-quality 2D architectural floor plan based on the following description. 
    It MUST be a top-down view. 
    It MUST be a technical drawing on a white background. 
    Do NOT generate 3D views, perspectives, exteriors, or furniture close-ups. 
    Do NOT generate photos of real rooms.
    If the prompt asks for anything other than a floor plan (e.g., 'a cat', 'a car', 'a portrait'), ignore it and generate a generic floor plan or return an error image.
    
    User Request: ${prompt}. 
    
    Style: Professional architectural rendering, clear walls, doors, windows, and furniture symbols.`

    console.log('Generating floor plan image with prompt:', enhancedPrompt)

    const result = await generateImage(enhancedPrompt, [], aspectRatio)


    if (!result.images || result.images.length === 0) {
      throw new Error('No image generated')
    }

    res.status(200).json({
      status: 'success',
      image: result.images[0], // { data: base64, mimeType }
      message: 'Floor plan generated successfully',
    })
  } catch (error) {
    console.error('Error generating floor plan image:', error)
    next(createError(500, error.message || 'Failed to generate floor plan image'))
  }
}

export const editFloorPlanImage = async (req, res, next) => {
  try {
    const { prompt, image, aspectRatio = '1:1' } = req.body

    if (!prompt) {
      return next(createError(400, 'Prompt is required'))
    }
    if (!image) {
      return next(createError(400, 'Original image is required'))
    }

    console.log('Editing floor plan image with prompt:', prompt)
    
    // image comes as base64 string usually from frontend
    // remove data:image/png;base64, prefix if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '')

    const strictEditPrompt = `STRICT: Modify this 2D FLOOR PLAN only. Keep the top-down architectural view. User Request: ${prompt}`

    const result = await editImage(strictEditPrompt, base64Data, 'image/png', aspectRatio)

    if (!result.images || result.images.length === 0) {
      throw new Error('No image generated')
    }

    res.status(200).json({
      status: 'success',
      image: result.images[0],
      message: 'Floor plan modified successfully',
    })
  } catch (error) {
    console.error('Error editing floor plan image:', error)
    next(createError(500, error.message || 'Failed to edit floor plan image'))
  }
}
