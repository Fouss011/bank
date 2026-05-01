import { verifyAccessToken } from '../utils/jwt.js'
import { findUserById } from '../repositories/usersRepository.js'

export async function requireAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization || ''

    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token manquant'
      })
    }

    const token = authHeader.replace('Bearer ', '').trim()
    const decoded = verifyAccessToken(token)

    const user = await findUserById(decoded.sub)
    if (!user || !user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non autorisé'
      })
    }

    req.user = {
      id: user.id,
      bank_id: user.bank_id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      access_level: user.access_level
    }

    next()
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré'
    })
  }
}