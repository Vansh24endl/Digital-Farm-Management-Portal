import { Router, Response } from "express";
import mongoose from "mongoose";
import { protect, authorize, AuthRequest } from "../middleware/authMiddleware";
import VeterinarianProfile from "../models/VeterinarianProfile";
import User from "../models/User";
import Farm from "../models/Farm";
import Audit from "../models/Audit";
import ChecklistSubmission from "../models/ChecklistSubmission";
import DiseaseReport from "../models/DiseaseReport";
import Inventory from "../models/Inventory";
import Visitor from "../models/Visitor";

const router = Router();

// Protect all admin routes with authentication and admin authorization
router.use(protect);
router.use(authorize("admin"));

// ─── Helper: Parse date filter parameters ─────────────────────────────────────
function getDateRange(query: any): { startDate: Date | undefined; endDate: Date | undefined; dateFilter: Record<string, any> } {
  const { timeRange, startDate: startParam, endDate: endParam } = query;
  const now = new Date();
  let start: Date | undefined;
  let end: Date | undefined;

  if (startParam || endParam) {
    if (startParam) {
      const parsedStart = new Date(String(startParam));
      if (!isNaN(parsedStart.getTime())) start = parsedStart;
    }
    if (endParam) {
      const parsedEnd = new Date(String(endParam));
      if (!isNaN(parsedEnd.getTime())) {
        parsedEnd.setHours(23, 59, 59, 999);
        end = parsedEnd;
      }
    }
  } else if (timeRange) {
    switch (timeRange) {
      case "today": {
        start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
        end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
        break;
      }
      case "7d": {
        start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      }
      case "30d": {
        start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      }
      case "90d": {
        start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        end = now;
        break;
      }
      default:
        break;
    }
  }

  const dateFilter: Record<string, any> = {};
  if (start && end) {
    dateFilter.createdAt = { $gte: start, $lte: end };
  } else if (start) {
    dateFilter.createdAt = { $gte: start };
  } else if (end) {
    dateFilter.createdAt = { $lte: end };
  }

  return { startDate: start, endDate: end, dateFilter };
}

