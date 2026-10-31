import { Router, Response } from "express";
import mongoose from "mongoose";
import { protect, authorize, AuthRequest } from "../middleware/authMiddleware";
import VeterinarianProfile from "../models/VeterinarianProfile";

const router = Router();

/**
 * GET /api/admin/veterinarians/pending
 * Retrieve all veterinarian profiles pending admin verification.
 */
router.get(
  "/veterinarians/pending",
  protect,
  authorize("admin"),
  async (_req: AuthRequest, res: Response) => {
    try {
      const pending = await VeterinarianProfile.find({ verificationStatus: "pending" })
        .populate("userId", "name email createdAt")
        .sort({ createdAt: -1 });

      return res.json({
        success: true,
        count: pending.length,
        data: pending,
      });
    } catch (error: any) {
      console.error("Admin get pending vets error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to retrieve pending veterinarian applications.",
      });
    }
  }
);

/**
 * PUT /api/admin/veterinarians/:id/verify
 * Approve or reject a veterinarian's professional profile verification.
 * Body: { status: 'verified' | 'rejected', reason?: string }
 */
router.put(
  "/veterinarians/:id/verify",
  protect,
  authorize("admin"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, reason } = req.body;

      if (!["verified", "rejected"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Status must be either 'verified' or 'rejected'.",
        });
      }

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid veterinarian profile ID.",
        });
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
        return res.status(404).json({
          success: false,
          message: "Veterinarian profile not found.",
        });
      }

      return res.json({
        success: true,
        message: `Veterinarian profile ${status === "verified" ? "approved" : "rejected"} successfully.`,
        data: profile,
      });
    } catch (error: any) {
      console.error("Admin verify vet error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update veterinarian verification status.",
      });
    }
  }
);

export default router;

