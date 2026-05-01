import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

export function signAccessToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      bank_id: user.bank_id,
      role: user.role,
      access_level: user.access_level,
      email: user.email,
      full_name: user.full_name
    },
    env.jwtSecret,
    { expiresIn: env.jwtExpiresIn }
  )
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret)
}