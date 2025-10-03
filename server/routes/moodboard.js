// File: server/routes/moodboard.js
// ============================================
import express from 'express'
import {
  createMoodboard,
  deleteMoodboard,
  editMoodboardImage,
  generateMoodboardImages,
  getMoodboardById,
  getUserMoodboards,
  regenerateMoodboardImages,
  updateMoodboard,
} from '../controllers/moodboard.js'
import { checkActiveUser, verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// All routes require authentication
router.use(verifyToken)
router.use(checkActiveUser)

// Create a new moodboard
router.post('/', createMoodboard)

// Get all moodboards for current user
router.get('/', getUserMoodboards)

// Get single moodboard by ID
router.get('/:id', getMoodboardById)

// Generate images for a moodboard using Gemini 2.5 Flash Image
router.post('/:id/generate', generateMoodboardImages)

// Regenerate specific images in a moodboard
router.post('/:id/regenerate', regenerateMoodboardImages)

// Edit a generated moodboard image with targeted transformation
router.post('/:id/edit', editMoodboardImage)

// Update moodboard details
router.put('/:id', updateMoodboard)

// Delete moodboard (soft delete)
router.delete('/:id', deleteMoodboard)

export default router
