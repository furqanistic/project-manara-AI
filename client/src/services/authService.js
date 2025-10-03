// File: client/src/services/authService.js
import axiosInstance from '../config/config'

export const authService = {
  // Sign up a new user
  signup: async (userData) => {
    const response = await axiosInstance.post('/auth/signup', {
      name: `${userData.firstName} ${userData.lastName}`.trim(),
      email: userData.email,
      password: userData.password,
    })
    return response.data
  },

  // Sign in existing user
  signin: async (credentials) => {
    const response = await axiosInstance.post('/auth/signin', {
      email: credentials.email,
      password: credentials.password,
    })
    return response.data
  },

  // Logout user
  logout: async () => {
    const response = await axiosInstance.post('/auth/logout')
    return response.data
  },

  // Get user profile
  getUserProfile: async (userId) => {
    const response = await axiosInstance.get(`/auth/profile/${userId}`)
    return response.data
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await axiosInstance.put(
      '/auth/change-password',
      passwordData
    )
    return response.data
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await axiosInstance.put('/auth/profile', userData)
    return response.data
  },
}
