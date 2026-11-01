import path from "path";
import dotenv from "dotenv";

// Load environment variables immediately before any other module evaluation
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();

import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import { connectDB, disconnectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import farmRoutes from "./routes/farmRoutes";
import auditRoutes from "./routes/auditRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import diseaseReportRoutes from "./routes/diseaseReportRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import alertRoutes from "./routes/alertRoutes";
import weatherRoutes from "./routes/weatherRoutes";
import dailyLogRoutes from "./routes/dailyLogRoutes";
import vetProfileRoutes from "./routes/vetProfileRoutes";
import userRoutes from "./routes/userRoutes";
import adminRoutes from "./routes/adminRoutes";

const app = express();

app.use(cors());
app.use(express.json());

// Public health check endpoint reporting DB connection state
app.get("/api/health", (_req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(isConnected ? 200 : 503).json({
    success: isConnected,
    message: isConnected ? "FarmDrishti API is healthy and connected to database" : "Database connection unavailable",
    database: isConnected ? "connected" : "disconnected",
    timestamp: new Date().toISOString(),
  });
});

// Mount API routes
app.use("/api/auth", authRoutes);
app.use("/api/farms", farmRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/checklists", checklistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/disease-reports", diseaseReportRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/weather", weatherRoutes);
app.use("/api/daily-logs", dailyLogRoutes);
app.use("/api/veterinarians", vetProfileRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

// Centralized error-handling middleware
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error("Unhandled server error:", err);
  const status = typeof err?.status === "number" ? err.status : 500;
  res.status(status).json({
    success: false,
    message: err?.message || "An unexpected error occurred on the server.",
  });
});

const PORT = Number(process.env.PORT) || 5000;
let server: any = null;

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`[Server] FarmDrishti API running on port ${PORT}`);
      });
    })
    .catch((error: unknown) => {
      console.error("[Server] Fatal error: Database connection failed during startup:", error);
      process.exit(1);
    });

  // Graceful shutdown handlers
  const handleShutdown = async (signal: string) => {
    console.log(`\n[Server] Received ${signal}. Initiating graceful shutdown...`);
    if (server) {
      server.close(() => {
        console.log("[Server] HTTP server closed.");
      });
    }
    try {
      await disconnectDB();
    } catch (e) {
      console.error("[Server] Error closing database connection:", e);
    }
    process.exit(0);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));
}

export { app };
