import mongoose from "mongoose";
import Alert, { IAlert, AlertType, AlertSeverity } from "../models/Alert";
import { IUser } from "../models/User";
import { canAccessFarm } from "../middleware/authMiddleware";

export interface CreateAlertDto {
  farmId?: string | mongoose.Types.ObjectId | null;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  source: string;
  metadata?: Record<string, any>;
}

export interface GetAlertsFilter {
  page?: number | undefined;
  limit?: number | undefined;
  type?: AlertType | undefined;
  severity?: AlertSeverity | undefined;
  isRead?: boolean | undefined;
  farmId?: string | undefined;
}

class AlertService {
  /**
   * Helper to construct farm-scoping query based on user role and permissions.
   */
  private getFarmScopeFilter(user: IUser, requestedFarmId?: string): Record<string, any> {
    if (user.role === "admin") {
      if (requestedFarmId && mongoose.isValidObjectId(requestedFarmId)) {
        return { farmId: new mongoose.Types.ObjectId(requestedFarmId) };
      }
      return {};
    }

    if (user.role === "farm_manager") {
      // Must be restricted to their assigned farm, or general system alerts (farmId: null)
      if (user.farmId) {
        return {
          $or: [
            { farmId: user.farmId },
            { farmId: null },
          ],
        };
      }
      return { farmId: null };
    }

    // Inspector and Veterinarian
    if (user.farmId) {
      return {
        $or: [
          { farmId: user.farmId },
          { farmId: null },
        ],
      };
    }

    if (requestedFarmId && mongoose.isValidObjectId(requestedFarmId)) {
      return { farmId: new mongoose.Types.ObjectId(requestedFarmId) };
    }

    return {};
  }

  /**
   * Create a new persistent alert.
   */
  async createAlert(data: CreateAlertDto): Promise<IAlert> {
    let validFarmId: mongoose.Types.ObjectId | null = null;
    if (data.farmId && mongoose.isValidObjectId(data.farmId)) {
      validFarmId = new mongoose.Types.ObjectId(String(data.farmId));
    }

    const alert = await Alert.create({
      farmId: validFarmId,
      type: data.type,
      severity: data.severity,
      title: data.title.trim(),
      message: data.message.trim(),
      source: data.source.trim(),
      isRead: false,
      metadata: data.metadata || {},
    });

    return alert;
  }

  /**
   * Retrieve alerts visible to the authenticated user with filtering & pagination.
   */
  async getAlertsForUser(user: IUser, filter: GetAlertsFilter = {}) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = this.getFarmScopeFilter(user, filter.farmId);

    if (filter.type) {
      query.type = filter.type;
    }

    if (filter.severity) {
      query.severity = filter.severity;
    }

    if (filter.isRead !== undefined) {
      query.isRead = filter.isRead;
    }

    const [alerts, total, unreadCount] = await Promise.all([
      Alert.find(query)
        .populate("farmId", "name location farmType")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Alert.countDocuments(query),
      Alert.countDocuments({ ...query, isRead: false }),
    ]);

