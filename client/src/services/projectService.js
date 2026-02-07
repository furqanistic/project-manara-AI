import axiosInstance from '../config/config'

/**
 * Get aggregated user projects with pagination
 * @param {Object} params - Query parameters (page, limit, type, sortBy, search)
 * @returns {Promise}
 */
export const getUserProjects = async (params) => {
  try {
    const response = await axiosInstance.get('/projects', { params })
    return response.data
  } catch (error) {
    console.error('❌ Error fetching aggregated projects:', error)
    throw error
  }
}
