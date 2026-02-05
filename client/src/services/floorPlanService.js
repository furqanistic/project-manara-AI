import axiosInstance from '../config/config'

/**
 * Get all user floor plans
 * @returns {Promise}
 */
export const getUserFloorPlans = async () => {
  try {
    const response = await axiosInstance.get('/floorplans/user')
    return response.data
  } catch (error) {
    console.error('❌ Error fetching floor plans:', error)
    throw error
  }
}

/**
 * Delete a floor plan
 * @param {String} id - Floor plan ID
 * @returns {Promise}
 */
export const deleteFloorPlan = async (id) => {
  try {
    const response = await axiosInstance.delete(`/floorplans/${id}`)
    return response.data
  } catch (error) {
    console.error('❌ Error deleting floor plan:', error)
    throw error
  }
}
