import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const HF_API_URL = 'https://api-inference.huggingface.co/models/stabilityai/TripoSR'
const HF_TOKEN = process.env.HF_TOKEN

/**
 * Generate a 3D model using TripoSR via Hugging Face API
 * @param {Buffer} imageBuffer - The 2D floor plan image buffer
 * @param {string} mimeType - Image mime type
 * @returns {Promise<{url: string, path: string}>} - The local URL and path to the generated GLB file
 */
export const generateTripoSRModel = async (imageBuffer, mimeType) => {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined in environment variables')
  }

  try {
    console.log('Sending request to Hugging Face TripoSR API...')

    // Convert buffer to base64 data URI if needed, but HF Inference usually accepts raw bytes or base64 JSON
    // Standard HF Inference API for image-to-3d might vary, but typically accepts binary or json with "inputs"
    // For many image models, sending raw bytes is supported. Let's try sending raw bytes first.
    
    // NOTE: TripoSR on HF Inference might expect a specific input format. 
    // Usually it's: { "inputs": "base64_string" } or just raw bytes data.
    // Let's try the JSON payload with base64 string which is safer for many HF endpoints.
    
    const base64Image = imageBuffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64Image}`

    const response = await axios.post(
      HF_API_URL,
      { inputs: dataUri },
      {
        headers: {
          Authorization: `Bearer ${HF_TOKEN}`,
          'Content-Type': 'application/json',
          'x-use-cache': 'false' 
        },
        responseType: 'arraybuffer', // We expect a binary GLB file back
      }
    )

    console.log('Received response from Hugging Face. Status:', response.status)

    // Verify content type if possible, but we'll assume it's the model file
    // Generate a unique filename
    const filename = `triposr-${uuidv4()}.glb`
    const uploadsDir = path.join(process.cwd(), 'uploads', '3d')
    const filePath = path.join(uploadsDir, filename)

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    // Write binary data to file
    fs.writeFileSync(filePath, response.data)
    console.log('Saved generated GLB model to:', filePath)

    // Return the local URL and path
    return {
      url: `/uploads/3d/${filename}`,
      path: filePath,
    }
  } catch (error) {
    console.error('Error generating TripoSR model:', error.response?.data?.toString() || error.message)
    
    if (error.response?.status === 503) {
      throw new Error('TripoSR model is currently loading (503). Please try again in a few moments.')
    }
    
    if (error.response?.status === 429) {
      throw new Error('Hugging Face API rate limit reached. Please try again later.')
    }

    throw new Error('Failed to generate 3D model via TripoSR.')
  }
}
