export const PROJECT_FLOW_STEPS = [
  'create_project',
  'define_room_scope',
  'generate_moodboard',
  'refine_moodboard',
  'upload_floorplan',
  'generate_3d',
  'refine_3d',
  'export_outputs',
]

export const DEFAULT_PROJECT_FLOW = {
  version: 'v1',
  currentStepId: 'define_room_scope',
  completedStepIds: ['create_project'],
  roomScope: {
    roomType: '',
    projectScope: '',
    notes: '',
  },
  moodboardRefinement: {
    budgetRange: '',
    stylePreference: '',
    lightingMood: '',
    colorPreference: '',
  },
  floorPlanGuardrails: {
    dimensions: '',
    ceilingHeight: '',
    windowPlacements: '',
  },
  export: {
    exportedAt: null,
    exportedFrom: '',
  },
  updatedAt: null,
}

const isValidStepId = (stepId) => PROJECT_FLOW_STEPS.includes(stepId)

const uniqueOrderedSteps = (steps = []) => {
  const seen = new Set()
  return steps.filter((step) => {
    if (!isValidStepId(step) || seen.has(step)) return false
    seen.add(step)
    return true
  })
}

const computeProgress = ({ completedStepIds = [] } = {}) => {
  const completed = uniqueOrderedSteps(completedStepIds)
  const firstIncomplete = PROJECT_FLOW_STEPS.find((step) => !completed.includes(step))

  if (!firstIncomplete) {
    return {
      currentStepId: 'export_outputs',
      nextStepId: null,
      percent: 100,
      completedStepIds: PROJECT_FLOW_STEPS.slice(),
    }
  }

  const currentIndex = PROJECT_FLOW_STEPS.indexOf(firstIncomplete)
  return {
    currentStepId: firstIncomplete,
    nextStepId: PROJECT_FLOW_STEPS[currentIndex + 1] || null,
    percent: Math.round((completed.length / PROJECT_FLOW_STEPS.length) * 100),
    completedStepIds: completed,
  }
}

export const normalizeProjectFlow = (flow = {}) => {
  const merged = {
    ...DEFAULT_PROJECT_FLOW,
    ...(flow || {}),
    roomScope: {
      ...DEFAULT_PROJECT_FLOW.roomScope,
      ...(flow?.roomScope || {}),
    },
    moodboardRefinement: {
      ...DEFAULT_PROJECT_FLOW.moodboardRefinement,
      ...(flow?.moodboardRefinement || {}),
    },
    floorPlanGuardrails: {
      ...DEFAULT_PROJECT_FLOW.floorPlanGuardrails,
      ...(flow?.floorPlanGuardrails || {}),
    },
    export: {
      ...DEFAULT_PROJECT_FLOW.export,
      ...(flow?.export || {}),
    },
  }

  const completedStepIds = uniqueOrderedSteps(merged.completedStepIds)
  const progress = computeProgress({ completedStepIds })

  return {
    ...merged,
    ...progress,
    updatedAt: merged.updatedAt || new Date(),
  }
}

export const deriveFlowFromAssets = ({ flow = null, assets = null } = {}) => {
  const completed = new Set(flow?.completedStepIds || [])

  if (assets?.moodboards?.length > 0) completed.add('generate_moodboard')
  if (assets?.floorplans?.length > 0) completed.add('upload_floorplan')
  if (assets?.threed?.length > 0) completed.add('generate_3d')
  if (flow?.export?.exportedAt) completed.add('export_outputs')

  if (flow?.roomScope?.roomType || flow?.roomScope?.projectScope) {
    completed.add('define_room_scope')
  }

  if (
    flow?.moodboardRefinement?.budgetRange ||
    flow?.moodboardRefinement?.stylePreference ||
    flow?.moodboardRefinement?.lightingMood ||
    flow?.moodboardRefinement?.colorPreference
  ) {
    completed.add('refine_moodboard')
  }

  if (
    assets?.threed?.some((model) =>
      Array.isArray(model.versions) && model.versions.length > 1
    )
  ) {
    completed.add('refine_3d')
  }

  completed.add('create_project')

  return normalizeProjectFlow({
    ...flow,
    completedStepIds: Array.from(completed),
  })
}

export const mergeProjectFlow = (currentFlow = {}, flowPatch = {}) => {
  const merged = {
    ...currentFlow,
    ...(flowPatch || {}),
    roomScope: {
      ...(currentFlow?.roomScope || {}),
      ...(flowPatch?.roomScope || {}),
    },
    moodboardRefinement: {
      ...(currentFlow?.moodboardRefinement || {}),
      ...(flowPatch?.moodboardRefinement || {}),
    },
    floorPlanGuardrails: {
      ...(currentFlow?.floorPlanGuardrails || {}),
      ...(flowPatch?.floorPlanGuardrails || {}),
    },
    export: {
      ...(currentFlow?.export || {}),
      ...(flowPatch?.export || {}),
    },
  }

  if (Array.isArray(flowPatch?.completedStepIds)) {
    merged.completedStepIds = uniqueOrderedSteps([
      ...(currentFlow?.completedStepIds || []),
      ...flowPatch.completedStepIds,
    ])
  }

  return normalizeProjectFlow({
    ...merged,
    updatedAt: new Date(),
  })
}

export const getFlowProgress = (flow = {}) => {
  const normalized = normalizeProjectFlow(flow)
  return {
    currentStepId: normalized.currentStepId,
    nextStepId: normalized.nextStepId,
    percent: normalized.percent,
    completedStepIds: normalized.completedStepIds,
  }
}
