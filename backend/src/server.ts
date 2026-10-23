import auditRoutes from "./routes/auditRoutes";
import inventoryRoutes from "./routes/inventoryRoutes";
import diseaseReportRoutes from "./routes/diseaseReportRoutes";
import farmRoutes from "./routes/farmRoutes";
import visitorRoutes from "./routes/visitorRoutes";
import checklistRoutes from "./routes/checklistRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/checklists", checklistRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/disease-reports", diseaseReportRoutes);
app.use("/api/audits", auditRoutes);
app.use("/api/visitors", visitorRoutes);
app.use("/api/farms", farmRoutes);

app.get("/api/health", (_req, res) => {
    res.json({
        success: true,
        message: "FarmDrishti API is running",
        timestamp: new Date().toISOString(),
    });
});

const PORT = Number(process.env.PORT) || 5000;



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