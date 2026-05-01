import { z } from 'zod'
import {
  searchChunksByEmbedding,
  searchAuthorizedChunks
} from '../repositories/documentsRepository.js'
import { generateAnswer, generateEmbedding } from './openaiService.js'
import { detectConversationIntent } from '../utils/conversationIntent.js'

const askSchema = z.object({
  question: z.string().min(1)
})

const DEFAULT_BANK_ID = 'b814ca86-9dce-4ad2-983c-2a7f9d300553'

function buildFallbackAnswer(question) {
  const q = question.toLowerCase()

  if (q.includes('ouvrir') || q.includes('compte')) {
    return "L’ouverture d’un compte bancaire n’est pas précisée dans les documents publics disponibles. Pour obtenir les démarches exactes, nous vous recommandons de contacter un conseiller ou de vous rendre en agence."
  }

  if (q.includes('prêt') || q.includes('pret') || q.includes('crédit') || q.includes('credit')) {
    return "Les conditions de demande de prêt ne sont pas précisées dans les documents publics disponibles. Pour une réponse adaptée à votre situation, nous vous recommandons de contacter un conseiller crédit."
  }

  if (q.includes('document') || q.includes('pièce') || q.includes('piece') || q.includes('fournir')) {
    return "La liste des documents à fournir n’est pas précisée dans les documents publics disponibles. Nous vous recommandons de demander la liste officielle auprès d’un conseiller ou en agence."
  }

  if (q.includes('conseiller') || q.includes('contact') || q.includes('agence')) {
    return "Les canaux de contact d’un conseiller ne sont pas précisés dans les documents publics disponibles. Nous vous recommandons d’utiliser les canaux officiels de la banque ou de vous rendre en agence."
  }

  return "Cette information n’est pas disponible dans les documents publics de la banque. Pour obtenir une réponse fiable, nous vous recommandons de contacter un conseiller."
}

export async function askExternalCopilot(input) {
  const payload = askSchema.parse(input)
  const intent = detectConversationIntent(payload.question)

  if (intent.type !== 'question') {
    return {
      answer: intent.answer,
      citations: [],
      intent: intent.type
    }
  }

  let chunks = []

try {
  const queryEmbedding = await generateEmbedding(payload.question)

  chunks = await searchChunksByEmbedding({
    bankId: DEFAULT_BANK_ID,
    accessLevel: 'P1',
    scope: 'external',
    queryEmbedding
  })
} catch (error) {
  console.error('⚠️ Embedding externe indisponible, fallback texte:', error.message)

  chunks = await searchAuthorizedChunks({
    bankId: DEFAULT_BANK_ID,
    accessLevel: 'P1',
    scope: 'external',
    query: payload.question
  })
}

  if (!chunks.length) {
  return {
    answer: buildFallbackAnswer(payload.question),
    citations: [],
    intent: 'question'
  }
}

  const citations = chunks.map((chunk) => ({
    document_id: chunk.document_id,
    document_title: chunk.documents?.title,
    chunk_id: chunk.id,
    chunk_index: chunk.chunk_index,
    similarity: chunk.similarity
  }))

  const filteredCitations = citations.filter(c =>
  payload.question.toLowerCase().includes(c.document_title?.toLowerCase() || '')
)

  const context = chunks
    .map((chunk, index) => {
      return `Source ${index + 1} - ${chunk.documents?.title}:\n${chunk.content}`
    })
    .join('\n\n')

  const answer = await generateAnswer({
  question: payload.question,
  context,
  mode: 'external'
})
let cleanAnswer = answer
  .replace(/3\.\s*Source documentaire[\s\S]*/i, '')
  .replace(/Sources?:[\s\S]*/i, '')
  .trim()

  const hasNoDirectAnswer =
  cleanAnswer.toLowerCase().includes("ne contient pas d'information") ||
  cleanAnswer.toLowerCase().includes("n'est pas disponible") ||
  cleanAnswer.toLowerCase().includes("n’est pas disponible")

return {
  answer: cleanAnswer,
  citations: hasNoDirectAnswer
    ? []
    : filteredCitations.length
      ? filteredCitations
      : citations,
  intent: 'question'
}
}