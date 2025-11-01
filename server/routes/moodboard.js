// File: server/routes/moodboard.js
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

/**
 * POST /api/moodboards
 * Create a new moodboard
 *
 * Request body:
 * {
 *   title: string (required),
 *   style: string,
 *   roomType: string,
 *   colorPreferences: string[] (palette names),
 *   paletteColors: string[] (hex colors from palette),
 *   customPrompt: string,
 *   layout: 'collage',
 *   imageCount: 1,
 *   aspectRatio: string
 * }
 */
router.post('/', createMoodboard)

/**
 * GET /api/moodboards
 * Get all moodboards for current user
 *
 * Query params:
 * - page: number (default 1)
 * - limit: number (default 10)
 */
router.get('/', getUserMoodboards)

/**
 * GET /api/moodboards/:id
 * Get single moodboard by ID
 */
router.get('/:id', getMoodboardById)

/**
 * POST /api/moodboards/:id/generate
 * Generate images for a moodboard using Gemini 2.5 Flash Image
 * This will generate a single composite moodboard image
 *
 * Request body:
 * {
 *   customPrompt: string (optional, overrides default prompt),
 *   imageCount: 1 (always 1),
 *   aspectRatio: string (e.g., '16:9', '1:1'),
 *   paletteColors: string[] (hex colors to use in generation)
 * }
 *
 * Response includes:
 * - compositeMoodboard: generated image URL
 * - colorPalette: extracted colors
 * - designNarrative: AI-generated design concept
 * - materials: material recommendations
 * - furniture: furniture pieces
 * - lightingConcept: lighting design
 * - zones: room layout zones
 * - variants: design alternatives
 */
router.post('/:id/generate', generateMoodboardImages)

/**
 * POST /api/moodboards/:id/regenerate
 * Regenerate specific images in a moodboard (creates new variation)
 *
 * Request body:
 * {
 *   customPrompt: string (optional),
 *   imageIndices: number[] (optional),
 *   aspectRatio: string (optional),
 *   paletteColors: string[] (hex colors to use)
 * }
 *
 * Creates a new variation while maintaining style and room type
 */
router.post('/:id/regenerate', regenerateMoodboardImages)

/**
 * POST /api/moodboards/:id/edit
 * Edit a generated moodboard image with targeted transformations
 *
 * Request body:
 * {
 *   imageIndex: number (which image to edit, default 0),
 *   editPrompt: string (required, description of changes),
 *   aspectRatio: string (optional),
 *   paletteColors: string[] (hex colors to maintain)
 * }
 *
 * Example editPrompt:
 * "Make it more minimalist, reduce clutter, focus on clean lines"
 * "Add more plants and natural elements"
 * "Use warmer lighting"
 */
router.post('/:id/edit', editMoodboardImage)

/**
 * PUT /api/moodboards/:id
 * Update moodboard details
 *
 * Request body (all optional):
 * {
 *   title: string,
 *   style: string,
 *   roomType: string,
 *   colorPreferences: string[],
 *   notes: string,
 *   status: string,
 *   layout: string,
 *   imageCount: number,
 *   aspectRatio: string
 * }
 */
router.put('/:id', updateMoodboard)

/**
 * DELETE /api/moodboards/:id
 * Delete moodboard (soft delete)
 * Sets isDeleted flag to true
 */
router.delete('/:id', deleteMoodboard)

export default router
