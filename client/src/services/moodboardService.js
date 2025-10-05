// File: client/src/services/moodboardService.js
import axiosInstance from '../config/config'

// Create a new moodboard
export const createMoodboard = async (data) => {
  const response = await axiosInstance.post('/moodboards/', data)
  return response.data
}

// Generate images for a moodboard
export const generateMoodboardImages = async ({ moodboardId, data }) => {
  const response = await axiosInstance.post(
    `/moodboards/${moodboardId}/generate`,
    data
  )
  return response.data
}

// Regenerate specific images in a moodboard
export const regenerateMoodboardImages = async ({ moodboardId, data }) => {
  const response = await axiosInstance.post(
    `/moodboards/${moodboardId}/regenerate`,
    data
  )
  return response.data
}

// Edit a moodboard image with targeted transformation
export const editMoodboardImage = async ({ moodboardId, data }) => {
  const response = await axiosInstance.post(
    `/moodboards/${moodboardId}/edit`,
    data
  )
  return response.data
}

// Get all user moodboards
export const getUserMoodboards = async ({ page = 1, limit = 10 }) => {
  const response = await axiosInstance.get('/moodboards/', {
    params: { page, limit },
  })
  return response.data
}

// Get single moodboard
export const getMoodboardById = async (id) => {
  const response = await axiosInstance.get(`/moodboards/${id}`)
  return response.data
}

// Update moodboard
export const updateMoodboard = async ({ id, data }) => {
  const response = await axiosInstance.put(`/moodboards/${id}`, data)
  return response.data
}

// Delete moodboard
export const deleteMoodboard = async (id) => {
  const response = await axiosInstance.delete(`/moodboards/${id}`)
  return response.data
}
