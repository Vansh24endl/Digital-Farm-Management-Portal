import { Router, Response } from "express";
import mongoose from "mongoose";
import { protect, authorize, AuthRequest } from "../middleware/authMiddleware";
import VeterinarianProfile from "../models/VeterinarianProfile";

const router = Router();

// ─────────────────────────────────────────────────────────────────────────────
// VETERINARIAN ROUTES (role: veterinarian)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/veterinarians/profile
 * Get the logged-in veterinarian's own professional profile.
 */
router.get(
  "/profile",
  protect,
  authorize("veterinarian"),
  async (req: AuthRequest, res: Response) => {
    try {
      const profile = await VeterinarianProfile.findOne({ userId: req.user!._id });

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "Veterinarian profile not found. Please create one.",
        });
      }

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error("Get vet profile error:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve veterinarian profile." });
    }
  }
);

/**
 * POST /api/veterinarians/profile
 * Create a new veterinarian professional profile. Prevents duplicates.
 */
router.post(
  "/profile",
  protect,
  authorize("veterinarian"),
  async (req: AuthRequest, res: Response) => {
    try {
      // Prevent duplicate profiles
      const existing = await VeterinarianProfile.findOne({ userId: req.user!._id });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: "A veterinarian profile already exists for this account. Use PUT to update it.",
        });
      }

      const {
        fullName,
        profilePhoto,
        registrationNumber,
        qualification,
        specialization,
        yearsOfExperience,
        contactNumber,
        email,
        clinicName,
        clinicAddress,
        serviceLocation,
        bio,
        certificates,
      } = req.body;

      if (!fullName?.trim()) {
        return res.status(400).json({ success: false, message: "Full name is required." });
      }
      if (!registrationNumber?.trim()) {
        return res.status(400).json({ success: false, message: "Veterinary registration number is required." });
      }
      if (!qualification?.trim()) {
        return res.status(400).json({ success: false, message: "Qualification is required." });
      }

      const profile = new VeterinarianProfile({
        userId: req.user!._id,
        fullName: fullName.trim(),
        profilePhoto: profilePhoto?.trim() || "",
        registrationNumber: registrationNumber.trim(),
        qualification: qualification.trim(),
        specialization: specialization?.trim() || "",
        yearsOfExperience: Number(yearsOfExperience) || 0,
        contactNumber: contactNumber?.trim() || "",
        email: email?.toLowerCase().trim() || "",
        clinicName: clinicName?.trim() || "",
        clinicAddress: clinicAddress?.trim() || "",
        serviceLocation: serviceLocation?.trim() || "",
        bio: bio?.trim() || "",
        certificates: Array.isArray(certificates) ? certificates : [],
        verificationStatus: "pending",
      });

      await profile.save();

      return res.status(201).json({
        success: true,
        message: "Veterinarian profile created successfully. Awaiting admin verification.",
        data: profile,
      });
    } catch (error: any) {
      console.error("Create vet profile error:", error);
      return res.status(500).json({ success: false, message: "Failed to create veterinarian profile." });
    }
  }
);

/**
 * PUT /api/veterinarians/profile
 * Update the logged-in veterinarian's own professional profile.
 */
router.put(
  "/profile",
  protect,
  authorize("veterinarian"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        fullName,
        profilePhoto,
        registrationNumber,
        qualification,
        specialization,
        yearsOfExperience,
        contactNumber,
        email,
        clinicName,
        clinicAddress,
        serviceLocation,
        bio,
        certificates,
      } = req.body;

      const updates: Partial<any> = {};
      if (fullName?.trim()) updates.fullName = fullName.trim();
      if (typeof profilePhoto === "string") updates.profilePhoto = profilePhoto.trim();
      if (registrationNumber?.trim()) updates.registrationNumber = registrationNumber.trim();
      if (qualification?.trim()) updates.qualification = qualification.trim();
      if (typeof specialization === "string") updates.specialization = specialization.trim();
      if (yearsOfExperience !== undefined) updates.yearsOfExperience = Number(yearsOfExperience);
      if (typeof contactNumber === "string") updates.contactNumber = contactNumber.trim();
      if (typeof email === "string") updates.email = email.toLowerCase().trim();
      if (typeof clinicName === "string") updates.clinicName = clinicName.trim();
      if (typeof clinicAddress === "string") updates.clinicAddress = clinicAddress.trim();
      if (typeof serviceLocation === "string") updates.serviceLocation = serviceLocation.trim();
      if (typeof bio === "string") updates.bio = bio.trim();
      if (Array.isArray(certificates)) updates.certificates = certificates;

      const profile = await VeterinarianProfile.findOneAndUpdate(
        { userId: req.user!._id },
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (!profile) {
        return res.status(404).json({
          success: false,
          message: "No veterinarian profile found. Please create one first.",
        });
      }

      return res.json({
        success: true,
        message: "Veterinarian profile updated successfully.",
        data: profile,
      });
    } catch (error: any) {
      console.error("Update vet profile error:", error);
      return res.status(500).json({ success: false, message: "Failed to update veterinarian profile." });
    }
  }
);

/**
 * GET /api/veterinarians/:id
 * Get any veterinarian's profile by ID (for admins, farm managers, inspectors).
 */
router.get(
  "/:id",
  protect,
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid profile ID." });
      }

      const profile = await VeterinarianProfile.findById(req.params.id).populate(
        "userId",
        "name email role isActive"
      );

      if (!profile) {
        return res.status(404).json({ success: false, message: "Veterinarian profile not found." });
      }

      return res.json({ success: true, data: profile });
    } catch (error: any) {
      console.error("Get vet by ID error:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve veterinarian profile." });
    }
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// ADMIN ROUTES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * GET /api/veterinarians/admin/pending
 * Get all pending veterinarian verification requests (Admin only).
 */
router.get(
  "/admin/pending",
  protect,
  authorize("admin"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const pending = await VeterinarianProfile.find({ verificationStatus: "pending" })
        .populate("userId", "name email createdAt")
        .sort({ createdAt: -1 });

      return res.json({ success: true, count: pending.length, data: pending });
    } catch (error: any) {
      console.error("Get pending vets error:", error);
      return res.status(500).json({ success: false, message: "Failed to retrieve pending verification requests." });
    }
  }
);

/**
 * PUT /api/veterinarians/admin/:id/verify
 * Approve or reject a veterinarian's profile (Admin only).
 * Body: { status: 'verified' | 'rejected', reason?: string }
 */
router.put(
  "/admin/:id/verify",
  protect,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, reason } = req.body;

      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be 'verified' or 'rejected'.",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({ success: false, message: "Invalid profile ID." });
      }

      const updates: any = { verificationStatus: status };
      if (status === "rejected" && reason?.trim()) {
        updates.rejectionReason = reason.trim();
      } else if (status === "verified") {
        updates.rejectionReason = "";
      }

      const profile = await VeterinarianProfile.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true }
      ).populate("userId", "name email");

      if (!profile) {
        return res.status(404).json({ success: false, message: "Veterinarian profile not found." });
      }

      const statusLabel = status === "verified" ? "approved" : "rejected";
      return res.json({
        success: true,
        message: `Veterinarian profile ${statusLabel} successfully.`,
        data: profile,
      });
    } catch (error: any) {
      console.error("Verify vet profile error:", error);
      return res.status(500).json({ success: false, message: "Failed to update verification status." });
    }
  }
);

export default router;

