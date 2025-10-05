// File: client/src/hooks/useMoodboard.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMoodboard,
  deleteMoodboard,
  editMoodboardImage,
  generateMoodboardImages,
  getMoodboardById,
  getUserMoodboards,
  regenerateMoodboardImages,
  updateMoodboard,
} from '../services/moodboardService'

// Query keys
export const moodboardKeys = {
  all: ['moodboards'],
  lists: () => [...moodboardKeys.all, 'list'],
  list: (filters) => [...moodboardKeys.lists(), filters],
  details: () => [...moodboardKeys.all, 'detail'],
  detail: (id) => [...moodboardKeys.details(), id],
}

// Get all user moodboards
export const useUserMoodboards = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: moodboardKeys.list({ page, limit }),
    queryFn: () => getUserMoodboards({ page, limit }),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// Get single moodboard
export const useMoodboard = (id) => {
  return useQuery({
    queryKey: moodboardKeys.detail(id),
    queryFn: () => getMoodboardById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

// Create moodboard
export const useCreateMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createMoodboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
  })
}

// Generate moodboard images
export const useGenerateMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: generateMoodboardImages,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
  })
}

// Regenerate specific images
export const useRegenerateImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: regenerateMoodboardImages,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
    },
  })
}

// Edit moodboard image
export const useEditMoodboardImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: editMoodboardImage,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
    },
  })
}

// Update moodboard
export const useUpdateMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateMoodboard,
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.id),
      })
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
  })
}

// Delete moodboard
export const useDeleteMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMoodboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
  })
}
