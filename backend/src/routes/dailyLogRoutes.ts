import { Router, Response } from "express";
import mongoose from "mongoose";
import DailyLog from "../models/DailyLog";
import Alert from "../models/Alert";
import {
  protect,
  AuthRequest,
  canAccessFarm,
  canAccessFarmAsync,
  getAuthorizedFarmIds,
} from "../middleware/authMiddleware";
import { validate, createDailyLogSchema } from "../validation";

const router = Router();

// All daily log routes require authentication
router.use(protect);

/**
 * POST /api/daily-logs
 * Manual daily farm record submission by farmer (Non-IoT)
 */
router.post("/", validate(createDailyLogSchema), async (req: AuthRequest, res: Response) => {
  try {
    const {
      farmId,
      logDate,
      temperature,
      humidity,
      animalCount,
      mortalityCount,
      waterConsumptionLiters,
      feedConsumptionKg,
      cleaningDisinfectionDone,
      disinfectantUsed,
      healthObservations,
      symptomsObserved,
      biosecurityNotes,
    } = req.body;

    if (!farmId || !mongoose.isValidObjectId(farmId)) {
      return res.status(400).json({
        success: false,
        message: "Valid farm ID is required.",
      });
    }

    const hasAccess = await canAccessFarmAsync(req.user!, String(farmId));
    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You are not authorized to log data for this farm.",
      });
    }

    if (temperature === undefined || humidity === undefined || animalCount === undefined) {
      return res.status(400).json({
        success: false,
        message: "Temperature, humidity, and animal population count are required.",
      });
    }

    const tempNum = Number(temperature);
    const humNum = Number(humidity);
    const animNum = Number(animalCount);
    const mortNum = Number(mortalityCount) || 0;
    const waterNum = Number(waterConsumptionLiters) || 0;
    const feedNum = Number(feedConsumptionKg) || 0;

    if (isNaN(tempNum) || tempNum < -10 || tempNum > 60) {
      return res.status(400).json({
        success: false,
        message: "Temperature must be a valid number between -10°C and 60°C.",
      });
    }

    if (isNaN(humNum) || humNum < 0 || humNum > 100) {
      return res.status(400).json({
        success: false,
        message: "Relative humidity must be between 0% and 100%.",
      });
    }

    if (isNaN(animNum) || animNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Animal population count cannot be negative.",
      });
    }

    const log = await DailyLog.create({
      farmId: new mongoose.Types.ObjectId(farmId),
      recordedBy: req.user!._id,
      logDate: logDate ? new Date(logDate) : new Date(),
      dataSource: "Manual Farmer Observation (Non-IoT)",
      temperature: tempNum,
      humidity: humNum,
      animalCount: animNum,
      mortalityCount: mortNum,
      waterConsumptionLiters: waterNum,
      feedConsumptionKg: feedNum,
      cleaningDisinfectionDone: Boolean(cleaningDisinfectionDone),
      disinfectantUsed: disinfectantUsed?.trim() || "Virkon-S / Bleach Dip",
      healthObservations: healthObservations?.trim() || "Normal activity recorded.",
      symptomsObserved: symptomsObserved?.trim() || "None",
      biosecurityNotes: biosecurityNotes?.trim(),
    });

    // ── Automated Alert Hook for Severe Manual Observations ──
    if (mortNum >= 5) {
      await Alert.create({
        farmId: new mongoose.Types.ObjectId(farmId),
        type: "disease_severity",
        severity: "critical",
        title: `Spike in Mortality (${mortNum} head deaths recorded)`,
        message: `Farmer reported ${mortNum} animal deaths in manual daily log. Immediate veterinary swab sampling required.`,
        source: "Manual Daily Log",
      });
    } else if (tempNum >= 38) {
      await Alert.create({
        farmId: new mongoose.Types.ObjectId(farmId),
        type: "system",
        severity: "high",
        title: `Extreme Heat Stress (${tempNum}°C Barn Temp)`,
        message: `Farmer recorded barn temperature of ${tempNum}°C manually. Activate mist cooling and continuous air ventilation immediately.`,
        source: "Manual Daily Log",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Daily farm log recorded successfully (Manual observation persisted).",
      data: log,
    });
  } catch (error: any) {
    console.error("Create daily log error:", error);
    return res.status(500).json({
      success: false,
      message: error?.message || "Failed to record daily log.",
    });
  }
});

/**
 * GET /api/daily-logs
 * Retrieve recent manual logs for a farm
 */
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { farmId, limit = 30 } = req.query;
    const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);

    // If non-admin user has 0 authorized farms, return empty list immediately
    if (authorizedFarmIds !== null && authorizedFarmIds.length === 0) {
      return res.json({
        success: true,
        count: 0,
        data: [],
      });
    }

    let query: Record<string, any> = {};

    if (farmId) {
      if (!mongoose.isValidObjectId(String(farmId))) {
        return res.status(400).json({ success: false, message: "Invalid farm ID." });
      }
      const hasAccess = await canAccessFarmAsync(req.user!, String(farmId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: "Forbidden: No access to this farm." });
      }
      query.farmId = farmId;
    } else if (authorizedFarmIds !== null) {
      query.farmId = { $in: authorizedFarmIds };
    }

    const logs = await DailyLog.find(query)
      .sort({ logDate: -1 })
      .limit(Number(limit) || 30)
      .populate("recordedBy", "name role email")
      .populate("farmId", "name location");

    return res.json({
      success: true,
      count: logs.length,
      data: logs,
    });
  } catch (error: any) {
    console.error("Fetch daily logs error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch daily logs.",
    });
  }
});

/**
 * GET /api/daily-logs/latest
 * Get the latest manual observation for the selected farm
 */
router.get("/latest", async (req: AuthRequest, res: Response) => {
  try {
    const { farmId } = req.query;
    const authorizedFarmIds = await getAuthorizedFarmIds(req.user!);

    if (authorizedFarmIds !== null && authorizedFarmIds.length === 0) {
      return res.json({
        success: true,
        data: null,
      });
    }

    let query: Record<string, any> = {};

    if (farmId) {
      if (!mongoose.isValidObjectId(String(farmId))) {
        return res.status(400).json({ success: false, message: "Invalid farm ID." });
      }
      const hasAccess = await canAccessFarmAsync(req.user!, String(farmId));
      if (!hasAccess) {
        return res.status(403).json({ success: false, message: "Forbidden: No access to this farm." });
      }
      query.farmId = farmId;
    } else if (authorizedFarmIds !== null) {
      query.farmId = { $in: authorizedFarmIds };
    }

    const latest = await DailyLog.findOne(query)
      .sort({ logDate: -1 })
      .populate("recordedBy", "name role")
      .populate("farmId", "name location");

    return res.json({
      success: true,
      data: latest,
    });
  } catch (error: any) {
    console.error("Fetch latest daily log error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch latest daily log.",
    });
  }
});

export default router;