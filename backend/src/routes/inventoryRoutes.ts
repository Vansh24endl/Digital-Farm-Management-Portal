
import { Router } from "express";
import mongoose from "mongoose";
import Inventory from "../models/Inventory";
import Farm from "../models/Farm";

const router = Router();

// CREATE INVENTORY ITEM
router.post("/", async (req, res) => {
  try {
    const {
      farmId,
      itemName,
      category,
      quantity,
      unit,
      minimumStock,
    } = req.body;

    const categories = [
      "disinfectant",
      "ppe",
      "medicine",
      "equipment",
      "other",
    ];

    if (
      !farmId ||
      !mongoose.isValidObjectId(farmId) ||
      !itemName?.trim() ||
      !unit?.trim() ||
      !categories.includes(category) ||
      typeof quantity !== "number" ||
      !Number.isFinite(quantity) ||
      quantity < 0 ||
      (minimumStock !== undefined &&
        (typeof minimumStock !== "number" ||
          !Number.isFinite(minimumStock) ||
          minimumStock < 0))
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide valid farmId, itemName, category, quantity and unit",
      });
    }

    const farm = await Farm.findById(farmId);

    if (!farm) {
      return res.status(404).json({
        success: false,
        message: "Farm not found",
      });
    }

    const item = await Inventory.create({
      farmId,
      itemName: itemName.trim(),
      category,
      quantity,
      unit: unit.trim(),
      minimumStock,
    });

    return res.status(201).json({
      success: true,
      data: item,
    });
  } catch (error) {
    console.error("Create inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to create inventory item",
    });
  }
});

// GET INVENTORY
router.get("/", async (req, res) => {
  try {
    const filter: Record<string, unknown> = {};

    if (req.query.farmId) {
      if (!mongoose.isValidObjectId(req.query.farmId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid farmId",
        });
      }

      filter.farmId = req.query.farmId;
    }

    const items = await Inventory.find(filter)
      .populate("farmId", "name farmType location")
      .sort({ createdAt: -1 });

    return res.json({
      success: true,
      count: items.length,
      data: items,
    });
  } catch (error) {
    console.error("Fetch inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch inventory",
    });
  }
});

// UPDATE INVENTORY ITEM
router.patch("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const allowed = [
      "itemName",
      "category",
      "quantity",
      "unit",
      "minimumStock",
    ];

    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([key]) => allowed.includes(key))
    );

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid fields provided for update",
      });
    }

    if (
      updates.itemName !== undefined &&
      (typeof updates.itemName !== "string" || !updates.itemName.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "itemName must be a non-empty string",
      });
    }

    if (
      updates.unit !== undefined &&
      (typeof updates.unit !== "string" || !updates.unit.trim())
    ) {
      return res.status(400).json({
        success: false,
        message: "unit must be a non-empty string",
      });
    }

    if (
      updates.quantity !== undefined &&
      (typeof updates.quantity !== "number" ||
        !Number.isFinite(updates.quantity) ||
        updates.quantity < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "quantity must be a non-negative number",
      });
    }

    if (
      updates.minimumStock !== undefined &&
      (typeof updates.minimumStock !== "number" ||
        !Number.isFinite(updates.minimumStock) ||
        updates.minimumStock < 0)
    ) {
      return res.status(400).json({
        success: false,
        message: "minimumStock must be a non-negative number",
      });
    }

    if (
      updates.category !== undefined &&
      !["disinfectant", "ppe", "medicine", "equipment", "other"].includes(
        updates.category as string
      )
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory category",
      });
    }

    if (typeof updates.itemName === "string") {
      updates.itemName = updates.itemName.trim();
    }

    if (typeof updates.unit === "string") {
      updates.unit = updates.unit.trim();
    }

    const item = await Inventory.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    );

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error("Update inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update inventory item",
    });
  }
});

// DELETE INVENTORY ITEM
router.delete("/:id", async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid inventory ID",
      });
    }

    const item = await Inventory.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Inventory item not found",
      });
    }

    return res.json({
      success: true,
      message: "Inventory item deleted",
    });
  } catch (error) {
    console.error("Delete inventory error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to delete inventory item",
    });
  }
});

export default router;