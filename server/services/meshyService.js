import axios from 'axios'
import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const MESHY_API_KEY = process.env.MESHY_API_KEY
const MESHY_API_URL = 'https://api.meshy.ai/v2/image-to-3d'

/**
 * Generate a 3D model using Meshy AI
 * @param {Buffer} imageBuffer - The image buffer
 * @param {string} mimeType - The mime type
 * @returns {Promise<Object>} - The generated model URL and metadata
 */
export const generateMeshyModel = async (imageBuffer, mimeType) => {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY is not defined')
  }

  try {
    console.log('🚀 Starting Meshy AI 3D generation...')

    // 1. Create Task
    const headers = {
      Authorization: `Bearer ${MESHY_API_KEY}`,
      'Content-Type': 'application/json',
    }

    const dataUri = `data:${mimeType};base64,${imageBuffer.toString('base64')}`

    const payload = {
      image_url: dataUri,
      enable_pbr: true,
      should_remesh: true,
    }

    const createResponse = await axios.post(MESHY_API_URL, payload, { headers })
    const taskId = createResponse.data.result
    
    console.log(`✅ Meshy Task Created: ${taskId}`)

    // 2. Poll for Completion
    const modelUrls = await pollMeshyTask(taskId, headers)
    
    // 3. Download and Save GLB
    return await downloadAndSaveModel(modelUrls.glb, taskId)

  } catch (error) {
    console.error('❌ Meshy API Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to generate 3D model with Meshy')
  }
}

/**
 * Poll Meshy API for task completion
 */
const pollMeshyTask = async (taskId, headers) => {
  const maxRetries = 120 // 10 minutes (5s interval)
  let retries = 0

  while (retries < maxRetries) {
    await new Promise((resolve) => setTimeout(resolve, 5000))
    retries++

    try {
      const response = await axios.get(`${MESHY_API_URL}/${taskId}`, { headers })
      const status = response.data.status
      const progress = response.data.progress

      console.log(`⏳ Meshy Task ${taskId}: ${status} (${progress}%)`)

      if (status === 'SUCCEEDED') {
        return response.data.model_urls
      } else if (status === 'FAILED' || status === 'EXPIRED') {
        throw new Error(`Meshy task failed with status: ${status}`)
      }
    } catch (error) {
      if (error.message.includes('Meshy task failed')) throw error
      console.warn('Network error while polling, continuing...', error.message)
    }
  }

  throw new Error('Meshy task timed out')
}

/**
 * Download GLB file and save locally
 */
const downloadAndSaveModel = async (glbUrl, taskId) => {
    console.log(`⬇️ Downloading GLB from: ${glbUrl}`)
    
    const response = await axios.get(glbUrl, { responseType: 'arraybuffer' })
    const buffer = Buffer.from(response.data)
    
    const filename = `meshy-${taskId}.glb`
    const uploadsDir = path.join(process.cwd(), 'uploads/3d')
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    const filePath = path.join(uploadsDir, filename)
    fs.writeFileSync(filePath, buffer)
    
    console.log(`💾 Saved GLB to: ${filePath}`)
    
    return {
        url: `/uploads/3d/${filename}`,
        path: filePath,
        meshyId: taskId
    }
}
