import mongoose from 'mongoose'

const ProjectSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    flow: {
      version: {
        type: String,
        default: 'v1',
      },
      currentStepId: {
        type: String,
      },
      completedStepIds: {
        type: [String],
        default: [],
      },
      roomScope: {
        roomType: { type: String, default: '' },
        projectScope: { type: String, default: '' },
        notes: { type: String, default: '' },
      },
      moodboardRefinement: {
        budgetRange: { type: String, default: '' },
        stylePreference: { type: String, default: '' },
        lightingMood: { type: String, default: '' },
        colorPreference: { type: String, default: '' },
      },
      floorPlanGuardrails: {
        dimensions: { type: String, default: '' },
        ceilingHeight: { type: String, default: '' },
        windowPlacements: { type: String, default: '' },
      },
      export: {
        exportedAt: { type: Date, default: null },
        exportedFrom: { type: String, default: '' },
      },
      updatedAt: {
        type: Date,
      },
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
)

ProjectSchema.index({ userId: 1, createdAt: -1 })

export default mongoose.model('Project', ProjectSchema)
