// File: controllers/auth.js (FIXED VERSION 2)
/**
 * ✅ FIXED: Profile update now sends token to prevent re-login
 * ✅ FIXED: Password change properly sets passwordChangedAt
 */

import jwt from "jsonwebtoken";
import { createRemoteJWKSet, jwtVerify } from "jose";
import mongoose from "mongoose";
import { createError } from "../error.js";
import User from "../models/User.js";
import { uploadAvatarSvg } from "../services/cloudinaryService.js";

const googleJwks = createRemoteJWKSet(
  new URL("https://www.googleapis.com/oauth2/v3/certs")
);
const appleJwks = createRemoteJWKSet(
  new URL("https://appleid.apple.com/auth/keys")
);

const signToken = (id) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in the environment variables");
  }
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

const createSendToken = (user, statusCode, res) => {
  try {
    const token = signToken(user._id);
    const cookieOptions = {
      expires: new Date(
        Date.now() +
          (parseInt(process.env.JWT_COOKIE_EXPIRES_IN) || 7) *
            24 *
            60 *
            60 *
            1000
      ),
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    };

    res.cookie("jwt", token, cookieOptions);

    // Remove password from output
    user.password = undefined;

    res.status(statusCode).json({
      status: "success",
      token,
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error in createSendToken:", error);
    throw error;
  }
};

const getClientConfig = (provider) => {
  const isConfigured = (value) =>
    !!value &&
    typeof value === "string" &&
    !value.trim().toUpperCase().startsWith("REPLACE_WITH_");

  if (provider === "google") {
    if (!isConfigured(process.env.GOOGLE_CLIENT_ID)) {
      throw createError(500, "GOOGLE_CLIENT_ID is not configured");
    }
    return process.env.GOOGLE_CLIENT_ID.trim();
  }

  if (!isConfigured(process.env.APPLE_CLIENT_ID)) {
    throw createError(500, "APPLE_CLIENT_ID is not configured");
  }
  return process.env.APPLE_CLIENT_ID.trim();
};

const getProviderName = (provider) => {
  if (provider === "google") return "Google";
  if (provider === "apple") return "Apple";
  return "Social";
};

const normalizeName = ({ name, firstName, lastName, email }) => {
  const fullName = [firstName, lastName].filter(Boolean).join(" ").trim();
  if (fullName) return fullName;
  if (name && String(name).trim()) return String(name).trim();
  if (email && String(email).includes("@")) {
    return String(email).split("@")[0];
  }
  return "Manara User";
};

const verifyGoogleIdToken = async (idToken) => {
  const audience = getClientConfig("google");

  const { payload } = await jwtVerify(idToken, googleJwks, {
    issuer: ["https://accounts.google.com", "accounts.google.com"],
    audience,
  });

  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";

  if (!payload.sub || !payload.email || !emailVerified) {
    throw createError(401, "Invalid Google identity token");
  }

  return payload;
};

const verifyAppleIdToken = async (idToken) => {
  const audience = getClientConfig("apple");

  const { payload } = await jwtVerify(idToken, appleJwks, {
    issuer: "https://appleid.apple.com",
    audience,
  });

  const emailVerified =
    payload.email_verified === true || payload.email_verified === "true";

  if (!payload.sub || (payload.email && !emailVerified)) {
    throw createError(401, "Invalid Apple identity token");
  }

  return payload;
};

const findOrCreateSocialUser = async ({
  provider,
  providerId,
  email,
  name,
  avatarUrl,
}) => {
  const normalizedEmail = email ? email.toLowerCase().trim() : null;
  const providerField = provider === "google" ? "googleId" : "appleId";

  let user = await User.findOne({ [providerField]: providerId });

  if (!user && normalizedEmail) {
    user = await User.findOne({ email: normalizedEmail });
  }

  if (!user) {
    user = await User.create({
      name: normalizeName({ name, email: normalizedEmail }),
      email: normalizedEmail,
      authProvider: provider,
      [providerField]: providerId,
      onboardingData: avatarUrl
        ? {
            social: {
              avatarUrl,
              provider,
            },
          }
        : undefined,
      lastLogin: new Date(),
    });

    return user;
  }

  const updates = {
    lastLogin: new Date(),
  };

  if (!user[providerField]) {
    updates[providerField] = providerId;
  }

  if (!user.authProvider) {
    updates.authProvider = provider;
  }

  if (!user.name && name) {
    updates.name = normalizeName({ name, email: user.email });
  }

  if (
    avatarUrl &&
    (!user.onboardingData?.social || !user.onboardingData.social.avatarUrl)
  ) {
    updates.onboardingData = {
      ...(user.onboardingData || {}),
      social: {
        avatarUrl,
        provider,
      },
    };
  }

  user = await User.findByIdAndUpdate(user._id, updates, {
    new: true,
    runValidators: true,
  });

  return user;
};

export const signup = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { name, email, password, role } = req.body;

    // Check if all required fields are provided
    if (!name || !email || !password) {
      await session.abortTransaction();
      return next(createError(400, "Please provide name, email and password"));
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      await session.abortTransaction();
      return next(createError(400, "Please provide a valid email address"));
    }

    // Validate password strength
    if (password.length < 8) {
      await session.abortTransaction();
      return next(
        createError(400, "Password must be at least 8 characters long")
      );
    }

    // Set default role to user if not provided
    const userRole = role || "user";

    // Check if user with this email already exists
    const existingUser = await User.findOne({ email }).session(session);
    if (existingUser) {
      await session.abortTransaction();
      return next(createError(400, "User with this email already exists"));
    }

    // Create new user (password will be hashed by the pre-save middleware)
    const newUserData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
    };

    const [newUser] = await User.create([newUserData], { session });

    await session.commitTransaction();

    // Get user without password
    const populatedUser = await User.findById(newUser._id).select("-password");

    // Send token to the new user
    createSendToken(populatedUser, 201, res);
  } catch (err) {
    await session.abortTransaction();
    console.error("Error in signup:", err);

    if (err.code === 11000) {
      // Handle duplicate key errors
      const field = Object.keys(err.keyValue)[0];
      return next(createError(400, `${field} already exists`));
    }

    next(createError(500, "An unexpected error occurred during signup"));
  } finally {
    session.endSession();
  }
};

