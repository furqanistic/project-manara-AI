import express from 'express'
import multer from 'multer'
import {
    deleteThreeDModel,
    generate3D,
    generateVisualization,
    getMyThreeDModels,
} from '../controllers/threeDController.js'
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
    const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Invalid file type. Only PNG and JPEG are allowed.'))
    }
  },
})

// All routes are protected
router.use(verifyToken)

router.post('/generate', upload.single('image'), generate3D)
router.post('/visualize', upload.single('image'), generateVisualization)
router.get('/my-models', getMyThreeDModels)
router.delete('/:id', deleteThreeDModel)

export default router
