// File: server/routes/floorPlan.js
import express from 'express'
import multer from 'multer'
import {
    autoSave,
    createFloorPlan,
    deleteFloorPlan,
    editFloorPlanImage,
    exportFloorPlan,
    generateFloorPlanImage,
    generateWithAI,
    getFloorPlan,
    getUserFloorPlans,
    importFromDXF,
    importFromImage,
    shareFloorPlan,
    updateFloorPlan,
} from '../controllers/floorPlan.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

// Configure multer for file uploads
const storage = multer.memoryStorage()
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/dxf',
      'application/dwg',
    ]
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type'))
    }
  },
})

// Protected routes
router.use(verifyToken)

// CRUD operations
router.post('/', createFloorPlan)
router.get('/user', getUserFloorPlans)
router.get('/:id', getFloorPlan)
router.put('/:id', updateFloorPlan)
router.delete('/:id', deleteFloorPlan)

// Auto-save endpoint
router.post('/:id/autosave', autoSave)

// Sharing
router.post('/:id/share', shareFloorPlan)

// Export
router.post('/:id/export', exportFloorPlan)

// AI Generation
router.post('/generate', generateWithAI)
router.post('/generate-image', generateFloorPlanImage) // New image-based generation
router.post('/edit-image', editFloorPlanImage) // New image-based editing

// Import
router.post('/import-image', upload.single('image'), importFromImage)
router.post('/import-dxf', upload.single('file'), importFromDXF)

export default router