    return {
      alerts,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
        unreadCount,
      },
    };
  }

  /**
   * Get unread count visible to the user.
   */
  async getUnreadCount(user: IUser): Promise<number> {
    const query = {
      ...this.getFarmScopeFilter(user),
      isRead: false,
    };
    return Alert.countDocuments(query);
  }

  /**
   * Mark a specific alert as read with farm-level authorization check.
   */
  async markAsRead(alertId: string, user: IUser): Promise<IAlert | null> {
    if (!mongoose.isValidObjectId(alertId)) {
      throw new Error("Invalid alert ID format.");
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return null;
    }

    // Check farm access permission
    if (!canAccessFarm(user, alert.farmId)) {
      const err = new Error("Forbidden: You do not have permission to modify alerts for this farm.");
      (err as any).status = 403;
      throw err;
    }

    if (!alert.isRead) {
      alert.isRead = true;
      await alert.save();
    }

    return alert;
  }

  /**
   * Mark all visible alerts as read for the authenticated user.
   */
  async markAllAsRead(user: IUser): Promise<number> {
    const query = {
      ...this.getFarmScopeFilter(user),
      isRead: false,
    };

    const result = await Alert.updateMany(query, { $set: { isRead: true } });
    return result.modifiedCount;
  }

  /**
   * Dismiss (delete) an alert if authorized.
   */
  async dismissAlert(alertId: string, user: IUser): Promise<boolean> {
    if (!mongoose.isValidObjectId(alertId)) {
      throw new Error("Invalid alert ID format.");
    }

    const alert = await Alert.findById(alertId);
    if (!alert) {
      return false;
    }

    if (!canAccessFarm(user, alert.farmId)) {
      const err = new Error("Forbidden: You do not have permission to dismiss alerts for this farm.");
      (err as any).status = 403;
      throw err;
    }

    await Alert.findByIdAndDelete(alertId);
    return true;
  }

  /**
   * Automatic trigger for Low Inventory items.
   * Prevents repeated duplicate alerts if an active unread alert already exists for this item.
   */
  async triggerLowInventoryAlert(item: any): Promise<IAlert | null> {
    if (!item || typeof item.quantity !== "number" || typeof item.minimumStock !== "number") {
      return null;
    }

    // Case 1: Item is at or below minimum threshold
    if (item.quantity <= item.minimumStock) {
      // Check if there is already an unread low stock alert for this specific item
      const existingAlert = await Alert.findOne({
        type: "inventory_low",
        "metadata.itemId": item._id,
        isRead: false,
      });

      if (existingAlert) {
        // Already flagged, avoid spamming duplicate alerts
        return null;
      }

      const isCritical = item.quantity === 0;
      return this.createAlert({
        farmId: item.farmId,
        type: "inventory_low",
        severity: isCritical ? "critical" : "high",
        title: `Low Stock: ${item.itemName}`,
        message: isCritical
          ? `CRITICAL DEPLETION: ${item.itemName} is completely out of stock (0 ${item.unit}). Immediate restocking required.`
          : `Stock for ${item.itemName} is at ${item.quantity} ${item.unit}, which is at or below minimum reserve (${item.minimumStock} ${item.unit}).`,
        source: "inventory",
        metadata: {
          itemId: item._id,
          itemName: item.itemName,
          quantity: item.quantity,
          minimumStock: item.minimumStock,
          unit: item.unit,
        },
      });
    }

    // Case 2: Item has been restocked above minimumStock -> Auto-resolve previous unread low stock alerts
    if (item.quantity > item.minimumStock) {
      await Alert.updateMany(
        {
          type: "inventory_low",
          "metadata.itemId": item._id,
          isRead: false,
        },
        {
          $set: { isRead: true },
        }
      );
    }

    return null;
  }

  /**
   * Automatic trigger for High/Critical Severity Disease Reports.
   * Avoids duplicate alerts on unrelated updates, but creates an alert on new high/critical cases or escalation.
   */
  async triggerDiseaseAlert(report: any, isEscalation = false): Promise<IAlert | null> {
    if (!report) return null;

    const severity = String(report.severity || "").toLowerCase();
    const isHighOrCritical = severity === "high" || severity === "critical";

    if (!isHighOrCritical) {
      return null;
    }

    // Check if an alert for this disease report already exists
    const existingAlert = await Alert.findOne({
      "metadata.reportId": report._id,
      "metadata.severity": severity,
    });

    if (existingAlert && !isEscalation) {
      // Unrelated update, do not re-alert
      return null;
    }

    const title = severity === "critical"
      ? `CRITICAL OUTBREAK ALERT: ${report.diseaseName || "Pathogen Vector"}`
      : `Disease Vector Alert: ${report.diseaseName || "Pathogen Vector"}`;

    const locationText = report.location ? ` in ${report.location}` : "";
    const animalText = report.speciesAffected || report.animalType || "Livestock";

    const message = `High-severity pathogen outbreak reported${locationText}. Affected: ${animalText}. Symptoms: ${report.symptoms || "Abnormal clinical signs"}. Veterinary containment required.`;

    return this.createAlert({
      farmId: report.farmId,
      type: severity === "critical" ? "outbreak_warning" : "disease_severity",
      severity: severity === "critical" ? "critical" : "high",
      title,
      message,
      source: "disease_surveillance",
      metadata: {
        reportId: report._id,
        diseaseName: report.diseaseName,
        animalType: report.animalType,
        severity: report.severity,
      },
    });
  }
}

export const alertService = new AlertService();