// ─── GET /api/admin/analytics/overview ────────────────────────────────────────
router.get("/analytics/overview", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, dateFilter } = getDateRange(req.query);

    // Visitor date filter uses checkIn instead of createdAt
    const visitorDateFilter = startDate || endDate ? {
      checkIn: {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      },
    } : {};

    // Checklist date filter uses submittedAt
    const checklistDateFilter = startDate || endDate ? {
      submittedAt: {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      },
    } : {};

    const [
      totalUsers,
      totalFarmers,
      totalVeterinarians,
      totalInspectors,
      totalAdmins,
      vetProfiles,
      totalFarms,
      farmsList,
      totalAudits,
      completedAudits,
      pendingAudits,
      inProgressAudits,
      highRiskAudits,
      totalVisitors,
      activeVisitors,
      totalInventoryItems,
      lowStockItems,
      checklistAgg,
      activeHighRiskDiseases,
    ] = await Promise.all([
      User.countDocuments(dateFilter),
      User.countDocuments({ ...dateFilter, role: "farm_manager" }),
      User.countDocuments({ ...dateFilter, role: "veterinarian" }),
      User.countDocuments({ ...dateFilter, role: "inspector" }),
      User.countDocuments({ ...dateFilter, role: "admin" }),
      VeterinarianProfile.find({}),
      Farm.countDocuments(dateFilter),
      Farm.find({}).select("_id name farmType location"),
      Audit.countDocuments(dateFilter),
      Audit.countDocuments({ ...dateFilter, status: "completed" }),
      Audit.countDocuments({ ...dateFilter, status: "pending" }),
      Audit.countDocuments({ ...dateFilter, status: "in-progress" }),
      Audit.find({ riskLevel: "high" }).select("farmId riskLevel status"),
      Visitor.countDocuments(visitorDateFilter),
      Visitor.countDocuments({ ...visitorDateFilter, status: "IN" }),
      Inventory.countDocuments({}),
      Inventory.countDocuments({ $expr: { $lte: ["$quantity", "$minimumStock"] } }),
      ChecklistSubmission.aggregate([
        ...(Object.keys(checklistDateFilter).length > 0 ? [{ $match: checklistDateFilter }] : []),
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
      DiseaseReport.find({ severity: "high", status: { $ne: "resolved" } }).select("farmId severity status diseaseName"),
    ]);

    // Vet verification stats
    const verifiedVets = vetProfiles.filter((v) => v.verificationStatus === "verified").length;
    const pendingVets = vetProfiles.filter((v) => v.verificationStatus === "pending").length;
    const rejectedVets = vetProfiles.filter((v) => v.verificationStatus === "rejected").length;

    // Overall compliance score calculation
    let complianceScore = 100;
    const cl = checklistAgg[0];
    if (cl && cl.totalItems > 0) {
      complianceScore = Math.round((cl.totalPassed / cl.totalItems) * 100);
    } else if (totalAudits > 0) {
      complianceScore = Math.round((completedAudits / totalAudits) * 100);
    }

    // High risk farms identification
    const highRiskFarmIds = new Set<string>();
    highRiskAudits.forEach((a) => {
      if (a.farmId) highRiskFarmIds.add(String(a.farmId));
    });
    activeHighRiskDiseases.forEach((d) => {
      if (d.farmId) highRiskFarmIds.add(String(d.farmId));
    });

    const highRiskFarmsList = farmsList
      .filter((f) => highRiskFarmIds.has(String(f._id)))
      .map((f) => ({
        id: f._id,
        name: f.name,
        farmType: f.farmType,
        location: f.location,
        hasActiveOutbreak: activeHighRiskDiseases.some((d) => String(d.farmId) === String(f._id)),
        hasHighRiskAudit: highRiskAudits.some((a) => String(a.farmId) === String(f._id)),
      }));

    return res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          farmers: totalFarmers,
          veterinarians: totalVeterinarians,
          inspectors: totalInspectors,
          admins: totalAdmins,
          veterinarianVerification: {
            verified: verifiedVets,
            pending: pendingVets,
            rejected: rejectedVets,
          },
        },
        farms: {
          total: totalFarms,
          highRiskCount: highRiskFarmsList.length,
          lowRiskCount: Math.max(0, farmsList.length - highRiskFarmsList.length),
          highRiskFarms: highRiskFarmsList,
        },
        audits: {
          total: totalAudits,
          completed: completedAudits,
          pending: pendingAudits,
          inProgress: inProgressAudits,
          completionRate: totalAudits > 0 ? Math.round((completedAudits / totalAudits) * 100) : 0,
        },
        visitors: {
          total: totalVisitors,
          currentlyOnSite: activeVisitors,
        },
        inventory: {
          totalSKUs: totalInventoryItems,
          lowStockSKUs: lowStockItems,
        },
        compliance: {
          score: complianceScore,
          checklistMetrics: cl || {
            totalSubmissions: 0,
            totalItems: 0,
            totalPassed: 0,
            totalWarning: 0,
            totalCritical: 0,
          },
        },
        filtersApplied: {
          timeRange: req.query.timeRange || "all",
          startDate: startDate ? startDate.toISOString() : null,
          endDate: endDate ? endDate.toISOString() : null,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin analytics overview error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate analytics overview.",
      error: error?.message,
    });
  }
});

