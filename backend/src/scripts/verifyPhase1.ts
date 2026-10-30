import mongoose from "mongoose";

const BASE_URL = "http://localhost:5000/api";

interface TestResult {
  name: string;
  passed: boolean;
  details?: string;
}

const results: TestResult[] = [];

async function assert(name: string, fn: () => Promise<boolean | string>) {
  try {
    const res = await fn();
    if (res === true) {
      console.log(`  ✅ PASS: ${name}`);
      results.push({ name, passed: true });
    } else {
      console.error(`  ❌ FAIL: ${name} (${res})`);
      results.push({ name, passed: false, details: String(res) });
    }
  } catch (err: any) {
    console.error(`  ❌ ERROR: ${name} (${err.message})`);
    results.push({ name, passed: false, details: err.message });
  }
}

async function request(endpoint: string, options: RequestInit = {}) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  return { status: res.status, ok: res.ok, data };
}

async function runVerification() {
  console.log("\n🧪 ─── STARTING PHASING 1 SECURITY & ALERT VERIFICATION SUITE ───\n");

  // 1. Health check
  await assert("Public health check endpoint (/api/health) returns 200", async () => {
    const res = await request("/health");
    return res.status === 200 && res.data.success === true;
  });

  // 2. Unauthenticated access rejected
  await assert("Unauthenticated GET /api/inventory returns 401", async () => {
    const res = await request("/inventory");
    return res.status === 401 && res.data.success === false;
  });

  await assert("Unauthenticated GET /api/alerts returns 401", async () => {
    const res = await request("/alerts");
    return res.status === 401 && res.data.success === false;
  });

  await assert("Unauthenticated GET /api/farms returns 401", async () => {
    const res = await request("/farms");
    return res.status === 401 && res.data.success === false;
  });

  // 3. Invalid/expired token rejected
  await assert("Invalid Bearer token returns 401", async () => {
    const res = await request("/alerts", {
      headers: { Authorization: "Bearer invalid.token.payload" },
    });
    return res.status === 401;
  });

  // 4. Authenticate users
  let adminToken = "";
  let managerToken = "";
  let managerFarmId = "";
  let vetToken = "";
  let otherFarmId = "";

  await assert("Login as Administrator returns valid JWT", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "admin@farmdrishti.org", password: "Admin@1234" }),
    });
    if (res.status === 200 && res.data.token) {
      adminToken = res.data.token;
      return true;
    }
    return `Status: ${res.status}, msg: ${res.data.message}`;
  });

  await assert("Login as Farm Manager returns valid JWT and farmId", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "manager@greenvalley.farm", password: "Manager@123" }),
    });
    if (res.status === 200 && res.data.token) {
      managerToken = res.data.token;
      const rawFarmId = res.data.user.farmId;
      managerFarmId = typeof rawFarmId === "object" && rawFarmId !== null ? String(rawFarmId._id) : String(rawFarmId);
      return true;
    }
    return `Status: ${res.status}, msg: ${res.data.message}`;
  });

  await assert("Login as Veterinarian returns valid JWT", async () => {
    const res = await request("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email: "ananya.reyes@biosec.vet", password: "VetSecret@123" }),
    });
    if (res.status === 200 && res.data.token) {
      vetToken = res.data.token;
      return true;
    }
    return `Status: ${res.status}, msg: ${res.data.message}`;
  });

  // 5. Get farms using admin token to find a different farm
  await assert("Admin lists farms to identify target test farms", async () => {
    const res = await request("/farms", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    if (res.status === 200 && Array.isArray(res.data.data)) {
      const other = res.data.data.find((f: any) => String(f._id) !== managerFarmId);
      if (other) otherFarmId = String(other._id);
      return true;
    }
    return `Status: ${res.status}`;
  });

  // 6. Role-Based Access Control (RBAC)
  await assert("Veterinarian cannot create farms (POST /api/farms returns 403)", async () => {
    const res = await request("/farms", {
      method: "POST",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({ name: "Unauthorized Farm", farmType: "pig", location: "Nowhere" }),
    });
    return res.status === 403;
  });

  await assert("Admin can create farms (POST /api/farms returns 201)", async () => {
    const res = await request("/farms", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminToken}` },
      body: JSON.stringify({
        name: `Test Unit ${Date.now()}`,
        farmType: "mixed",
        location: "Bio-Cluster 9",
      }),
    });
    return res.status === 201;
  });

  // 7. IDOR (Farm Scoping) Prevention
  await assert("Farm Manager CANNOT modify/add inventory for a different farm (IDOR returns 403)", async () => {
    if (!otherFarmId) return "No secondary farm available to test IDOR";
    const res = await request("/inventory", {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        farmId: otherFarmId,
        itemName: "Unauthorized Chemical",
        category: "disinfectant",
        quantity: 50,
        unit: "kg",
        minimumStock: 10,
      }),
    });
    return res.status === 403;
  });

  // 8. Low-Stock Alert Generation & Deduplication
  let testItemId = "";
  await assert("Low stock inventory creation generates an automatic Alert", async () => {
    const res = await request("/inventory", {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        farmId: managerFarmId,
        itemName: `Iodine Footbath Solution ${Date.now()}`,
        category: "disinfectant",
        quantity: 3,
        unit: "liters",
        minimumStock: 15,
      }),
    });

    if (res.status !== 201 || !res.data.data?._id) {
      return `Failed to create inventory item: ${res.status}`;
    }
    testItemId = res.data.data._id;

    // Check alert was created
    const alertsRes = await request("/alerts?type=inventory_low", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    const matchingAlert = alertsRes.data.data?.find(
      (a: any) => a.metadata?.itemId === testItemId
    );

    return Boolean(matchingAlert);
  });

  await assert("Repeated inventory update under low stock DOES NOT generate duplicate alert", async () => {
    if (!testItemId) return "Skipped because item creation failed";

    // Update item stock from 3 to 2 (still low)
    const updateRes = await request(`/inventory/${testItemId}`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ quantity: 2 }),
    });

    if (updateRes.status !== 200) return `Update failed with status ${updateRes.status}`;

    // Verify exactly 1 alert exists for this item
    const alertsRes = await request("/alerts?type=inventory_low", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    const matchingAlerts = alertsRes.data.data?.filter(
      (a: any) => a.metadata?.itemId === testItemId && !a.isRead
    );

    return matchingAlerts?.length === 1;
  });

  // 9. High-Severity Disease Report Alert & Escalation
  let testReportId = "";
  await assert("High-severity disease report generates an automatic Alert", async () => {
    const res = await request("/disease-reports", {
      method: "POST",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({
        farmId: managerFarmId,
        diseaseName: "Avian Influenza H5N1 Vector",
        animalType: "poultry",
        severity: "high",
        symptoms: "Cyanosis, respiratory rales",
        location: "Zone 1 Hatchery",
      }),
    });

    if (res.status !== 201 || !res.data.data?._id) {
      return `Failed to create report: ${res.status}`;
    }
    testReportId = res.data.data._id;

    // Verify alert
    const alertsRes = await request("/alerts?type=disease_severity", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });

    const match = alertsRes.data.data?.find(
      (a: any) => a.metadata?.reportId === testReportId
    );

    return Boolean(match);
  });

  await assert("Unrelated disease report status update DOES NOT generate duplicate alert", async () => {
    if (!testReportId) return "Skipped because report creation failed";

    const updateRes = await request(`/disease-reports/${testReportId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({ status: "investigating" }),
    });

    if (updateRes.status !== 200) return `Status update failed: ${updateRes.status}`;

    const alertsRes = await request("/alerts?type=disease_severity", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });

    const matches = alertsRes.data.data?.filter(
      (a: any) => a.metadata?.reportId === testReportId
    );

    return matches?.length === 1;
  });

  await assert("Non-vet / non-admin cannot update disease case status (returns 403)", async () => {
    if (!testReportId) return "Skipped because report creation failed";

    const res = await request(`/disease-reports/${testReportId}/status`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ status: "resolved" }),
    });

    return res.status === 403;
  });

  // 10. Alert Read & Mark-All-Read API
  let alertToReadId = "";
  await assert("GET /api/alerts returns paginated results and unread count", async () => {
    const res = await request("/alerts", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });

    if (res.status === 200 && res.data.pagination && Array.isArray(res.data.data)) {
      const unread = res.data.data.find((a: any) => !a.isRead);
      if (unread) alertToReadId = unread._id;
      return true;
    }
    return `Status: ${res.status}`;
  });

  await assert("GET /api/alerts/unread-count returns number count", async () => {
    const res = await request("/alerts/unread-count", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return res.status === 200 && typeof res.data.count === "number";
  });

  await assert("PATCH /api/alerts/:id/read marks single alert as read", async () => {
    if (!alertToReadId) return "No unread alert to test";
    const res = await request(`/alerts/${alertToReadId}/read`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return res.status === 200 && res.data.data?.isRead === true;
  });

  await assert("PATCH /api/alerts/read-all marks all permitted alerts as read", async () => {
    const res = await request("/alerts/read-all", {
      method: "PATCH",
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return res.status === 200 && typeof res.data.modifiedCount === "number";
  });

  console.log("\n📊 ─── VERIFICATION SUMMARY ───\n");
  const passed = results.filter((r) => r.passed).length;
  const failed = results.filter((r) => !r.passed).length;
  console.log(`  Total Tests: ${results.length}`);
  console.log(`  Passed:      ${passed}`);
  console.log(`  Failed:      ${failed}`);

  if (failed === 0) {
    console.log("\n✨ ALL TESTS PASSED SUCCESSFULLY! ✨\n");
    process.exit(0);
  } else {
    console.error("\n⚠️ SOME TESTS FAILED!\n");
    process.exit(1);
  }
}

runVerification();
