process.env.NODE_ENV = "test";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectDB, disconnectDB } from "../config/db";
import { app } from "../server";
import User from "../models/User";
import Farm from "../models/Farm";
import Audit from "../models/Audit";

interface TestResult {
  suite: string;
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function assert(suite: string, name: string, fn: () => Promise<boolean | string>) {
  try {
    const res = await fn();
    if (res === true) {
      console.log(`  ✅ [${suite}] PASS: ${name}`);
      results.push({ suite, name, passed: true });
    } else {
      console.error(`  ❌ [${suite}] FAIL: ${name} (${res})`);
      results.push({ suite, name, passed: false, details: String(res) });
    }
  } catch (err: any) {
    console.error(`  ❌ [${suite}] ERROR: ${name} (${err.message})`);
    results.push({ suite, name, passed: false, details: err.message });
  }
}

async function runVerification() {
  console.log("\n========================================================");
  console.log("🚀 FARMDISHTI: FULL COMPREHENSIVE VERIFICATION SUITE");
  console.log("   (DATABASE + LOGIN AUTH + ADMIN ANALYTICS)");
  console.log("========================================================\n");

  const TEST_PORT = 5095;
  let server: any;

  try {
    // ══════════════════════════════════════════════════════════
    // 1. DATABASE CONNECTION & RELIABILITY SUITE
    // ══════════════════════════════════════════════════════════
    console.log("📦 ─── 1. DATABASE CONNECTION & RELIABILITY ───");

    await assert("Database", "Centralized connectDB() successfully connects to MongoDB Atlas", async () => {
      const conn = await connectDB();
      return mongoose.connection.readyState === 1 && Boolean(conn.connection.name);
    });

    await assert("Database", "Duplicate connection prevention (returns exact same instance)", async () => {
      const conn1 = mongoose.connection;
      const conn2 = await connectDB();
      return conn1 === conn2.connection;
    });

    await assert("Database", "Existing records remain completely intact", async () => {
      const [userCount, farmCount, auditCount] = await Promise.all([
        User.countDocuments(),
        Farm.countDocuments(),
        Audit.countDocuments(),
      ]);
      if (userCount >= 7 && farmCount >= 12 && auditCount >= 5) {
        return true;
      }
      return `Counts: users=${userCount}, farms=${farmCount}, audits=${auditCount}`;
    });

    // Start local express instance on test port
    server = app.listen(TEST_PORT);
    const BASE_URL = `http://localhost:${TEST_PORT}/api`;

    const request = async (path: string, options: RequestInit = {}) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          ...options.headers,
        },
      });
      const data = await res.json().catch(() => ({}));
      return { status: res.status, ok: res.ok, data, headers: res.headers };
    };

    await assert("Database", "Health check reports database: 'connected' with 200 status", async () => {
      const res = await request("/health");
      return res.status === 200 && res.data.database === "connected" && res.data.success === true;
    });

    // ══════════════════════════════════════════════════════════
    // 2. LOGIN & AUTHENTICATION SUITE
    // ══════════════════════════════════════════════════════════
    console.log("\n🔐 ─── 2. LOGIN & AUTHENTICATION SUITE ───");

    await assert("Auth", "Unauthorized request to protected endpoint rejected with 401", async () => {
      const res = await request("/inventory");
      return res.status === 401 && res.data.success === false;
    });

    await assert("Auth", "Invalid credentials rejected with 401", async () => {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@farmdrishti.org", password: "WrongPassword!999" }),
      });
      return res.status === 401 && res.data.success === false;
    });

    let adminToken = "";
    let vetToken = "";
    let managerToken = "";

    await assert("Auth", "Admin login succeeds with JWT and correct role 'admin'", async () => {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "admin@farmdrishti.org", password: "Admin@1234" }),
      });
      if (res.status === 200 && res.data.token && res.data.user?.role === "admin") {
        adminToken = res.data.token;
        return true;
      }
      return `Status: ${res.status}, msg: ${res.data.message}`;
    });

    await assert("Auth", "Veterinarian login succeeds with JWT and role 'veterinarian'", async () => {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "ananya.reyes@biosec.vet", password: "VetSecret@123" }),
      });
      if (res.status === 200 && res.data.token && res.data.user?.role === "veterinarian") {
        vetToken = res.data.token;
        return true;
      }
      return `Status: ${res.status}, msg: ${res.data.message}`;
    });

    await assert("Auth", "Farm Manager login succeeds with JWT and role 'farm_manager'", async () => {
      const res = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "manager@greenvalley.farm", password: "Manager@123" }),
      });
      if (res.status === 200 && res.data.token && res.data.user?.role === "farm_manager") {
        managerToken = res.data.token;
        return true;
      }
      return `Status: ${res.status}, msg: ${res.data.message}`;
    });

    await assert("Auth", "GET /api/auth/me returns authenticated user profile", async () => {
      const res = await request("/auth/me", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.status === 200 && res.data.user?.email === "admin@farmdrishti.org";
    });

    await assert("Auth", "Unauthorized access prevention: Non-admin rejected from /api/admin/* with 403", async () => {
      const res = await request("/admin/analytics/overview", {
        headers: { Authorization: `Bearer ${managerToken}` },
      });
      return res.status === 403;
    });

    await assert("Auth", "Invalid / expired JWT token rejected with 401", async () => {
      const res = await request("/auth/me", {
        headers: { Authorization: "Bearer bad.token.payload" },
      });
      return res.status === 401;
    });

    // ══════════════════════════════════════════════════════════
    // 3. ADMIN REPORTS & ANALYTICS SUITE
    // ══════════════════════════════════════════════════════════
    console.log("\n📊 ─── 3. ADMIN REPORTS & ANALYTICS SUITE ───");

    await assert("Admin", "GET /api/admin/analytics/overview returns real database counts", async () => {
      const res = await request("/admin/analytics/overview", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      const d = res.data.data;
      const ok =
        typeof d.users.total === "number" &&
        d.users.total >= 7 &&
        typeof d.farms.total === "number" &&
        d.farms.total >= 12 &&
        typeof d.audits.total === "number" &&
        typeof d.compliance.score === "number";
      return ok ? true : `Invalid data shape: ${JSON.stringify(d)}`;
    });

    await assert("Admin", "Date range filters update overview metrics (timeRange=7d)", async () => {
      const res = await request("/admin/analytics/overview?timeRange=7d", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.status === 200 && res.data.data?.filtersApplied?.timeRange === "7d";
    });

    await assert("Admin", "GET /api/admin/analytics/users returns role distribution and trends", async () => {
      const res = await request("/admin/analytics/users", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      const roles = res.data.data?.roleDistribution;
      return Array.isArray(roles) && roles.length === 4;
    });

    await assert("Admin", "GET /api/admin/analytics/farms returns farm types and risk breakdown", async () => {
      const res = await request("/admin/analytics/farms", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      const d = res.data.data;
      return typeof d.totalFarms === "number" && typeof d.riskComparison?.highRisk === "number";
    });

    await assert("Admin", "GET /api/admin/analytics/audits returns completion trends & risk distribution", async () => {
      const res = await request("/admin/analytics/audits", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      return typeof res.data.data?.total === "number" && Array.isArray(res.data.data?.completionTrends);
    });

    await assert("Admin", "GET /api/admin/analytics/compliance returns score and distribution bands", async () => {
      const res = await request("/admin/analytics/compliance", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      return typeof res.data.data?.overallScore === "number" && Array.isArray(res.data.data?.distribution);
    });

    await assert("Admin", "GET /api/admin/reports returns paginated combined records", async () => {
      const res = await request("/admin/reports?page=1&limit=5", {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      if (res.status !== 200 || !res.data.success) return `Status: ${res.status}`;
      const d = res.data;
      return Array.isArray(d.data) && d.data.length <= 5 && typeof d.pagination?.total === "number";
    });

    await assert("Admin", "GET /api/admin/reports/export generates valid CSV file", async () => {
      const res = await fetch(`${BASE_URL}/admin/reports/export`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const contentType = res.headers.get("content-type") || "";
      const text = await res.text();
      const hasHeaders = text.startsWith("Date,Type,Farm,Title / Subject,Severity,Status,Responsible,Details");
      return res.status === 200 && contentType.includes("text/csv") && hasHeaders;
    });

    await assert("Admin", "Empty dataset query handled gracefully (future dates return 0 count)", async () => {
      const futureStart = "2099-01-01";
      const futureEnd = "2099-12-31";
      const res = await request(`/admin/reports?startDate=${futureStart}&endDate=${futureEnd}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      return res.status === 200 && res.data.success === true && res.data.data.length === 0 && res.data.pagination.total === 0;
    });

    // ══════════════════════════════════════════════════════════
    // SUMMARY
    // ══════════════════════════════════════════════════════════
    console.log("\n========================================================");
    const passed = results.filter((r) => r.passed).length;
    const failed = results.filter((r) => !r.passed).length;
    console.log(`📋 Total Tests Executed: ${results.length}`);
    console.log(`   Passed:               ${passed}`);
    console.log(`   Failed:               ${failed}`);
    console.log("========================================================\n");

    if (failed === 0) {
      console.log("🎉 ALL TESTS PASSED SUCCESSFULLY! ZERO FAILURES.\n");
    } else {
      console.error("⚠️ SOME TESTS FAILED!\n");
    }

  } finally {
    if (server) {
      server.close();
    }
    await disconnectDB();
  }

  const failedCount = results.filter((r) => !r.passed).length;
  process.exit(failedCount === 0 ? 0 : 1);
}

runVerification().catch((e) => {
  console.error("Verification suite encountered an unhandled error:", e);
  process.exit(1);
});
