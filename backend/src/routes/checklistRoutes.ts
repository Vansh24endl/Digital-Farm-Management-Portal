
import { Router, Request, Response } from "express";
import mongoose from "mongoose";
import ChecklistSubmission from "../models/ChecklistSubmission";
import Farm from "../models/Farm";

const router = Router();

const validStatuses = ["passed", "warning", "critical"];

router.post("/", async (req: Request, res: Response) => {
  try {
    const { farmId, zone, items, submittedAt } = req.body ?? {};

    if (!farmId || !mongoose.isValidObjectId(farmId)) {
      return res.status(400).json({
        success: false,
        message: "A valid MongoDB farmId is required.",
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
});

router.get("/", async (req: Request, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.farmId) {
      const farmId = String(req.query.farmId);

      if (!mongoose.isValidObjectId(farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId.",
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