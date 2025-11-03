// File: src/config/config.js
import axios from 'axios'

// ✅ Create axios instance with LONG TIMEOUT for moodboard generation
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8800/api',
  withCredentials: true, // Important for cookies
  timeout: 600000, // ✅ 10 MINUTES - for long-running moodboard generation
  headers: {
    'Content-Type': 'application/json',
  },
})

// Store reference to get state (will be set when store is created)
let store
export const injectStore = (_store) => {
  store = _store
}

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    // Get token from Redux store if available
    if (store) {
      const state = store.getState()
      const token = state.user?.token
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    // ✅ Log request for debugging
    console.log('📤 Request:', config.method.toUpperCase(), config.url)

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    console.log('✅ Response:', response.status)
    return response
  },
  (error) => {
    // ✅ Handle timeout errors specifically
    if (error.code === 'ECONNABORTED') {
      console.error('⏱️  REQUEST TIMEOUT:', {
        url: error.config?.url,
        timeout: error.config?.timeout,
        message: 'Request took too long - please try again',
      })
      return Promise.reject({
        message: 'Request timeout - generation may be taking too long',
        code: 'TIMEOUT',
        originalError: error,
      })
    }

    // ✅ Handle network errors
    if (error.message === 'Network Error') {
      console.error('🌐 NETWORK ERROR:', error)
      return Promise.reject({
        message: 'Network error - check your connection and CORS',
        code: 'NETWORK_ERROR',
        originalError: error,
      })
    }

    // Handle auth errors
    if (error.response?.status === 401 && store) {
      // Import logout action dynamically to avoid circular dependency
      import('../redux/userSlice.js').then(({ logout }) => {
        store.dispatch(logout())
        // Redirect to login if not already there
        if (window.location.pathname !== '/auth') {
          window.location.href = '/auth'
        }
      })
    }

    console.error('❌ Error:', {
      status: error.response?.status,
      message: error.message,
      url: error.config?.url,
    })

    return Promise.reject(error)
  }
)

export default axiosInstance
