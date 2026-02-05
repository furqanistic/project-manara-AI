import { useQuery } from '@tanstack/react-query'
import { getUserThreeDModels } from '../services/threeDService'

export const useUserThreeDModels = () => {
  return useQuery({
    queryKey: ['3d-models'],
    queryFn: getUserThreeDModels,
    staleTime: 1000 * 60 * 5,
  })
}
