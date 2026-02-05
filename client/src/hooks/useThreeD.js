import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteThreeDModel, getUserThreeDModels } from '../services/threeDService'

export const useUserThreeDModels = () => {
  return useQuery({
    queryKey: ['3d-models'],
    queryFn: getUserThreeDModels,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDeleteThreeDModel = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteThreeDModel,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['3d-models'] })
    },
    onError: (error) => {
      console.error('❌ Delete 3D model error:', error)
    },
  })
}
