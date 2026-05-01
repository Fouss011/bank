import { Router } from 'express'
import healthRoutes from './healthRoutes.js'
import authRoutes from './authRoutes.js'
import documentsRoutes from './documentsRoutes.js'
import internalChatRoutes from './internalChatRoutes.js'
import usersRoutes from './usersRoutes.js'
import externalChatRoutes from './externalChatRoutes.js'

const router = Router()

router.use('/health', healthRoutes)
router.use('/auth', authRoutes)
router.use('/documents', documentsRoutes)
router.use('/internal-chat', internalChatRoutes)
router.use('/users', usersRoutes)
router.use('/external-chat', externalChatRoutes)

export default router