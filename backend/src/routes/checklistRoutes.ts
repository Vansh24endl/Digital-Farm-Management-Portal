
import { Router, Response } from "express";
import mongoose from "mongoose";
import ChecklistSubmission from "../models/ChecklistSubmission";
import Farm from "../models/Farm";
import {
  protect,
  authorize,
  AuthRequest,
  canAccessFarm,
} from "../middleware/authMiddleware";
import { alertService } from "../services/alertService";

const router = Router();

// Protect all checklist routes
router.use(protect);

const validStatuses = ["passed", "warning", "critical"];

// SUBMIT CHECKLIST
// @access Private (Admin, Farm Manager, Inspector)
router.post(
  "/",
  authorize("admin", "farm_manager", "inspector"),
  async (req: AuthRequest, res: Response) => {
    try {
      const { farmId, zone, items, submittedAt } = req.body ?? {};

      if (!farmId || !mongoose.isValidObjectId(farmId)) {
        return res.status(400).json({
          success: false,
          message: "A valid MongoDB farmId is required.",
        });
      }

      // Check farm access permission
      if (!canAccessFarm(req.user!, farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to submit checklists for this farm.",
        });
      }

      const farmExists = await Farm.exists({ _id: farmId });
      if (!farmExists) {
        return res.status(400).json({
          success: false,
          message: "Farm not found. Select an existing database farm.",
        });
      }

      if (
        !zone ||
        typeof zone !== "string" ||
        !Array.isArray(items) ||
        items.length === 0
      ) {
        return res.status(400).json({
          success: false,
          message: "Zone and checklist items are required.",
        });
      }

      const normalizedItems = items.map((item: any) => ({
        itemId: String(item.itemId ?? ""),
        title: String(item.title ?? ""),
        category: String(item.category ?? "General"),
        description: String(item.description ?? ""),
        status: item.status,
      }));

      const invalidItem = normalizedItems.find(
        (item: any) =>
          !item.itemId ||
          !item.title ||
          !validStatuses.includes(item.status)
      );

      if (invalidItem) {
        return res.status(400).json({
          success: false,
          message: "Checklist item contains invalid data or status.",
        });
      }

      // Calculate counts on the server instead of trusting frontend totals.
      const summary = {
        total: normalizedItems.length,
        passed: normalizedItems.filter(
          (item: any) => item.status === "passed"
        ).length,
        warning: normalizedItems.filter(
          (item: any) => item.status === "warning"
        ).length,
        critical: normalizedItems.filter(
          (item: any) => item.status === "critical"
        ).length,
      };

      const submission = await ChecklistSubmission.create({
        farmId,
        zone: zone.trim(),
        items: normalizedItems,
        summary,
        submittedAt: submittedAt ? new Date(submittedAt) : new Date(),
      });

      // If checklist contains critical biosecurity failures, trigger an alert
      if (summary.critical > 0) {
        await alertService.createAlert({
          farmId,
          type: "outbreak_warning",
          severity: "high",
          title: `Biosecurity Breach: ${zone.trim()}`,
          message: `Daily checklist in ${zone.trim()} logged ${summary.critical} critical compliance failure(s). Immediate decontamination or remediation required.`,
          source: "daily_checklist",
          metadata: {
            submissionId: submission._id,
            zone: zone.trim(),
            summary,
          },
        });
      }

      return res.status(201).json({
        success: true,
        message: "Checklist submitted successfully.",
        data: submission,
      });
    } catch (error) {
      console.error("Checklist submission error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to save checklist.",
      });
    }
  }
);

// GET ALL CHECKLISTS
// @access Private (Authenticated users, scoped by farm permissions)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.user?.role === "farm_manager" && req.user.farmId) {
      filter.farmId = req.user.farmId;
    } else if (req.query.farmId) {
      const farmId = String(req.query.farmId);

      if (!mongoose.isValidObjectId(farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId.",
        });
      }

      if (!canAccessFarm(req.user!, farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view checklists for this farm.",
        });
      }

      filter.farmId = farmId;
    }

    if (req.query.zone) {
      filter.zone = String(req.query.zone);
    }

    const data = await ChecklistSubmission.find(filter)
      .populate("farmId", "name")
      .sort({ submittedAt: -1 });

    return res.json({
      success: true,
      count: data.length,
      data,
    });
  } catch (error) {
    console.error("Checklist retrieval error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve checklists.",
    });
  }
});

export default router;