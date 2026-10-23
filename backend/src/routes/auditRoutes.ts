import { Router } from "express";
import mongoose from "mongoose";
import Audit from "../models/Audit";
import Farm from "../models/Farm";

const router = Router();
router.post("/", async (req, res) => {
  try {
    const { farmId, title, findings, riskLevel } = req.body;

    if (!farmId || !title?.trim()) {
      return res.status(400).json({
        success: false,
        message: "farmId and title are required",
      });
    }

    if (!mongoose.isValidObjectId(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farmId",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const audit = await Audit.create({
      farmId,
      title: title.trim(),
      findings,
      riskLevel,
    });

    return res.status(201).json({
      success: true,
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

// UPDATE AUDIT STATUS
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