import { supabase } from '../config/supabaseClient.js'

export async function createChatSession({ bankId, userId, scope, sessionTitle }) {
  const { data, error } = await supabase
    .from('chat_sessions')
    .insert({
      bank_id: bankId,
      user_id: userId,
      scope,
      session_title: sessionTitle || null
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export async function createChatMessage({ sessionId, actor, content, citations = null }) {
  const { data, error } = await supabase
    .from('chat_messages')
    .insert({
      session_id: sessionId,
      actor,
      content,
      citations
    })
    .select()
    .single()

  if (error) throw error
  return data
}