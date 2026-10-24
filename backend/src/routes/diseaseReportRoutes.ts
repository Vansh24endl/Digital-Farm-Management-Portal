import { Router } from "express";
import mongoose from "mongoose";
import DiseaseReport from "../models/DiseaseReport";
import Farm from "../models/Farm";

const router = Router();

// CREATE DISEASE REPORT
router.post("/", async (req, res) => {
  try {
    const {
      farmId,
      diseaseName,
      animalType = "poultry",
      symptoms,
      description = "",
      severity = "medium",
      location = "",
      speciesAffected = "",
      coordinates,
    } = req.body;

    let targetFarmId = farmId;

    if (!targetFarmId || !mongoose.isValidObjectId(targetFarmId)) {
      const existingFarm = await Farm.findOne();
      if (existingFarm) {
        targetFarmId = existingFarm._id;
      } else {
        const newFarm = await Farm.create({
          name: "Primary Livestock Facility",
          farmType: animalType === "pig" ? "pig" : "poultry",
          location: location || "Sector 1",
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

    const report = await DiseaseReport.create({
      farmId: targetFarmId,
      diseaseName: diseaseName || "Unspecified Vector Outbreak",
      animalType: ["pig", "poultry"].includes(animalType) ? animalType : "poultry",
      symptoms: symptoms?.trim() || "Observed abnormal clinical signs / pathogen vector",
      description: description?.trim() || "",
      severity: ["low", "medium", "high"].includes(severity?.toLowerCase())
        ? severity.toLowerCase()
        : "medium",
      location: location?.trim() || "",
      speciesAffected: speciesAffected?.trim() || "",
      coordinates: {
        x: coordinates?.x ?? Math.floor(Math.random() * 60) + 20,
        y: coordinates?.y ?? Math.floor(Math.random() * 60) + 20,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Disease case reported successfully",
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