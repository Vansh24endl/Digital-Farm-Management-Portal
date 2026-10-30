import { Router, Response } from "express";
import mongoose from "mongoose";
import Visitor from "../models/Visitor";
import Farm from "../models/Farm";
import {
  protect,
  authorize,
  AuthRequest,
  canAccessFarm,
} from "../middleware/authMiddleware";

const router = Router();

// Protect all visitor routes
router.use(protect);

// REGISTER VISITOR
// @access Private (Admin, Farm Manager)
router.post(
  "/",
  authorize("admin", "farm_manager"),
  async (req: AuthRequest, res: Response) => {
    try {
      const {
        farmId,
        name,
        purpose,
        role,
        company,
        phone,
        temperature,
        status,
      } = req.body;

      if (!farmId || !name?.trim() || !purpose?.trim()) {
        return res.status(400).json({
          success: false,
          message: "farmId, name and purpose are required",
        });
      }

      if (!mongoose.isValidObjectId(farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId",
        });
      }

      // Farm-level IDOR check
      if (!canAccessFarm(req.user!, farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to register visitors for this farm.",
        });
      }

      const farm = await Farm.findById(farmId);
      if (!farm) {
        return res.status(404).json({
          success: false,
          message: "Farm not found",
        });
      }

      const visitor = await Visitor.create({
        farmId,
        name: name.trim(),
        purpose: purpose.trim(),
        role: role?.trim() || "Visitor",
        company: company?.trim() || "Independent",
        phone: phone?.trim() || "—",
        temperature: temperature?.trim() || "36.5°C",
        status: status === "OUT" ? "OUT" : "IN",
        checkIn: new Date(),
      });

      return res.status(201).json({
        success: true,
        data: visitor,
      });
    } catch (error) {
      console.error("Register visitor error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to register visitor",
      });
    }
  }
);

// GET ALL VISITORS
// @access Private (Authenticated users, scoped by farm)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.user?.role === "farm_manager" && req.user.farmId) {
      filter.farmId = req.user.farmId;
    } else if (req.query.farmId) {
      if (!mongoose.isValidObjectId(req.query.farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId",
        });
      }

      if (!canAccessFarm(req.user!, String(req.query.farmId))) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to view visitors for this farm.",
        });
      }

      filter.farmId = req.query.farmId;
    }

    const visitors = await Visitor.find(filter)
      .populate("farmId", "name farmType location")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: visitors.length,
      data: visitors,
    });
  } catch (error) {
    console.error("Fetch visitors error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch visitors",
    });
  }
});

// CHECK OUT VISITOR
// @access Private (Admin, Farm Manager)
router.patch(
  "/:id/checkout",
  authorize("admin", "farm_manager"),
  async (req: AuthRequest, res: Response) => {
    try {
      if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid visitor ID",
        });
      }

      const visitor = await Visitor.findById(req.params.id);

      if (!visitor) {
        return res.status(404).json({
          success: false,
          message: "Visitor not found",
        });
      }

      if (!canAccessFarm(req.user!, visitor.farmId)) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to check out visitors for this farm.",
        });
      }

      if (visitor.checkOut) {
        return res.status(409).json({
          success: false,
          message: "Visitor has already checked out",
        });
      }

      visitor.checkOut = new Date();
      visitor.status = "OUT";
      await visitor.save();

      return res.json({
        success: true,
        data: visitor,
      });
    } catch (error) {
      console.error("Visitor checkout error:", error);
      return res.status(500).json({
        success: false,
        message: "Failed to check out visitor",
      });
    }
  }
);

export default router;