export const signin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return next(createError(400, "Please provide email and password"));
    }

    // Find user and include password for comparison
    const user = await User.findOne({
      email: email.toLowerCase().trim(),
      isActive: true,
      isDeleted: false,
    }).select("+password");

    if (user && !user.password) {
      const providerLabel = getProviderName(user.authProvider);
      return next(
        createError(
          400,
          `This account uses ${providerLabel} sign-in. Please continue with ${providerLabel}.`
        )
      );
    }

    if (!user || !(await user.correctPassword(password, user.password))) {
      return next(createError(401, "Incorrect email or password"));
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Get user data for response
    const populatedUser = await User.findById(user._id).select("-password");

    createSendToken(populatedUser, 200, res);
  } catch (err) {
    console.error("Error in signin:", err);
    next(createError(500, "An unexpected error occurred during login"));
  }
};

export const signinWithGoogle = async (req, res, next) => {
  try {
    const { idToken } = req.body;

    if (!idToken || typeof idToken !== "string") {
      return next(createError(400, "Google identity token is required"));
    }

    const payload = await verifyGoogleIdToken(idToken);
    const user = await findOrCreateSocialUser({
      provider: "google",
      providerId: payload.sub,
      email: payload.email,
      name: payload.name,
      avatarUrl: payload.picture,
    });

    const populatedUser = await User.findById(user._id).select("-password");
    createSendToken(populatedUser, 200, res);
  } catch (error) {
    console.error("Error in signinWithGoogle:", error);
    if (
      error?.code === "ERR_JWT_EXPIRED" ||
      error?.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return next(createError(401, "Google sign-in failed. Please try again."));
    }
    next(error);
  }
};

