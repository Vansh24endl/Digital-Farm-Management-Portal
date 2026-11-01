import { Router, Response } from "express";
import mongoose from "mongoose";
import DiseaseReport from "../models/DiseaseReport";
import Farm from "../models/Farm";
import {
  protect,
  authorize,
  AuthRequest,
  canAccessFarm,
  canAccessFarmAsync,
  getAuthorizedFarmIds,
} from "../middleware/authMiddleware";
import { alertService } from "../services/alertService";

const router = Router();

// Protect all disease report routes
router.use(protect);

// CREATE DISEASE REPORT
// @access Private (All authenticated users, scoped to permitted farm)
router.post("/", async (req: AuthRequest, res: Response) => {
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
      if (req.user?.farmId) {
        targetFarmId = req.user.farmId;
      } else {
        const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);
        if (authorizedFarmIds && authorizedFarmIds.length > 0) {
          targetFarmId = authorizedFarmIds[0];
        } else {
          return res.status(400).json({
            success: false,
            message: "A valid farmId is required. Please select or create an authorized farm first.",
          });
        }
      }
    }

    // Farm-level IDOR check
    const hasAccess = await canAccessFarmAsync(req.user!, targetFarmId);
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to file reports for this farm.",
      });
    }

    const farmExists = await Farm.findById(targetFarmId);
    if (!farmExists) {
      return res.status(404).json({
        success: false,
        message: "Target farm does not exist.",
      });
    }

    const normalizedSeverity = ["low", "medium", "high", "critical"].includes(severity?.toLowerCase())
      ? severity.toLowerCase()
      : "medium";

    const report = await DiseaseReport.create({
      farmId: targetFarmId,
      diseaseName: diseaseName?.trim() || "Unspecified Vector Outbreak",
      animalType: ["pig", "poultry"].includes(animalType) ? animalType : "poultry",
      symptoms: symptoms?.trim() || "Observed abnormal clinical signs / pathogen vector",
      description: description?.trim() || "",
      severity: normalizedSeverity,
      location: location?.trim() || "",
      speciesAffected: speciesAffected?.trim() || "",
      coordinates: {
        x: coordinates?.x ?? Math.floor(Math.random() * 60) + 20,
        y: coordinates?.y ?? Math.floor(Math.random() * 60) + 20,
      },
    });

    // Automatic Trigger: High-severity or critical disease alert
    await alertService.triggerDiseaseAlert(report);

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
// @access Private (Authenticated users, scoped by farm permissions)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);

    // If non-admin user has 0 authorized farms, return empty list immediately
    if (authorizedFarmIds !== null && authorizedFarmIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    const filter: Record<string, unknown> = {};

    if (req.query.farmId) {
      if (!mongoose.isValidObjectId(req.query.farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId",
        });
      }

      const hasAccess = await canAccessFarmAsync(req.user!, String(req.query.farmId));
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view reports for this farm.",
        });
      }

      filter.farmId = req.query.farmId;
    } else if (authorizedFarmIds !== null) {
      filter.farmId = { $in: authorizedFarmIds };
    }

    const reports = await DiseaseReport.find(filter)
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

// UPDATE REPORT STATUS & CLINICAL REVIEW
// @access Private (Admin, Veterinarian)
router.patch(
  "/:id/status",
  authorize("admin", "veterinarian"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { status, severity, description } = req.body;

      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid report ID",
        });
      }

      const existingReport = await DiseaseReport.findById(req.params.id);
      if (!existingReport) {
        return res.status(404).json({
          success: false,
          message: "Disease report not found",
        });
      }

      const hasAccess = await canAccessFarmAsync(req.user!, existingReport.farmId);
      if (!hasAccess) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to review cases for this farm.",
        });
      }

      const updates: any = {};

      if (status) {
        if (!["reported", "investigating", "resolved"].includes(status)) {
          return res.status(400).json({
            success: false,
            message: "Invalid report status. Allowed: 'reported', 'investigating', 'resolved'",
          });
        }
        updates.status = status;
      }

      let isEscalation = false;
      if (severity && ["low", "medium", "high", "critical"].includes(severity.toLowerCase())) {
        const oldSev = existingReport.severity;
        const newSev = severity.toLowerCase();
        updates.severity = newSev;
        if (oldSev !== newSev && (newSev === "high" || newSev === "critical")) {
          isEscalation = true;
        }
      }

      if (typeof description === "string") {
        updates.description = description.trim();
      }

      const report = await DiseaseReport.findByIdAndUpdate(
        req.params.id,
        { $set: updates },
        { new: true, runValidators: true }
      );

      if (report && isEscalation) {
        await alertService.triggerDiseaseAlert(report, true);
      }

      return res.json({ success: true, data: report });
    } catch (error) {
      console.error("Update disease report error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to update disease report",
      });
    }
  }
);

export default router;