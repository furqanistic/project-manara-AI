// File: client/src/hooks/useMoodboard.js
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createMoodboard,
  deleteMoodboard,
  editMoodboardImage,
  generateMoodboardImages,
  generateMoodboardDescriptions,
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

/**
 * Get all user moodboards
 */
export const useUserMoodboards = (page = 1, limit = 10, projectId = null) => {
  return useQuery({
    queryKey: moodboardKeys.list({ page, limit, projectId }),
    queryFn: () => getUserMoodboards({ page, limit, projectId }),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
    retryDelay: 1000,
  })
}

/**
 * Get single moodboard
 */
export const useMoodboard = (id) => {
  return useQuery({
    queryKey: moodboardKeys.detail(id),
    queryFn: () => getMoodboardById(id),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Create moodboard
 */
export const useCreateMoodboard = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createMoodboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
    onError: (error) => {
      console.error('❌ Create moodboard error:', error)
    },
  })
}

/**
 * Generate moodboard image (Phase 1 - fast)
 * ✅ Optimized for quick image generation
 */
export const useGenerateMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables) => {
      console.log('🎨 useGenerateMoodboard (Phase 1) called with:', variables)

      try {
        const result = await generateMoodboardImages(variables)
        console.log('✅ Image generation successful:', result)
        return result
      } catch (error) {
        console.error('❌ Image generation failed:', error)

        // Provide user-friendly error messages
        if (error.code === 'TIMEOUT') {
          throw new Error(
            'Image generation took too long. Please try again or use a simpler prompt.'
          )
        }

        if (error.code === 'NETWORK_ERROR') {
          throw new Error(
            'Network connection lost. Check your internet and try again.'
          )
        }

        if (error.message?.includes('quota')) {
          throw new Error(
            'API quota exceeded. Please wait a moment and try again.'
          )
        }

        throw error
      }
    },
    onSuccess: (data, variables) => {
      console.log(
        '🔄 Invalidating queries for moodboard:',
        variables.moodboardId
      )
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
    onError: (error) => {
      console.error('❌ Mutation error:', error.message)
    },
    retry: 1, // Retry once on failure
    retryDelay: 2000, // Wait 2 seconds before retry
  })
}

/**
 * Generate moodboard descriptions (Phase 2 - deferred)
 * ✅ Runs in background after image is shown
 */
export const useGenerateMoodboardDescriptions = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (moodboardId) => {
      console.log('📝 useGenerateMoodboardDescriptions (Phase 2) called for:', moodboardId)

      try {
        const result = await generateMoodboardDescriptions(moodboardId)
        console.log('✅ Description generation successful:', result)
        return result
      } catch (error) {
        console.error('❌ Description generation failed:', error)

        if (error.code === 'TIMEOUT') {
          throw new Error(
            'Description generation took too long. Some details may be missing.'
          )
        }

        if (error.message?.includes('quota')) {
          throw new Error(
            'API quota exceeded. Descriptions may be incomplete.'
          )
        }

        throw error
      }
    },
    onSuccess: (data, moodboardId) => {
      console.log('🔄 Invalidating queries after description generation:', moodboardId)
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(moodboardId),
      })
    },
    onError: (error) => {
      console.error('❌ Description generation error:', error.message)
    },
    retry: 2, // Retry twice for descriptions
    retryDelay: 3000, // Wait 3 seconds before retry
  })
}

/**
 * Regenerate specific images
 */
export const useRegenerateImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables) => {
      console.log('🔄 useRegenerateImage called')

      try {
        return await regenerateMoodboardImages(variables)
      } catch (error) {
        if (error.code === 'TIMEOUT') {
          throw new Error('Regeneration took too long. Please try again.')
        }
        throw error
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
    },
    onError: (error) => {
      console.error('❌ Regenerate error:', error.message)
    },
    retry: 1,
    retryDelay: 2000,
  })
}

/**
 * Edit moodboard image
 */
export const useEditMoodboardImage = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (variables) => {
      console.log('✏️  useEditMoodboardImage called')

      try {
        return await editMoodboardImage(variables)
      } catch (error) {
        if (error.code === 'TIMEOUT') {
          throw new Error('Edit took too long. Please try again.')
        }
        throw error
      }
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: moodboardKeys.detail(variables.moodboardId),
      })
    },
    onError: (error) => {
      console.error('❌ Edit error:', error.message)
    },
    retry: 1,
    retryDelay: 2000,
  })
}

/**
 * Update moodboard
 */
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
    onError: (error) => {
      console.error('❌ Update error:', error)
    },
  })
}

/**
 * Delete moodboard
 */
export const useDeleteMoodboard = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteMoodboard,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: moodboardKeys.lists() })
    },
    onError: (error) => {
      console.error('❌ Delete error:', error)
    },
  })
}