export const signinWithApple = async (req, res, next) => {
  try {
    const { idToken, firstName, lastName, name } = req.body;

    if (!idToken || typeof idToken !== "string") {
      return next(createError(400, "Apple identity token is required"));
    }

    const payload = await verifyAppleIdToken(idToken);
    const providerId = payload.sub;
    let user = await User.findOne({ appleId: providerId });

    if (!user) {
      const email = payload.email ? String(payload.email).toLowerCase() : null;
      if (!email) {
        return next(
          createError(
            400,
            "Apple did not return an email address. Please use your first Apple sign-in attempt again."
          )
        );
      }

      user = await findOrCreateSocialUser({
        provider: "apple",
        providerId,
        email,
        name: normalizeName({ name, firstName, lastName, email }),
      });
    } else {
      user.lastLogin = new Date();
      await user.save({ validateBeforeSave: false });
    }

    const populatedUser = await User.findById(user._id).select("-password");
    createSendToken(populatedUser, 200, res);
  } catch (error) {
    console.error("Error in signinWithApple:", error);
    if (
      error?.code === "ERR_JWT_EXPIRED" ||
      error?.code === "ERR_JWS_SIGNATURE_VERIFICATION_FAILED"
    ) {
      return next(createError(401, "Apple sign-in failed. Please try again."));
    }
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const { role, name, email } = req.body;
    const userId = req.params.id;

    // Find the user first
    const existingUser = await User.findById(userId);

    // If no user found with that ID
    if (!existingUser) {
      return next(createError(404, "No user found with that ID"));
    }

    // Validate role if being updated
    if (role && !["admin", "user"].includes(role)) {
      return next(createError(400, "Invalid role provided"));
    }

    // Validate email if being updated
    if (email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return next(createError(400, "Please provide a valid email address"));
      }

      // Check if email is already taken by another user
      const emailExists = await User.findOne({
        email: email.toLowerCase().trim(),
        _id: { $ne: userId },
      });

      if (emailExists) {
        return next(createError(400, "Email is already taken by another user"));
      }
    }

    // Prepare update data
    const updateData = {};
    if (role) updateData.role = role;
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.toLowerCase().trim();

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    });

    // ✅ FIXED: Send token with profile update to prevent re-login
    createSendToken(updatedUser, 200, res);
  } catch (error) {
    console.error("Error in updateUser:", error);
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      {
        isDeleted: true,
        isActive: false,
        deletedAt: new Date(),
      },
      {
        new: true,
      }
    );

    if (!user) {
      return next(createError(404, "No user found with that ID"));
    }

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    console.error("Error in deleteUser:", error);
    next(error);
  }
};

export const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(createError(404, "No user found with that ID"));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({ isDeleted: false })
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const totalUsers = await User.countDocuments({ isDeleted: false });

    res.status(200).json({
      status: "success",
      results: users.length,
      totalResults: totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
      data: {
        users,
      },
    });
  } catch (error) {
    console.error("Error in getAllUsers:", error);
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return next(
        createError(
          400,
          "Please provide current password, new password, and confirm password"
        )
      );
    }

    if (newPassword !== confirmPassword) {
      return next(
        createError(400, "New password and confirm password do not match")
      );
    }

    if (newPassword.length < 8) {
      return next(
        createError(400, "New password must be at least 8 characters long")
      );
    }

    // ✅ FIXED: Changed req.user.id to req.user._id
    const user = await User.findById(req.user._id).select("+password");

    if (!user) {
      return next(createError(404, "User not found"));
    }

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return next(createError(401, "Your current password is incorrect"));
    }

    // Set new password (will be hashed by pre-save middleware)
    user.password = newPassword;
    await user.save();

    // Get updated user without password
    const updatedUser = await User.findById(user._id);

    createSendToken(updatedUser, 200, res);
  } catch (error) {
    console.error("Error in changePassword:", error);
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("jwt", "loggedout", {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true,
    });

    res.status(200).json({
      status: "success",
      message: "Logged out successfully",
    });
  } catch (error) {
    console.error("Error in logout:", error);
    next(error);
  }
};

const ONBOARDING_QUESTION_IDS_BY_USER_TYPE = {
  homeowner: ["owner_status", "volume", "duration"],
  interior_designer: ["owner_status", "volume", "duration"],
  business_developer: ["owner_status", "volume", "duration"],
};

const ALLOWED_USER_TYPES = Object.keys(ONBOARDING_QUESTION_IDS_BY_USER_TYPE);

