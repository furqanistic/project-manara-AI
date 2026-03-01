import { createError } from '../error.js'
import FloorPlan from '../models/FloorPlan.js'
import Moodboard from '../models/Moodboard.js'
import Project from '../models/Project.js'
import ThreeDModel from '../models/ThreeDModel.js'
import {
  DEFAULT_PROJECT_FLOW,
  deriveFlowFromAssets,
  getFlowProgress,
  mergeProjectFlow,
  normalizeProjectFlow,
} from '../utils/projectFlow.js'

const sanitizeName = (value = '') => value.toString().trim().replace(/\s+/g, ' ')

export const createProject = async (req, res, next) => {
  try {
    const name = sanitizeName(req.body?.name)

    if (!name) {
      return next(createError(400, 'Project name is required'))
    }

    const project = await Project.create({
      userId: req.user.id,
      name,
      description: req.body?.description?.trim() || '',
      flow: normalizeProjectFlow(DEFAULT_PROJECT_FLOW),
    })

    res.status(201).json({
      status: 'success',
      data: project,
    })
  } catch (error) {
    console.error('Error creating project:', error)
    next(createError(500, 'Failed to create project'))
  }
}

export const getUserProjects = async (req, res, next) => {
  try {
    const userId = req.user.id
    const search = sanitizeName(req.query?.search || '')

    const query = {
      userId,
      isDeleted: false,
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' }
    }

    const projects = await Project.find(query).sort({ updatedAt: -1 }).lean()

    const projectIds = projects.map((project) => project._id)

    const [moodboardCounts, floorPlanCounts, threeDCounts] = await Promise.all([
      Moodboard.aggregate([
        { $match: { userId: req.user._id, isDeleted: { $ne: true }, projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
      ]),
      FloorPlan.aggregate([
        { $match: { userId: req.user._id, isDeleted: false, projectId: { $in: projectIds } } },
        { $group: { _id: '$projectId', count: { $sum: 1 } } },
      ]),
      ThreeDModel.aggregate([
        { $match: { userId: req.user._id, isDeleted: false, workspaceProjectId: { $in: projectIds } } },
        { $group: { _id: '$workspaceProjectId', count: { $sum: 1 } } },
      ]),
    ])

    const moodboardMap = new Map(moodboardCounts.map((row) => [String(row._id), row.count]))
    const floorPlanMap = new Map(floorPlanCounts.map((row) => [String(row._id), row.count]))
    const threeDMap = new Map(threeDCounts.map((row) => [String(row._id), row.count]))

    const data = projects.map((project) => {
      const key = String(project._id)
      const moodboards = moodboardMap.get(key) || 0
      const floorplans = floorPlanMap.get(key) || 0
      const threed = threeDMap.get(key) || 0

      return {
        ...project,
        counts: {
          moodboard: moodboards,
          floorplan: floorplans,
          threed,
          total: moodboards + floorplans + threed,
        },
        flow: normalizeProjectFlow(project.flow || DEFAULT_PROJECT_FLOW),
        flowProgress: getFlowProgress(project.flow || DEFAULT_PROJECT_FLOW),
      }
    })

    res.status(200).json({
      status: 'success',
      data,
    })
  } catch (error) {
    console.error('Error fetching projects:', error)
    next(createError(500, 'Failed to fetch projects'))
  }
}

export const getProjectWorkspace = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    }).lean()

    if (!project) {
      return next(createError(404, 'Project not found'))
    }

    const [moodboards, floorplans, threed] = await Promise.all([
      Moodboard.find({ userId: req.user._id, projectId: project._id, isDeleted: { $ne: true } })
        .sort({ createdAt: -1 })
        .select('title style roomType status compositeMoodboard createdAt updatedAt')
        .lean(),
      FloorPlan.find({ userId: req.user._id, projectId: project._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .select('name status thumbnail createdAt updatedAt')
        .lean(),
      ThreeDModel.find({ userId: req.user._id, workspaceProjectId: project._id, isDeleted: false })
        .sort({ createdAt: -1 })
        .select('name status sourceImage versions meshyStatus glbUrl createdAt updatedAt')
        .lean(),
    ])

    res.status(200).json({
      status: 'success',
      data: {
        project: {
          ...project,
          flow: deriveFlowFromAssets({ flow: project.flow || DEFAULT_PROJECT_FLOW, assets: { moodboards, floorplans, threed } }),
        },
        assets: {
          moodboards,
          floorplans,
          threed,
        },
        flowProgress: getFlowProgress(
          deriveFlowFromAssets({
            flow: project.flow || DEFAULT_PROJECT_FLOW,
            assets: { moodboards, floorplans, threed },
          })
        ),
      },
    })
  } catch (error) {
    console.error('Error fetching workspace:', error)
    next(createError(500, 'Failed to fetch project workspace'))
  }
}

export const updateProject = async (req, res, next) => {
  try {
    const hasName = typeof req.body?.name === 'string'
    const name = hasName ? sanitizeName(req.body?.name) : null

    if (hasName && !name) {
      return next(createError(400, 'Project name is required'))
    }

    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    })

    if (!project) {
      return next(createError(404, 'Project not found'))
    }

    if (hasName) {
      project.name = name
    }

    if (typeof req.body?.description === 'string') {
      project.description = req.body.description.trim()
    }

    if (req.body?.flow && typeof req.body.flow === 'object') {
      project.flow = mergeProjectFlow(project.flow || DEFAULT_PROJECT_FLOW, req.body.flow)
    }

    await project.save()

    res.status(200).json({
      status: 'success',
      data: {
        ...project.toObject(),
        flow: normalizeProjectFlow(project.flow || DEFAULT_PROJECT_FLOW),
      },
    })
  } catch (error) {
    console.error('Error updating project:', error)
    next(createError(500, 'Failed to update project'))
  }
}

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      userId: req.user.id,
      isDeleted: false,
    })

    if (!project) {
      return next(createError(404, 'Project not found'))
    }

    project.isDeleted = true
    project.deletedAt = new Date()
    await project.save()

    res.status(200).json({
      status: 'success',
      message: 'Project deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    next(createError(500, 'Failed to delete project'))
  }
}
