import { useMemo } from 'react'
import { useUpdateProject } from './useProjects'
import {
  DEFAULT_PROJECT_FLOW,
  PROJECT_FLOW_STEPS,
  STEP_ROUTE_MAP,
  getStepLabel,
  normalizeClientFlow,
} from '@/lib/projectFlow'

export const useProjectFlow = (projectId, workspaceData) => {
  const updateProjectMutation = useUpdateProject()

  const flow = useMemo(() => {
    const rawFlow = workspaceData?.data?.project?.flow
    return normalizeClientFlow(rawFlow || DEFAULT_PROJECT_FLOW)
  }, [workspaceData])

  const flowProgress = useMemo(() => {
    const serverProgress = workspaceData?.data?.flowProgress

    if (serverProgress) {
      return {
        ...serverProgress,
        currentStepLabel: getStepLabel(serverProgress.currentStepId),
        nextStepLabel: serverProgress.nextStepId ? getStepLabel(serverProgress.nextStepId) : null,
      }
    }

    const completed = new Set(flow.completedStepIds || [])
    const firstIncomplete = PROJECT_FLOW_STEPS.find((step) => !completed.has(step.id))
    const currentStepId = firstIncomplete?.id || 'export_outputs'
    const currentIndex = PROJECT_FLOW_STEPS.findIndex((step) => step.id === currentStepId)
    const nextStepId = currentIndex >= 0 ? PROJECT_FLOW_STEPS[currentIndex + 1]?.id || null : null

    return {
      currentStepId,
      nextStepId,
      percent: Math.round((completed.size / PROJECT_FLOW_STEPS.length) * 100),
      completedStepIds: Array.from(completed),
      currentStepLabel: getStepLabel(currentStepId),
      nextStepLabel: nextStepId ? getStepLabel(nextStepId) : null,
    }
  }, [workspaceData, flow])

  const updateFlowMeta = async (flowPatch) => {
    if (!projectId) return null
    return updateProjectMutation.mutateAsync({
      id: projectId,
      data: { flow: flowPatch },
    })
  }

  const markStepComplete = async (stepId, additionalFlow = {}) => {
    if (!projectId || !stepId) return null

    const mergedCompleted = Array.from(
      new Set([...(flow.completedStepIds || []), stepId])
    )

    return updateFlowMeta({
      completedStepIds: mergedCompleted,
      ...additionalFlow,
    })
  }

  const nextStepRoute = flowProgress.nextStepId
    ? STEP_ROUTE_MAP[flowProgress.nextStepId] || '/projects'
    : null

  return {
    flow,
    flowProgress,
    nextStepRoute,
    updateFlowMeta,
    markStepComplete,
    isUpdatingFlow: updateProjectMutation.isPending,
  }
}

export default useProjectFlow
