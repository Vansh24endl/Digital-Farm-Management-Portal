import {
  registerSchema,
  loginSchema,
  createFarmSchema,
  createDailyLogSchema,
  createVisitorSchema,
  createAuditSchema,
  createInventorySchema,
  createDiseaseReportSchema,
  saveVetProfileSchema,
  formatZodErrors,
} from "../validation";

console.log("==========================================");
console.log("  FarmDrishti Zod Validation Test Suite   ");
console.log("==========================================\n");

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    console.log(`[PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`[FAIL] ${testName}`);
  }
}

// 1. Auth Validation Test
console.log("--- 1. Auth Validation ---");
const validRegister = registerSchema.safeParse({
  name: "Ramesh Kumar",
  email: "ramesh.farmer@example.com",
  password: "securepassword123",
  role: "farm_manager",
});
assert(validRegister.success, "Valid registration payload accepted");

const invalidRegister = registerSchema.safeParse({
  name: "R",
  email: "not-an-email",
  password: "123", // too short
});
assert(!invalidRegister.success, "Invalid registration rejected");
if (!invalidRegister.success) {
  const errors = formatZodErrors(invalidRegister.error);
  assert(errors.some((e) => e.field === "email"), "Email error identified correctly");
  assert(errors.some((e) => e.field === "password"), "Password length error identified");
}

// 2. Farm Validation Test
console.log("\n--- 2. Farm Validation ---");
const validFarm = createFarmSchema.safeParse({
  name: "Greenfield Poultry Unit 1",
  farmType: "poultry",
  location: "Sanwer Agro Zone, Indore",
  coordinates: { lat: 22.7845, lon: 75.8398 },
});
assert(validFarm.success, "Valid farm payload with GPS coordinates accepted");

const invalidFarm = createFarmSchema.safeParse({
  name: "",
  farmType: "cattle", // invalid enum
  location: "",
});
assert(!invalidFarm.success, "Invalid farmType and empty fields rejected");

// 3. Non-IoT Daily Log Telemetry Test
console.log("\n--- 3. Non-IoT Daily Log Telemetry ---");
const validDailyLog = createDailyLogSchema.safeParse({
  farmId: "507f1f77bcf86cd799439011",
  temperature: 24.5,
  humidity: 62,
  animalCount: 3000,
  mortalityCount: 2,
  waterConsumptionLiters: 480,
  feedConsumptionKg: 350,
  cleaningDisinfectionDone: true,
  disinfectantUsed: "Virkon-S 1%",
});
assert(validDailyLog.success, "Valid daily observation log accepted");

const invalidDailyLog = createDailyLogSchema.safeParse({
  farmId: "invalid-id",
  temperature: 150, // impossible temperature
  humidity: -10, // negative humidity
  animalCount: -5,
  mortalityCount: -1,
  waterConsumptionLiters: -100,
  feedConsumptionKg: -50,
});
assert(!invalidDailyLog.success, "Out-of-range sensor/telemetry readings rejected");

// 4. Visitor Log Test
console.log("\n--- 4. Biosecurity Visitor Validation ---");
const validVisitor = createVisitorSchema.safeParse({
  farmId: "507f1f77bcf86cd799439011",
  name: "Dr. Ananya Sharma",
  purpose: "Quarterly Biosecurity Inspection",
  role: "Veterinarian",
  phone: "9876543210",
  temperature: "36.8",
});
assert(validVisitor.success, "Valid visitor entry accepted");

// 5. Inventory & Audit Tests
console.log("\n--- 5. Inventory & Audit Schemas ---");
const validInventory = createInventorySchema.safeParse({
  farmId: "507f1f77bcf86cd799439011",
  itemName: "Bleach Disinfectant Solution",
  category: "disinfectant",
  quantity: 50,
  unit: "Liters",
  minimumStock: 10,
});
assert(validInventory.success, "Valid inventory item accepted");

const validAudit = createAuditSchema.safeParse({
  farmId: "507f1f77bcf86cd799439011",
  title: "Perimeter Biosecurity Audit Q4",
  riskLevel: "medium",
  items: [{ text: "Footbath replenishment check", done: true }],
});
assert(validAudit.success, "Valid audit schema accepted");

console.log("\n==========================================");
console.log(`Results: ${passedTests}/${totalTests} tests passed!`);
console.log("==========================================");
