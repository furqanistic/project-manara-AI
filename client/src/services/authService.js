// File: client/src/services/authService.js
/**
 * Authentication Service
 * Handles all API calls for user authentication and profile management
 */

import axiosInstance from "../config/config";

export const authService = {
  /**
   * Sign up a new user
   * @param {Object} userData - User data { firstName, lastName, email, password }
   * @returns {Promise} Response with user data and token
   */
  signup: async (userData) => {
    try {
      const response = await axiosInstance.post("/auth/signup", {
        name: `${userData.firstName} ${userData.lastName}`.trim(),
        email: userData.email,
        password: userData.password,
        role: userData.role || "user",
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Sign in existing user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with user data and token
   */
  signin: async (credentials) => {
    try {
      const response = await axiosInstance.post("/auth/signin", {
        email: credentials.email,
        password: credentials.password,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Logout user
   * @returns {Promise}
   */
  logout: async () => {
    try {
      const response = await axiosInstance.post("/auth/logout");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get user profile by ID
   * @param {String} userId - User ID
   * @returns {Promise} User data
   */
  getUserProfile: async (userId) => {
    try {
      const response = await axiosInstance.get(`/auth/profile/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get current authenticated user
   * @returns {Promise} Current user data
   */
  getCurrentUser: async () => {
    try {
      const response = await axiosInstance.get("/auth/me");
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user profile (name, email)
   * @param {Object} userData - { name, email }
   * @returns {Promise} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const response = await axiosInstance.put("/auth/profile", {
        name: userData.name,
        email: userData.email,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Change user password
   * @param {Object} passwordData - { currentPassword, newPassword, confirmPassword }
   * @returns {Promise} Response with new token
   */
  changePassword: async (passwordData) => {
    try {
      const response = await axiosInstance.put("/auth/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
        confirmPassword: passwordData.confirmPassword,
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Get all users (Admin only)
   * @param {Object} options - { page, limit }
   * @returns {Promise} List of users
   */
  getAllUsers: async (options = {}) => {
    try {
      const response = await axiosInstance.get("/auth/all-users", {
        params: {
          page: options.page || 1,
          limit: options.limit || 10,
        },
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Delete user (Admin only)
   * @param {String} userId - User ID to delete
   * @returns {Promise}
   */
  deleteUser: async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `/auth/admin/users/${userId}`
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  /**
   * Update user as admin
   * @param {String} userId - User ID
   * @param {Object} userData - User data to update
   * @returns {Promise} Updated user data
   */
  updateUserAsAdmin: async (userId, userData) => {
    try {
      const response = await axiosInstance.put(
        `/auth/admin/users/${userId}`,
        userData
      );
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },
};
