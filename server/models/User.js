// File: models/User.js (FIXED VERSION)
import bcrypt from "bcryptjs";
import crypto from "crypto";
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    lastLogin: {
      type: Date,
    },
    // ✅ FIXED: Added passwordChangedAt field
    passwordChangedAt: {
      type: Date,
    },
    // ✅ FIXED: Added passwordResetToken field (for future password reset feature)
    passwordResetToken: {
      type: String,
    },
    // ✅ FIXED: Added passwordResetExpires field (for future password reset feature)
    passwordResetExpires: {
      type: Date,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    // ✅ Optional: Added deletedAt for soft delete tracking
    deletedAt: {
      type: Date,
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    onboardingData: {
      type: mongoose.Schema.Types.Mixed,
    },
    // Stripe & Subscription fields
    stripeCustomerId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripeSubscriptionId: {
      type: String,
      unique: true,
      sparse: true,
    },
    stripePriceId: {
      type: String,
    },
    subscriptionStatus: {
      type: String,
      enum: ["none", "trialing", "active", "past_due", "canceled", "unpaid"],
      default: "none",
    },
    subscriptionCurrentPeriodEnd: {
      type: Date,
    },
    cancelAtPeriodEnd: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ isDeleted: 1, isActive: 1 });

// ✅ FIXED: Updated pre-save middleware to set passwordChangedAt
UserSchema.pre("save", async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified("password")) return next();

  try {
    // Generate a salt and hash the password
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);

    // ✅ FIXED: Set passwordChangedAt when password is changed (but not on new user creation)
    if (!this.isNew) {
      this.passwordChangedAt = Date.now() - 1000; // Minus 1 second to ensure it's before JWT issued
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Method to check if password is correct
UserSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// ✅ Method to check if password was changed after JWT was issued
UserSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false;
};

// Query middleware to exclude deleted users by default
UserSchema.pre(/^find/, function (next) {
  // this points to the current query
  this.find({ isDeleted: { $ne: true } });
  next();
});

export default mongoose.model("User", UserSchema);