// ─── GET /api/admin/analytics/users ───────────────────────────────────────────
router.get("/analytics/users", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate, dateFilter } = getDateRange(req.query);

    const [roleDistribution, registrationTrends, vetProfiles] = await Promise.all([
      User.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: "$role",
            count: { $sum: 1 },
          },
        },
      ]),
      User.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      VeterinarianProfile.aggregate([
        {
          $group: {
            _id: "$verificationStatus",
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const rolesMap: Record<string, number> = {
      admin: 0,
      farm_manager: 0,
      veterinarian: 0,
      inspector: 0,
    };
    roleDistribution.forEach((r) => {
      if (r._id) rolesMap[r._id] = r.count;
    });

    const vetMap: Record<string, number> = {
      verified: 0,
      pending: 0,
      rejected: 0,
    };
    vetProfiles.forEach((v) => {
      if (v._id) vetMap[v._id] = v.count;
    });

    return res.json({
      success: true,
      data: {
        roleDistribution: [
          { role: "Farmers", key: "farm_manager", count: rolesMap.farm_manager },
          { role: "Veterinarians", key: "veterinarian", count: rolesMap.veterinarian },
          { role: "Inspectors", key: "inspector", count: rolesMap.inspector },
          { role: "Administrators", key: "admin", count: rolesMap.admin },
        ],
        registrationTrends: registrationTrends.map((t) => ({
          date: t._id,
          count: t.count,
        })),
        veterinarianVerification: vetMap,
      },
    });
  } catch (error: any) {
    console.error("Admin analytics users error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user analytics.",
    });
  }
});

// ─── GET /api/admin/analytics/farms ───────────────────────────────────────────
router.get("/analytics/farms", async (req: AuthRequest, res: Response) => {
  try {
    const { dateFilter } = getDateRange(req.query);

    const [farmTypes, registrationTrends, allFarms, highRiskAudits, highRiskDiseases] = await Promise.all([
      Farm.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: "$farmType",
            count: { $sum: 1 },
          },
        },
      ]),
      Farm.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Farm.find({}).select("_id name farmType location createdAt"),
      Audit.find({ riskLevel: "high" }).select("farmId riskLevel status"),
      DiseaseReport.find({ severity: "high", status: { $ne: "resolved" } }).select("farmId severity diseaseName"),
    ]);

    const highRiskFarmIds = new Set<string>();
    highRiskAudits.forEach((a) => {
      if (a.farmId) highRiskFarmIds.add(String(a.farmId));
    });
    highRiskDiseases.forEach((d) => {
      if (d.farmId) highRiskFarmIds.add(String(d.farmId));
    });

    const highRiskCount = allFarms.filter((f) => highRiskFarmIds.has(String(f._id))).length;
    const lowRiskCount = Math.max(0, allFarms.length - highRiskCount);

    return res.json({
      success: true,
      data: {
        totalFarms: allFarms.length,
        types: farmTypes.map((t) => ({ type: t._id || "mixed", count: t.count })),
        registrationTrends: registrationTrends.map((t) => ({ date: t._id, count: t.count })),
        riskComparison: {
          highRisk: highRiskCount,
          lowRisk: lowRiskCount,
          ratio: allFarms.length > 0 ? Math.round((highRiskCount / allFarms.length) * 100) : 0,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin analytics farms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch farm analytics.",
    });
  }
});

// ─── GET /api/admin/analytics/audits ──────────────────────────────────────────
router.get("/analytics/audits", async (req: AuthRequest, res: Response) => {
  try {
    const { dateFilter } = getDateRange(req.query);

    const [statusDistribution, riskDistribution, auditTrends, totalAudits] = await Promise.all([
      Audit.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: "$status",
            count: { $sum: 1 },
          },
        },
      ]),
      Audit.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: "$riskLevel",
            count: { $sum: 1 },
          },
        },
      ]),
      Audit.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            completed: {
              $sum: { $cond: [{ $eq: ["$status", "completed"] }, 1, 0] },
            },
            total: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Audit.countDocuments(dateFilter),
    ]);

    return res.json({
      success: true,
      data: {
        total: totalAudits,
        statusDistribution: statusDistribution.map((s) => ({ status: s._id || "pending", count: s.count })),
        riskDistribution: riskDistribution.map((r) => ({ riskLevel: r._id || "low", count: r.count })),
        completionTrends: auditTrends.map((t) => ({
          date: t._id,
          completed: t.completed,
          total: t.total,
        })),
      },
    });
  } catch (error: any) {
    console.error("Admin analytics audits error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch audit analytics.",
    });
  }
});

