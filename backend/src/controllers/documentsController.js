import { ok } from '../utils/responses.js'
import {
  createTextDocument,
  deleteDocument,
  getDocumentDetails,
  getDocuments,
  updateDocument
} from '../services/documentsService.js'

export async function createDocument(req, res, next) {
  try {
    const result = await createTextDocument(req.body, req.user)
    return ok(res, result, 'Document créé', 201)
  } catch (error) {
    next(error)
  }
}

export async function listDocuments(req, res, next) {
  try {
    const scope = req.query.scope || 'internal'
    const documents = await getDocuments(req.user, scope)
    return ok(res, { documents }, 'Documents récupérés')
  } catch (error) {
    next(error)
  }
}

export async function getDocumentById(req, res, next) {
  try {
    const document = await getDocumentDetails(req.params.id, req.user)
    return ok(res, { document }, 'Document récupéré')
  } catch (error) {
    next(error)
  }
}

export async function updateDocumentById(req, res, next) {
  try {
    const document = await updateDocument(req.params.id, req.body, req.user)
    return ok(res, { document }, 'Document modifié')
  } catch (error) {
    next(error)
  }
}

export async function deleteDocumentById(req, res, next) {
  try {
    const result = await deleteDocument(req.params.id, req.user)
    return ok(res, result, 'Document supprimé')
  } catch (error) {
    next(error)
  }
}