import { Router } from "express";
import mongoose from "mongoose";
import Visitor from "../models/Visitor";
import Farm from "../models/Farm";

const router = Router();

// REGISTER VISITOR
router.post("/", async (req, res) => {
  try {
    const { farmId, name, purpose } = req.body;

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
});

// GET ALL VISITORS
router.get("/", async (_req, res) => {
  try {
    const visitors = await Visitor.find()
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
router.patch("/:id/checkout", async (req, res) => {
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

    if (visitor.checkOut) {
      return res.status(409).json({
        success: false,
        message: "Visitor has already checked out",
      });
    }

    visitor.checkOut = new Date();
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
});

export default router;