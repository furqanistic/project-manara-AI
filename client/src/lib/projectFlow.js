export const PROJECT_FLOW_STEPS = [
  { id: 'create_project', label: 'Create Project' },
  { id: 'define_room_scope', label: 'Define Room Type / Scope' },
  { id: 'generate_moodboard', label: 'Generate Mood Board' },
  { id: 'refine_moodboard', label: 'Refine Mood Board' },
  { id: 'upload_floorplan', label: 'Upload Floor Plan' },
  { id: 'generate_3d', label: 'Generate 3D Plan' },
  { id: 'refine_3d', label: 'Refine 3D Plan' },
  { id: 'export_outputs', label: 'Export Final Outputs' },
]

export const STEP_ROUTE_MAP = {
  define_room_scope: '/projects',
  generate_moodboard: '/moodboard',
  refine_moodboard: '/moodboard',
  upload_floorplan: '/floorplans',
  generate_3d: '/visualizer',
  refine_3d: '/visualizer',
  export_outputs: '/visualizer',
}

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
}

export const getStepLabel = (stepId) => {
  return PROJECT_FLOW_STEPS.find((step) => step.id === stepId)?.label || 'Unknown Step'
}

export const normalizeClientFlow = (flow = {}) => {
  return {
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
}
