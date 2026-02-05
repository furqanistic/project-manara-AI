import mongoose from 'mongoose'

const threeDSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: {
      type: String,
      default: 'Generated 3D Model',
    },
    sourceImage: {
      type: String, // URL or base64
    },
    glbUrl: {
      type: String,
      required: false,
    },
    glbPath: {
      type: String,
      required: false,
    },
    sceneJson: {
      type: mongoose.Schema.Types.Mixed,
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
    },
    versions: [
      {
        style: String,
        image: {
          url: String,
          data: String, // base64
          mimeType: String,
        },
        prompt: String,
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  { timestamps: true }
)

// Add methods to check permissions if needed
threeDSchema.methods.canUserView = function (userId) {
  return this.userId.toString() === userId.toString()
}

const ThreeDModel = mongoose.model('ThreeDModel', threeDSchema)

export default ThreeDModel
