import { hasRequiredAccessLevel } from '../utils/permissions.js'

export function requireAccessLevel(requiredLevel) {
  return function (req, res, next) {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié'
      })
    }

    const allowed = hasRequiredAccessLevel(req.user.access_level, requiredLevel)

    if (!allowed) {
      return res.status(403).json({
        success: false,
        message: `Accès refusé: niveau ${requiredLevel} requis`
      })
    }

    next()
  }
}