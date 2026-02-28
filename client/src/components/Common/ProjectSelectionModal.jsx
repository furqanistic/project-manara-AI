import { useCreateProject, useProjects } from '@/hooks/useProjects'
import { X } from 'lucide-react'
import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate } from 'react-router-dom'

const ProjectSelectionModal = ({
  open,
  onSelect,
  onClose,
  title = 'Choose a project',
  description = 'Create a project or select an existing one to continue.',
}) => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const { data, isLoading } = useProjects()
  const createMutation = useCreateProject()

  if (!open) return null

  const projects = data?.data || []

  const handleBack = () => {
    if (onClose) {
      onClose()
      return
    }
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    navigate('/projects')
  }

  const handleGoToProjects = () => {
    navigate('/projects')
  }

  const handleCreate = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Please enter a project name')
      return
    }

    try {
      const result = await createMutation.mutateAsync({ name: trimmed })
      const created = result?.data
      if (created?._id) {
        onSelect(created)
        setName('')
        toast.success('Project created')
      }
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create project')
    }
  }

  return (
    <div className='fixed inset-0 z-[220] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4'>
      <div className='w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-5 shadow-2xl dark:border-white/10 dark:bg-[#121212]'>
        <div className='mb-1 flex items-start justify-between gap-3'>
          <div>
            <h3 className='text-lg font-bold text-readable-primary'>{title}</h3>
            <p className='mt-1 text-sm text-readable-secondary'>{description}</p>
          </div>
          <button
            onClick={handleBack}
            className='rounded-lg p-1.5 text-readable-muted hover:bg-gray-100 hover:text-readable-primary dark:hover:bg-white/10'
            aria-label='Close'
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleCreate} className='mt-4 flex gap-2'>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder='Project name'
            className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-readable-primary outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
          />
          <button
            type='submit'
            disabled={createMutation.isPending}
            className='btn-primary-readable rounded-xl px-4 py-2 text-sm font-semibold disabled:opacity-60'
          >
            {createMutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </form>

        <div className='mt-4 max-h-56 overflow-y-auto space-y-2'>
          {isLoading && <p className='text-sm text-readable-secondary'>Loading projects...</p>}
          {!isLoading && projects.length === 0 && (
            <p className='text-sm text-readable-secondary'>No projects yet. Create one to continue.</p>
          )}
          {projects.map((project) => (
            <button
              key={project._id}
              onClick={() => onSelect(project)}
              className='w-full rounded-xl border border-gray-200 px-3 py-2 text-left hover:border-[#8d775e]/40 dark:border-white/10 dark:bg-white/5'
            >
              <p className='text-sm font-semibold text-readable-primary'>{project.name}</p>
              <p className='text-xs text-readable-secondary'>
                {project.counts?.total || 0} outputs
              </p>
            </button>
          ))}
        </div>

        <div className='mt-4 flex items-center justify-end gap-2'>
          <button
            onClick={handleBack}
            className='btn-secondary-readable rounded-xl px-3 py-2 text-sm font-semibold'
          >
            Back
          </button>
          <button
            onClick={handleGoToProjects}
            className='btn-primary-readable rounded-xl px-3 py-2 text-sm font-semibold'
          >
            Go to Projects
          </button>
        </div>
      </div>
    </div>
  )
}

export default ProjectSelectionModal
