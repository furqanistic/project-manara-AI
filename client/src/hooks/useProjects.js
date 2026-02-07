import { useQuery } from '@tanstack/react-query'
import { getUserProjects } from '../services/projectService'

export const useProjects = (params) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getUserProjects(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    keepPreviousData: true,
  })
}
