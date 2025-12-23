import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const GRADIO_SPACE_URL = 'https://stabilityai-stable-fast-3d.hf.space'

/**
 * Generate a 3D model (GLB) from an image using Stability AI's SF3D via direct HTTP API.
 * Uses base64 data URI for image upload compatibility.
 * @param {Buffer} imageBuffer - The image buffer to process.
 * @param {string} mimeType - The mime type of the image.
 * @returns {Promise<Object>} - Information about the generated GLB file.
 */
export const generate3DModel = async (imageBuffer, mimeType) => {
  try {
    console.log('Starting 3D generation with Stable Fast 3D (SF3D)...')
    console.log('Image size:', imageBuffer.length, 'bytes, type:', mimeType)
    
    // Convert image to base64 data URI
    const base64Image = imageBuffer.toString('base64')
    const dataUri = `data:${mimeType};base64,${base64Image}`
    console.log('Image converted to base64, length:', dataUri.length)
    
    // Generate a session hash for this request
    const sessionHash = uuidv4().slice(0, 11)
    
    // Step 1: Join the queue
    console.log('Step 1: Joining Gradio queue...')
    
    const queuePayload = {
      data: [
        dataUri,    // Image as base64 data URI
        0.85,       // Foreground Ratio
        'None',     // Remeshing
        -1,         // Target Vertex Count
        1024,       // Texture Size
      ],
      fn_index: 5,
      session_hash: sessionHash,
    }
    
    const queueResponse = await fetch(`${GRADIO_SPACE_URL}/queue/join`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(queuePayload),
    })
    
    if (!queueResponse.ok) {
      const errorText = await queueResponse.text()
      console.error('Queue join failed:', queueResponse.status, errorText)
      throw new Error(`Queue join failed: ${queueResponse.status}`)
    }
    
    const queueResult = await queueResponse.json()
    console.log('Queue join result:', queueResult)
    
    // Step 2: Poll for result using SSE or data endpoint
    console.log('Step 2: Waiting for generation result...')
    
    // Use the /queue/data endpoint to get results
    const eventSource = `${GRADIO_SPACE_URL}/queue/data?session_hash=${sessionHash}`
    
    let result = null
    let retries = 0
    const maxRetries = 60 // 5 minutes max (5 second intervals)
    
    while (!result && retries < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 5000))
      
      try {
        const statusResponse = await fetch(`${GRADIO_SPACE_URL}/queue/status`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ session_hash: sessionHash }),
        })
        
        if (statusResponse.ok) {
          const status = await statusResponse.json()
          console.log('Status:', status)
          
          if (status.data && status.data.length >= 2) {
            result = status.data
            break
          }
          
          if (status.msg === 'process_completed') {
            if (status.success && status.output?.data) {
              result = status.output.data
            }
            break
          }
        }
      } catch (e) {
        console.log('Status check error:', e.message)
      }
      
      retries++
    }
    
    if (!result) {
      throw new Error('Timed out waiting for 3D generation')
    }
    
    console.log('Generation complete. Result:', JSON.stringify(result, null, 2))
    
    // Extract the 3D model URL
    const modelData = result[1]
    let glbUrl = null
    
    if (modelData?.url) {
      glbUrl = modelData.url
    } else if (modelData?.path) {
      glbUrl = `${GRADIO_SPACE_URL}/file=${modelData.path}`
    }
    
    if (!glbUrl) {
      console.error('Could not extract model URL:', modelData)
      throw new Error('Failed to get 3D model URL')
    }
    
    console.log('3D model URL:', glbUrl)
    
    // Step 3: Download and save the GLB file
    console.log('Step 3: Downloading 3D model...')
    
    const uploadsDir = path.join(process.cwd(), 'uploads/3d')
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }

    const glbFilename = `${uuidv4()}.glb`
    const glbPath = path.join(uploadsDir, glbFilename)
    
    const downloadResponse = await fetch(glbUrl)
    
    if (!downloadResponse.ok) {
      throw new Error(`Failed to download: ${downloadResponse.status}`)
    }
    
    const glbBuffer = await downloadResponse.arrayBuffer()
    fs.writeFileSync(glbPath, Buffer.from(glbBuffer))

    console.log(`GLB saved to: ${glbPath} (${glbBuffer.byteLength} bytes)`)

    return {
      success: true,
      filename: glbFilename,
      url: `/uploads/3d/${glbFilename}`,
      path: glbPath
    }
  } catch (error) {
    console.error('Error in generate3DModel:', error)
    throw new Error(error.message || 'Failed to generate 3D model')
  }
}
