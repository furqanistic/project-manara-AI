import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createProject,
  deleteProject,
  getProjectWorkspace,
  getUserProjects,
  updateProject,
} from '../services/projectService'

export const useProjects = (params) => {
  return useQuery({
    queryKey: ['projects', params],
    queryFn: () => getUserProjects(params),
    staleTime: 1000 * 60 * 5,
  })
}

export const useProjectWorkspace = (projectId) => {
  return useQuery({
    queryKey: ['project-workspace', projectId],
    queryFn: () => getProjectWorkspace(projectId),
    enabled: !!projectId,
    staleTime: 1000 * 60,
  })
}

export const useCreateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}

export const useUpdateProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProject,
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['project-workspace', variables.id] })
    },
  })
}

export const useDeleteProject = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
    },
  })
}
