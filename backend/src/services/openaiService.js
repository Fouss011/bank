import OpenAI from 'openai'
import { env } from '../config/env.js'

export const openai = new OpenAI({
  apiKey: env.openaiApiKey
})

export async function generateEmbedding(text) {
  const response = await openai.embeddings.create({
    model: env.openaiEmbeddingModel,
    input: text
  })

  return response.data[0].embedding
}

export async function generateAnswer({ question, context, mode = 'internal' }) {
  const isExternal = mode === 'external'

  const systemPrompt = isExternal
    ? `
Tu es un assistant d'information client pour une banque.

Règles strictes :
- Tu réponds uniquement avec le contexte fourni.
- Tu n'inventes jamais.
- Si le contexte ne contient pas la réponse, dis-le clairement puis propose une action utile (contacter un conseiller ou se rendre en agence).
- Si le contexte parle d'un autre sujet que la question, ne donne pas ces informations hors sujet.
- Tu ne mentionnes jamais les comptes bancaires, transactions ou systèmes internes sensibles.
- Tu réponds en français clair, professionnel, naturel et rassurant.
- Tu ne structures jamais la réponse avec "1.", "2.", "3.".
- Tu ne mentionnes jamais "Source documentaire".
- Tu ne cites pas les sources dans ta réponse texte.
`
    : `
Tu es le copilote interne d'une banque.

Règles strictes :
- Tu réponds uniquement avec le contexte fourni.
- Tu n'inventes jamais.
- Si le contexte ne contient pas l'information, tu dis clairement que l'information n'est pas disponible dans les documents accessibles.
- Tu ne mentionnes jamais les comptes bancaires, transactions ou systèmes internes sensibles.
- Tu réponds en français clair, professionnel et utile.
- Tu structures la réponse ainsi :
  1. Réponse courte
  2. Détails utiles
  3. Source documentaire
`

  const response = await openai.chat.completions.create({
    model: 'gpt-4.1-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content: systemPrompt
      },
      {
        role: 'user',
        content: `
Question :
${question}

Contexte documentaire autorisé :
${context}
`
      }
    ]
  })

  return response.choices?.[0]?.message?.content || "Je n’ai pas pu générer de réponse fiable."
}