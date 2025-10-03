// File: client/src/hooks/useAuth.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  loginFailure,
  loginStart,
  loginSuccess,
  logout as logoutAction,
  updateProfile as updateProfileAction,
} from '../redux/userSlice'
import { authService } from '../services/authService'

export const useSignup = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.signup,
    onMutate: () => {
      dispatch(loginStart())
    },
    onSuccess: (data) => {
      // Store user and token in Redux using your existing action
      dispatch(loginSuccess(data))

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })

      // Redirect to home or dashboard
      navigate('/')
    },
    onError: (error) => {
      console.error('Signup error:', error)
      dispatch(loginFailure(error?.response?.data || error.message))
    },
  })
}

export const useSignin = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.signin,
    onMutate: () => {
      dispatch(loginStart())
    },
    onSuccess: (data) => {
      // Store user and token in Redux using your existing action
      dispatch(loginSuccess(data))

      // Invalidate and refetch any user-related queries
      queryClient.invalidateQueries({ queryKey: ['user'] })

      // Redirect to home or dashboard
      navigate('/')
    },
    onError: (error) => {
      console.error('Signin error:', error)
      dispatch(loginFailure(error?.response?.data || error.message))
    },
  })
}

export const useLogout = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear user from Redux
      dispatch(logoutAction())

      // Clear all queries
      queryClient.clear()

      // Redirect to auth page
      navigate('/auth')
    },
    onError: (error) => {
      console.error('Logout error:', error)
      // Still logout on error
      dispatch(logoutAction())
      navigate('/auth')
    },
  })
}

export const useUserProfile = (userId, options = {}) => {
  return useQuery({
    queryKey: ['user', userId],
    queryFn: () => authService.getUserProfile(userId),
    enabled: !!userId,
    ...options,
  })
}

export const useChangePassword = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.changePassword,
    onSuccess: (data) => {
      // Update token if new one is issued
      dispatch(loginSuccess(data))
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

export const useUpdateProfile = () => {
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      // Update user in Redux using your existing action
      dispatch(updateProfileAction(data.data.user))

      // Invalidate user queries
      queryClient.invalidateQueries({ queryKey: ['user'] })
    },
  })
}

// Convenience hook to get current user from Redux
export const useCurrentUser = () => {
  const { currentUser } = useSelector((state) => state.user)
  return currentUser
}
