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

async function runProfileVerification() {
  console.log("\n🧪 ─── STARTING USER PROFILE & VETERINARIAN PROFILE SEPARATION VERIFICATION SUITE ───\n");

  // 1. Authenticate users for different roles
  console.log("🔐 Authenticating test users...");

  const managerLogin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "manager@greenvalley.farm", password: "Manager@123" }),
  });
  const managerToken = managerLogin.data.token;

  const vetLogin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "ananya.reyes@biosec.vet", password: "VetSecret@123" }),
  });
  const vetToken = vetLogin.data.token;

  const adminLogin = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email: "admin@farmdrishti.org", password: "Admin@1234" }),
  });
  const adminToken = adminLogin.data.token;

  if (!managerToken || !vetToken || !adminToken) {
    console.error("❌ Failed to login test users. Check credentials.", {
      manager: managerLogin.data,
      vet: vetLogin.data,
      admin: adminLogin.data,
    });
    process.exit(1);
  }

  // ── TEST 1: Normal user can get and update their User Profile
  await assert("SCENARIO 1: Normal user (Farm Manager) can retrieve User Profile (/api/users/profile)", async () => {
    const res = await request("/users/profile", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return (
      res.status === 200 &&
      res.data.success === true &&
      res.data.data.email === "manager@greenvalley.farm" &&
      res.data.data.role === "farm_manager"
    );
  });

  await assert("SCENARIO 1b: Normal user can update their User Profile (name & phone)", async () => {
    const res = await request("/users/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({ name: "Carlos Miller", phone: "+91 98765 00001" }),
    });
    return (
      res.status === 200 &&
      res.data.success === true &&
      res.data.data.name === "Carlos Miller" &&
      res.data.data.phone === "+91 98765 00001"
    );
  });

  // ── TEST 2: Normal user cannot modify or create veterinarian credentials
  await assert("SCENARIO 2: Normal user (Farm Manager) CANNOT create Veterinarian Profile (Returns 403 Forbidden)", async () => {
    const res = await request("/veterinarians/profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        fullName: "Dr. Carlos Miller",
        registrationNumber: "FAKE-VET-001",
        qualification: "BVSc",
      }),
    });
    return res.status === 403;
  });

  await assert("SCENARIO 2b: Normal user CANNOT access GET /api/veterinarians/profile (Returns 403 Forbidden)", async () => {
    const res = await request("/veterinarians/profile", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return res.status === 403;
  });

  // ── TEST 3: Veterinarian can create a separate professional profile
  let vetProfileId = "";
  await assert("SCENARIO 3: Veterinarian can create / access separate professional profile", async () => {
    let res = await request("/veterinarians/profile", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    if (res.status === 404) {
      res = await request("/veterinarians/profile", {
        method: "POST",
        headers: { Authorization: `Bearer ${vetToken}` },
        body: JSON.stringify({
          fullName: "Dr. Ananya Reyes",
          registrationNumber: "VCI/MP/2018/78901",
          qualification: "BVSc & AH, MVSc Epidemiology",
          specialization: "Swine & Avian Biosecurity Containment",
          yearsOfExperience: 14,
          contactNumber: "+91 98765 43210",
          clinicName: "Central Madhya Pradesh Animal Diagnostics",
          clinicAddress: "Plot 42, Super Corridor, Indore, MP",
          serviceLocation: "Indore, Ujjain, Dewas",
          bio: "Lead Epidemiologist with 14+ years specializing in commercial swine & poultry disease surveillance.",
        }),
      });
      if (res.status === 201 && res.data.data._id) {
        vetProfileId = res.data.data._id;
        return true;
      }
      return `Failed to create profile: status ${res.status}`;
    } else if (res.status === 200 && res.data.data._id) {
      vetProfileId = res.data.data._id;
      return true;
    }
    return `Unexpected status: ${res.status}`;
  });

  // ── TEST 4: Duplicate prevention: Cannot create duplicate vet profile
  await assert("SCENARIO 4: Veterinarian CANNOT create duplicate profile (Returns 409 Conflict)", async () => {
    const res = await request("/veterinarians/profile", {
      method: "POST",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({
        fullName: "Dr. Ananya Reyes Duplicate",
        registrationNumber: "VCI/MP/2018/78901",
        qualification: "BVSc",
      }),
    });
    return res.status === 409;
  });

  // ── TEST 5: Veterinarian can update professional information
  await assert("SCENARIO 5: Veterinarian can update professional information (clinic name & experience)", async () => {
    const res = await request("/veterinarians/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({
        clinicName: "Indore Regional Veterinary Institute & Advanced Labs",
        yearsOfExperience: 15,
      }),
    });
    return (
      res.status === 200 &&
      res.data.success === true &&
      res.data.data.clinicName === "Indore Regional Veterinary Institute & Advanced Labs" &&
      res.data.data.yearsOfExperience === 15
    );
  });

  // ── TEST 6: Updating User Profile does NOT overwrite VeterinarianProfile
  await assert("SCENARIO 6: Updating User Profile (/api/users/profile) does NOT overwrite VeterinarianProfile", async () => {
    const userUpdate = await request("/users/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({ name: "Dr. Ananya Reyes (Account Updated)" }),
    });
    if (userUpdate.status !== 200) return "Failed to update user profile";

    const vetCheck = await request("/veterinarians/profile", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    return (
      vetCheck.status === 200 &&
      vetCheck.data.data.registrationNumber === "VCI/MP/2018/78901" &&
      vetCheck.data.data.clinicName === "Indore Regional Veterinary Institute & Advanced Labs"
    );
  });

  // ── TEST 7: Updating VeterinarianProfile does NOT overwrite User information
  await assert("SCENARIO 7: Updating VeterinarianProfile does NOT modify User model fields", async () => {
    const vetUpdate = await request("/veterinarians/profile", {
      method: "PUT",
      headers: { Authorization: `Bearer ${vetToken}` },
      body: JSON.stringify({ specialization: "Avian Infectious Disease Specialist" }),
    });
    if (vetUpdate.status !== 200) return "Failed to update vet profile";

    const userCheck = await request("/users/profile", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    return (
      userCheck.status === 200 &&
      userCheck.data.data.role === "veterinarian" &&
      userCheck.data.data.email === "ananya.reyes@biosec.vet"
    );
  });

  // ── TEST 8: One user cannot access another user's private profile without auth
  await assert("SCENARIO 8: Unauthenticated access to /api/users/profile returns 401", async () => {
    const res = await request("/users/profile");
    return res.status === 401;
  });

  await assert("SCENARIO 8b: Password change requires correct current password", async () => {
    const res = await request("/users/change-password", {
      method: "PUT",
      headers: { Authorization: `Bearer ${managerToken}` },
      body: JSON.stringify({
        currentPassword: "WrongPassword999",
        newPassword: "NewSecretPassword123",
      }),
    });
    return res.status === 400 && res.data.message.includes("Current password does not match");
  });

  // ── TEST 9: Admin can view pending veterinarian applications
  await assert("SCENARIO 9: Admin can view pending veterinarian applications (/api/admin/veterinarians/pending)", async () => {
    const res = await request("/admin/veterinarians/pending", {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    return res.status === 200 && res.data.success === true && Array.isArray(res.data.data);
  });

  await assert("SCENARIO 9b: Non-admin CANNOT view pending applications (Returns 403 Forbidden)", async () => {
    const res = await request("/admin/veterinarians/pending", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    return res.status === 403;
  });

  // ── TEST 10: Only authorized admins can approve or reject verification
  if (vetProfileId) {
    await assert("SCENARIO 10: Non-admin CANNOT approve or reject verification (Returns 403)", async () => {
      const res = await request(`/admin/veterinarians/${vetProfileId}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${vetToken}` },
        body: JSON.stringify({ status: "verified" }),
      });
      return res.status === 403;
    });

    await assert("SCENARIO 10b: Admin can successfully verify veterinarian profile", async () => {
      const res = await request(`/admin/veterinarians/${vetProfileId}/verify`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${adminToken}` },
        body: JSON.stringify({ status: "verified" }),
      });
      return (
        res.status === 200 &&
        res.data.success === true &&
        res.data.data.verificationStatus === "verified"
      );
    });
  }

  // ── TEST 11: Existing modules continue working
  await assert("SCENARIO 11: Existing Auth (/api/auth/me) returns 200", async () => {
    const res = await request("/auth/me", {
      headers: { Authorization: `Bearer ${vetToken}` },
    });
    return res.status === 200 && res.data.success === true && res.data.user.role === "veterinarian";
  });

  await assert("SCENARIO 11b: DailyLog manual non-IoT endpoint continues working", async () => {
    const res = await request("/daily-logs/latest", {
      headers: { Authorization: `Bearer ${managerToken}` },
    });
    return res.status === 200 && res.data.success === true;
  });

  await assert("SCENARIO 11c: Weather endpoint for Indore MP continues working", async () => {
    const res = await request("/weather?lat=22.7196&lon=75.8577");
    return res.status === 200 && res.data.location.name.toLowerCase().includes("indore");
  });

  // Final summary
  console.log("\n────────────────────────────────────────────────────────────");
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;
  console.log(`TOTAL SCENARIOS VERIFIED: ${passed}/${total}`);
  if (passed === total) {
    console.log("🎉 ALL USER PROFILE & VETERINARIAN PROFILE SEPARATION TESTS PASSED!\n");
  } else {
    console.error("⚠️ SOME TESTS FAILED. See details above.\n");
    process.exit(1);
  }
}

runProfileVerification();
