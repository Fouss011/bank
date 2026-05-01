import { supabase } from '../config/supabaseClient.js'

export async function findUserByEmail(email) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function findUserById(id) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function updateLastLogin(userId) {
  const { error } = await supabase
    .from('users')
    .update({ last_login_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw error
}

export async function createUser(payload) {
  const { data, error } = await supabase
    .from('users')
    .insert(payload)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function listUsersByBank(bankId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, bank_id, full_name, email, role, access_level, department, is_active, last_login_at, created_at')
    .eq('bank_id', bankId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function updateUserById({ userId, bankId, payload }) {
  const { data, error } = await supabase
    .from('users')
    .update(payload)
    .eq('id', userId)
    .eq('bank_id', bankId)
    .select('id, bank_id, full_name, email, role, access_level, department, is_active, last_login_at, created_at')
    .single()

  if (error) throw error
  return data
}

export async function deleteUserById({ userId, bankId }) {
  const { error } = await supabase
    .from('users')
    .delete()
    .eq('id', userId)
    .eq('bank_id', bankId)

  if (error) throw error
}