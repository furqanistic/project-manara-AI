// File: server/routes/moodboard.js - ADD THIS ROUTE

import express from 'express'
import {
  createMoodboard,
  deleteMoodboard,
  editMoodboardImage,
  generateMoodboardImages,
  getMoodboardById,
  getMoodboardProgressStream,
  getUserMoodboards,
  regenerateMoodboardImages,
  updateMoodboard,
} from '../controllers/moodboard.js'
import { checkActiveUser, verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(verifyToken)
router.use(checkActiveUser)

/**
 * POST /api/moodboards
 * Create a new moodboard
 */
router.post('/', createMoodboard)

/**
 * GET /api/moodboards
 * Get all moodboards for current user
 */
router.get('/', getUserMoodboards)

/**
 * GET /api/moodboards/:id/progress-stream
 * Server-Sent Events stream for real-time progress updates
 *
 * Usage in frontend:
 * const eventSource = new EventSource(`/api/moodboards/${moodboardId}/progress-stream`)
 * eventSource.addEventListener('progress', (e) => {
 *   const { currentSteps } = JSON.parse(e.data)
 * })
 * eventSource.addEventListener('complete', () => eventSource.close())
 */
router.get('/:id/progress-stream', getMoodboardProgressStream)

/**
 * GET /api/moodboards/:id
 * Get single moodboard by ID
 */
router.get('/:id', getMoodboardById)

/**
 * POST /api/moodboards/:id/generate
 * Generate images for a moodboard using Gemini 2.5 Flash Image
 */
router.post('/:id/generate', generateMoodboardImages)

/**
 * POST /api/moodboards/:id/regenerate
 * Regenerate specific images in a moodboard (creates new variation)
 */
router.post('/:id/regenerate', regenerateMoodboardImages)

/**
 * POST /api/moodboards/:id/edit
 * Edit a generated moodboard image with targeted transformations
 */
router.post('/:id/edit', editMoodboardImage)

/**
 * PUT /api/moodboards/:id
 * Update moodboard details
 */
router.put('/:id', updateMoodboard)

/**
 * DELETE /api/moodboards/:id
 * Delete moodboard (soft delete)
 */
router.delete('/:id', deleteMoodboard)

export default router
