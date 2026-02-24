import TopBar from '@/components/Layout/Topbar'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useProjectWorkspace,
} from '@/hooks/useProjects'
import { motion } from 'framer-motion'
import { Loader2, Plus, Sparkles, Trash2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

const BuilderButton = ({ title, subtitle, ctaLabel, onClick, featured = false }) => (
  <button
    onClick={onClick}
    className={`w-full rounded-2xl border px-4 py-4 text-left transition hover:shadow-md ${
      featured
        ? 'border-[#8d775e]/40 bg-gradient-to-br from-[#8d775e]/10 to-white dark:from-[#8d775e]/20 dark:to-white/5'
        : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/5'
    }`}
  >
    <div className='flex items-start justify-between gap-3'>
      <div>
        <p className='text-sm font-semibold text-gray-900 dark:text-white'>{title}</p>
        <p className='mt-1 text-xs text-gray-500 dark:text-gray-400'>{subtitle}</p>
      </div>
      {featured && (
        <div className='rounded-full bg-[#8d775e] p-1.5 text-white'>
          <Sparkles size={14} />
        </div>
      )}
    </div>
    <p className='mt-3 text-[11px] font-medium uppercase tracking-[0.15em] text-[#8d775e]'>
      {ctaLabel} (opens new page)
    </p>
  </button>
)

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const LAST_VIEWED_PROJECT_KEY = 'manara_last_viewed_project_id'

const ProjectsPage = () => {
  const navigate = useNavigate()
  const { id: routeProjectId } = useParams()
  const [name, setName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(routeProjectId || null)
  const [lastViewedProjectId, setLastViewedProjectId] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LAST_VIEWED_PROJECT_KEY)
  })

  const { data: projectsData, isLoading } = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()

  const projects = useMemo(() => projectsData?.data || [], [projectsData])

  React.useEffect(() => {
    if (routeProjectId) {
      setSelectedProjectId(routeProjectId)
    }
  }, [routeProjectId])

  const activeProjectId = routeProjectId || selectedProjectId
  const { data: workspaceData, isLoading: workspaceLoading } =
    useProjectWorkspace(activeProjectId)

  const activeProject = workspaceData?.data?.project
  const assets = workspaceData?.data?.assets || {
    moodboards: [],
    floorplans: [],
    threed: [],
  }

  const handleCreateProject = async (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) {
      toast.error('Please enter a project name')
      return
    }

    try {
      const result = await createMutation.mutateAsync({ name: trimmed })
      const created = result?.data
      setName('')
      if (created?._id) {
        setSelectedProjectId(created._id)
      }
      toast.success('Project created')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to create project')
    }
  }

  const handleDeleteProject = async (e, projectId) => {
    e.stopPropagation()
    if (!window.confirm('Delete this project workspace?')) return

    try {
      await deleteMutation.mutateAsync(projectId)
      if (activeProjectId === projectId) {
        setSelectedProjectId(null)
      }
      toast.success('Project deleted')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to delete project')
    }
  }

  const goToBuilder = (type) => {
    if (!activeProject) return

    const state = {
      workspaceProjectId: activeProject._id,
      workspaceProjectName: activeProject.name,
    }

    if (type === 'moodboard') {
      navigate(`/moodboard?projectId=${activeProject._id}`, { state })
      return
    }
    if (type === 'floorplan') {
      navigate(`/floorplans?projectId=${activeProject._id}`, { state })
      return
    }
    navigate(`/visualizer?projectId=${activeProject._id}`, { state })
  }

  React.useEffect(() => {
    if (!activeProjectId || typeof window === 'undefined') return
    localStorage.setItem(LAST_VIEWED_PROJECT_KEY, activeProjectId)
    setLastViewedProjectId(activeProjectId)
  }, [activeProjectId])

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"]'>
      <TopBar />

      <main className='mx-auto max-w-[1400px] px-6 pb-12 pt-28'>
        <div className='mb-7 flex flex-wrap items-end justify-between gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#8d775e]'>Projects</p>
            <h1 className='text-3xl font-bold text-gray-900 dark:text-white'>Project-first Studio</h1>
            <p className='text-sm text-gray-500 dark:text-gray-400'>
              Create a project, select it, then open a builder page for that project.
            </p>
          </div>

          <form onSubmit={handleCreateProject} className='flex w-full max-w-lg gap-2'>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='New project name'
              className='w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5 dark:text-white'
            />
            <button
              type='submit'
              disabled={createMutation.isPending}
              className='inline-flex items-center gap-2 rounded-xl bg-[#8d775e] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60'
            >
              {createMutation.isPending ? <Loader2 size={16} className='animate-spin' /> : <Plus size={16} />}
              Create
            </button>
          </form>
        </div>

        <section className='mb-6 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-white/5'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-gray-900 dark:text-white'>Your Projects</h2>
            {isLoading && <Loader2 size={14} className='animate-spin text-gray-400' />}
          </div>

          {!isLoading && projects.length === 0 && (
            <div className='rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-gray-500 dark:border-white/10 dark:text-gray-400'>
              No projects yet. Create your first project above.
            </div>
          )}

          <div className='flex gap-3 overflow-x-auto pb-1'>
            {projects.map((project) => {
              const isActive = activeProjectId === project._id
              const isLastViewed = lastViewedProjectId === project._id
              return (
                <motion.button
                  key={project._id}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedProjectId(project._id)}
                  className={`min-w-[250px] rounded-2xl border p-4 text-left transition ${
                    isActive
                      ? 'border-[#8d775e]/40 bg-[#8d775e]/8 dark:bg-[#8d775e]/12'
                      : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <p className='line-clamp-1 text-sm font-semibold text-gray-900 dark:text-white'>
                      {project.name}
                    </p>
                    <button
                      onClick={(e) => handleDeleteProject(e, project._id)}
                      className='text-rose-500 hover:text-rose-600'
                      aria-label='Delete project'
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {isLastViewed && (
                    <p className='mt-2 inline-flex rounded-full bg-[#8d775e]/10 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#8d775e]'>
                      Last viewed
                    </p>
                  )}
                  <p className='mt-2 text-xs text-gray-500 dark:text-gray-400'>
                    {project.counts?.total || 0} outputs • {formatDate(project.createdAt)}
                  </p>
                  <p className='mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8d775e]'>
                    Select workspace
                  </p>
                </motion.button>
              )
            })}
          </div>
        </section>

        <section className='rounded-3xl border border-gray-200 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-white/5'>
          {!activeProjectId && (
            <div className='flex h-full min-h-[360px] flex-col items-center justify-center text-center'>
              <h3 className='text-lg font-semibold text-gray-900 dark:text-white'>Select a project workspace</h3>
              <p className='mt-2 max-w-md text-sm text-gray-500 dark:text-gray-400'>
                Pick a project above. Then choose one builder below to open its dedicated page.
              </p>
            </div>
          )}

          {activeProjectId && (
            <>
              <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
                <div>
                  <p className='text-xs uppercase tracking-[0.25em] text-[#8d775e]'>Active Workspace</p>
                  <h2 className='text-2xl font-bold text-gray-900 dark:text-white'>
                    {activeProject?.name || 'Project'}
                  </h2>
                </div>
                {workspaceLoading && <Loader2 className='animate-spin text-gray-400' size={16} />}
              </div>

              <div className='mb-6 grid gap-3 md:grid-cols-3'>
                <BuilderButton
                  title='3D Renders'
                  subtitle='Generate and iterate 3D outputs for this project.'
                  ctaLabel='Open 3D Renderer'
                  onClick={() => goToBuilder('threed')}
                />
                <BuilderButton
                  title='Floor Plan Generator'
                  subtitle='Create floor plans saved under this project.'
                  ctaLabel='Open Floor Plan Builder'
                  onClick={() => goToBuilder('floorplan')}
                />
                <BuilderButton
                  title='AI Design Generator'
                  subtitle='Create moodboards and design concepts for this project.'
                  ctaLabel='Open AI Design Builder'
                  onClick={() => goToBuilder('moodboard')}
                  featured
                />
              </div>

              <div className='grid gap-4 md:grid-cols-3'>
                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>Moodboards</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>{assets.moodboards.length}</p>
                </div>
                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>Floor Plans</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>{assets.floorplans.length}</p>
                </div>
                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>3D Renders</p>
                  <p className='text-2xl font-bold text-gray-900 dark:text-white'>{assets.threed.length}</p>
                </div>
              </div>

              <div className='mt-5 grid gap-3 md:grid-cols-3'>
                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>Recent Moodboards</p>
                  {assets.moodboards.slice(0, 3).map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigate(`/moodboards/${item._id}`)}
                      className='block w-full truncate py-1 text-left text-sm text-[#8d775e] hover:underline'
                    >
                      {item.title || 'Untitled Moodboard'}
                    </button>
                  ))}
                </div>

                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>Recent Floor Plans</p>
                  {assets.floorplans.slice(0, 3).map((item) => (
                    <button
                      key={item._id || item.id}
                      onClick={() =>
                        navigate(`/floorplans?projectId=${activeProjectId}`, {
                          state: {
                            project: item,
                            workspaceProjectId: activeProjectId,
                            workspaceProjectName: activeProject?.name,
                          },
                        })
                      }
                      className='block w-full truncate py-1 text-left text-sm text-[#8d775e] hover:underline'
                    >
                      {item.name || 'Untitled Floor Plan'}
                    </button>
                  ))}
                </div>

                <div className='rounded-2xl border border-gray-200 p-4 dark:border-white/10'>
                  <p className='mb-2 text-xs font-semibold uppercase tracking-[0.15em] text-gray-500'>Recent 3D Renders</p>
                  {assets.threed.slice(0, 3).map((item) => (
                    <button
                      key={item._id}
                      onClick={() => navigate(`/visualizer/${item._id}`)}
                      className='block w-full truncate py-1 text-left text-sm text-[#8d775e] hover:underline'
                    >
                      {item.name || '3D Render'}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default ProjectsPage
