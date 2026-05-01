import { Router } from 'express'
import {
  createUser,
  deleteUser,
  listUsers,
  updateUser
} from '../controllers/usersController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.use(requireAuth)
router.use(requireRole('super_admin', 'bank_admin'))

router.get('/', listUsers)
router.post('/', createUser)
router.patch('/:id', updateUser)
router.delete('/:id', deleteUser)

export default router