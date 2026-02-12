import express from 'express'
import multer from 'multer'
import {
    deleteThreeDModel,
    generate3D,
    generateMeshy3D,
    generateVisualization,
    getMeshyStatus,
    getMyThreeDModels,
    proxyMeshyModel,
    getThreeDModel,
    updateThreeDModel,
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
// Public proxy (locked to *.meshy.ai in controller)
router.get('/meshy/proxy', proxyMeshyModel)

router.use(verifyToken)

router.post('/generate', upload.single('image'), generate3D)
router.post('/visualize', upload.single('image'), generateVisualization)
router.post('/meshy/generate', generateMeshy3D)
router.get('/meshy/status/:taskId', getMeshyStatus)
router.get('/my-models', getMyThreeDModels)
router.get('/projects/:id', getThreeDModel)
router.delete('/:id', deleteThreeDModel)
router.put('/:id', updateThreeDModel)

export default router
