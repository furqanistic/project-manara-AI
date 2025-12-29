// File: project-manara-AI/server/index.js
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
import stripeRoutes from './routes/stripe.js'
import threeDRoutes from './routes/threeD.js'

const app = express()
dotenv.config({ quiet: true })

// ============================================================================
// ✅ CRITICAL: CORS MIDDLEWARE MUST BE FIRST
// ============================================================================

const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins =
      process.env.NODE_ENV === 'production'
        ? [
            // Frontend domains
            'https://manaradesign.ai', // ✅ Your main frontend
            'https://www.manaradesign.ai', // www variant
            'https://app.manaradesign.ai', // app subdomain
            'https://design.manaradesign.ai', // design subdomain
            // Backend domain (for self-referencing requests)
            'https://api.manaradesign.ai',
          ]
        : [
            // Development domains
            'http://localhost:5173',
            'http://localhost:5174',
            'http://127.0.0.1:5173',
            'http://127.0.0.1:5174',
            'http://localhost:3000',
          ]

    console.log('========================================')
    console.log('🔍 CORS REQUEST RECEIVED')
    console.log('   Origin:', origin || 'NO ORIGIN (preflight or same-origin)')
    console.log('   NODE_ENV:', process.env.NODE_ENV)
    console.log('   Allowed origins:', allowedOrigins)

    if (!origin) {
      // Preflight or same-origin request
      console.log('   ✅ CORS ALLOWED (no origin header)')
      callback(null, true)
    } else if (allowedOrigins.includes(origin)) {
      console.log('   ✅ CORS ALLOWED (origin matched)')
      callback(null, true)
    } else {
      console.log('   ❌ CORS BLOCKED (origin not in list)')
      callback(new Error('Not allowed by CORS'))
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Content-Length', 'X-JSON-Response-Length'],
  maxAge: 86400, // 24 hours
}

app.use(cors(corsOptions))

// ============================================================================
// ✅ THEN apply other middleware
// ============================================================================

app.use(cookieParser())

// ✅ Special handling for Stripe Webhooks - MUST be before express.json()
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))



app.use('/api/auth/', authRoute)
app.use('/api/moodboards/', moodboardRoute)
app.use('/api/floorplans', floorPlanRoutes)
app.use('/api/3d', threeDRoutes)
app.use('/api/stripe', stripeRoutes)

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

// ============================================================================
// ✅ ERROR HANDLING MIDDLEWARE - INCLUDES CORS HEADERS
// ============================================================================

app.use((err, req, res, next) => {
  // Determine status code
  let statusCode = 500
  if (typeof err.status === 'number') {
    statusCode = err.status
  } else if (typeof err.statusCode === 'number') {
    statusCode = err.statusCode
  }

  const message = err.message || 'Something went wrong'

  console.error('========================================')
  console.error('❌ ERROR CAUGHT')
  console.error('   Status:', statusCode)
  console.error('   Message:', message)
  console.error('   Path:', req.path)
  console.error('   Stack:', err.stack)
  console.error('========================================')

  // ✅ CRITICAL: Send CORS headers with error responses
  // This ensures the browser doesn't block the error response
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*')
  res.header('Access-Control-Allow-Credentials', 'true')
  res.header(
    'Access-Control-Allow-Methods',
    'GET,HEAD,OPTIONS,POST,PUT,DELETE,PATCH'
  )
  res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization')
  res.header(
    'Access-Control-Expose-Headers',
    'Content-Length,X-JSON-Response-Length'
  )

  return res.status(statusCode).json({
    status: 'error',
    statusCode,
    message,
    timestamp: new Date().toISOString(),
  })
})

// ============================================================================
// Database connection
// ============================================================================

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
const isProduction = process.env.NODE_ENV === 'production'

app.listen(PORT, () => {
  connect()
  console.log(`🚀 Server running on port ${PORT}`)
  console.log(
    `📍 API: ${
      isProduction ? 'https://api.manaradesign.ai' : `http://localhost:${PORT}`
    }`
  )
  console.log(
    `🎨 Frontend: ${
      isProduction ? 'https://manaradesign.ai' : process.env.FRONTEND_URL || 'http://localhost:5173'
    }`
  )
  console.log(`📌 NODE_ENV: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🎨 Moodboard generation with Gemini 2.5 Flash Image enabled`)
  console.log('========================================')
})
