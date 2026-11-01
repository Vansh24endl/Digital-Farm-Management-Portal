import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Ensure environment variables are loaded even if db.ts is imported directly
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve(__dirname, "../../.env") });
  dotenv.config();
}

/**
 * Masks sensitive credentials in MongoDB connection string for safe diagnostic logging.
 */
function sanitizeMongoUri(uri: string): string {
  try {
    return uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)([^@]+)(@.+)/i, "$1*****$3");
  } catch {
    return "[URI MASKED]";
  }
}

/**
 * Validates the MongoDB URI format without exposing credentials.
 */
function validateMongoUri(uri: string | undefined): string {
  if (!uri || !uri.trim()) {
    throw new Error("MONGODB_URI environment variable is missing or empty.");
  }
  const trimmed = uri.trim();
  if (!trimmed.startsWith("mongodb://") && !trimmed.startsWith("mongodb+srv://")) {
    throw new Error("Invalid MONGODB_URI format: Expected connection string starting with 'mongodb://' or 'mongodb+srv://'.");
  }
  return trimmed;
}

let isConnecting = false;

// Attach event listeners once
let listenersAttached = false;
function attachConnectionListeners() {
  if (listenersAttached) return;
  listenersAttached = true;

  mongoose.connection.on("connected", () => {
    console.log(`[Database] MongoDB connection established successfully (db: ${mongoose.connection.name || "default"}).`);
  });

  mongoose.connection.on("error", (err: any) => {
    console.error("[Database] MongoDB connection error occurred:", err?.message || err);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[Database] MongoDB connection was lost. Reconnecting...");
  });

  mongoose.connection.on("reconnected", () => {
    console.log("[Database] MongoDB successfully reconnected.");
  });
}

/**
 * Centralized MongoDB connection manager.
 * Prevents duplicate connections, applies standard timeout options, and validates environment variables.
 */
export const connectDB = async (): Promise<typeof mongoose> => {
  // Prevent duplicate connections: 1 = connected, 2 = connecting
  if (mongoose.connection.readyState === 1) {
    return mongoose;
  }

  if (isConnecting || mongoose.connection.readyState === 2) {
    // Wait for in-flight connection attempt
    return new Promise((resolve, reject) => {
      const check = setInterval(() => {
        if (mongoose.connection.readyState === 1) {
          clearInterval(check);
          resolve(mongoose);
        } else if (mongoose.connection.readyState === 0) {
          clearInterval(check);
          reject(new Error("MongoDB connection attempt aborted or failed."));
        }
      }, 100);
    });
  }

  const rawUri = process.env.MONGODB_URI;
  const validatedUri = validateMongoUri(rawUri);

  attachConnectionListeners();
  isConnecting = true;

  try {
    const conn = await mongoose.connect(validatedUri, {
      serverSelectionTimeoutMS: 10000,
      maxPoolSize: 10,
      socketTimeoutMS: 45000,
      autoIndex: true,
    });

    isConnecting = false;
    return conn;
  } catch (error: any) {
    isConnecting = false;
    const sanitized = sanitizeMongoUri(validatedUri);
    console.error(`[Database] Failed to connect to MongoDB target: ${sanitized}`);
    console.error(`[Database] Diagnostic error: ${error?.message || error}`);
    throw error;
  }
};

/**
 * Closes the active MongoDB connection cleanly during graceful shutdown.
 */
export const disconnectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.connection.close(false);
    console.log("[Database] MongoDB connection cleanly closed.");
  }
};

export default connectDB;
