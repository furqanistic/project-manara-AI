import express from 'express'
import {
  createProject,
  deleteProject,
  getProjectWorkspace,
  getUserProjects,
  updateProject,
} from '../controllers/projectController.js'
import { verifyToken } from '../middleware/authMiddleware.js'

const router = express.Router()

router.use(verifyToken)

router.route('/').get(getUserProjects).post(createProject)
router.route('/:id').get(getProjectWorkspace).put(updateProject).delete(deleteProject)

export default router
