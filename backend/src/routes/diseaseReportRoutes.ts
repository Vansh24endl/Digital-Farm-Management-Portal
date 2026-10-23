import { Router } from "express";
import mongoose from "mongoose";
import DiseaseReport from "../models/DiseaseReport";
import Farm from "../models/Farm";

const router = Router();

// CREATE DISEASE REPORT
router.post("/", async (req, res) => {
  try {
    const { farmId, animalType, symptoms, description, severity } = req.body;

    if (
      !farmId ||
      !mongoose.isValidObjectId(farmId) ||
      !["pig", "poultry"].includes(animalType) ||
      !symptoms?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Valid farmId, animalType and symptoms are required",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const report = await DiseaseReport.create({
      farmId,
      animalType,
      symptoms: symptoms.trim(),
      description,
      severity,
    });

    return res.status(201).json({
      success: true,
      data: report,
    });
  } catch (error) {
    console.error("Create disease report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create disease report",
    });
  }
});

// GET ALL REPORTS
router.get("/", async (_req, res) => {
  try {
    const reports = await DiseaseReport.find()
      .populate("farmId", "name farmType location")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: reports.length,
      data: reports,
    });
  } catch (error) {
    console.error("Fetch disease reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch disease reports",
    });
  }
});

// UPDATE REPORT STATUS
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report ID",
      });
    }

    if (!["reported", "investigating", "resolved"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid report status",
      });
    }

    const report = await DiseaseReport.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({
        success: false,
        message: "Disease report not found",
      });
    }

    return res.json({ success: true, data: report });
  } catch (error) {
    console.error("Update disease report error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update disease report",
    });
  }
});

export default router;