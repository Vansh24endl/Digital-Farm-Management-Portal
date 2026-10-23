
import { Router } from "express";
import Farm from "../models/Farm";

const router = Router();

// CREATE FARM
router.post("/", async (req, res) => {
  try {
    const { name, farmType, location } = req.body;

    if (!name || !farmType || !location) {
      return res.status(400).json({
        success: false,
        message: "Name, farmType and location are required",
      });
    }

    const farm = await Farm.create({
      name,
      farmType,
      location,
    });

    return res.status(201).json({
      success: true,
      data: farm,
    });
  } catch (error) {
    console.error("Create farm error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create farm",
    });
  }
});

// GET ALL FARMS
router.get("/", async (_req, res) => {
  try {
    const farms = await Farm.find().sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: farms.length,
      data: farms,
    });
  } catch (error) {
    console.error("Fetch farms error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch farms",
    });
  }
});

// GET FARM BY ID
router.get("/:id", async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findById(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.json({ success: true, data: farm });
  } catch (error) {
    console.error("Fetch farm error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch farm",
    });
  }
});

// UPDATE FARM
router.put("/:id", async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const { name, farmType, location } = req.body;

    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      { name, farmType, location },
      { new: true, runValidators: true }
    );

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.json({ success: true, data: farm });
  } catch (error) {
    console.error("Update farm error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update farm",
    });
  }
});

// DELETE FARM
router.delete("/:id", async (req, res) => {
  try {
    if (!/^[a-f\d]{24}$/i.test(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farm = await Farm.findByIdAndDelete(req.params.id);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    return res.json({
      success: true,
      message: "Farm deleted successfully",
    });
  } catch (error) {
    console.error("Delete farm error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete farm",
    });
  }
});

export default router;