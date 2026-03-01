import mongoose from 'mongoose';

const BillingUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    planId: {
      type: String,
      default: null,
    },
    billingPeriodStart: {
      type: Date,
      required: true,
    },
    billingPeriodEnd: {
      type: Date,
      required: true,
    },
    usedUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    limitUnits: {
      type: Number,
      default: 0,
      min: 0,
    },
    warning80SentAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

BillingUsageSchema.index({ userId: 1, billingPeriodStart: 1, billingPeriodEnd: 1 }, { unique: true });

export default mongoose.model('BillingUsage', BillingUsageSchema);