// ─── GET /api/admin/analytics/compliance ──────────────────────────────────────
router.get("/analytics/compliance", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const dateFilter = startDate || endDate ? {
      submittedAt: {
        ...(startDate ? { $gte: startDate } : {}),
        ...(endDate ? { $lte: endDate } : {}),
      },
    } : {};

    const [checklistStats, farmSubmissions, allFarms] = await Promise.all([
      ChecklistSubmission.aggregate([
        ...(Object.keys(dateFilter).length > 0 ? [{ $match: dateFilter }] : []),
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
      ChecklistSubmission.aggregate([
        {
          $group: {
            _id: "$farmId",
            passed: { $sum: "$summary.passed" },
            total: { $sum: "$summary.total" },
          },
        },
      ]),
      Farm.find({}).select("_id name"),
    ]);

    const cl = checklistStats[0] || {
      totalSubmissions: 0,
      totalItems: 0,
      totalPassed: 0,
      totalWarning: 0,
      totalCritical: 0,
    };

    // Compliance score bands: Optimal (>=80%), Warning (60-79%), Critical (<60%)
    let optimal = 0;
    let warning = 0;
    let critical = 0;

    const farmMap = new Map<string, number>();
    farmSubmissions.forEach((fs) => {
      const pct = fs.total > 0 ? Math.round((fs.passed / fs.total) * 100) : 100;
      farmMap.set(String(fs._id), pct);
    });

    allFarms.forEach((f) => {
      const score = farmMap.has(String(f._id)) ? (farmMap.get(String(f._id)) || 100) : 85;
      if (score >= 80) optimal++;
      else if (score >= 60) warning++;
      else critical++;
    });

    return res.json({
      success: true,
      data: {
        overallScore: cl.totalItems > 0 ? Math.round((cl.totalPassed / cl.totalItems) * 100) : 100,
        distribution: [
          { name: "Optimal (80-100%)", count: optimal, color: "var(--lime, #a3e635)" },
          { name: "Monitoring (60-79%)", count: warning, color: "var(--warning, #eab308)" },
          { name: "Critical (<60%)", count: critical, color: "var(--critical, #ef4444)" },
        ],
        itemTotals: {
          passed: cl.totalPassed,
          warning: cl.totalWarning,
          critical: cl.totalCritical,
        },
      },
    });
  } catch (error: any) {
    console.error("Admin analytics compliance error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch compliance analytics.",
    });
  }
});

