import axios from 'axios'
import { createError } from '../error.js'

/**
 * Download Proxy - Bypasses CORS restrictions by fetching the image server-side
 * and sending it back with proper Content-Disposition headers
 */
export const downloadProxy = async (req, res, next) => {
  try {
    const { url, filename } = req.query

    if (!url) {
      return next(createError(400, 'URL parameter is required'))
    }

    console.log(`📥 Proxying download for: ${url}`)

    // Fetch the image from the external URL
    const response = await axios.get(url, {
      responseType: 'arraybuffer',
      timeout: 30000, // 30 second timeout
    })

    // Determine content type
    const contentType = response.headers['content-type'] || 'image/png'
    
    // Set download filename
    const downloadFilename = filename || `manara-download-${Date.now()}.png`

    // Send the image back with download headers
    res.set({
      'Content-Type': contentType,
      'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      'Content-Length': response.data.length,
    })

    res.send(Buffer.from(response.data))
  } catch (error) {
    console.error('Download proxy error:', error.message)
    next(createError(500, 'Failed to download image'))
  }
}
