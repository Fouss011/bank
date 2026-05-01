import { z } from 'zod'
import {
  createChatMessage,
  createChatSession
} from '../repositories/chatRepository.js'
import {
  searchChunksByEmbedding,
  searchAuthorizedChunks
} from '../repositories/documentsRepository.js'
import { generateAnswer, generateEmbedding } from './openaiService.js'
import { detectConversationIntent } from '../utils/conversationIntent.js'

const askSchema = z.object({
  question: z.string().min(1),
  session_id: z.string().uuid().optional().nullable()
})

const MIN_SIMILARITY_SCORE = 0.75

function filterRelevantChunks(chunks) {
  return chunks.filter((chunk) => {
    if (typeof chunk.similarity !== 'number') {
      return true
    }

    return chunk.similarity >= MIN_SIMILARITY_SCORE
  })
}

function buildNoAnswerMessage() {
  return (
    "1. Réponse courte\n" +
    "L'information demandée n'est pas disponible dans les documents internes accessibles.\n\n" +
    "2. Détails utiles\n" +
    "Aucun document interne pertinent ne permet de répondre avec certitude à cette question."
  )
}

export async function askInternalCopilot(input, user) {
  const payload = askSchema.parse(input)
  const intent = detectConversationIntent(payload.question)

  let sessionId = payload.session_id

  if (!sessionId) {
    const session = await createChatSession({
      bankId: user.bank_id,
      userId: user.id,
      scope: 'internal',
      sessionTitle: payload.question.slice(0, 80)
    })

    sessionId = session.id
  }

  await createChatMessage({
    sessionId,
    actor: 'user',
    content: payload.question
  })

  if (intent.type !== 'question') {
    await createChatMessage({
      sessionId,
      actor: 'assistant',
      content: intent.answer,
      citations: []
    })

    return {
      session_id: sessionId,
      answer: intent.answer,
      citations: [],
      intent: intent.type
    }
  }

  let chunks = []

  try {
    const queryEmbedding = await generateEmbedding(payload.question)

    chunks = await searchChunksByEmbedding({
      bankId: user.bank_id,
      accessLevel: user.access_level,
      scope: 'internal',
      queryEmbedding
    })
  } catch (error) {
    console.error('⚠️ Embedding indisponible, fallback recherche texte:', error.message)

    chunks = await searchAuthorizedChunks({
      bankId: user.bank_id,
      accessLevel: user.access_level,
      scope: 'internal',
      query: payload.question
    })
  }

  const relevantChunks = filterRelevantChunks(chunks)

  let answer
  let citations = []

  if (!relevantChunks.length) {
    answer = buildNoAnswerMessage()
  } else {
    citations = relevantChunks.map((chunk) => ({
      document_id: chunk.document_id,
      document_title: chunk.documents?.title,
      chunk_id: chunk.id,
      chunk_index: chunk.chunk_index,
      similarity: chunk.similarity
    }))

    const context = relevantChunks
      .map((chunk, index) => {
        return `Source ${index + 1} - ${chunk.documents?.title}:\n${chunk.content}`
      })
      .join('\n\n')

    answer = await generateAnswer({
      question: payload.question,
      context,
      mode: 'internal'
    })
  }

  await createChatMessage({
    sessionId,
    actor: 'assistant',
    content: answer,
    citations
  })

  return {
    session_id: sessionId,
    answer,
    citations,
    intent: 'question'
  }
}