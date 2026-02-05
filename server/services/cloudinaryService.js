import { v2 as cloudinary } from 'cloudinary'
import dotenv from 'dotenv'

dotenv.config()

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API,
  api_secret: process.env.CLOUDINARY_SECRET,
})

/**
 * Upload an image (buffer or base64) to Cloudinary
 * @param {Buffer|String} fileData - The file data to upload
 * @param {String} folder - Optional folder name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadImage = (fileData, folder = 'manara-ai') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'image',
    }

    // Check if it's a buffer or string
    if (Buffer.isBuffer(fileData) || (typeof fileData === 'string' && !fileData.startsWith('data:'))) {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }).end(fileData)
    } else {
        // Assume base64 string
        cloudinary.uploader.upload(fileData, uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
    }
  })
}

/**
 * Upload a video (buffer or base64) to Cloudinary
 * @param {Buffer|String} fileData - The file data to upload
 * @param {String} folder - Optional folder name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadVideo = (fileData, folder = 'manara-ai/videos') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder,
      resource_type: 'video',
    }

    if (Buffer.isBuffer(fileData)) {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }).end(fileData)
    } else {
        cloudinary.uploader.upload(fileData, uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
    }
  })
}

/**
 * Upload a raw file (like .glb) to Cloudinary
 * @param {Buffer|String} fileData - The file data to upload
 * @param {String} folder - Optional folder name
 * @returns {Promise<Object>} - Cloudinary upload result
 */
export const uploadRaw = (fileData, folder = 'manara-ai/3d-models') => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
        folder,
        resource_type: 'raw',
    }

    if (Buffer.isBuffer(fileData)) {
        cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        }).end(fileData)
    } else {
        cloudinary.uploader.upload(fileData, uploadOptions, (error, result) => {
          if (error) return reject(error)
          resolve(result)
        })
    }
  })
}

/**
 * Delete an asset from Cloudinary
 * @param {String} url - The URL of the asset to delete
 * @param {String} resourceType - The resource type ('image', 'video', or 'raw')
 * @returns {Promise<Object>} - Cloudinary deletion result
 */
export const deleteAsset = (url, resourceType = 'image') => {
  return new Promise((resolve, reject) => {
    if (!url) return resolve({ result: 'not_found' })

    try {
      // Extract public ID from URL
      // Example: https://res.cloudinary.com/demo/image/upload/v12345678/sample.jpg -> sample
      // For folders: manara-ai/moodboards/abc1234 -> manara-ai/moodboards/abc1234
      const parts = url.split('/')
      const lastPart = parts[parts.length - 1]
      const folderParts = parts.slice(parts.indexOf('upload') + 2, parts.length - 1)
      const publicIdWithExtension = lastPart.split('?')[0] // remove query params
      const publicId = publicIdWithExtension.split('.')[0]
      
      const fullPublicId = folderParts.length > 0 
        ? [...folderParts, publicId].join('/')
        : publicId

      console.log(`🗑️ Deleting Cloudinary asset: ${fullPublicId} (${resourceType})`)
      
      cloudinary.uploader.destroy(fullPublicId, { resource_type: resourceType }, (error, result) => {
        if (error) {
          console.error('❌ Cloudinary deletion error:', error)
          return reject(error)
        }
        resolve(result)
      })
    } catch (error) {
      console.error('❌ Error parsing Cloudinary URL:', error)
      resolve({ result: 'error', message: 'Failed to parse URL' })
    }
  })
}

export default {
    uploadImage,
    uploadVideo,
    uploadRaw,
    deleteAsset
}
