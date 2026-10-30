import { Router, Response } from "express";
import { protect, AuthRequest } from "../middleware/authMiddleware";
import { alertService } from "../services/alertService";
import { AlertType, AlertSeverity } from "../models/Alert";

const router = Router();

// Protect all alert routes
router.use(protect);

// @route   GET /api/alerts
// @desc    Get alerts visible to the authenticated user with pagination and filters
// @access  Private (All authenticated roles, scoped to permitted farms)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const { page, limit, type, severity, isRead, farmId } = req.query;

    const parsedFilter = {
      page: page ? parseInt(String(page), 10) : 1,
      limit: limit ? parseInt(String(limit), 10) : 20,
      type: type ? (String(type) as AlertType) : undefined,
      severity: severity ? (String(severity) as AlertSeverity) : undefined,
      isRead: isRead !== undefined ? isRead === "true" : undefined,
      farmId: farmId ? String(farmId) : undefined,
    };

    const result = await alertService.getAlertsForUser(req.user!, parsedFilter);

    return res.json({
      success: true,
      data: result.alerts,
      pagination: result.pagination,
    });
  } catch (error: any) {
    console.error("Fetch alerts error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch alerts.",
    });
  }
});

// @route   GET /api/alerts/unread-count
// @desc    Get count of unread alerts visible to the authenticated user
// @access  Private
router.get("/unread-count", async (req: AuthRequest, res: Response) => {
  try {
    const count = await alertService.getUnreadCount(req.user!);

    return res.json({
      success: true,
      count,
    });
  } catch (error: any) {
    console.error("Get unread alert count error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to get unread alert count.",
    });
  }
});

// @route   PATCH /api/alerts/:id/read
// @desc    Mark a specific alert as read
// @access  Private (Only if user has access to this alert's farm)
router.patch("/:id/read", async (req: AuthRequest, res: Response) => {
  try {
    const alertId = String(req.params.id);
    const alert = await alertService.markAsRead(alertId, req.user!);

    if (!alert) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    return res.json({
      success: true,
      message: "Alert marked as read.",
      data: alert,
    });
  } catch (error: any) {
    if (error.status === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Mark alert read error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark alert as read.",
    });
  }
});

// @route   PATCH /api/alerts/read-all
// @desc    Mark all visible alerts as read for the authenticated user
// @access  Private
router.patch("/read-all", async (req: AuthRequest, res: Response) => {
  try {
    const modifiedCount = await alertService.markAllAsRead(req.user!);

    return res.json({
      success: true,
      message: `Marked ${modifiedCount} alerts as read.`,
      modifiedCount,
    });
  } catch (error: any) {
    console.error("Mark all alerts read error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to mark all alerts as read.",
    });
  }
});

// @route   DELETE /api/alerts/:id
// @desc    Dismiss (delete) an alert
// @access  Private
router.delete("/:id", async (req: AuthRequest, res: Response) => {
  try {
    const alertId = String(req.params.id);
    const success = await alertService.dismissAlert(alertId, req.user!);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: "Alert not found.",
      });
    }

    return res.json({
      success: true,
      message: "Alert dismissed successfully.",
    });
  } catch (error: any) {
    if (error.status === 403) {
      return res.status(403).json({
        success: false,
        message: error.message,
      });
    }

    console.error("Dismiss alert error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to dismiss alert.",
    });
  }
});

export default router;