// ─── GET /api/admin/reports ───────────────────────────────────────────────────
router.get("/reports", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const { farmId, role, status, type = "all", search } = req.query;
    const page = Math.max(1, parseInt(String(req.query.page || 1), 10));
    const limit = Math.max(1, Math.min(100, parseInt(String(req.query.limit || 20), 10)));

    const rows: Array<{
      id: string;
      date: string;
      type: "Audit" | "Disease Report" | "Checklist" | "Visitor";
      farmName: string;
      farmId: string | undefined;
      title: string;
      severity: string;
      status: string;
      responsible: string;
      details: string;
    }> = [];

    // Base date query
    const makeDateQuery = (field: string) => {
      if (!startDate && !endDate) return {};
      const q: any = {};
      if (startDate) q.$gte = startDate;
      if (endDate) q.$lte = endDate;
      return { [field]: q };
    };

    // Filter farms
    const farmFilter = farmId && mongoose.isValidObjectId(String(farmId))
      ? { farmId: new mongoose.Types.ObjectId(String(farmId)) }
      : {};

    // 1. Fetch Audits if applicable
    if (type === "all" || type === "audits") {
      const auditStatusFilter = status && status !== "all" ? { status: String(status) } : {};
      const audits = await Audit.find({
        ...makeDateQuery("createdAt"),
        ...farmFilter,
        ...auditStatusFilter,
      } as any)
        .populate("farmId", "name")
        .sort({ createdAt: -1 })
        .limit(100);

      audits.forEach((a: any) => {
        rows.push({
          id: String(a._id),
          date: a.createdAt ? a.createdAt.toISOString() : "",
          type: "Audit",
          farmName: a.farmId?.name || "General Facility",
          farmId: a.farmId?._id ? String(a.farmId._id) : undefined,
          title: a.title,
          severity: a.riskLevel || "low",
          status: a.status || "pending",
          responsible: a.auditor || "Inspector",
          details: a.findings || `${a.progress || 0}% completed in ${a.sector || "general sector"}`,
        });
      });
    }

    // 2. Fetch Disease Reports if applicable
    if (type === "all" || type === "diseases") {
      const diseases = await DiseaseReport.find({
        ...makeDateQuery("createdAt"),
        ...farmFilter,
      })
        .populate("farmId", "name")
        .sort({ createdAt: -1 })
        .limit(100);

      diseases.forEach((d: any) => {
        rows.push({
          id: String(d._id),
          date: d.createdAt ? d.createdAt.toISOString() : "",
          type: "Disease Report",
          farmName: d.farmId?.name || "Target Barn",
          farmId: d.farmId?._id ? String(d.farmId._id) : undefined,
          title: d.diseaseName || "Pathogen Vector",
          severity: d.severity || "medium",
          status: d.status || "reported",
          responsible: "Field Veterinarian",
          details: `${d.animalType}: ${d.symptoms} (${d.location || "Sector"})`,
        });
      });
    }

    // 3. Fetch Checklist Submissions if applicable
    if (type === "all" || type === "checklists") {
      const checklists = await ChecklistSubmission.find({
        ...makeDateQuery("submittedAt"),
        ...farmFilter,
      })
        .populate("farmId", "name")
        .sort({ submittedAt: -1 })
        .limit(100);

      checklists.forEach((c: any) => {
        rows.push({
          id: String(c._id),
          date: c.submittedAt ? c.submittedAt.toISOString() : "",
          type: "Checklist",
          farmName: c.farmId?.name || "Farm Facility",
          farmId: c.farmId?._id ? String(c.farmId._id) : undefined,
          title: `Zone Sanitation: ${c.zone}`,
          severity: c.summary?.critical > 0 ? "high" : c.summary?.warning > 0 ? "medium" : "low",
          status: c.summary?.critical > 0 ? "critical" : "compliant",
          responsible: "Farm Manager",
          details: `${c.summary?.passed || 0}/${c.summary?.total || 0} passed, ${c.summary?.critical || 0} critical issues`,
        });
      });
    }

    // 4. Fetch Visitors if applicable
    if (type === "all" || type === "visitors") {
      const visitors = await Visitor.find({
        ...makeDateQuery("checkIn"),
        ...farmFilter,
      })
        .populate("farmId", "name")
        .sort({ checkIn: -1 })
        .limit(100);

      visitors.forEach((v: any) => {
        rows.push({
          id: String(v._id),
          date: v.checkIn ? v.checkIn.toISOString() : "",
          type: "Visitor",
          farmName: v.farmId?.name || "Entry Gate",
          farmId: v.farmId?._id ? String(v.farmId._id) : undefined,
          title: `Entrant: ${v.name} (${v.role || "Visitor"})`,
          severity: "low",
          status: v.status || "IN",
          responsible: v.company || "Independent",
          details: `Purpose: ${v.purpose}. Temp: ${v.temperature || "Normal"}`,
        });
      });
    }

    // Sort combined rows by date descending
    rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    // Apply text search if provided
    let filtered = rows;
    if (search && typeof search === "string" && search.trim()) {
      const term = search.trim().toLowerCase();
      filtered = rows.filter(
        (r) =>
          r.title.toLowerCase().includes(term) ||
          r.farmName.toLowerCase().includes(term) ||
          r.responsible.toLowerCase().includes(term) ||
          r.details.toLowerCase().includes(term)
      );
    }

    // Apply role filter if user role filter is requested
    if (role && role !== "all") {
      const roleTarget = String(role).toLowerCase();
      filtered = filtered.filter((r) => {
        if (roleTarget === "veterinarian") return r.type === "Disease Report" || r.responsible.toLowerCase().includes("vet");
        if (roleTarget === "inspector") return r.type === "Audit" || r.responsible.toLowerCase().includes("inspector");
        if (roleTarget === "farm_manager") return r.type === "Checklist" || r.responsible.toLowerCase().includes("farm");
        return true;
      });
    }

    const totalCount = filtered.length;
    const startIndex = (page - 1) * limit;
    const paginated = filtered.slice(startIndex, startIndex + limit);

    return res.json({
      success: true,
      data: paginated,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit) || 1,
      },
    });
  } catch (error: any) {
    console.error("Admin get reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate report records.",
      error: error?.message,
    });
  }
});

