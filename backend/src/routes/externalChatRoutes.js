import { Router } from 'express'
import { askExternal } from '../controllers/externalChatController.js'

const router = Router()

router.post('/ask', askExternal)

export default router