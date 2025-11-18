// File: routes/auth.js (FIXED VERSION)
import express from "express";
import {
  changePassword,
  deleteUser,
  getAllUsers,
  getUserProfile,
  logout,
  signin,
  signup,
  updateUser,
} from "../controllers/auth.js";
import { restrictTo, verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

/**
 * POST /api/auth/signup
 * Create a new user account
 * Body: { name, email, password, role? }
 */
router.post("/signup", signup);

/**
 * POST /api/auth/signin
 * Login existing user
 * Body: { email, password }
 */
router.post("/signin", signin);

// ============================================
// PROTECTED ROUTES (Authentication required)
// ============================================

// Apply authentication middleware to all routes below
router.use(verifyToken);

/**
 * GET /api/auth/profile/:id
 * Get user profile by ID
 * Params: { id: userId }
 */
router.get("/profile/:id", getUserProfile);

/**
 * PUT /api/auth/change-password
 * Change current user's password
 * Body: { currentPassword, newPassword, confirmPassword }
 */
router.put("/change-password", changePassword);

/**
 * POST /api/auth/logout
 * Logout current user
 */
router.post("/logout", logout);

/**
 * PUT /api/auth/profile
 * Update current user's profile (name, email)
 * Automatically sets userId from token
 * Body: { name?, email?, role? }
 */
router.put(
  "/profile",
  (req, res, next) => {
    // ✅ Set the userId from authenticated user's token
    req.params.id = req.user._id;
    next();
  },
  updateUser
);

/**
 * PUT /api/auth/users/:id
 * Update user profile (can update own or others if admin)
 * Params: { id: userId }
 * Body: { name?, email?, role? }
 */
router.put(
  "/users/:id",
  (req, res, next) => {
    // Allow admin to update anyone, or user to update themselves
    if (
      req.user.role === "admin" ||
      req.user._id.toString() === req.params.id
    ) {
      next();
    } else {
      const error = new Error("You can only access your own profile");
      error.statusCode = 403;
      next(error);
    }
  },
  updateUser
);

// ============================================
// ADMIN ONLY ROUTES
// ============================================

// Apply admin restriction middleware
router.use(restrictTo("admin"));

/**
 * GET /api/auth/all-users
 * Get all users (paginated)
 * Query: { page?, limit? }
 */
router.get("/all-users", getAllUsers);

/**
 * POST /api/auth/create-user
 * Create new user as admin
 * Body: { name, email, password, role? }
 */
router.post("/create-user", signup);

/**
 * PUT /api/auth/admin/users/:id
 * Update user as admin
 * Params: { id: userId }
 * Body: { name?, email?, role? }
 */
router.put("/admin/users/:id", updateUser);

/**
 * DELETE /api/auth/admin/users/:id
 * Delete/deactivate user as admin (soft delete)
 * Params: { id: userId }
 */
router.delete("/admin/users/:id", deleteUser);

export default router;
