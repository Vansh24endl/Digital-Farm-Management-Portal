import { Router, Response } from "express";
import Farm from "../models/Farm";
import Visitor from "../models/Visitor";
import Audit from "../models/Audit";
import DiseaseReport from "../models/DiseaseReport";
import Inventory from "../models/Inventory";
import ChecklistSubmission from "../models/ChecklistSubmission";
import { protect, AuthRequest, getAuthorizedFarmIds } from "../middleware/authMiddleware";

const router = Router();

// Protect all dashboard routes
router.use(protect);

// ─── Stats endpoint (Strict user ownership isolation) ─────────────────────────
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);

    // New or unassigned user with 0 farms sees zero statistics
    if (authorizedFarmIds !== null && authorizedFarmIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalFarms: 0,
          totalVisitors: 0,
          totalAudits: 0,
          pendingAudits: 0,
          totalDiseaseReports: 0,
          activeDiseaseReports: 0,
          totalInventoryItems: 0,
          lowStockItems: 0,
        },
      });
    }

    const farmFilter: Record<string, any> =
      authorizedFarmIds !== null ? { farmId: { $in: authorizedFarmIds } } : {};
    const farmIdFilter: Record<string, any> =
      authorizedFarmIds !== null ? { _id: { $in: authorizedFarmIds } } : {};

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
      Farm.countDocuments(farmIdFilter),
      Visitor.countDocuments(farmFilter),
      Audit.countDocuments(farmFilter),
      Audit.countDocuments({
        ...farmFilter,
        status: { $in: ["pending", "in-progress"] },
      }),
      DiseaseReport.countDocuments(farmFilter),
      DiseaseReport.countDocuments({
        ...farmFilter,
        status: { $in: ["reported", "investigating"] },
      }),
      Inventory.countDocuments(farmFilter),
      Inventory.countDocuments({
        ...farmFilter,
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

// ─── Comprehensive dashboard summary (Strict user ownership isolation) ───────
router.get("/summary", async (req: AuthRequest, res: Response) => {
  try {
    const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);

    // New or unassigned user with 0 farms sees zero statistics and clean empty state
    if (authorizedFarmIds !== null && authorizedFarmIds.length === 0) {
      return res.json({
        success: true,
        data: {
          totalFarms: 0,
          totalVisitors: 0,
          totalAudits: 0,
          pendingAudits: 0,
          totalDiseaseReports: 0,
          activeDiseaseReports: 0,
          totalInventoryItems: 0,
          lowStockItems: 0,
          checklistSummary: {
            totalSubmissions: 0,
            totalItems: 0,
            passed: 0,
            warning: 0,
            critical: 0,
            compliancePercentage: 0,
          },
          recentChecklistActivity: [],
        },
      });
    }

    const farmFilter: Record<string, any> =
      authorizedFarmIds !== null ? { farmId: { $in: authorizedFarmIds } } : {};
    const farmIdFilter: Record<string, any> =
      authorizedFarmIds !== null ? { _id: { $in: authorizedFarmIds } } : {};

    const checklistMatchStage =
      authorizedFarmIds !== null ? [{ $match: { farmId: { $in: authorizedFarmIds } } }] : [];

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
      Farm.countDocuments(farmIdFilter),
      Visitor.countDocuments(farmFilter),
      Audit.countDocuments(farmFilter),
      Audit.countDocuments({ ...farmFilter, status: { $in: ["pending", "in-progress"] } }),
      DiseaseReport.countDocuments(farmFilter),
      DiseaseReport.countDocuments({
        ...farmFilter,
        status: { $in: ["reported", "investigating"] },
      }),
      Inventory.countDocuments(farmFilter),
      Inventory.countDocuments({
        ...farmFilter,
        $expr: { $lte: ["$quantity", "$minimumStock"] },
      }),

      ChecklistSubmission.aggregate([
        ...checklistMatchStage,
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

      ChecklistSubmission.find(farmFilter)
        .populate("farmId", "name")
        .sort({ submittedAt: -1 })
        .limit(5)
        .select("farmId zone submittedAt summary"),
    ]);

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
