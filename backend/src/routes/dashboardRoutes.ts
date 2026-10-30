
import { Router, Response } from "express";
import Farm from "../models/Farm";
import Visitor from "../models/Visitor";
import Audit from "../models/Audit";
import DiseaseReport from "../models/DiseaseReport";
import Inventory from "../models/Inventory";
import ChecklistSubmission from "../models/ChecklistSubmission";
import { protect, AuthRequest } from "../middleware/authMiddleware";

const router = Router();

// Protect all dashboard routes
router.use(protect);

// ─── Stats endpoint (preserved for backwards compatibility) ───────────────────
router.get("/stats", async (req: AuthRequest, res: Response) => {
  try {
    const isFarmManager = Boolean(req.user?.role === "farm_manager" && req.user.farmId);
    const farmFilter: Record<string, any> = isFarmManager ? { farmId: req.user!.farmId } : {};

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
      isFarmManager ? Farm.countDocuments({ _id: req.user!.farmId } as any) : Farm.countDocuments(),
      Visitor.countDocuments(farmFilter as any),
      Audit.countDocuments(farmFilter as any),
      Audit.countDocuments({
        ...farmFilter,
        status: { $in: ["pending", "in-progress"] },
      } as any),
      DiseaseReport.countDocuments(farmFilter as any),
      DiseaseReport.countDocuments({
        ...farmFilter,
        status: { $in: ["reported", "investigating"] },
      } as any),
      Inventory.countDocuments(farmFilter as any),
      Inventory.countDocuments({
        ...farmFilter,
        $expr: { $lte: ["$quantity", "$minimumStock"] },
      } as any),
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
router.get("/summary", async (req: AuthRequest, res: Response) => {
  try {
    const isFarmManager = Boolean(req.user?.role === "farm_manager" && req.user.farmId);
    const farmFilter: Record<string, any> = isFarmManager ? { farmId: req.user!.farmId } : {};

    const checklistMatchStage = isFarmManager ? [{ $match: farmFilter }] : [];

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
      isFarmManager ? Farm.countDocuments({ _id: req.user!.farmId } as any) : Farm.countDocuments(),
      Visitor.countDocuments(farmFilter as any),
      Audit.countDocuments(farmFilter as any),
      Audit.countDocuments({ ...farmFilter, status: { $in: ["pending", "in-progress"] } } as any),
      DiseaseReport.countDocuments(farmFilter as any),
      DiseaseReport.countDocuments({
        ...farmFilter,
        status: { $in: ["reported", "investigating"] },
      } as any),
      Inventory.countDocuments(farmFilter as any),
      Inventory.countDocuments({
        ...farmFilter,
        $expr: { $lte: ["$quantity", "$minimumStock"] },
      } as any),

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

      ChecklistSubmission.find(farmFilter as any)
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