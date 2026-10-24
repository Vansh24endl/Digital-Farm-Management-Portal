import { Router } from "express";
import mongoose from "mongoose";
import Audit from "../models/Audit";
import Farm from "../models/Farm";

const router = Router();

// CREATE AUDIT
router.post("/", async (req, res) => {
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
    } else {
      const farmExists = await Farm.findById(targetFarmId);
      if (!farmExists) {
        const firstFarm = await Farm.findOne();
        targetFarmId = firstFarm ? firstFarm._id : targetFarmId;
      }
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
      auditor: auditor?.trim() || "Dr. Ananya Reyes",
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
});

// GET ALL AUDITS
router.get("/", async (_req, res) => {
  try {
    const audits = await Audit.find()
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
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit ID",
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

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      });
    }

    return res.json({ success: true, data: audit });
  } catch (error) {
    console.error("Update audit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update audit",
    });
  }
});

// UPDATE AUDIT STATUS (Backwards compatibility)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid audit ID",
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

    if (!audit) {
      return res.status(404).json({
        success: false,
        message: "Audit not found",
      });
    }

    return res.json({ success: true, data: audit });
  } catch (error) {
    console.error("Update audit error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update audit",
    });
  }
});

export default router;