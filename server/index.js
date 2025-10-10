// File: server/index.js
import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
// Import routes
import authRoute from './routes/auth.js'
import moodboardRoute from './routes/moodboard.js'

const app = express()
dotenv.config({ quiet: true })

app.use(cookieParser())
app.use(express.json({ limit: '50mb' })) // Increased limit for base64 images
app.use(express.urlencoded({ limit: '50mb', extended: true }))

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? ['https://manaradesign.ai', 'https://api.manaradesign.ai']
        : ['http://localhost:5173', 'http://localhost:5174']

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}
app.use(cors(corsOptions))
// Routes
app.use('/api/auth/', authRoute)
app.use('/api/moodboards/', moodboardRoute)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  // Ensure status code is a number
  let statusCode = 500
  if (typeof err.status === 'number') {
    statusCode = err.status
  } else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode
  }

  const message = err.message || 'Something went wrong'

  console.error('Error:', {
    statusCode,
    message,
    stack: err.stack,
  })

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
  })
})

// Database connection
const connect = () => {
  mongoose
    .connect(process.env.MONGO)
    .then(() => {
      console.log('✅ Connected to MongoDB')
    })
    .catch((err) => {
      console.error('❌ MongoDB connection error:', err)
      process.exit(1)
    })
}

const PORT = process.env.PORT || 8800
app.listen(PORT, () => {
  connect()
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(`🎨 Moodboard generation with Gemini 2.5 Flash Image enabled`)
})
