import { Router, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUser, UserRole } from "../models/User";
import Farm from "../models/Farm";
import { protect, authorize, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// Helper function to generate JWT token
const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET || "fallback_secret_key";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign(
    { id: user._id, role: user.role },
    secret,
    { expiresIn } as any
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user (Farm Manager, Inspector, Veterinarian, Admin)
// @access  Public
router.post("/register", async (req, res: Response) => {
  try {
    const { name, email, password, role, farmId, phone } = req.body;

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "An account with this email already exists.",
      });
    }

    // Validate farmId if provided
    let validFarmId: mongoose.Types.ObjectId | undefined = undefined;
    if (farmId) {
      if (!mongoose.isValidObjectId(farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId provided.",
        });
      }
      const farmExists = await Farm.findById(farmId);
      if (!farmExists) {
        return res.status(404).json({
          success: false,
          message: "The specified farm was not found.",
        });
      }
      validFarmId = new mongoose.Types.ObjectId(farmId);
    }

    // Validate role if provided
    const validRoles: UserRole[] = ["admin", "farm_manager", "inspector", "veterinarian"];
    const userRole: UserRole = role && validRoles.includes(role) ? role : "farm_manager";

    // Create user
    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: userRole,
      farmId: validFarmId || null,
      phone: phone?.trim() || "",
    });
    await user.save();

    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      message: "Account registered successfully.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error("Register error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register user.",
    });
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
// @access  Public
router.post("/login", async (req, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    // Find user and explicitly include password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account is deactivated. Contact an administrator.",
      });
    }

    // Check password match
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const token = generateToken(user);

    // Optionally populate farm info
    if (user.farmId) {
      await user.populate("farmId", "name farmType location");
    }

    return res.json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        farmId: user.farmId,
        phone: user.phone,
      },
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error during login.",
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged-in user profile
// @access  Private
router.get("/me", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .populate("farmId", "name farmType location")
      .select("-password");

    return res.json({
      success: true,
      user,
    });
  } catch (error: any) {
    console.error("Get current user error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
});

// @route   PUT /api/auth/profile
// @desc    Update current user profile
// @access  Private
router.put("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone } = req.body;
    const updates: Partial<IUser> = {};

    if (name?.trim()) updates.name = name.trim();
    if (typeof phone === "string") updates.phone = phone.trim();

    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("farmId", "name farmType location")
      .select("-password");

    return res.json({
      success: true,
      message: "Profile updated successfully.",
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update profile.",
    });
  }
});

// @route   GET /api/auth/users
// @desc    Get list of all users (Admin only)
// @access  Private (Admin)
router.get(
  "/users",
  protect,
  authorize("admin"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const users = await User.find()
        .populate("farmId", "name farmType location")
        .select("-password")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: users.length,
        users,
      });
    } catch (error: any) {
      console.error("List users error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to list users.",
      });
    }
  }
);

export default router;
