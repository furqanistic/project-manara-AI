import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { deleteFloorPlan, getUserFloorPlans, updateFloorPlan } from '../services/floorPlanService'

export const useUserFloorPlans = () => {
  return useQuery({
    queryKey: ['floor-plans'],
    queryFn: getUserFloorPlans,
    staleTime: 1000 * 60 * 5,
  })
}

export const useDeleteFloorPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: deleteFloorPlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] })
    },
    onError: (error) => {
      console.error('❌ Delete floor plan error:', error)
    },
  })
}

export const useUpdateFloorPlan = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }) => updateFloorPlan(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['floor-plans'] })
    },
    onError: (error) => {
      console.error('❌ Update floor plan error:', error)
    },
  })
}
