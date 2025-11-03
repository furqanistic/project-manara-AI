import cookieParser from 'cookie-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import mongoose from 'mongoose'
// Import routes
import fs from 'fs'
import path from 'path'
import authRoute from './routes/auth.js'
import floorPlanRoutes from './routes/floorPlan.js'
import moodboardRoute from './routes/moodboard.js'
const app = express()
dotenv.config({ quiet: true })

// ✅ CRITICAL: Apply CORS middleware FIRST (before any other middleware)
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [
            'https://manaradesign.ai',
            'https://www.manaradesign.ai',
            'https://api.manaradesign.ai',
          ]
        : [
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
          ]

    console.log(
      'CORS Check - Origin:',
      origin,
      'NODE_ENV:',
      process.env.NODE_ENV
    )

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true)
    } else {
      console.warn('CORS rejected origin:', origin)
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))

// Then apply other middleware
app.use(cookieParser())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Routes
app.use('/api/auth/', authRoute)
app.use('/api/moodboards/', moodboardRoute)
app.use('/api/floorplans', floorPlanRoutes)

const uploadsDir = path.join(process.cwd(), 'uploads/furniture')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// Serve uploaded images
app.use('/uploads', express.static('uploads'))

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  })
})

// ✅ IMPROVED Error handling middleware (now includes CORS headers via middleware)
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

  // ✅ CRITICAL: Send CORS headers with error responses
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH'
  )
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
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
  console.log(`📍 NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
})
