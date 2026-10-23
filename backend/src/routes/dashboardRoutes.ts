
import { Router } from "express";
import Farm from "../models/Farm";
import Visitor from "../models/Visitor";
import Audit from "../models/Audit";
import DiseaseReport from "../models/DiseaseReport";
import Inventory from "../models/Inventory";
import ChecklistSubmission from "../models/ChecklistSubmission";

const router = Router();

// ─── Existing stats endpoint (preserved for backwards compatibility) ───────────
router.get("/stats", async (_req, res) => {
  try {
    const [
      totalFarms,
      totalVisitors,
      totalAudits,
      pendingAudits,
      totalDiseaseReports,
      activeDiseaseReports,
      totalInventoryItems,
      lowStockItems,
    ] = await Promise.all([
      Farm.countDocuments(),
      Visitor.countDocuments(),
      Audit.countDocuments(),
      Audit.countDocuments({
        status: { $in: ["pending", "in-progress"] },
      }),
      DiseaseReport.countDocuments(),
      DiseaseReport.countDocuments({
        status: { $in: ["reported", "investigating"] },
      }),
      Inventory.countDocuments(),
      Inventory.countDocuments({
        $expr: { $lte: ["$quantity", "$minimumStock"] },
      }),
    ]);

    return res.json({
      success: true,
      data: {
        totalFarms,
        totalVisitors,
        totalAudits,
        pendingAudits,
        totalDiseaseReports,
        activeDiseaseReports,
        totalInventoryItems,
        lowStockItems,
      },
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics",
    });
  }
});

// ─── Comprehensive dashboard summary (includes checklist metrics) ─────────────
// GET /api/dashboard/summary
//
// Compliance definition: (total passed items across all submissions) /
//   (total items across all submissions) × 100.
// Returns 0 when no submissions exist (avoids division by zero).
router.get("/summary", async (_req, res) => {
  try {
    // Run all DB queries concurrently for efficiency.
    const [
      totalFarms,
      totalVisitors,
      totalAudits,
      pendingAudits,
      totalDiseaseReports,
      activeDiseaseReports,
      totalInventoryItems,
      lowStockItems,
      checklistAgg,
      recentSubmissions,
    ] = await Promise.all([
      Farm.countDocuments(),
      Visitor.countDocuments(),
      Audit.countDocuments(),
      Audit.countDocuments({ status: { $in: ["pending", "in-progress"] } }),
      DiseaseReport.countDocuments(),
      DiseaseReport.countDocuments({
        status: { $in: ["reported", "investigating"] },
      }),
      Inventory.countDocuments(),
      Inventory.countDocuments({
        $expr: { $lte: ["$quantity", "$minimumStock"] },
      }),

      // Aggregate totals from the summary sub-document stored on each submission.
      // This avoids unwinding the items array and is O(submissions) not O(items).
      ChecklistSubmission.aggregate([
        {
          $group: {
            _id: null,
            totalSubmissions: { $sum: 1 },
            totalItems: { $sum: "$summary.total" },
            totalPassed: { $sum: "$summary.passed" },
            totalWarning: { $sum: "$summary.warning" },
            totalCritical: { $sum: "$summary.critical" },
          },
        },
      ]),

      // Fetch the 5 most recent submissions with farm name for activity feed.
      ChecklistSubmission.find()
        .populate("farmId", "name")
        .sort({ submittedAt: -1 })
        .limit(5)
        .select("farmId zone submittedAt summary"),
    ]);

    // Extract aggregation result (empty when no submissions exist).
    const cl = checklistAgg[0] ?? {
      totalSubmissions: 0,
      totalItems: 0,
      totalPassed: 0,
      totalWarning: 0,
      totalCritical: 0,
    };

    const compliancePercentage =
      cl.totalItems > 0
        ? Math.round((cl.totalPassed / cl.totalItems) * 100)
        : 0;

    // Shape recent activity feed.
    const recentActivity = recentSubmissions.map((sub: any) => ({
      _id: String(sub._id),
      farmName:
        sub.farmId && typeof sub.farmId === "object"
          ? sub.farmId.name
          : "Unknown Farm",
      zone: sub.zone,
      submittedAt: sub.submittedAt,
      summary: sub.summary,
    }));

    return res.json({
      success: true,
      data: {
        totalFarms,
        totalVisitors,
        totalAudits,
        pendingAudits,
        totalDiseaseReports,
        activeDiseaseReports,
        totalInventoryItems,
        lowStockItems,
        checklistSummary: {
          totalSubmissions: cl.totalSubmissions,
          totalItems: cl.totalItems,
          passed: cl.totalPassed,
          warning: cl.totalWarning,
          critical: cl.totalCritical,
          compliancePercentage,
        },
        recentChecklistActivity: recentActivity,
      },
    });
  } catch (error) {
    console.error("Dashboard summary error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard summary",
    });
  }
});

export default router;