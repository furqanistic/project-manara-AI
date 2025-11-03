// File: server/models/Moodboard.js
import mongoose from 'mongoose'

const ColorPaletteSchema = new mongoose.Schema(
  {
    hex: {
      type: String,
      required: true,
    },
    rgb: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100,
    },
  },
  { _id: false }
)

const MoodDescriptionSchema = new mongoose.Schema(
  {
    mood: {
      type: String,
      default: 'Harmonious',
    },
    feeling: {
      type: String,
      default: 'Comfortable and Inviting',
    },
    description: {
      type: String,
      default:
        'A thoughtfully designed space that balances aesthetics with functionality.',
    },
    keywords: {
      type: [String],
      default: ['Modern', 'Elegant', 'Refined', 'Timeless'],
    },
  },
  { _id: false }
)

const DesignNarrativeSchema = new mongoose.Schema(
  {
    narrative: {
      type: String,
      default: '',
    },
    vibe: {
      type: String,
      default: '',
    },
    lifestyle: {
      type: String,
      default: '',
    },
  },
  { _id: false }
)

const MaterialItemSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    finish: String,
    color: String,
    texture: String,
    maintenance: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    source: String,
    notes: String,
  },
  { _id: false }
)

const MaterialsSchema = new mongoose.Schema(
  {
    floors: [MaterialItemSchema],
    walls: [MaterialItemSchema],
    tiles: [MaterialItemSchema],
    fabrics: [MaterialItemSchema],
    metals: [MaterialItemSchema],
    woods: [MaterialItemSchema],
  },
  { _id: false }
)

const FurnitureItemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: [
        'seating',
        'tables',
        'storage',
        'beds',
        'lighting',
        'decor',
        'other',
      ],
      default: 'other',
    },
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
      unit: {
        type: String,
        enum: ['cm', 'inch', 'ft'],
        default: 'cm',
      },
    },
    scaleNotes: String,
    source: String,
    brand: String,
    imageUrl: String,
    placement: String,
    isHero: {
      type: Boolean,
      default: false,
    },
  },
  { _id: false }
)

const FurnitureSchema = new mongoose.Schema(
  {
    heroPieces: [FurnitureItemSchema],
    alternates: [FurnitureItemSchema],
  },
  { _id: false }
)

const LightingItemSchema = new mongoose.Schema(
  {
    name: String,
    type: {
      type: String,
      enum: [
        'pendant',
        'chandelier',
        'recessed',
        'wall_sconce',
        'floor_lamp',
        'table_lamp',
        'track',
        'strip',
        'other',
      ],
    },
    placement: String,
    kelvin: {
      type: Number,
      min: 1000,
      max: 10000,
    },
    lumens: Number,
    notes: String,
    source: String,
  },
  { _id: false }
)

const LightingConceptSchema = new mongoose.Schema(
  {
    ambient: [LightingItemSchema],
    task: [LightingItemSchema],
    accent: [LightingItemSchema],
    dayMood: {
      description: String,
      lightingNotes: String,
    },
    nightMood: {
      description: String,
      lightingNotes: String,
    },
  },
  { _id: false }
)

const ZoneSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    purpose: String,
    focalPoint: String,
    flowDirection: String,
    dimensions: {
      x: Number,
      y: Number,
      width: Number,
      height: Number,
    },
  },
  { _id: false }
)

const VariantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: String,
    differences: [String],
    imageUrl: String,
    colorPalette: [ColorPaletteSchema],
    materials: MaterialsSchema,
    furniture: FurnitureSchema,
  },
  { _id: false }
)

const ImageRegionSchema = new mongoose.Schema(
  {
    index: Number,
    x: Number,
    y: Number,
    width: Number,
    height: Number,
  },
  { _id: false }
)

const GeneratedImageMetadataSchema = new mongoose.Schema(
  {
    model: String,
    aspectRatio: String,
    tokens: Number,
    index: Number,
    editPrompt: String,
    isIndividual: Boolean,
    colorPalette: [ColorPaletteSchema],
  },
  { _id: false }
)

const CompositeMoodboardMetadataSchema = new mongoose.Schema(
  {
    model: String,
    aspectRatio: String,
    tokens: Number,
    isComposite: Boolean,
    width: Number,
    height: Number,
    imageCount: Number,
    imageRegions: [ImageRegionSchema],
    colorPalette: [ColorPaletteSchema],
    moodDescription: MoodDescriptionSchema,
  },
  { _id: false }
)

const MoodboardSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: false,
      index: true,
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
        'art-deco',
        'mediterranean',
        'japanese',
        'industrial-chic',
        'transitional',
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
        'home_office',
        'outdoor',
        'hallway',
        'kids_room',
        'commercial',
        'restaurant',
        'other',
      ],
    },
    colorPreferences: {
      type: [String],
      default: [],
    },
    paletteColors: {
      type: [String],
      default: [],
    },
    colorPalette: {
      type: [ColorPaletteSchema],
      default: [],
    },
    layout: {
      type: String,
      enum: ['grid', 'collage', 'single'],
      default: 'collage',
    },
    imageCount: {
      type: Number,
      min: 1,
      max: 6,
      default: 1,
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
      default: '16:9',
    },
    referenceImages: [
      {
        url: String,
        description: String,
      },
    ],
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
        metadata: GeneratedImageMetadataSchema,
      },
    ],
    compositeMoodboard: {
      url: String,
      prompt: String,
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      metadata: CompositeMoodboardMetadataSchema,
    },
    status: {
      type: String,
      enum: ['draft', 'generating', 'completed', 'failed'],
      default: 'draft',
      index: true,
    },
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },
    notes: {
      type: String,
      trim: true,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },
    designNarrative: {
      type: DesignNarrativeSchema,
      default: () => ({}),
    },
    materials: {
      type: MaterialsSchema,
      default: () => ({}),
    },
    furniture: {
      type: FurnitureSchema,
      default: () => ({}),
    },
    lightingConcept: {
      type: LightingConceptSchema,
      default: () => ({}),
    },
    zones: {
      type: [ZoneSchema],
      default: [],
    },
    variants: {
      type: [VariantSchema],
      default: [],
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
)

MoodboardSchema.index({ userId: 1, createdAt: -1 })
MoodboardSchema.index({ userId: 1, status: 1 })
MoodboardSchema.index({ projectId: 1, createdAt: -1 })
MoodboardSchema.index({ isDeleted: 1, userId: 1 })

MoodboardSchema.pre(/^find/, function (next) {
  this.find({ isDeleted: { $ne: true } })
  next()
})

MoodboardSchema.methods.incrementViewCount = async function () {
  this.viewCount += 1
  this.lastViewedAt = new Date()
  await this.save({ validateBeforeSave: false })
}

MoodboardSchema.methods.incrementDownloadCount = async function () {
  this.downloadCount += 1
  await this.save({ validateBeforeSave: false })
}

MoodboardSchema.virtual('dominantColor').get(function () {
  if (this.colorPalette && this.colorPalette.length > 0) {
    return this.colorPalette[0].hex
  }
  return '#937c60'
})

MoodboardSchema.virtual('moodSummary').get(function () {
  if (this.compositeMoodboard?.metadata?.moodDescription) {
    const mood = this.compositeMoodboard.metadata.moodDescription
    return `${mood.mood} - ${mood.feeling}`
  }
  return 'Harmonious Design'
})

export default mongoose.model('Moodboard', MoodboardSchema)
