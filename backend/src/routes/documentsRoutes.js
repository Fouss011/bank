import { Router } from 'express'
import {
  createDocument,
  deleteDocumentById,
  getDocumentById,
  listDocuments,
  updateDocumentById
} from '../controllers/documentsController.js'
import { requireAuth } from '../middleware/authMiddleware.js'
import { requireRole } from '../middleware/requireRole.js'

const router = Router()

router.use(requireAuth)

router.post(
  '/',
  requireRole('super_admin', 'bank_admin'),
  createDocument
)

router.get('/', listDocuments)
router.get('/:id', getDocumentById)

router.patch(
  '/:id',
  requireRole('super_admin', 'bank_admin'),
  updateDocumentById
)

router.delete(
  '/:id',
  requireRole('super_admin', 'bank_admin'),
  deleteDocumentById
)

export default router