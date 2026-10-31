import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config();
import connectDB from "./config/db";
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

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Public health check endpoint
app.get("/api/health", (_req, res) => {
  res.json({
    success: true,
    message: "FarmDrishti API is running",
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

if (process.env.NODE_ENV !== "test") {
  connectDB()
    .then(() => {
      app.listen(PORT, "0.0.0.0", () => {
        console.log(`FarmDrishti API running on port ${PORT}`);
      });
    })
    .catch((error: unknown) => {
      console.error("Database connection failed:", error);
      process.exit(1);
    });
}

export { app };
