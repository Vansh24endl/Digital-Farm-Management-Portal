import { Router, Response } from "express";
import User, { IUser } from "../models/User";
import VeterinarianProfile from "../models/VeterinarianProfile";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

/**
 * GET /api/users/profile
 * Get current user's personal account profile
 * STRICT: Only returns personal account information (no veterinarian credentials).
 */
router.get("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!._id)
      .populate("farmId", "name farmType location")
      .select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User account not found.",
      });
    }

    return res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        profilePhoto: user.profilePhoto || "",
        role: user.role,
        isActive: user.isActive,
        farmId: user.farmId,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Get user profile error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve user profile.",
    });
  }
});

/**
 * PUT /api/users/profile
 * Update personal account profile (name, phone, profilePhoto).
 * STRICT: Role, email, and password cannot be modified through this endpoint.
 */
router.put("/profile", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { name, phone, profilePhoto } = req.body;
    const updates: Partial<IUser> = {};

    if (name !== undefined) {
      if (!name?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Name cannot be empty.",
        });
      }
      updates.name = name.trim();
    }

    if (phone !== undefined) {
      updates.phone = String(phone).trim();
    }

    if (profilePhoto !== undefined) {
      updates.profilePhoto = String(profilePhoto).trim();
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: updates },
      { new: true, runValidators: true }
    )
      .populate("farmId", "name farmType location")
      .select("-password");

    if (!updatedUser) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    return res.json({
      success: true,
      message: "Personal profile updated successfully.",
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone || "",
        profilePhoto: updatedUser.profilePhoto || "",
        role: updatedUser.role,
        isActive: updatedUser.isActive,
        farmId: updatedUser.farmId,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt,
      },
    });
  } catch (error: any) {
    console.error("Update user profile error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update profile.",
    });
  }
});

/**
 * POST /api/users/profile-photo
 * Upload/update personal profile photo (base64 data URI or valid image URL).
 * Validates size (< 5MB) and supported formats (data:image/jpeg, png, webp or http(s) url).
 */
router.post("/profile-photo", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { photo } = req.body;

    if (!photo || typeof photo !== "string" || !photo.trim()) {
      return res.status(400).json({
        success: false,
        message: "Profile photo data or URL is required.",
      });
    }

    const trimmedPhoto = photo.trim();

    // Check size limit (max 5MB: ~7MB in base64)
    if (trimmedPhoto.length > 7 * 1024 * 1024) {
      return res.status(400).json({
        success: false,
        message: "Photo size exceeds 5MB limit.",
      });
    }

    // Validate format: either data:image/(jpeg|jpg|png|webp);base64,... or http/https URL
    const isDataUri = /^data:image\/(jpeg|jpg|png|webp);base64,/i.test(trimmedPhoto);
    const isHttpUrl = /^https?:\/\/.+/i.test(trimmedPhoto);

    if (!isDataUri && !isHttpUrl) {
      return res.status(400).json({
        success: false,
        message: "Invalid image format. Supported formats: JPEG, PNG, WebP, or valid image URL.",
      });
    }

    const user = await User.findByIdAndUpdate(
      req.user!._id,
      { $set: { profilePhoto: trimmedPhoto } },
      { new: true, runValidators: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    // Also update VeterinarianProfile if user is veterinarian
    if (user.role === "veterinarian") {
      await VeterinarianProfile.findOneAndUpdate(
        { userId: user._id },
        { $set: { profilePhoto: trimmedPhoto } }
      );
    }

    return res.json({
      success: true,
      message: "Profile photo updated successfully.",
      data: {
        profilePhoto: user.profilePhoto,
      },
    });
  } catch (error: any) {
    console.error("Update profile photo error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to update profile photo.",
    });
  }
});

/**
 * PUT /api/users/change-password
 * Change password securely with verification of current password.
 */
router.put("/change-password", protect, async (req: AuthRequest, res: Response) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long.",
      });
    }

    // Retrieve user with password included
    const user = await User.findById(req.user!._id).select("+password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found.",
      });
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Current password does not match.",
      });
    }

    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password changed successfully.",
    });
  } catch (error: any) {
    console.error("Change password error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to change password.",
    });
  }
});

export default router;

