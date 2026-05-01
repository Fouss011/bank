import { ok } from '../utils/responses.js'
import { askExternalCopilot } from '../services/externalChatService.js'

export async function askExternal(req, res, next) {
  try {
    const result = await askExternalCopilot(req.body)
    return ok(res, result, 'Réponse générée')
  } catch (error) {
    next(error)
  }
}