// ─── GET /api/admin/reports/export ────────────────────────────────────────────
router.get("/reports/export", async (req: AuthRequest, res: Response) => {
  try {
    const { startDate, endDate } = getDateRange(req.query);
    const { farmId, role, status, type = "all", format = "csv" } = req.query;

    const makeDateQuery = (field: string) => {
      if (!startDate && !endDate) return {};
      const q: any = {};
      if (startDate) q.$gte = startDate;
      if (endDate) q.$lte = endDate;
      return { [field]: q };
    };

    const farmFilter = farmId && mongoose.isValidObjectId(String(farmId))
      ? { farmId: new mongoose.Types.ObjectId(String(farmId)) }
      : {};

    const rows: Array<{
      date: string;
      type: string;
      farmName: string;
      title: string;
      severity: string;
      status: string;
      responsible: string;
      details: string;
    }> = [];

    if (type === "all" || type === "audits") {
      const auditStatusFilter = status && status !== "all" ? { status: String(status) } : {};
      const audits = await Audit.find({ ...makeDateQuery("createdAt"), ...farmFilter, ...auditStatusFilter } as any)
        .populate("farmId", "name")
        .sort({ createdAt: -1 });

      audits.forEach((a: any) => {
        rows.push({
          date: a.createdAt ? a.createdAt.toISOString() : "",
          type: "Audit",
          farmName: a.farmId?.name || "General Facility",
          title: a.title,
          severity: a.riskLevel || "low",
          status: a.status || "pending",
          responsible: a.auditor || "Inspector",
          details: a.findings || `${a.progress || 0}% progress`,
        });
      });
    }

    if (type === "all" || type === "diseases") {
      const diseases = await DiseaseReport.find({ ...makeDateQuery("createdAt"), ...farmFilter })
        .populate("farmId", "name")
        .sort({ createdAt: -1 });

      diseases.forEach((d: any) => {
        rows.push({
          date: d.createdAt ? d.createdAt.toISOString() : "",
          type: "Disease Report",
          farmName: d.farmId?.name || "Target Barn",
          title: d.diseaseName || "Pathogen Vector",
          severity: d.severity || "medium",
          status: d.status || "reported",
          responsible: "Field Veterinarian",
          details: `${d.animalType}: ${d.symptoms}`,
        });
      });
    }

    if (type === "all" || type === "checklists") {
      const checklists = await ChecklistSubmission.find({ ...makeDateQuery("submittedAt"), ...farmFilter })
        .populate("farmId", "name")
        .sort({ submittedAt: -1 });

      checklists.forEach((c: any) => {
        rows.push({
          date: c.submittedAt ? c.submittedAt.toISOString() : "",
          type: "Checklist",
          farmName: c.farmId?.name || "Farm Facility",
          title: `Zone Sanitation: ${c.zone}`,
          severity: c.summary?.critical > 0 ? "high" : "low",
          status: c.summary?.critical > 0 ? "critical" : "compliant",
          responsible: "Farm Manager",
          details: `${c.summary?.passed || 0}/${c.summary?.total || 0} passed`,
        });
      });
    }

    if (type === "all" || type === "visitors") {
      const visitors = await Visitor.find({ ...makeDateQuery("checkIn"), ...farmFilter })
        .populate("farmId", "name")
        .sort({ checkIn: -1 });

      visitors.forEach((v: any) => {
        rows.push({
          date: v.checkIn ? v.checkIn.toISOString() : "",
          type: "Visitor",
          farmName: v.farmId?.name || "Entry Gate",
          title: v.name,
          severity: "low",
          status: v.status || "IN",
          responsible: v.company || "Independent",
          details: v.purpose || "Inspection",
        });
      });
    }

    // Role filter
    let finalRows = rows;
    if (role && role !== "all") {
      const roleTarget = String(role).toLowerCase();
      finalRows = rows.filter((r) => {
        if (roleTarget === "veterinarian") return r.type === "Disease Report" || r.responsible.toLowerCase().includes("vet");
        if (roleTarget === "inspector") return r.type === "Audit" || r.responsible.toLowerCase().includes("inspector");
        if (roleTarget === "farm_manager") return r.type === "Checklist" || r.responsible.toLowerCase().includes("farm");
        return true;
      });
    }

    finalRows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    if (format === "json") {
      return res.json({
        success: true,
        count: finalRows.length,
        data: finalRows,
      });
    }

    // Return as CSV
    const headers = ["Date", "Type", "Farm", "Title / Subject", "Severity", "Status", "Responsible", "Details"];
    const escapeCsv = (str: any) => {
      const val = str === null || str === undefined ? "" : String(str);
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    const csvLines = [headers.join(",")];
    finalRows.forEach((r) => {
      csvLines.push([
        escapeCsv(r.date ? new Date(r.date).toLocaleDateString() : "—"),
        escapeCsv(r.type),
        escapeCsv(r.farmName),
        escapeCsv(r.title),
        escapeCsv(r.severity),
        escapeCsv(r.status),
        escapeCsv(r.responsible),
        escapeCsv(r.details),
      ].join(","));
    });

    const csvContent = csvLines.join("\r\n");
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", `attachment; filename=farmdrishti-compliance-report-${Date.now()}.csv`);
    return res.status(200).send(csvContent);
  } catch (error: any) {
    console.error("Admin export reports error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to export report records.",
    });
  }
});

