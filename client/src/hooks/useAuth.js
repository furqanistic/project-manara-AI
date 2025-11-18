// File: client/src/hooks/useAuth.js
/**
 * Authentication Hooks
 * Provides React Query mutations and queries for auth operations
 */

import React, { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logout as logoutAction,
  updateProfile as updateProfileAction,
} from "../redux/userSlice";
import { authService } from "../services/authService";

// Query key factory
export const authQueryKeys = {
  all: ["auth"],
  user: () => [...authQueryKeys.all, "user"],
  currentUser: () => [...authQueryKeys.user(), "current"],
  profile: (id) => [...authQueryKeys.user(), "profile", id],
  users: () => [...authQueryKeys.all, "users"],
  userList: (page, limit) => [...authQueryKeys.users(), { page, limit }],
};

/**
 * useSignup - Register a new user
 * @returns {Object} Mutation object
 */
export const useSignup = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signup,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      console.log("✅ Signup successful");
      dispatch(loginSuccess(data));
      queryClient.setQueryData(authQueryKeys.currentUser(), data?.data?.user);
      navigate("/");
    },
    onError: (error) => {
      console.error("❌ Signup error:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Signup failed";
      dispatch(loginFailure(errorMessage));
    },
  });
};

/**
 * useSignin - Login user
 * @returns {Object} Mutation object
 */
export const useSignin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.signin,
    onMutate: () => {
      dispatch(loginStart());
    },
    onSuccess: (data) => {
      console.log("✅ Signin successful");
      dispatch(loginSuccess(data));
      queryClient.setQueryData(authQueryKeys.currentUser(), data?.data?.user);
      navigate("/");
    },
    onError: (error) => {
      console.error("❌ Signin error:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Signin failed";
      dispatch(loginFailure(errorMessage));
    },
  });
};

/**
 * useLogout - Logout user
 * @returns {Object} Mutation object
 */
export const useLogout = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      console.log("✅ Logout successful");
      dispatch(logoutAction());
      queryClient.clear();
      navigate("/auth");
    },
    onError: (error) => {
      console.error("❌ Logout error:", error);
      // Still logout even on error
      dispatch(logoutAction());
      navigate("/auth");
    },
  });
};

/**
 * useCurrentUser - Get current authenticated user
 * @returns {Object} Current user from Redux
 */
export const useCurrentUser = () => {
  const { currentUser } = useSelector((state) => state.user);
  return currentUser;
};

/**
 * useUserProfile - Fetch user profile by ID
 * @param {String} userId - User ID
 * @returns {Object} Query object
 */
export const useUserProfile = (userId) => {
  return useQuery({
    queryKey: authQueryKeys.profile(userId),
    queryFn: () => authService.getUserProfile(userId),
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  });
};

/**
 * useUpdateProfile - Update user profile (name, email)
 * @returns {Object} Mutation object
 */
export const useUpdateProfile = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userData) => authService.updateProfile(userData),
    onSuccess: (data) => {
      console.log("✅ Profile updated successfully");
      const updatedUser = data?.data?.user;
      dispatch(updateProfileAction(updatedUser));
      queryClient.setQueryData(authQueryKeys.currentUser(), updatedUser);
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
    },
    onError: (error) => {
      console.error("❌ Update profile error:", error);
      const errorMessage =
        error?.data?.message || error?.message || "Failed to update profile";
      throw new Error(errorMessage);
    },
  });
};

/**
 * useChangePassword - Change user password
 * @returns {Object} Mutation object
 */
export const useChangePassword = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (passwordData) => authService.changePassword(passwordData),
    onSuccess: (data) => {
      console.log("✅ Password changed successfully");
      // Update token if new one is issued
      if (data?.data?.token) {
        dispatch(loginSuccess(data));
        queryClient.setQueryData(authQueryKeys.currentUser(), data?.data?.user);
      }
      queryClient.invalidateQueries({ queryKey: authQueryKeys.user() });
    },
    onError: (error) => {
      console.error("❌ Change password error:", error);
      const errorMessage =
        error?.data?.message ||
        error?.message ||
        "Failed to change password. Please check your current password.";
      throw new Error(errorMessage);
    },
  });
};

/**
 * useGetAllUsers - Get all users (Admin only)
 * @param {Object} options - { page, limit }
 * @returns {Object} Query object
 */
export const useGetAllUsers = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: authQueryKeys.userList(page, limit),
    queryFn: () => authService.getAllUsers({ page, limit }),
    staleTime: 1000 * 60 * 5,
    retry: 2,
  });
};

/**
 * useDeleteUser - Delete user (Admin only)
 * @returns {Object} Mutation object
 */
export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId) => authService.deleteUser(userId),
    onSuccess: () => {
      console.log("✅ User deleted successfully");
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
    },
    onError: (error) => {
      console.error("❌ Delete user error:", error);
      throw error;
    },
  });
};

/**
 * useUpdateUserAsAdmin - Update user as admin
 * @returns {Object} Mutation object
 */
export const useUpdateUserAsAdmin = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ userId, userData }) =>
      authService.updateUserAsAdmin(userId, userData),
    onSuccess: () => {
      console.log("✅ User updated successfully");
      queryClient.invalidateQueries({ queryKey: authQueryKeys.users() });
    },
    onError: (error) => {
      console.error("❌ Update user error:", error);
      throw error;
    },
  });
};

/**
 * useAuthGuard - Check authentication and redirect if needed
 * @param {Boolean} requireAdmin - Require admin role
 * @returns {Object} { currentUser, isAuthenticated }
 */
export const useAuthGuard = (requireAdmin = false) => {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate("/auth?type=login");
    } else if (requireAdmin && currentUser.role !== "admin") {
      navigate("/");
    }
  }, [currentUser, requireAdmin, navigate]);

  return { currentUser, isAuthenticated: !!currentUser };
};

export default {
  useSignup,
  useSignin,
  useLogout,
  useCurrentUser,
  useUserProfile,
  useUpdateProfile,
  useChangePassword,
  useGetAllUsers,
  useDeleteUser,
  useUpdateUserAsAdmin,
  useAuthGuard,
};
