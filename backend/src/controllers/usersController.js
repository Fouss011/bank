import { ok } from '../utils/responses.js'
import {
  createBankUser,
  deleteBankUser,
  getBankUsers,
  updateBankUser
} from '../services/usersService.js'

export async function listUsers(req, res, next) {
  try {
    const users = await getBankUsers(req.user)
    return ok(res, { users }, 'Utilisateurs récupérés')
  } catch (error) {
    next(error)
  }
}

export async function createUser(req, res, next) {
  try {
    const user = await createBankUser(req.body, req.user)
    return ok(res, { user }, 'Utilisateur créé', 201)
  } catch (error) {
    next(error)
  }
}

export async function updateUser(req, res, next) {
  try {
    const user = await updateBankUser(req.params.id, req.body, req.user)
    return ok(res, { user }, 'Utilisateur modifié')
  } catch (error) {
    next(error)
  }
}

export async function deleteUser(req, res, next) {
  try {
    const result = await deleteBankUser(req.params.id, req.user)
    return ok(res, result, 'Utilisateur supprimé')
  } catch (error) {
    next(error)
  }
}