export const completeOnboarding = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const {
      userType,
      qualification = {},
      requiredProfile = {},
      stripeMetadata = {},
      flow = {},
    } = req.body || {};

    if (!ALLOWED_USER_TYPES.includes(userType)) {
      return next(
        createError(
          400,
          "Please choose a valid user type: homeowner, interior_designer, or business_developer"
        )
      );
    }

    const questions = Array.isArray(qualification.questions)
      ? qualification.questions
      : [];

    if (questions.length !== 3) {
      return next(createError(400, "Exactly 3 qualification questions are required"));
    }

    const expectedQuestionIds =
      ONBOARDING_QUESTION_IDS_BY_USER_TYPE[userType] || [];
    const receivedQuestionIds = questions.map((question) => question?.id);
    const hasExpectedQuestionSet =
      expectedQuestionIds.length === 3 &&
      expectedQuestionIds.every((id) => receivedQuestionIds.includes(id));

    if (!hasExpectedQuestionSet) {
      return next(createError(400, "Qualification questions do not match selected user type"));
    }

    const allQuestionsAnswered = questions.every(
      (question) =>
        question &&
        typeof question.prompt === "string" &&
        question.prompt.trim().length > 0 &&
        typeof question.answer === "string" &&
        question.answer.trim().length > 0
    );

    if (!allQuestionsAnswered) {
      return next(createError(400, "All qualification questions must be answered"));
    }

    const country = String(requiredProfile.country || "").trim();
    const city = String(requiredProfile.city || "").trim();
    const billingRegion = String(requiredProfile.billingRegion || "").trim();
    const emailConfirmed = requiredProfile.emailConfirmed === true;

    if (!country || !city || !billingRegion) {
      return next(createError(400, "Country, city, and intended billing region are required"));
    }

    if (!emailConfirmed) {
      return next(
        createError(400, "Email confirmation is required before finishing onboarding")
      );
    }

    const completionSeconds = Number(qualification.completionSeconds || 0);
    const sanitizedCompletionSeconds =
      Number.isFinite(completionSeconds) && completionSeconds > 0
        ? Math.round(completionSeconds)
        : null;

    const onboardingData = {
      userType,
      qualification: {
        questions: questions.map((question) => ({
          id: question.id,
          prompt: String(question.prompt).trim(),
          answer: String(question.answer).trim(),
        })),
        completionSeconds: sanitizedCompletionSeconds,
      },
      requiredProfile: {
        country,
        city,
        billingRegion,
        emailConfirmed: true,
      },
      stripeMetadata: {
        userType,
        country,
        city,
        billingRegion,
        ...(stripeMetadata && typeof stripeMetadata === "object" ? stripeMetadata : {}),
      },
      flow: {
        version: flow.version || "onboarding-v2",
        basicComplete: true,
        qualificationComplete: true,
        billingComplete: true,
        avatarComplete: false,
      },
    };

    const user = await User.findByIdAndUpdate(
      userId,
      {
        isOnboarded: true,
        onboardingData,
      },
      { new: true, runValidators: true }
    );

    if (!user) {
      return next(createError(404, "User not found"));
    }

    res.status(200).json({
      status: "success",
      data: {
        user,
      },
    });
  } catch (error) {
    console.error("Error in completeOnboarding:", error);
    next(error);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { svg, meta = {} } = req.body;

    if (!svg || typeof svg !== "string") {
      return next(createError(400, "Avatar SVG is required"));
    }

    const user = await User.findById(userId);
    if (!user) {
      return next(createError(404, "User not found"));
    }

    const cloudinaryResult = await uploadAvatarSvg(svg, "manara-ai/avatars");
    const existingOnboarding = user.onboardingData || {};

    const avatarPayload = {
      name: meta.name || "",
      style: meta.style || "",
      seed: meta.seed || "",
      palette: meta.palette || "",
      accessory: meta.accessory || "",
      url: cloudinaryResult.secure_url,
      publicId: cloudinaryResult.public_id,
      completed: true,
    };

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        isOnboarded: true,
        onboardingData: {
          ...existingOnboarding,
          avatar: avatarPayload,
          flow: {
            ...(existingOnboarding.flow || {}),
            avatarComplete: true,
            basicComplete: true,
            version: existingOnboarding.flow?.version || "onboarding-v2",
          },
        },
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: "success",
      data: {
        user: updatedUser,
        avatar: avatarPayload,
      },
    });
  } catch (error) {
    console.error("Error in uploadAvatar:", error);
    next(error);
  }
};
