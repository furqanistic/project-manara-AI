import { useQuery } from '@tanstack/react-query'
import { getUserFloorPlans } from '../services/floorPlanService'

export const useUserFloorPlans = () => {
  return useQuery({
    queryKey: ['floor-plans'],
    queryFn: getUserFloorPlans,
    staleTime: 1000 * 60 * 5,
  })
}
