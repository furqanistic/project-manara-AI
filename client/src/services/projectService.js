import axiosInstance from '../config/config'

export const getUserProjects = async (params = {}) => {
  const response = await axiosInstance.get('/projects', { params })
  return response.data
}

export const createProject = async (payload) => {
  const response = await axiosInstance.post('/projects', payload)
  return response.data
}

export const getProjectWorkspace = async (id) => {
  const response = await axiosInstance.get(`/projects/${id}`)
  return response.data
}

export const updateProject = async ({ id, data }) => {
  const response = await axiosInstance.put(`/projects/${id}`, data)
  return response.data
}

export const deleteProject = async (id) => {
  const response = await axiosInstance.delete(`/projects/${id}`)
  return response.data
}
