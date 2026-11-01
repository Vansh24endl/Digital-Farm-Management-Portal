import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import User, { IUser, UserRole } from "../models/User";
import Farm from "../models/Farm";

export interface AuthRequest extends Request {
  user?: IUser;
}

interface JwtPayload {
  id: string;
  role: string;
}

/**
 * Authentication middleware:
 * - Extracts Bearer token
 * - Verifies JWT
 * - Rejects missing, invalid, or expired tokens with HTTP 401
 * - Rejects non-existent or inactive users
 * - Attaches authenticated user to req.user (excluding password)
 */
export const protect = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  let token: string | undefined;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access denied. Authentication token is required.",
    });
  }

  try {
    const secret = process.env.JWT_SECRET || "fallback_secret_key";
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Invalid token payload.",
      });
    }

    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "The user belonging to this token no longer exists.",
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        message: "Your account has been deactivated. Please contact an administrator.",
      });
    }

    req.user = user;
    next();
  } catch (error: any) {
    const isExpired = error?.name === "TokenExpiredError";
    return res.status(401).json({
      success: false,
      message: isExpired ? "Token has expired. Please log in again." : "Invalid or expired token.",
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware:
 * Rejects requests with HTTP 403 if req.user does not have one of the required roles.
 */
export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user?.role || "guest"}' is not authorized to perform this action.`,
      });
    }
    next();
  };
};

/**
 * Resolves all farm ObjectIds accessible to the authenticated user based on role and ownership.
 * Returns null if user is admin (unrestricted).
 * Returns array of farm ObjectIds if user is farm_manager, veterinarian, or inspector.
 */
export async function getAuthorizedFarmIds(user: IUser): Promise<mongoose.Types.ObjectId[] | null> {
  if (user.role === "admin") {
    return null; // Admins have global access
  }

  const conditions: any[] = [];
  if (user.farmId) {
    conditions.push({ _id: user.farmId });
  }

  if (user.role === "farm_manager") {
    // Farm managers own farms created by them
    conditions.push({ ownerId: user._id });
  }

  if (conditions.length === 0) {
    return []; // No farms associated with this user yet
  }

  const farms = await Farm.find({ $or: conditions }).select("_id");
  return farms.map((f) => f._id as mongoose.Types.ObjectId);
}

/**
 * Checks whether user has permission to access a specific farm (async to verify DB ownership).
 */
export async function canAccessFarmAsync(
  user: IUser,
  targetFarmId?: string | mongoose.Types.ObjectId | null
): Promise<boolean> {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!targetFarmId) return false;

  const targetStr = String(targetFarmId);
  const userFarmStr = user.farmId ? String(user.farmId) : null;

  if (userFarmStr && userFarmStr === targetStr) {
    return true;
  }

  if (user.role === "farm_manager") {
    if (mongoose.isValidObjectId(targetFarmId)) {
      const isOwner = await Farm.exists({ _id: targetFarmId, ownerId: user._id });
      return Boolean(isOwner);
    }
    return false;
  }

  return false;
}

/**
 * Synchronous farm permission check for backward compatibility.
 */
export const canAccessFarm = (
  user: IUser,
  targetFarmId?: string | mongoose.Types.ObjectId | null
): boolean => {
  if (!user) return false;
  if (user.role === "admin") return true;
  if (!targetFarmId) return false;

  const targetStr = String(targetFarmId);
  const userFarmStr = user.farmId ? String(user.farmId) : null;

  if (user.role === "farm_manager") {
    return Boolean(userFarmStr && userFarmStr === targetStr);
  }

  if (userFarmStr) {
    return userFarmStr === targetStr;
  }
  return false;
};

/**
 * Middleware to enforce farm-level ownership and prevent IDOR attacks.
 */
export const requireFarmAccess = (
  source: "body" | "query" | "params" = "body",
  key = "farmId"
) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const targetFarmId = req[source]?.[key];
    if (targetFarmId) {
      const allowed = await canAccessFarmAsync(req.user, targetFarmId);
      if (!allowed) {
        return res.status(403).json({
          success: false,
          message: "Forbidden: You do not have permission to access or modify records for this farm.",
        });
      }
    }
    next();
  };
};
