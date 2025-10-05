// File: server/models/Moodboard.js
import mongoose from 'mongoose'

const MoodboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    prompt: {
      type: String,
      required: true,
    },
    style: {
      type: String,
      enum: [
        'modern',
        'contemporary',
        'minimalist',
        'scandinavian',
        'industrial',
        'bohemian',
        'traditional',
        'rustic',
        'coastal',
        'eclectic',
        'mid-century',
        'luxury',
        'custom',
      ],
      default: 'modern',
    },
    roomType: {
      type: String,
      enum: [
        'living_room',
        'bedroom',
        'kitchen',
        'bathroom',
        'dining_room',
        'office',
        'outdoor',
        'entryway',
        'other',
      ],
    },
    colorPalette: {
      type: [String],
      default: [],
    },
    layout: {
      type: String,
      enum: ['grid', 'collage', 'single'],
      default: 'grid',
    },
    imageCount: {
      type: Number,
      min: 1,
      max: 6,
      default: 4,
    },
    aspectRatio: {
      type: String,
      enum: [
        '1:1',
        '16:9',
        '4:3',
        '9:16',
        '3:4',
        '2:1',
        '1:2',
        '21:9',
        '5:4',
        '3:2',
      ],
      default: '1:1',
    },
    referenceImages: [
      {
        url: String,
        description: String,
      },
    ],
    // Individual generated images (stored for editing)
    generatedImages: [
      {
        url: String,
        prompt: String,
        generatedAt: {
          type: Date,
          default: Date.now,
        },
        regenerated: {
          type: Boolean,
          default: false,
        },
        edited: {
          type: Boolean,
          default: false,
        },
        metadata: {
          model: String,
          aspectRatio: String,
          tokens: Number,
          index: Number,
          editPrompt: String,
          isIndividual: Boolean,
        },
      },
    ],
    // Composite moodboard (the final combined image)
    compositeMoodboard: {
      url: String,
      prompt: String,
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      metadata: {
        model: String,
        aspectRatio: String,
        tokens: Number,
        isComposite: Boolean,
        width: Number,
        height: Number,
        imageCount: Number,
        imageRegions: [
          {
            index: Number,
            x: Number,
            y: Number,
            width: Number,
            height: Number,
          },
        ],
      },
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    notes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

// Indexes for better performance
MoodboardSchema.index({ userId: 1, createdAt: -1 })
MoodboardSchema.index({ projectId: 1 })
MoodboardSchema.index({ status: 1 })
MoodboardSchema.index({ isDeleted: 1 })

// Query middleware to exclude deleted moodboards by default
MoodboardSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

export default mongoose.model('Moodboard', MoodboardSchema)
