import express from 'express'
import { getUserProjects } from '../controllers/projectController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.get('/', verifyToken, getUserProjects)

export default router
