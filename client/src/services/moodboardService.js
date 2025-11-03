// File: client/src/services/moodboardService.js
import axiosInstance from '../config/config'

/**
 * Create a new moodboard
 * @param {Object} data - Moodboard data
 * @returns {Promise}
 */
export const createMoodboard = async (data) => {
  const response = await axiosInstance.post('/moodboards/', data)
  return response.data
}

/**
 * Generate images for a moodboard
 * @param {String} moodboardId - ID of the moodboard
 * @param {Object} data - Generation options
 * @returns {Promise}
 */
export const generateMoodboardImages = async ({ moodboardId, data }) => {
  try {
    console.log('🎨 Starting moodboard generation for ID:', moodboardId)

    // ✅ Set specific long timeout for this request
    const response = await axiosInstance.post(
      `/moodboards/${moodboardId}/generate`,
      data,
      {
        timeout: 600000, // 10 minutes for image generation
      }
    )

    console.log('✅ Generation complete:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Generation error:', error)
    throw error
  }
}

/**
 * Regenerate specific images in a moodboard
 * @param {String} moodboardId - ID of the moodboard
 * @param {Object} data - Regeneration options
 * @returns {Promise}
 */
export const regenerateMoodboardImages = async ({ moodboardId, data }) => {
  try {
    console.log('🔄 Regenerating images for ID:', moodboardId)

    const response = await axiosInstance.post(
      `/moodboards/${moodboardId}/regenerate`,
      data,
      {
        timeout: 600000, // 10 minutes
      }
    )

    console.log('✅ Regeneration complete:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Regeneration error:', error)
    throw error
  }
}

/**
 * Edit a moodboard image with targeted transformation
 * @param {String} moodboardId - ID of the moodboard
 * @param {Object} data - Edit options
 * @returns {Promise}
 */
export const editMoodboardImage = async ({ moodboardId, data }) => {
  try {
    console.log('✏️  Editing image for ID:', moodboardId)

    const response = await axiosInstance.post(
      `/moodboards/${moodboardId}/edit`,
      data,
      {
        timeout: 600000, // 10 minutes
      }
    )

    console.log('✅ Edit complete:', response.data)
    return response.data
  } catch (error) {
    console.error('❌ Edit error:', error)
    throw error
  }
}

/**
 * Get all user moodboards
 * @param {Number} page - Page number
 * @param {Number} limit - Items per page
 * @returns {Promise}
 */
export const getUserMoodboards = async ({ page = 1, limit = 10 }) => {
  try {
    const response = await axiosInstance.get('/moodboards/', {
      params: { page, limit },
    })
    return response.data
  } catch (error) {
    console.error('❌ Error fetching moodboards:', error)
    throw error
  }
}

/**
 * Get single moodboard
 * @param {String} id - Moodboard ID
 * @returns {Promise}
 */
export const getMoodboardById = async (id) => {
  try {
    const response = await axiosInstance.get(`/moodboards/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ Error fetching moodboard:', error)
    throw error
  }
}

/**
 * Update moodboard
 * @param {String} id - Moodboard ID
 * @param {Object} data - Updated data
 * @returns {Promise}
 */
export const updateMoodboard = async ({ id, data }) => {
  try {
    const response = await axiosInstance.put(`/moodboards/${id}`, data)
    return response.data
  } catch (error) {
    console.error('❌ Error updating moodboard:', error)
    throw error
  }
}

/**
 * Delete moodboard
 * @param {String} id - Moodboard ID
 * @returns {Promise}
 */
export const deleteMoodboard = async (id) => {
  try {
    const response = await axiosInstance.delete(`/moodboards/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ Error deleting moodboard:', error)
    throw error
  }
}
