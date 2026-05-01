import dotenv from 'dotenv'

dotenv.config()

function requireEnv(name, fallback = undefined) {
  const value = process.env[name] ?? fallback

  if (value === undefined || value === null || value === '') {
    throw new Error(`Variable d'environnement manquante: ${name}`)
  }

  return value
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  appOrigin: process.env.APP_ORIGIN || 'http://localhost:5173',

  supabaseUrl: requireEnv('SUPABASE_URL'),
  supabaseServiceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),

  jwtSecret: requireEnv('JWT_SECRET'),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '12h',

  openaiApiKey: requireEnv('OPENAI_API_KEY'),
  openaiEmbeddingModel: process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
}