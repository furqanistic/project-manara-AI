import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

const MESHY_API_KEY = process.env.MESHY_API_KEY
const MESHY_API_URL = 'https://api.meshy.ai/openapi/v1/image-to-3d'

/**
 * Step 1: Create a 3D model generation task
 */
export const createMeshyTask = async (imageBuffer, mimeType) => {
  if (!MESHY_API_KEY) {
    throw new Error('MESHY_API_KEY is not defined')
  }

  try {
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

    const response = await axios.post(MESHY_API_URL, payload, { headers })
    return response.data.result // Task ID
  } catch (error) {
    console.error('❌ Meshy Create Task Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to start 3D generation')
  }
}

/**
 * Step 2: Check status of a task
 */
export const getMeshyTaskStatus = async (taskId) => {
  const headers = { Authorization: `Bearer ${MESHY_API_KEY}` }
  try {
    const response = await axios.get(`${MESHY_API_URL}/${taskId}`, { headers })
    return response.data
  } catch (error) {
    console.error('❌ Meshy Get Status Error:', error.response?.data || error.message)
    throw new Error(error.response?.data?.message || 'Failed to check task status')
  }
}

/**
 * Step 3: Handle the successful result
 */
export const processMeshyResult = async (taskId, modelUrls) => {
  return {
    url: modelUrls?.glb || modelUrls?.glb_url || modelUrls?.glbUrl || null,
    meshyId: taskId
  }
}
