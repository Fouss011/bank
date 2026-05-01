import { z } from 'zod'
import { hashPassword } from '../utils/password.js'
import {
  createUser,
  deleteUserById,
  findUserByEmail,
  listUsersByBank,
  updateUserById
} from '../repositories/usersRepository.js'

const createUserSchema = z.object({
  full_name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.enum(['bank_admin', 'employee']).default('employee'),
  access_level: z.enum(['P1', 'P2', 'P3']).default('P1'),
  department: z.string().optional().nullable()
})

const updateUserSchema = z.object({
  full_name: z.string().min(2).optional(),
  role: z.enum(['bank_admin', 'employee']).optional(),
  access_level: z.enum(['P1', 'P2', 'P3']).optional(),
  department: z.string().optional().nullable(),
  is_active: z.boolean().optional()
})

export async function getBankUsers(user) {
  return listUsersByBank(user.bank_id)
}

export async function createBankUser(input, currentUser) {
  const payload = createUserSchema.parse(input)

  const existing = await findUserByEmail(payload.email.toLowerCase())
  if (existing) {
    const error = new Error('Un utilisateur existe déjà avec cet email')
    error.status = 409
    throw error
  }

  const password_hash = await hashPassword(payload.password)

  return createUser({
    bank_id: currentUser.bank_id,
    full_name: payload.full_name,
    email: payload.email.toLowerCase(),
    password_hash,
    role: payload.role,
    access_level: payload.access_level,
    department: payload.department || null
  })
}

export async function updateBankUser(userId, input, currentUser) {
  const payload = updateUserSchema.parse(input)

  return updateUserById({
    userId,
    bankId: currentUser.bank_id,
    payload
  })
}

export async function deleteBankUser(userId, currentUser) {
  if (userId === currentUser.id) {
    const error = new Error('Vous ne pouvez pas supprimer votre propre compte')
    error.status = 400
    throw error
  }

  await deleteUserById({
    userId,
    bankId: currentUser.bank_id
  })

  return { deleted: true }
}