import { z } from 'zod'
import { comparePassword, hashPassword } from '../utils/password.js'
import { signAccessToken } from '../utils/jwt.js'
import {
  createUser,
  findUserByEmail,
  findUserById,
  updateLastLogin
} from '../repositories/usersRepository.js'

const registerSchema = z.object({
  bank_id: z.string().uuid(),
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['super_admin', 'bank_admin', 'employee']).optional(),
  access_level: z.enum(['P1', 'P2', 'P3']).optional(),
  department: z.string().optional().nullable()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
})

export async function registerUser(input) {
  const payload = registerSchema.parse(input)

  const existingUser = await findUserByEmail(payload.email)
  if (existingUser) {
    const error = new Error('Un utilisateur avec cet email existe déjà')
    error.status = 409
    throw error
  }

  const password_hash = await hashPassword(payload.password)

  const user = await createUser({
    bank_id: payload.bank_id,
    full_name: payload.full_name,
    email: payload.email.toLowerCase(),
    password_hash,
    role: payload.role || 'employee',
    access_level: payload.access_level || 'P1',
    department: payload.department || null
  })

  const token = signAccessToken(user)

  return {
    user: sanitizeUser(user),
    token
  }
}

export async function loginUser(input) {
  const payload = loginSchema.parse(input)

  const user = await findUserByEmail(payload.email.toLowerCase())
  if (!user) {
    const error = new Error('Identifiants invalides')
    error.status = 401
    throw error
  }

  const isValidPassword = await comparePassword(payload.password, user.password_hash)
  if (!isValidPassword) {
    const error = new Error('Identifiants invalides')
    error.status = 401
    throw error
  }

  await updateLastLogin(user.id)

  const token = signAccessToken(user)

  return {
    user: sanitizeUser(user),
    token
  }
}

export async function getCurrentUser(userId) {
  const user = await findUserById(userId)

  if (!user) {
    const error = new Error('Utilisateur introuvable')
    error.status = 404
    throw error
  }

  return sanitizeUser(user)
}

function sanitizeUser(user) {
  return {
    id: user.id,
    bank_id: user.bank_id,
    full_name: user.full_name,
    email: user.email,
    role: user.role,
    access_level: user.access_level,
    department: user.department,
    is_active: user.is_active,
    last_login_at: user.last_login_at,
    created_at: user.created_at
  }
}