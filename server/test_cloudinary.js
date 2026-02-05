import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { uploadImage, uploadRaw } from './services/cloudinaryService.js'

dotenv.config({ path: './.env' })

async function testCloudinary() {
  console.log('🚀 Starting Cloudinary Verification...')
  
  try {
    // 1. Test Image Upload
    console.log('\n📸 Testing Image Upload...')
    const uploadsDir = path.join(process.cwd(), 'uploads')
    const sampleImagePath = path.join(uploadsDir, 'test-image.png')
    
    // Create a dummy image if it doesn't exist for testing
    if (!fs.existsSync(sampleImagePath)) {
        const dummyBuffer = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true })
        }
        fs.writeFileSync(sampleImagePath, dummyBuffer)
    }

    const imageBuffer = fs.readFileSync(sampleImagePath)
    const imgResult = await uploadImage(imageBuffer, 'manara-ai/test')
    console.log('✅ Image Upload Success!')
    console.log('🔗 URL:', imgResult.secure_url)

    // 2. Test Raw File Upload (GLB)
    console.log('\n📦 Testing Raw File (GLB) Upload...')
    const dummyGlb = Buffer.from('glTF', 'utf-8')
    const glbResult = await uploadRaw(dummyGlb, 'manara-ai/test-models')
    console.log('✅ GLB Upload Success!')
    console.log('🔗 URL:', glbResult.secure_url)

    console.log('\n🎉 All Cloudinary tests passed!')
  } catch (error) {
    console.error('\n❌ Cloudinary Verification Failed:', error.message)
    if (error.http_code) console.error('HTTP Code:', error.http_code)
  }
}

testCloudinary()
