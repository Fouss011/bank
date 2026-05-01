import { z } from 'zod'
import { chunkText } from '../utils/chunkText.js'
import {
  createDocument,
  createDocumentChunks,
  findDocumentByIdForUser,
  listDocumentsForUser,
  updateDocumentById,
  deleteDocumentById
} from '../repositories/documentsRepository.js'
import { generateEmbedding } from './openaiService.js'
import { updateChunkEmbedding } from '../repositories/documentsRepository.js'

const createDocumentSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  department: z.string().optional().nullable(),
  scope: z.enum(['internal', 'external']).default('internal'),
  min_access_level: z.enum(['P1', 'P2', 'P3']).default('P1'),
  status: z.enum(['draft', 'published', 'archived']).default('published'),
  source_text: z.string().min(10)
})

export async function createTextDocument(input, user) {
  const payload = createDocumentSchema.parse(input)

  const document = await createDocument({
    bank_id: user.bank_id,
    title: payload.title,
    description: payload.description || null,
    category: payload.category || null,
    department: payload.department || null,
    scope: payload.scope,
    min_access_level: payload.min_access_level,
    status: payload.status,
    source_text: payload.source_text,
    created_by: user.id,
    published_at: payload.status === 'published' ? new Date().toISOString() : null
  })

  const chunks = chunkText(payload.source_text).map((content, index) => ({
    document_id: document.id,
    bank_id: user.bank_id,
    chunk_index: index,
    content,
    token_count: Math.ceil(content.length / 4)
  }))

  const createdChunks = await createDocumentChunks(chunks)

for (const chunk of createdChunks) {
  const embedding = await generateEmbedding(chunk.content)
  await updateChunkEmbedding(chunk.id, embedding)
}

  return {
    document,
    chunks_created: chunks.length
  }
}

export async function getDocuments(user, scope = 'internal') {
  return listDocumentsForUser({
    bankId: user.bank_id,
    accessLevel: user.access_level,
    scope
  })
}

export async function getDocumentDetails(documentId, user) {
  const document = await findDocumentByIdForUser({
    documentId,
    bankId: user.bank_id,
    accessLevel: user.access_level
  })

  if (!document) {
    const error = new Error('Document introuvable ou accès refusé')
    error.status = 404
    throw error
  }

  return document
}

export async function updateDocument(documentId, input, user) {
  const payload = createDocumentSchema.partial().parse(input)

  const updated = await updateDocumentById({
    documentId,
    bankId: user.bank_id,
    payload
  })

  return updated
}

export async function deleteDocument(documentId, user) {
  await deleteDocumentById({
    documentId,
    bankId: user.bank_id
  })

  return { deleted: true }
}