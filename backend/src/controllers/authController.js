import { ok } from '../utils/responses.js'
import { getCurrentUser, loginUser, registerUser } from '../services/authService.js'

export async function register(req, res, next) {
  try {
    const result = await registerUser(req.body)
    return ok(res, result, 'Utilisateur créé', 201)
  } catch (error) {
    next(error)
  }
}

export async function login(req, res, next) {
  try {
    const result = await loginUser(req.body)
    return ok(res, result, 'Connexion réussie')
  } catch (error) {
    next(error)
  }
}

export async function me(req, res, next) {
  try {
    const user = await getCurrentUser(req.user.id)
    return ok(res, { user }, 'Profil récupéré')
  } catch (error) {
    next(error)
  }
}