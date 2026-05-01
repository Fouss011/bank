import { supabase } from '../config/supabaseClient.js'

export async function createDocument(payload) {
  const { data, error } = await supabase
    .from('documents')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createDocumentChunks(chunks) {
  if (!chunks.length) return []

  const { data, error } = await supabase
    .from('document_chunks')
    .insert(chunks)
    .select()

  if (error) throw error
  return data
}

export async function updateChunkEmbedding(chunkId, embedding) {
  const { error } = await supabase
    .from('document_chunks')
    .update({ embedding })
    .eq('id', chunkId)

  if (error) throw error
}

export async function listDocumentsForUser({ bankId, accessLevel, scope }) {
  const accessOrder = {
    P1: ['P1'],
    P2: ['P1', 'P2'],
    P3: ['P1', 'P2', 'P3']
  }

  const allowedLevels = accessOrder[accessLevel] || ['P1']

  const { data, error } = await supabase
    .from('documents')
    .select('*')
    .eq('bank_id', bankId)
    .eq('scope', scope)
    .eq('status', 'published')
    .in('min_access_level', allowedLevels)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function findDocumentByIdForUser({ documentId, bankId, accessLevel }) {
  const accessOrder = {
    P1: ['P1'],
    P2: ['P1', 'P2'],
    P3: ['P1', 'P2', 'P3']
  }

  const allowedLevels = accessOrder[accessLevel] || ['P1']

  const { data, error } = await supabase
    .from('documents')
    .select(`
      *,
      document_chunks (
        id,
        chunk_index,
        content,
        token_count,
        created_at
      )
    `)
    .eq('id', documentId)
    .eq('bank_id', bankId)
    .in('min_access_level', allowedLevels)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function searchAuthorizedChunks({ bankId, accessLevel, scope, query }) {
  const accessOrder = {
    P1: ['P1'],
    P2: ['P1', 'P2'],
    P3: ['P1', 'P2', 'P3']
  }

  const allowedLevels = accessOrder[accessLevel] || ['P1']

  const keywords = query
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .split(/\s+/)
    .filter((word) => word.length > 2)
    .slice(0, 10)

  let request = supabase
    .from('document_chunks')
    .select(`
      id,
      document_id,
      chunk_index,
      content,
      documents!inner (
        id,
        title,
        category,
        scope,
        status,
        min_access_level,
        bank_id
      )
    `)
    .eq('bank_id', bankId)
    .eq('documents.scope', scope)
    .eq('documents.status', 'published')
    .in('documents.min_access_level', allowedLevels)

  if (keywords.length > 0) {
    const orFilter = keywords
      .map((word) => `content.ilike.%${word}%`)
      .join(',')

    request = request.or(orFilter)
  }

  const { data, error } = await request.limit(20)

  if (error) throw error

  return scoreChunks(data || [], keywords).slice(0, 6)
}

export async function searchChunksByEmbedding({
  bankId,
  accessLevel,
  scope,
  queryEmbedding
}) {
  const accessOrder = {
    P1: ['P1'],
    P2: ['P1', 'P2'],
    P3: ['P1', 'P2', 'P3']
  }

  const allowedLevels = accessOrder[accessLevel] || ['P1']

  const { data, error } = await supabase.rpc('match_document_chunks', {
    query_embedding: queryEmbedding,
    match_bank_id: bankId,
    match_scope: scope,
    allowed_levels: allowedLevels,
    match_count: 6
  })

  if (error) throw error

  return (data || []).map((chunk) => ({
    id: chunk.id,
    document_id: chunk.document_id,
    chunk_index: chunk.chunk_index,
    content: chunk.content,
    similarity: chunk.similarity,
    documents: {
      title: chunk.document_title,
      category: chunk.document_category,
      min_access_level: chunk.min_access_level
    }
  }))
}

function scoreChunks(chunks, keywords) {
  return chunks
    .map((chunk) => {
      const normalizedContent = chunk.content
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')

      const score = keywords.reduce((total, word) => {
        return normalizedContent.includes(word) ? total + 1 : total
      }, 0)

      return {
        ...chunk,
        score
      }
    })
    .sort((a, b) => b.score - a.score)
}

export async function updateDocumentById({ documentId, bankId, payload }) {
  const { data, error } = await supabase
    .from('documents')
    .update(payload)
    .eq('id', documentId)
    .eq('bank_id', bankId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function deleteDocumentById({ documentId, bankId }) {
  const { error } = await supabase
    .from('documents')
    .delete()
    .eq('id', documentId)
    .eq('bank_id', bankId)

  if (error) throw error
}