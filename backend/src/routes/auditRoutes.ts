import { Router, Response } from "express";
import mongoose from "mongoose";
import Audit from "../models/Audit";
import Farm from "../models/Farm";
import {
  protect,
  authorize,
  AuthRequest,
  canAccessFarm,
} from "../middleware/authMiddleware";

const router = Router();

// Protect all audit routes
router.use(protect);

// CREATE AUDIT
// @access Private (Admin, Inspector)
router.post(
  "/",
  authorize("admin", "inspector"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        farmId,
        title,
        findings = "",
        riskLevel = "medium",
        severity,
        sector = "Sector 2 · Feed Mill",
        dueDate = "In 3 days",
        auditor = "Dr. Ananya Reyes",
        items,
        progress = 0,
      } = req.body;

      if (!title?.trim()) {
        return res.status(400).json({
          success: false,
          message: "Audit title is required",
        });
      }

      let targetFarmId = farmId;
      if (!targetFarmId || !mongoose.isValidObjectId(targetFarmId)) {
        if (req.user?.farmId) {
          targetFarmId = req.user.farmId;
        } else {
          const existingFarm = await Farm.findOne();
          if (existingFarm) {
            targetFarmId = existingFarm._id;
          } else {
            const newFarm = await Farm.create({
              name: "Main Production Site",
              farmType: "mixed",
              location: "Central Facility",
            });
            targetFarmId = newFarm._id;
          }
        }
      }

      // Check farm access permission
      if (!canAccessFarm(req.user!, targetFarmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to schedule audits for this farm.",
        });
      }

      const farmExists = await Farm.findById(targetFarmId);
      if (!farmExists) {
        return res.status(404).json({
          success: false,
          message: "Target farm does not exist.",
        });
      }

      // Default inspection checklist items if none passed
      const defaultItems = [
        { text: "Verify perimeter boundary fencing and entry disinfection trench", done: false },
        { text: "Inspect footbath chemical dilution and active virucide levels", done: false },
        { text: "Examine PPE change-room decontamination protocol log", done: false },
        { text: "Audit mortality bin containment and rendering transport seals", done: false },
      ];

      const mappedRisk = (severity === "urgent" || riskLevel === "high")
        ? "high"
        : (severity === "routine" || riskLevel === "low")
        ? "low"
        : "medium";

      const audit = await Audit.create({
        farmId: targetFarmId,
        title: title.trim(),
        findings: findings?.trim() || "",
        riskLevel: mappedRisk,
        status: "pending",
        sector: sector?.trim() || "Sector 2",
        dueDate: dueDate?.trim() || "In 3 days",
        auditor: auditor?.trim() || req.user?.name || "Biosecurity Auditor",
        progress: progress || 0,
        items: Array.isArray(items) && items.length > 0 ? items : defaultItems,
      });

      return res.status(201).json({
        success: true,
        message: "Audit scheduled successfully",
        data: audit,
      });
    } catch (error) {
      console.error("Create audit error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to create audit",
      });
    }
  }
);

// GET ALL AUDITS
// @access Private (Authenticated users, scoped by farm permissions)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.user?.role === "farm_manager" && req.user.farmId) {
      filter.farmId = req.user.farmId;
    } else if (req.query.farmId) {
      if (!mongoose.isValidObjectId(req.query.farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId",
        });
      }

      if (!canAccessFarm(req.user!, String(req.query.farmId))) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view audits for this farm.",
        });
      }

      filter.farmId = req.query.farmId;
    }

    const audits = await Audit.find(filter)
      .populate("farmId", "name farmType location")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: audits.length,
      data: audits,
    });
  } catch (error) {
    console.error("Fetch audits error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audits",
    });
  }
});

// UPDATE AUDIT (STATUS, PROGRESS, ITEMS)
// @access Private (Admin, Inspector)
router.patch(
  "/:id",
  authorize("admin", "inspector"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit ID",
        });
      }

      const existingAudit = await Audit.findById(req.params.id);
      if (!existingAudit) {
        return res.status(404).json({
          success: false,
          message: "Audit not found",
        });
      }

      if (!canAccessFarm(req.user!, existingAudit.farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to update audits for this farm.",
        });
      }

      const { status, progress, items, findings } = req.body;
      const updates: any = {};

      if (status && ["pending", "in-progress", "completed"].includes(status)) {
        updates.status = status;
      }
      if (typeof progress === "number") {
        updates.progress = Math.min(100, Math.max(0, progress));
      }
      if (Array.isArray(items)) {
        updates.items = items;
      }
      if (typeof findings === "string") {
        updates.findings = findings;
      }

      const audit = await Audit.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      ).populate("farmId", "name farmType location");

      return res.json({ success: true, data: audit });
    } catch (error) {
      console.error("Update audit error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update audit",
      });
    }
  }
);

// UPDATE AUDIT STATUS (Backwards compatibility)
// @access Private (Admin, Inspector)
router.patch(
  "/:id/status",
  authorize("admin", "inspector"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status } = req.body;

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit ID",
        });
      }

      const existingAudit = await Audit.findById(req.params.id);
      if (!existingAudit) {
        return res.status(404).json({
          success: false,
          message: "Audit not found",
        });
      }

      if (!canAccessFarm(req.user!, existingAudit.farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to update audits for this farm.",
        });
      }

      if (!["pending", "in-progress", "completed"].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "Invalid audit status",
        });
      }

      const audit = await Audit.findByIdAndUpdate(
        req.params.id,
        { status },
        { new: true, runValidators: true }
      );

      return res.json({ success: true, data: audit });
    } catch (error) {
      console.error("Update audit error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update audit",
      });
    }
  }
);

export default router;