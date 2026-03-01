import TopBar from '@/components/Layout/Topbar'
import { useProjectFlow } from '@/hooks/useProjectFlow'
import {
  useCreateProject,
  useDeleteProject,
  useProjects,
  useProjectWorkspace,
  useUpdateProject,
} from '@/hooks/useProjects'
import { PROJECT_FLOW_STEPS, STEP_ROUTE_MAP } from '@/lib/projectFlow'
import { motion } from 'framer-motion'
import { Loader2, Plus, Trash2 } from 'lucide-react'
import React, { useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate, useParams } from 'react-router-dom'

const formatDate = (value) =>
  new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

const LAST_VIEWED_PROJECT_KEY = 'manara_last_viewed_project_id'
const PROJECT_SKELETON_ITEMS = [1, 2, 3]
const STEP_ACTION_COPY = {
  define_room_scope: {
    title: 'Define Room Scope',
    description: 'Set room type and project scope so all builders can generate relevant outputs.',
    cta: 'Set Scope',
  },
  generate_moodboard: {
    title: 'Generate Mood Board',
    description: 'Start the visual direction first so style decisions flow into floor plan and 3D.',
    cta: 'Open Moodboard',
  },
  refine_moodboard: {
    title: 'Refine Mood Board',
    description: 'Adjust style, lighting, budget and color preferences before planning layout.',
    cta: 'Refine Moodboard',
  },
  upload_floorplan: {
    title: 'Upload Floor Plan',
    description: 'Upload an empty plan, sketch, or blueprint to move into spatial generation.',
    cta: 'Open Floor Planner',
  },
  generate_3d: {
    title: 'Generate 3D Plan',
    description: 'Convert your floor plan into 3D to validate scale, zoning, and details.',
    cta: 'Open 3D Builder',
  },
  refine_3d: {
    title: 'Refine 3D Plan',
    description: 'Tune wall alignment, zones, openings, and materials before export.',
    cta: 'Refine 3D',
  },
  export_outputs: {
    title: 'Export Final Outputs',
    description: 'Export your latest approved output and then continue refining if needed.',
    cta: 'Go to Export',
  },
}

