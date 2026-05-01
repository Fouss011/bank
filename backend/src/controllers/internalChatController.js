import { ok } from '../utils/responses.js'
import { askInternalCopilot } from '../services/internalChatService.js'

export async function askInternal(req, res, next) {
  try {
    const result = await askInternalCopilot(req.body, req.user)
    return ok(res, result, 'Réponse générée')
  } catch (error) {
    next(error)
  }
}