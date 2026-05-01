import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'

import routes from './routes/index.js'
import { env } from './config/env.js'
import { notFound } from './middleware/notFound.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174'
]

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true)
      }

      return callback(new Error(`CORS refusé pour origin: ${origin}`))
    },
    credentials: true
  })
)

app.use(
  helmet({
    crossOriginResourcePolicy: false
  })
)

app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Bienvenue sur Banque IA API'
  })
})

app.use('/api', routes)

app.use(notFound)
app.use(errorHandler)

export default app