import { ok } from '../utils/responses.js'

export function getHealth(req, res) {
  return ok(
    res,
    {
      app: 'Banque IA API',
      status: 'running',
      timestamp: new Date().toISOString()
    },
    'API opérationnelle'
  )
}