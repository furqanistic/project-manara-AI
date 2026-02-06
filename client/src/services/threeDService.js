import axiosInstance from '../config/config'

/**
 * Get all user 3D models
 * @returns {Promise}
 */
export const getUserThreeDModels = async () => {
  try {
    const response = await axiosInstance.get('/3d/my-models')
    return response.data
  } catch (error) {
    console.error('❌ Error fetching 3D models:', error)
    throw error
  }
}

/**
 * Delete a 3D model
 * @param {String} id - Model ID
 * @returns {Promise}
 */
export const deleteThreeDModel = async (id) => {
  try {
    const response = await axiosInstance.delete(`/3d/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ Error deleting 3D model:', error)
    throw error
  }


}

/**
 * Update a 3D model

 * @param {String} id - Model ID
 * @param {Object} data - Update data
 * @returns {Promise}
 */
export const updateThreeDModel = async (id, data) => {
  try {
    const response = await axiosInstance.put(`/3d/${id}`, data)
    return response.data
  } catch (error) {
    console.error('❌ Error updating 3D model:', error)
    throw error
  }
}
