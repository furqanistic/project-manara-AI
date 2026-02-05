// File: server/models/FloorPlan.js
import mongoose from 'mongoose'

const ElementSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: {
    type: String,
    enum: [
      'wall',
      'room',
      'door',
      'window',
      'furniture',
      'measurement',
      'annotation',
      'image',
    ],
    required: true,
  },
  // Common properties
  layer: { type: Number, default: 1 },
  color: { type: String },
  locked: { type: Boolean, default: false },
  visible: { type: Boolean, default: true },

  // Position properties for rectangular elements
  x: Number,
  y: Number,
  width: Number,
  height: Number,
  rotation: { type: Number, default: 0 },

  // Wall-specific properties
  startX: Number,
  startY: Number,
  endX: Number,
  endY: Number,
  thickness: { type: Number, default: 10 },

  // Door-specific properties
  swingDirection: {
    type: String,
    enum: ['inward', 'outward', 'double'],
    default: 'inward',
  },
  swingAngle: { type: Number, default: 90 },
  doorType: { type: String, default: 'single' },

  // Window-specific properties
  style: {
    type: String,
    enum: ['single-hung', 'double-hung', 'sliding', 'fixed', 'casement'],
    default: 'double-hung',
  },
  mullions: { type: Number, default: 2 },

  // Room-specific properties
  roomName: String,
  roomType: String,
  area: Number,
  fill: String,

  // Measurement properties
  distance: String,
  unit: { type: String, enum: ['meters', 'feet'], default: 'meters' },

  // Image properties
  imageUrl: String,
  imageName: String,

  // Metadata
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
})

const LayerSchema = new mongoose.Schema({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  visible: { type: Boolean, default: true },
  locked: { type: Boolean, default: false },
  color: { type: String, default: '#ffffff' },
  order: { type: Number, default: 0 },
})

const FloorPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    name: {
      type: String,
      required: true,
      default: 'Untitled Floor Plan',
    },
    description: String,

    // Canvas data
    elements: [ElementSchema],
    layers: {
      type: [LayerSchema],
      default: [
        {
          id: 1,
          name: 'Walls',
          visible: true,
          locked: false,
          color: '#ffffff',
          order: 1,
        },
        {
          id: 2,
          name: 'Doors & Windows',
          visible: true,
          locked: false,
          color: '#947d61',
          order: 2,
        },
        {
          id: 3,
          name: 'Furniture',
          visible: true,
          locked: false,
          color: '#3b82f6',
          order: 3,
        },
        {
          id: 4,
          name: 'Dimensions',
          visible: true,
          locked: false,
          color: '#10b981',
          order: 4,
        },
        {
          id: 5,
          name: 'Annotations',
          visible: true,
          locked: false,
          color: '#f59e0b',
          order: 5,
        },
      ],
    },

    // Settings
    gridSize: { type: Number, default: 20 },
    snapToGrid: { type: Boolean, default: true },
    scale: { type: Number, default: 100 }, // 1:100 scale
    units: { type: String, enum: ['meters', 'feet'], default: 'meters' },

    // Dimensions
    canvasWidth: { type: Number, default: 1200 },
    canvasHeight: { type: Number, default: 800 },

    // Calculated properties
    totalArea: Number,
    roomCount: Number,
    wallCount: Number,

    // AI generation history
    aiGenerations: [
      {
        prompt: String,
        timestamp: Date,
        elementsGenerated: Number,
        success: Boolean,
        error: String,
      },
    ],

    // Export history
    exports: [
      {
        format: { type: String, enum: ['dxf', 'dwg', 'pdf', 'png', 'svg'] },
        timestamp: Date,
        fileUrl: String,
      },
    ],

    // Version control
    version: { type: String, default: '1.0.0' },
    history: [
      {
        action: String,
        elements: [ElementSchema],
        timestamp: Date,
        userId: mongoose.Schema.Types.ObjectId,
      },
    ],

    // Status
    status: {
      type: String,
      enum: ['draft', 'in-progress', 'review', 'approved', 'archived', 'completed'],
      default: 'draft',
    },

    // Sharing
    isPublic: { type: Boolean, default: false },
    sharedWith: [
      {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        permission: {
          type: String,
          enum: ['view', 'edit', 'admin'],
          default: 'view',
        },
        sharedAt: { type: Date, default: Date.now },
      },
    ],

    // Metadata
    tags: [String],
    thumbnail: String,
    lastModifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
)

// Indexes
FloorPlanSchema.index({ userId: 1, status: 1 })
FloorPlanSchema.index({ projectId: 1 })
FloorPlanSchema.index({ 'sharedWith.userId': 1 })
FloorPlanSchema.index({ isPublic: 1, status: 1 })
FloorPlanSchema.index({ createdAt: -1 })

// Pre-save middleware to calculate properties
FloorPlanSchema.pre('save', function (next) {
  if (this.elements) {
    // Calculate room count
    this.roomCount = this.elements.filter((el) => el.type === 'room').length

    // Calculate wall count
    this.wallCount = this.elements.filter((el) => el.type === 'wall').length

    // Calculate total area (sum of all room areas)
    this.totalArea = this.elements
      .filter((el) => el.type === 'room')
      .reduce((total, room) => {
        const area = (room.width || 0) * (room.height || 0)
        return total + area
      }, 0)
    }
  if (!this.lastModifiedBy) {
    this.lastModifiedBy = this.userId
  }
  next()
})

// Methods
FloorPlanSchema.methods.canUserEdit = function (userId) {
  if (this.userId.toString() === userId.toString()) return true

  const share = this.sharedWith.find(
    (share) => share.userId.toString() === userId.toString()
  )
  return share && (share.permission === 'edit' || share.permission === 'admin')
}

FloorPlanSchema.methods.canUserView = function (userId) {
  if (this.isPublic) return true
  if (this.userId.toString() === userId.toString()) return true

  return this.sharedWith.some(
    (share) => share.userId.toString() === userId.toString()
  )
}

FloorPlanSchema.methods.addToHistory = function (action, elements, userId) {
  this.history.push({
    action,
    elements: JSON.parse(JSON.stringify(elements)),
    timestamp: new Date(),
    userId,
  })

  // Keep only last 50 history entries
  if (this.history.length > 50) {
    this.history = this.history.slice(-50)
  }
}

export default mongoose.model('FloorPlan', FloorPlanSchema)
