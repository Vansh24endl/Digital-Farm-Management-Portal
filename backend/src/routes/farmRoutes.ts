import { Router, Response } from "express";
import mongoose from "mongoose";
import Farm from "../models/Farm";
import User from "../models/User";
import { protect, authorize, AuthRequest, canAccessFarm } from "../middleware/authMiddleware";

const router = Router();

// Protect all farm routes
router.use(protect);

// CREATE / REGISTER FARM
// @access Private (Admin or Farm Manager)
router.post("/", authorize("admin", "farm_manager"), async (req: AuthRequest, res: Response) => {
  try {
    const { name, farmType, location, coordinates } = req.body;

    if (!name?.trim() || !farmType || !location?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name, farmType and location are required",
      });
    }

    if (!["pig", "poultry", "mixed"].includes(farmType)) {
      return res.status(400).json({
        success: false,
        message: "farmType must be 'pig', 'poultry', or 'mixed'",
      });
    }

    const farmData: any = {
      name: name.trim(),
      farmType,
      location: location.trim(),
      ownerId: req.user?._id,
    };

    if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lon === "number") {
      farmData.coordinates = {
        lat: coordinates.lat,
        lon: coordinates.lon,
      };
    }

    const farm = await Farm.create(farmData);

    // If farm_manager is registering their farm, link it to their user profile if not already set
    if (req.user && req.user.role === "farm_manager" && !req.user.farmId) {
      await User.findByIdAndUpdate(req.user._id, { farmId: farm._id });
    }

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
// @access Private (Authenticated users)
router.get("/", async (req: AuthRequest, res: Response) => {
  try {
    let query: Record<string, any> = {};

    // If farm_manager is assigned to or owns a specific farm, prioritize
    if (req.user?.role === "farm_manager") {
      if (req.user.farmId) {
        query.$or = [{ _id: req.user.farmId }, { ownerId: req.user._id }];
      } else {
        // If not explicitly assigned, allow seeing their created farms or general pool
        const ownedCount = await Farm.countDocuments({ ownerId: req.user._id });
        if (ownedCount > 0) {
          query.ownerId = req.user._id;
        }
      }
    }

    const farms = await Farm.find(query).sort({ createdAt: -1 });

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
// @access Private (Authenticated users with farm permission)
router.get("/:id", async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farmId = String(req.params.id);
    if (!canAccessFarm(req.user!, farmId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have access to this farm.",
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
// @access Private (Admin, or Farm Manager for their assigned farm)
router.put("/:id", authorize("admin", "farm_manager"), async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid farm ID",
      });
    }

    const farmId = String(req.params.id);
    if (!canAccessFarm(req.user!, farmId)) {
      return res.status(403).json({
        success: false,
        message: "Forbidden: You do not have permission to edit this farm.",
      });
    }

    const { name, farmType, location, coordinates } = req.body;
    const updates: any = {};
    if (name?.trim()) updates.name = name.trim();
    if (farmType && ["pig", "poultry", "mixed"].includes(farmType)) updates.farmType = farmType;
    if (location?.trim()) updates.location = location.trim();
    if (coordinates && typeof coordinates.lat === "number" && typeof coordinates.lon === "number") {
      updates.coordinates = coordinates;
    }

    const farm = await Farm.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
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
// @access Private (Admin only)
router.delete("/:id", authorize("admin"), async (req: AuthRequest, res: Response) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
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
