import { HfInference } from "@huggingface/inference"
import axios from 'axios'
import { Blob } from 'buffer'
import dotenv from 'dotenv'
import { createParser } from 'eventsource-parser'
import fs from 'fs'
import https from 'https'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

dotenv.config()

const HF_TOKEN = process.env.HF_TOKEN
const SPACE_ID = process.env.TRELLIS_SPACE_ID || 'ManaraD/Hunyuan3D-2.1'
const hf = new HfInference(HF_TOKEN)

/**
 * Generate a 3D model using Hunyuan3D via Hugging Face Space API
 * @param {Buffer} imageBuffer - The input image buffer
 * @param {string} mimeType - Image mime type
 * @param {Object} options - Generation options
 * @returns {Promise<{url: string, path: string}>} - The local URL and path to the generated GLB file
 */
export const generateHunyuan3DModel = async (imageBuffer, mimeType, options = {}) => {
  if (!HF_TOKEN) {
    throw new Error('HF_TOKEN is not defined in environment variables')
  }

  try {
    console.log(`Using Hugging Face Inference for Space: ${SPACE_ID}...`)
    
    // 1. Upload the image to Hugging Face Space
    console.log('Uploading image to Space...')
    
    // We need to upload the image to the space's server to get a temporary path
    // Gradio spaces usually have an /upload endpoint
    const SPACE_URL = `https://${SPACE_ID.replace('/', '-').replace(/\./g, '-').toLowerCase()}.hf.space`
    
    const formData = new FormData()
    const blob = new Blob([imageBuffer], { type: mimeType })
    formData.append('files', blob, 'input.png')

    const uploadRes = await axios.post(`${SPACE_URL}/upload`, formData, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
      }
    })

    if (!uploadRes.data || !uploadRes.data[0]) {
      throw new Error('Failed to upload image to Space')
    }

    const tempImagePath = uploadRes.data[0]
    console.log('Image uploaded successfully:', tempImagePath)

    // 2. Join the queue for /generation_all (fn_index: 5)
    console.log('Joining queue for /generation_all...')
    const session_hash = uuidv4().substring(0, 10)
    
    const joinRes = await axios.post(`${SPACE_URL}/queue/join`, {
      data: [
        { path: tempImagePath }, // image
        { path: tempImagePath }, // mv_image_front
        { path: tempImagePath }, // mv_image_back
        { path: tempImagePath }, // mv_image_left
        { path: tempImagePath }, // mv_image_right
        options.steps || 30,
        options.guidance_scale || 5,
        options.seed || 1234,
        options.octree_resolution || 256,
        options.check_box_rembg !== undefined ? options.check_box_rembg : true,
        options.num_chunks || 8000,
        options.randomize_seed !== undefined ? options.randomize_seed : true
      ],
      fn_index: 5, // Correct fn_index for /generation_all
      session_hash
    }, {
      headers: {
        'Authorization': `Bearer ${HF_TOKEN}`,
        'Content-Type': 'application/json'
      }
    })

    if (joinRes.status !== 200) {
      throw new Error(`Failed to join queue: ${joinRes.statusText}`)
    }

    // 3. Listen to SSE stream for fulfillment
    return new Promise((resolve, reject) => {
      console.log('Listening to queue stream...')
      
      const eventUrl = `${SPACE_URL}/queue/data?session_hash=${session_hash}`
      
      const req = https.get(eventUrl, {
        headers: {
          'Authorization': `Bearer ${HF_TOKEN}`
        }
      }, (res) => {
        const parser = createParser({
          onEvent: (event) => {
            if (event.type === 'event') {
              try {
                const data = JSON.parse(event.data)
                console.log('Queue Event:', data.msg, data.progress_data?.[0]?.desc || '')

                if (data.msg === 'process_completed') {
                  if (data.success && data.output && data.output.data) {
                    const resultData = data.output.data
                    // Returns: [0] base mesh, [1] textured mesh, [2] HTML, [3] stats, [4] seed
                    let glbFile = resultData[1] || resultData[0]
                    
                    if (!glbFile || (!glbFile.url && !glbFile.name)) {
                      reject(new Error('No GLB file returned in process_completed'))
                      return
                    }

                    const fileUrl = glbFile.url || `${SPACE_URL}/file=${glbFile.name}`
                    console.log('Generating local copy from:', fileUrl)
                    
                    // Download the result
                    downloadAndSave(fileUrl, HF_TOKEN).then(resolve).catch(reject)
                  } else {
                    reject(new Error(`Process completed but failed: ${JSON.stringify(data.output?.error || 'Unknown error')}`))
                  }
                  req.destroy()
                } else if (data.msg === 'queue_full') {
                  reject(new Error('Hugging Face Space queue is full. Please try again later.'))
                  req.destroy()
                } else if (data.msg === 'process_starts') {
                  console.log('GPU processing started...')
                }
              } catch (e) {
                console.error('Error parsing queue event data:', e)
              }
            }
          }
        })

        res.on('data', (chunk) => {
          parser.feed(chunk.toString())
        })

        res.on('error', (err) => {
          reject(new Error(`Stream error: ${err.message}`))
        })
      })

      req.on('error', (err) => {
        reject(new Error(`Request error: ${err.message}`))
      })

      // Timeout safety (5 minutes)
      setTimeout(() => {
        req.destroy()
        reject(new Error('Generation timed out after 5 minutes'))
      }, 300000)
    })
  } catch (error) {
    console.error('Error in HF service:', error.response?.data || error.message)
    throw new Error(`Failed to generate 3D model: ${error.message}`)
  }
}

/**
 * Helper to download and save GLB file
 */
async function downloadAndSave(fileUrl, token) {
  const response = await axios.get(fileUrl, { 
    responseType: 'arraybuffer',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  })
  
  const glbBuffer = Buffer.from(response.data)
  const filename = `hunyuan-${uuidv4()}.glb`
  const uploadsDir = path.join(process.cwd(), 'uploads', '3d')
  const filePath = path.join(uploadsDir, filename)

  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true })
  }

  fs.writeFileSync(filePath, glbBuffer)
  console.log('Saved generated GLB model to:', filePath)

  return {
    url: `/uploads/3d/${filename}`,
    path: filePath,
  }
}
