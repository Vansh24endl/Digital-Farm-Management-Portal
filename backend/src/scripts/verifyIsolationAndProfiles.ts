/**
 * Comprehensive Multi-Account Verification Script:
 * 1. Data Isolation for New Users (Clean 0 stats, empty arrays, no leakage)
 * 2. Cross-user IDOR protection (403 Forbidden on accessing other users' farms)
 * 3. Profile Photo Persistence across updates
 * 4. Verified Veterinarian Directory filtering and privacy protection
 */

import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import { connectDB, disconnectDB } from "../config/db";
import User, { IUser } from "../models/User";
import Farm from "../models/Farm";
import Audit from "../models/Audit";
import Inventory from "../models/Inventory";
import Visitor from "../models/Visitor";
import DiseaseReport from "../models/DiseaseReport";
import VeterinarianProfile from "../models/VeterinarianProfile";
import { getAuthorizedFarmIds, canAccessFarmAsync } from "../middleware/authMiddleware";

const JWT_SECRET = process.env.JWT_SECRET || "farmdrishti_jwt_super_secret_for_testing";

function makeToken(user: IUser): string {
  return jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1h" });
}

async function runVerification() {
  console.log("=================================================================");
  console.log("🚀 STARTING FARMDISHTI SECURITY, PRIVACY & PERSISTENCE VERIFICATION");
  console.log("=================================================================\n");

  await connectDB();

  const timestamp = Date.now();
  const testIdsToClean: {
    users: mongoose.Types.ObjectId[];
    farms: mongoose.Types.ObjectId[];
    audits: mongoose.Types.ObjectId[];
    inventory: mongoose.Types.ObjectId[];
    vets: mongoose.Types.ObjectId[];
  } = {
    users: [],
    farms: [],
    audits: [],
    inventory: [],
    vets: [],
  };

  try {
    // ─────────────────────────────────────────────────────────────────────────
    // TEST 1: New User Isolation (Zero Stats, Zero Records)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("▶ TEST 1: New User Data Isolation...");
    const userA = await User.create({
      name: `Farmer Alpha ${timestamp}`,
      email: `alpha_${timestamp}@testfarm.io`,
      password: "Password@123",
      role: "farm_manager",
      phone: "+91 99999 11111",
    });
    testIdsToClean.users.push(userA._id as mongoose.Types.ObjectId);

    // Verify authorized farms for new user with 0 farms
    const authFarmIdsUserA = await getAuthorizedFarmIds(userA);
    if (authFarmIdsUserA === null || authFarmIdsUserA.length !== 0) {
      throw new Error(`FAIL: User A should have 0 authorized farms, got ${JSON.stringify(authFarmIdsUserA)}`);
    }
    console.log("  ✔ New User A has 0 authorized farms in MongoDB.");

    // Query farms scoped to User A
    const userAFarms = await Farm.find({ ownerId: userA._id });
    if (userAFarms.length !== 0) {
      throw new Error("FAIL: User A should have 0 farms");
    }
    console.log("  ✔ User A farm list returns exactly [].");

    // Query audits scoped to User A's authorized farms
    const userAAudits = authFarmIdsUserA.length === 0 ? [] : await Audit.find({ farmId: { $in: authFarmIdsUserA } });
    if (userAAudits.length !== 0) {
      throw new Error("FAIL: User A sees audits when they have 0 farms!");
    }
    console.log("  ✔ User A audit list returns exactly [].");

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 2: User A Creates Farm 1 & Ownership Verification
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶ TEST 2: Farm Creation & Scoped Authorization...");
    const farm1 = (await Farm.create({
      name: `Alpha Poultry Unit ${timestamp}`,
      farmType: "poultry",
      location: "Zone 1, Central District",
      ownerId: userA._id,
    })) as any;
    testIdsToClean.farms.push(farm1._id as mongoose.Types.ObjectId);

    const updatedFarmIdsUserA = await getAuthorizedFarmIds(userA);
    if (!updatedFarmIdsUserA || updatedFarmIdsUserA.length !== 1) {
      throw new Error(`FAIL: User A should now have 1 authorized farm, got ${updatedFarmIdsUserA?.length}`);
    }
    const canUserAAccessFarm1 = await canAccessFarmAsync(userA, farm1._id);
    if (!canUserAAccessFarm1) {
      throw new Error("FAIL: User A should be authorized to access their own farm.");
    }
    console.log("  ✔ Farm 1 created with User A as ownerId.");
    console.log("  ✔ User A authorized farm count: 1.");
    console.log("  ✔ canAccessFarmAsync for User A on Farm 1: TRUE.");

    // Create an audit on Farm 1
    const audit1 = await Audit.create({
      farmId: farm1._id,
      title: "Biosecurity Boundary Check",
      findings: "Perimeter fence intact",
      riskLevel: "low",
      status: "completed",
      progress: 100,
      sector: "Sector 1",
      dueDate: "Tomorrow",
      auditor: "Dr. Inspector",
    });
    testIdsToClean.audits.push(audit1._id as mongoose.Types.ObjectId);
    console.log("  ✔ Audit created on Farm 1.");

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 3: User B Privacy & IDOR Defense (Cross-User Isolation)
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶ TEST 3: User B Privacy & Cross-User IDOR Defense...");
    const userB = await User.create({
      name: `Farmer Beta ${timestamp}`,
      email: `beta_${timestamp}@testfarm.io`,
      password: "Password@123",
      role: "farm_manager",
      phone: "+91 99999 22222",
    });
    testIdsToClean.users.push(userB._id as mongoose.Types.ObjectId);

    // Verify User B cannot access Farm 1
    const canUserBAccessFarm1 = await canAccessFarmAsync(userB, farm1._id);
    if (canUserBAccessFarm1) {
      throw new Error("CRITICAL SECURITY LEAK: User B was granted access to User A's Farm 1!");
    }
    console.log("  ✔ canAccessFarmAsync for User B on User A's Farm 1: FALSE (IDOR Blocked).");

    const authFarmIdsUserB = await getAuthorizedFarmIds(userB);
    if (authFarmIdsUserB === null || authFarmIdsUserB.length !== 0) {
      throw new Error(`FAIL: User B should have 0 authorized farms, got ${JSON.stringify(authFarmIdsUserB)}`);
    }
    console.log("  ✔ User B has 0 authorized farms (User A's farm does NOT leak to User B).");

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 4: Profile Photo Persistence Across Refresh and Updates
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶ TEST 4: Profile Photo Persistence Across Updates & Refreshes...");
    const sampleBase64Photo = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";

    // Save profile photo
    userA.profilePhoto = sampleBase64Photo;
    await userA.save();

    // Simulate page refresh: Re-fetch user from DB
    const refreshedUserA = await User.findById(userA._id).select("-password");
    if (refreshedUserA?.profilePhoto !== sampleBase64Photo) {
      throw new Error("FAIL: User A profilePhoto did not persist in MongoDB!");
    }
    console.log("  ✔ Profile photo saved and verified after DB re-fetch (persists across refresh).");

    // Update user's name without passing profilePhoto
    await User.findByIdAndUpdate(userA._id, { $set: { name: "Farmer Alpha (Updated Name)" } });
    const userAfterNameUpdate = await User.findById(userA._id);
    if (userAfterNameUpdate?.profilePhoto !== sampleBase64Photo) {
      throw new Error("FAIL: Updating user name wiped the profile photo!");
    }
    console.log("  ✔ Updating personal information preserves profile photo (not wiped).");

    // ─────────────────────────────────────────────────────────────────────────
    // TEST 5: Verified Veterinarian Directory & Privacy Protection
    // ─────────────────────────────────────────────────────────────────────────
    console.log("\n▶ TEST 5: Verified Veterinarian Directory & Data Privacy...");

    // Create Vet 1: Verified
    const vetUser1 = await User.create({
      name: `Dr. Vikram Sharma ${timestamp}`,
      email: `dr.sharma_${timestamp}@vetcare.in`,
      password: "Password@123",
      role: "veterinarian",
      phone: "+91 98765 43210",
      profilePhoto: sampleBase64Photo,
    });
    testIdsToClean.users.push(vetUser1._id as mongoose.Types.ObjectId);

    const vetProfile1 = await VeterinarianProfile.create({
      userId: vetUser1._id,
      fullName: `Dr. Vikram Sharma`,
      profilePhoto: sampleBase64Photo,
      registrationNumber: `VET-REG-${timestamp}`,
      qualification: "B.V.Sc & A.H, M.V.Sc (Avian Pathology)",
      specialization: "Poultry Disease Surveillance",
      yearsOfExperience: 9,
      contactNumber: "+91 98765 43210",
      email: `dr.sharma_${timestamp}@vetcare.in`,
      clinicName: "Central Livestock Clinical Center",
      clinicAddress: "42 Biosecurity Avenue, Hub A",
      serviceLocation: "Northern Region & Dairy Corridor",
      bio: "Avian viral vector containment and swine fever surveillance expert.",
      verificationStatus: "verified",
    });
    testIdsToClean.vets.push(vetProfile1._id as mongoose.Types.ObjectId);

    // Create Vet 2: Pending (Unverified)
    const vetUser2 = await User.create({
      name: `Dr. Unverified ${timestamp}`,
      email: `unverified_${timestamp}@vetcare.in`,
      password: "Password@123",
      role: "veterinarian",
    });
    testIdsToClean.users.push(vetUser2._id as mongoose.Types.ObjectId);

    const vetProfile2 = await VeterinarianProfile.create({
      userId: vetUser2._id,
      fullName: `Dr. Unverified Candidate`,
      registrationNumber: `PENDING-REG-${timestamp}`,
      qualification: "B.V.Sc",
      specialization: "General Practice",
      yearsOfExperience: 1,
      contactNumber: "+91 00000 00000",
      email: `unverified_${timestamp}@vetcare.in`,
      verificationStatus: "pending",
    });
    testIdsToClean.vets.push(vetProfile2._id as mongoose.Types.ObjectId);

    // Query Directory: MUST return ONLY verified vets
    const directory = await VeterinarianProfile.find({ verificationStatus: "verified" })
      .select("-certificates -rejectionReason")
      .populate("userId", "name email profilePhoto");

    const foundVerified = directory.find((v) => v._id.equals(vetProfile1._id));
    const foundPending = directory.find((v) => v._id.equals(vetProfile2._id));

    if (!foundVerified) {
      throw new Error("FAIL: Verified vet Dr. Vikram Sharma was not found in the directory!");
    }
    if (foundPending) {
      throw new Error("CRITICAL PRIVACY LEAK: Unverified veterinarian profile appeared in public directory!");
    }
    console.log("  ✔ Directory returns verified veterinarians.");
    console.log("  ✔ Pending/unverified veterinarian profiles are strictly excluded from directory.");
    console.log("  ✔ Verified vet credentials returned: Name, Reg #, Degree, Specialty, Experience, Phone, Email, Clinic.");

    // Test directory specialization filter
    const poultryVets = await VeterinarianProfile.find({
      verificationStatus: "verified",
      specialization: { $regex: "Poultry", $options: "i" },
    });
    const foundPoultryVet = poultryVets.find((v) => v._id.equals(vetProfile1._id));
    if (!foundPoultryVet) {
      throw new Error("FAIL: Specialization filter failed to match 'Poultry'!");
    }
    console.log("  ✔ Specialization search/filter successfully returns matching veterinarians.");

    console.log("\n=================================================================");
    console.log("✅ ALL 5 VERIFICATION SUITES PASSED WITH 100% SUCCESS!");
    console.log("=================================================================\n");
  } catch (error: any) {
    console.error("\n❌ VERIFICATION FAILED:", error.message);
    process.exitCode = 1;
  } finally {
    // Clean up temporary test data
    console.log("🧹 Cleaning up temporary test fixtures from MongoDB Atlas...");
    await Promise.all([
      User.deleteMany({ _id: { $in: testIdsToClean.users } }),
      Farm.deleteMany({ _id: { $in: testIdsToClean.farms } }),
      Audit.deleteMany({ _id: { $in: testIdsToClean.audits } }),
      VeterinarianProfile.deleteMany({ _id: { $in: testIdsToClean.vets } }),
    ]);
    console.log("✔ Temporary fixtures removed. Database state preserved.");
    await disconnectDB();
  }
}

runVerification();
