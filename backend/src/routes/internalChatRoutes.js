import { Router } from 'express'
import { askInternal } from '../controllers/internalChatController.js'
import { requireAuth } from '../middleware/authMiddleware.js'

const router = Router()

router.use(requireAuth)

router.post('/ask', askInternal)

export default router