// ─── GET /api/admin/veterinarians/pending ─────────────────────────────────────
router.get("/veterinarians/pending", async (_req: AuthRequest, res: Response) => {
  try {
    const pending = await VeterinarianProfile.find({ verificationStatus: "pending" })
      .populate("userId", "name email createdAt")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: pending.length,
      data: pending,
    });
  } catch (error: any) {
    console.error("Admin get pending vets error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve pending veterinarian applications.",
    });
  }
});

// ─── PUT /api/admin/veterinarians/:id/verify ──────────────────────────────────
router.put("/veterinarians/:id/verify", async (req: AuthRequest, res: Response) => {
  try {
    const { status, reason } = req.body;

    if (!["verified", "rejected"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Status must be either 'verified' or 'rejected'.",
      });
    }

    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid veterinarian profile ID.",
      });
    }

    const updates: any = { verificationStatus: status };
    if (status === "rejected" && reason?.trim()) {
      updates.rejectionReason = reason.trim();
    } else if (status === "verified") {
      updates.rejectionReason = "";
    }

    const profile = await VeterinarianProfile.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true }
    ).populate("userId", "name email");

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Veterinarian profile not found.",
      });
    }

    return res.json({
      success: true,
      message: `Veterinarian profile ${status === "verified" ? "approved" : "rejected"} successfully.`,
      data: profile,
    });
  } catch (error: any) {
    console.error("Admin verify vet error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update veterinarian verification status.",
    });
  }
});

export default router;