const ProjectsPage = () => {
  const navigate = useNavigate()
  const { id: routeProjectId } = useParams()
  const [name, setName] = useState('')
  const [selectedProjectId, setSelectedProjectId] = useState(() => {
    if (routeProjectId) return routeProjectId
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LAST_VIEWED_PROJECT_KEY)
  })
  const [roomScopeDraft, setRoomScopeDraft] = useState({
    roomType: '',
    projectScope: '',
    notes: '',
  })
  const [lastViewedProjectId, setLastViewedProjectId] = useState(() => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(LAST_VIEWED_PROJECT_KEY)
  })

  const { data: projectsData, isLoading } = useProjects()
  const createMutation = useCreateProject()
  const deleteMutation = useDeleteProject()
  const updateProjectMutation = useUpdateProject()

  const projects = useMemo(() => projectsData?.data || [], [projectsData])

  React.useEffect(() => {
    if (routeProjectId) {
      setSelectedProjectId(routeProjectId)
    }
  }, [routeProjectId])

  React.useEffect(() => {
    if (routeProjectId) return
    if (!projects.length) return

    const exists = selectedProjectId && projects.some((project) => project._id === selectedProjectId)
    if (exists) return

    const fallbackLastViewed = lastViewedProjectId && projects.some((project) => project._id === lastViewedProjectId)
      ? lastViewedProjectId
      : null

    setSelectedProjectId(fallbackLastViewed || projects[0]._id)
  }, [projects, routeProjectId, selectedProjectId, lastViewedProjectId])

  const activeProjectId = routeProjectId || selectedProjectId
  const { data: workspaceData, isLoading: workspaceLoading } =
    useProjectWorkspace(activeProjectId)

  const activeProject = workspaceData?.data?.project
  const assets = workspaceData?.data?.assets || {
    moodboards: [],
    floorplans: [],
    threed: [],
  }
  const { flow, flowProgress, nextStepRoute } = useProjectFlow(activeProjectId, workspaceData)
  const latestWorkspaceActivity = useMemo(() => {
    const activity = [
      ...assets.moodboards.map((item) => ({
        type: 'moodboard',
        label: item.title || 'Moodboard updated',
        at: item.updatedAt || item.createdAt,
        route: item._id ? `/moodboards/${item._id}` : null,
      })),
      ...assets.floorplans.map((item) => ({
        type: 'floorplan',
        label: item.name || 'Floor plan updated',
        at: item.updatedAt || item.createdAt,
        route: '/floorplans',
      })),
      ...assets.threed.map((item) => ({
        type: 'threed',
        label: item.name || '3D render updated',
        at: item.updatedAt || item.createdAt,
        route: item._id ? `/visualizer/${item._id}` : '/visualizer',
      })),
    ].filter((entry) => entry.at)

    if (!activity.length) return null
    return activity.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())[0]
  }, [assets])

  const nextStepCopy = useMemo(() => {
    const key = flowProgress?.nextStepId
    return (key && STEP_ACTION_COPY[key]) || {
      title: 'All steps completed',
      description: 'You can keep refining existing outputs or start a new project.',
      cta: 'Open Workspace',
    }
  }, [flowProgress?.nextStepId])

  const flowTimeline = useMemo(() => {
    const completed = new Set(flowProgress?.completedStepIds || [])
    const current = flowProgress?.currentStepId
    return PROJECT_FLOW_STEPS.map((step) => ({
      ...step,
      status: completed.has(step.id)
        ? 'completed'
        : current === step.id
        ? 'current'
        : 'upcoming',
    }))
  }, [flowProgress?.completedStepIds, flowProgress?.currentStepId])

  const activityFeed = useMemo(() => {
    const items = [
      ...assets.moodboards.map((item) => ({
        id: item._id,
        label: item.title || 'Moodboard updated',
        kind: 'Moodboard',
        at: item.updatedAt || item.createdAt,
        route: item._id ? `/moodboards/${item._id}` : null,
      })),
      ...assets.floorplans.map((item) => ({
        id: item._id || item.id,
        label: item.name || 'Floor plan updated',
        kind: 'Floor Plan',
        at: item.updatedAt || item.createdAt,
        route: '/floorplans',
      })),
      ...assets.threed.map((item) => ({
        id: item._id,
        label: item.name || '3D render updated',
        kind: '3D',
        at: item.updatedAt || item.createdAt,
        route: item._id ? `/visualizer/${item._id}` : '/visualizer',
      })),
    ].filter((entry) => entry.at)

    return items
      .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime())
      .slice(0, 5)
  }, [assets])

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

  const handleSaveRoomScope = async () => {
    if (!activeProjectId) return
    if (!roomScopeDraft.roomType.trim() || !roomScopeDraft.projectScope.trim()) {
      toast.error('Room type and project scope are required')
      return
    }

    const completedStepIds = Array.from(
      new Set([...(flow.completedStepIds || []), 'define_room_scope'])
    )

    try {
      await updateProjectMutation.mutateAsync({
        id: activeProjectId,
        data: {
          flow: {
            completedStepIds,
            roomScope: {
              roomType: roomScopeDraft.roomType.trim(),
              projectScope: roomScopeDraft.projectScope.trim(),
              notes: roomScopeDraft.notes.trim(),
            },
          },
        },
      })
      toast.success('Room scope saved')
    } catch (error) {
      toast.error(error?.response?.data?.message || 'Failed to save room scope')
    }
  }

  const handleContinueFlow = () => {
    if (!activeProjectId) return
    if (!flowProgress?.nextStepId) return

    const target = STEP_ROUTE_MAP[flowProgress.nextStepId] || nextStepRoute || '/projects'
    if (target === '/projects') return

    const state = {
      workspaceProjectId: activeProjectId,
      workspaceProjectName: activeProject?.name,
    }

    if (target.includes('?')) {
      navigate(target, { state })
      return
    }

    navigate(`${target}?projectId=${activeProjectId}`, { state })
  }

  const handleResumeLatest = () => {
    if (!activeProjectId || !latestWorkspaceActivity) return
    if (latestWorkspaceActivity.route?.startsWith('/moodboards/')) {
      navigate(latestWorkspaceActivity.route)
      return
    }
    if (latestWorkspaceActivity.route?.startsWith('/visualizer/')) {
      navigate(latestWorkspaceActivity.route)
      return
    }
    if (latestWorkspaceActivity.route) {
      navigate(`${latestWorkspaceActivity.route}?projectId=${activeProjectId}`, {
        state: {
          workspaceProjectId: activeProjectId,
          workspaceProjectName: activeProject?.name,
        },
      })
    }
  }

  const handleOpenActivity = (entry) => {
    if (!entry?.route || !activeProjectId) return
    if (entry.route.startsWith('/moodboards/') || entry.route.startsWith('/visualizer/')) {
      navigate(entry.route)
      return
    }
    navigate(`${entry.route}?projectId=${activeProjectId}`, {
      state: {
        workspaceProjectId: activeProjectId,
        workspaceProjectName: activeProject?.name,
      },
    })
  }

  React.useEffect(() => {
    if (!activeProjectId || typeof window === 'undefined') return
    localStorage.setItem(LAST_VIEWED_PROJECT_KEY, activeProjectId)
    setLastViewedProjectId(activeProjectId)
  }, [activeProjectId])

  React.useEffect(() => {
    setRoomScopeDraft({
      roomType: flow?.roomScope?.roomType || '',
      projectScope: flow?.roomScope?.projectScope || '',
      notes: flow?.roomScope?.notes || '',
    })
  }, [flow?.roomScope?.roomType, flow?.roomScope?.projectScope, flow?.roomScope?.notes])

  return (
    <div className='min-h-screen bg-[#faf8f6] dark:bg-[#0a0a0a] font-["Poppins"]'>
      <TopBar />

      <main className='mx-auto max-w-[1400px] px-4 pb-8 pt-24 sm:px-6 sm:pb-12 sm:pt-28'>
        <div className='mb-5 flex flex-wrap items-end justify-between gap-3 sm:mb-7 sm:gap-4'>
          <div>
            <p className='text-xs font-semibold uppercase tracking-[0.3em] text-[#8d775e]'>Projects</p>
            <h1 className='text-2xl font-bold text-readable-primary sm:text-3xl'>Project-first Studio</h1>
            <p className='text-xs text-readable-secondary sm:text-sm'>
              Create a project, select it, then open a builder page for that project.
            </p>
          </div>

          <form onSubmit={handleCreateProject} className='flex w-full max-w-lg gap-1.5 sm:gap-2'>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='New project name'
              className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-readable-primary outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5 sm:px-4 sm:py-2.5'
            />
            <button
              type='submit'
              disabled={createMutation.isPending}
              className='btn-primary-readable inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-60 sm:px-4 sm:py-2.5'
            >
              {createMutation.isPending ? <Loader2 size={16} className='animate-spin' /> : <Plus size={16} />}
              Create
            </button>
          </form>
        </div>

        <section className='mb-4 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5 sm:mb-6 sm:rounded-3xl sm:p-4'>
          <div className='mb-3 flex items-center justify-between'>
            <h2 className='text-sm font-semibold text-readable-primary'>Your Projects</h2>
            {isLoading && <Loader2 size={14} className='animate-spin text-readable-muted' />}
          </div>

          {!isLoading && projects.length === 0 && (
            <div className='rounded-xl border border-dashed border-gray-200 p-6 text-center text-sm text-readable-secondary dark:border-white/10'>
              No projects found yet. Create your first project above.
            </div>
          )}

          <div className='flex gap-2 overflow-x-auto pb-1 sm:gap-3'>
            {isLoading &&
              PROJECT_SKELETON_ITEMS.map((item) => (
                <div
                  key={item}
                  className='min-w-[220px] animate-pulse rounded-2xl border border-gray-200 bg-white p-3 dark:border-white/10 dark:bg-white/5 sm:min-w-[250px] sm:p-4'
                >
                  <div className='mb-3 h-4 w-2/3 rounded bg-gray-200 dark:bg-white/10' />
                  <div className='mb-2 h-3 w-1/3 rounded bg-gray-200 dark:bg-white/10' />
                  <div className='h-3 w-1/2 rounded bg-gray-200 dark:bg-white/10' />
                </div>
              ))}
            {projects.map((project) => {
              const isActive = activeProjectId === project._id
              const isLastViewed = lastViewedProjectId === project._id
              return (
                <motion.div
                  key={project._id}
                  whileHover={{ y: -1 }}
                  onClick={() => setSelectedProjectId(project._id)}
                  role='button'
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setSelectedProjectId(project._id)
                    }
                  }}
                  className={`min-w-[220px] rounded-2xl border p-3 text-left transition sm:min-w-[250px] sm:p-4 ${
                    isActive
                      ? 'border-[#8d775e]/40 bg-[#8d775e]/8 dark:bg-[#8d775e]/12'
                      : 'border-gray-200 bg-white dark:border-white/10 dark:bg-white/5'
                  }`}
                >
                  <div className='flex items-start justify-between gap-2'>
                    <p className='line-clamp-1 text-sm font-semibold text-readable-primary'>
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
                  <p className='mt-2 text-xs text-readable-secondary'>
                    {project.counts?.total || 0} outputs • {formatDate(project.createdAt)}
                  </p>
                  <p className='mt-2 text-[11px] font-medium uppercase tracking-[0.12em] text-[#8d775e]'>
                    Select workspace
                  </p>
                </motion.div>
              )
            })}
          </div>
        </section>

        <section className='rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5 sm:rounded-3xl sm:p-5'>
          {!activeProjectId && (
            <div className='flex h-full min-h-[360px] flex-col items-center justify-center text-center'>
              <h3 className='text-lg font-semibold text-readable-primary'>Select a project workspace</h3>
              <p className='mt-2 max-w-md text-sm text-readable-secondary'>
                Pick a project above. Then choose one builder below to open its dedicated page.
              </p>
            </div>
          )}

          {activeProjectId && workspaceLoading && !workspaceData?.data && (
            <>
              <div className='mb-5 flex flex-wrap items-start justify-between gap-3'>
                <div className='animate-pulse space-y-2'>
                  <div className='h-3 w-32 rounded bg-gray-200 dark:bg-white/10' />
                  <div className='h-8 w-56 rounded bg-gray-200 dark:bg-white/10' />
                </div>
              </div>

              <div className='mb-6 grid gap-3 md:grid-cols-2'>
                {PROJECT_SKELETON_ITEMS.map((item) => (
                  <div
                    key={item}
                    className='animate-pulse rounded-2xl border border-gray-200 bg-white p-4 dark:border-white/10 dark:bg-white/5'
                  >
                    <div className='mb-3 h-4 w-1/2 rounded bg-gray-200 dark:bg-white/10' />
                    <div className='mb-2 h-3 w-4/5 rounded bg-gray-200 dark:bg-white/10' />
                    <div className='h-3 w-3/5 rounded bg-gray-200 dark:bg-white/10' />
                  </div>
                ))}
              </div>
            </>
          )}

          {activeProjectId && (!workspaceLoading || workspaceData?.data) && (
            <>
              <div className='mb-3 flex flex-wrap items-start justify-between gap-2 sm:mb-5 sm:gap-3'>
                <div>
                  <p className='text-xs uppercase tracking-[0.25em] text-[#8d775e]'>Active Workspace</p>
                  <h2 className='text-xl font-bold text-readable-primary sm:text-2xl'>
                    {activeProject?.name || 'Project'}
                  </h2>
                </div>
                <div className='flex flex-wrap items-center gap-2'>
                  {activeProjectId && (
                    <>
                     <button
                        type='button'
                        onClick={() => goToBuilder('moodboard')}
                        className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                      >
                        Create AI Designs
                      </button>
                       <button
                        type='button'
                        onClick={() => goToBuilder('floorplan')}
                        className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                      >
                        Create Floor Plans
                      </button>
                      <button
                        type='button'
                        onClick={() => goToBuilder('threed')}
                        className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                      >
                        Create 3D Renders
                      </button>
                     
                     
                    </>
                  )}
                  {workspaceLoading && <Loader2 className='animate-spin text-readable-muted' size={16} />}
                </div>
              </div>

              <div className='mb-4 grid gap-3 lg:grid-cols-[1.1fr_0.9fr] sm:mb-6 sm:gap-4'>
                <section className='rounded-2xl border border-[#8d775e]/25 bg-[#8d775e]/5 p-4 sm:p-5'>
                  <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e]'>
                    What You Should Do Next
                  </p>
                  <h3 className='mt-1 text-lg font-bold text-readable-primary sm:text-xl'>{nextStepCopy.title}</h3>
                  <p className='mt-1 text-xs text-readable-secondary sm:text-sm'>{nextStepCopy.description}</p>
                  <div className='mt-3 flex flex-wrap gap-2'>
                    <button
                      type='button'
                      onClick={handleContinueFlow}
                      disabled={!flowProgress?.nextStepId}
                      className='inline-flex items-center rounded-xl bg-gray-900 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200 sm:px-4 sm:py-2'
                    >
                      {nextStepCopy.cta}
                    </button>
                    {latestWorkspaceActivity && (
                      <button
                        type='button'
                        onClick={handleResumeLatest}
                        className='inline-flex items-center rounded-xl border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-4 sm:py-2'
                      >
                        Resume Last Action
                      </button>
                    )}
                  </div>

                  <div className='mt-3 grid grid-cols-3 gap-1.5 sm:mt-4 sm:gap-2'>
                    <div className='rounded-xl border border-gray-200 bg-white p-2 text-center dark:border-white/10 dark:bg-white/5 sm:p-2.5'>
                      <p className='text-[10px] uppercase tracking-[0.12em] text-readable-secondary'>Moodboards</p>
                      <p className='mt-0.5 text-lg font-bold text-readable-primary'>{assets.moodboards.length}</p>
                    </div>
                    <div className='rounded-xl border border-gray-200 bg-white p-2 text-center dark:border-white/10 dark:bg-white/5 sm:p-2.5'>
                      <p className='text-[10px] uppercase tracking-[0.12em] text-readable-secondary'>Floor Plans</p>
                      <p className='mt-0.5 text-lg font-bold text-readable-primary'>{assets.floorplans.length}</p>
                    </div>
                    <div className='rounded-xl border border-gray-200 bg-white p-2 text-center dark:border-white/10 dark:bg-white/5 sm:p-2.5'>
                      <p className='text-[10px] uppercase tracking-[0.12em] text-readable-secondary'>3D</p>
                      <p className='mt-0.5 text-lg font-bold text-readable-primary'>{assets.threed.length}</p>
                    </div>
                  </div>

                  <div className='mt-3 flex flex-wrap gap-1.5 sm:mt-4 sm:gap-2'>
                    <button
                      type='button'
                      onClick={() => goToBuilder('moodboard')}
                      className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                    >
                      Create Moodboard
                    </button>
                    <button
                      type='button'
                      onClick={() => goToBuilder('floorplan')}
                      className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                    >
                      Create Floor Plan
                    </button>
                    <button
                      type='button'
                      onClick={() => goToBuilder('threed')}
                      className='rounded-lg border border-gray-300 bg-white px-2.5 py-1 text-[10px] font-medium text-readable-primary hover:bg-gray-50 dark:border-white/10 dark:bg-white/5 sm:px-3 sm:py-1.5 sm:text-[11px]'
                    >
                      Create 3D
                    </button>
                  </div>
                </section>

                <section className='rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5 sm:p-4'>
                  <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e]'>Timeline</p>
                  <ol className='mt-2.5 space-y-1.5 sm:mt-3 sm:space-y-2'>
                    {flowTimeline.map((step) => (
                      <li key={step.id} className='flex items-start gap-2'>
                        <span
                          className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${
                            step.status === 'completed'
                              ? 'bg-emerald-500'
                              : step.status === 'current'
                              ? 'bg-[#8d775e]'
                              : 'bg-gray-300 dark:bg-white/20'
                          }`}
                        />
                        <div className='min-w-0'>
                          <p className='truncate text-xs font-medium text-readable-primary'>{step.label}</p>
                          <p className='text-[10px] uppercase tracking-[0.12em] text-readable-secondary'>
                            {step.status}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {activityFeed.length > 0 && (
                    <>
                      <p className='mt-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e] sm:mt-4'>
                        Recent Activity
                      </p>
                      <div className='mt-2 space-y-1'>
                        {activityFeed.map((entry) => (
                          <button
                            key={`${entry.kind}-${entry.id}`}
                            type='button'
                            onClick={() => handleOpenActivity(entry)}
                            className='flex w-full items-center justify-between rounded-lg border border-gray-200 px-2 py-1.5 text-left hover:bg-gray-50 dark:border-white/10 dark:hover:bg-white/5 sm:px-2.5'
                          >
                            <div className='min-w-0'>
                              <p className='truncate text-[11px] font-medium text-readable-primary'>{entry.label}</p>
                              <p className='text-[10px] text-readable-secondary'>{entry.kind}</p>
                            </div>
                            <span className='shrink-0 text-[10px] text-readable-secondary'>{formatDate(entry.at)}</span>
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </section>
              </div>

              {flowProgress?.nextStepId === 'define_room_scope' && (
                <section id='room-scope-form' className='mb-5 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm dark:border-white/10 dark:bg-white/5 sm:mb-6 sm:p-4'>
                <p className='text-[10px] font-semibold uppercase tracking-[0.16em] text-[#8d775e]'>Define Room Type / Scope</p>
                <div className='mt-2.5 grid gap-2 md:grid-cols-2 sm:mt-3 sm:gap-2.5'>
                  <input
                    value={roomScopeDraft.roomType}
                    onChange={(e) =>
                      setRoomScopeDraft((prev) => ({ ...prev, roomType: e.target.value }))
                    }
                    placeholder='Room type (e.g. Living Room)'
                    className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
                  />
                  <input
                    value={roomScopeDraft.projectScope}
                    onChange={(e) =>
                      setRoomScopeDraft((prev) => ({ ...prev, projectScope: e.target.value }))
                    }
                    placeholder='Project scope (e.g. 2 rooms)'
                    className='w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5'
                  />
                  <textarea
                    value={roomScopeDraft.notes}
                    onChange={(e) =>
                      setRoomScopeDraft((prev) => ({ ...prev, notes: e.target.value }))
                    }
                    placeholder='Notes (optional)'
                    className='min-h-[72px] w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm outline-none focus:border-[#8d775e] dark:border-white/10 dark:bg-white/5 md:col-span-2'
                  />
                </div>
                <button
                  type='button'
                  onClick={handleSaveRoomScope}
                  disabled={updateProjectMutation.isPending}
                  className='mt-3 inline-flex items-center rounded-xl bg-gray-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-black disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-gray-200'
                >
                  {updateProjectMutation.isPending ? 'Saving...' : 'Save Scope'}
                </button>
              </section>
              )}
            </>
          )}
        </section>
      </main>
    </div>
  )
}

export default ProjectsPage
