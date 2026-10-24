import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import User from "../models/User";
import Farm from "../models/Farm";

dotenv.config();

const seedData = async () => {
  try {
    console.log("🌱 Connecting to database for seeding...");
    await connectDB();

    // 1. Seed Demo Farms if not present
    let greenValley = await Farm.findOne({ name: "Green Valley Swine Complex" });
    if (!greenValley) {
      greenValley = await Farm.create({
        name: "Green Valley Swine Complex",
        farmType: "pig",
        location: "Sector 4, Des Moines, IA",
      });
      console.log("  ✅ Created Farm: Green Valley Swine Complex");
    }

    let sunrisePoultry = await Farm.findOne({ name: "Sunrise Poultry House" });
    if (!sunrisePoultry) {
      sunrisePoultry = await Farm.create({
        name: "Sunrise Poultry House",
        farmType: "poultry",
        location: "Zone 2, Ames, IA",
      });
      console.log("  ✅ Created Farm: Sunrise Poultry House");
    }

    let oakRidge = await Farm.findOne({ name: "Oak Ridge Breeding Nucleus" });
    if (!oakRidge) {
      oakRidge = await Farm.create({
        name: "Oak Ridge Breeding Nucleus",
        farmType: "mixed",
        location: "Hub A, Cedar Rapids, IA",
      });
      console.log("  ✅ Created Farm: Oak Ridge Breeding Nucleus");
    }

    // 2. Seed Demo Users
    const demoUsers = [
      {
        name: "Dr. Ananya Reyes",
        email: "ananya.reyes@biosec.vet",
        password: "VetSecret@123",
        role: "veterinarian",
        phone: "+1 (555) 019-8372",
        farmId: greenValley._id,
      },
      {
        name: "Administrator",
        email: "admin@farmdrishti.org",
        password: "Admin@1234",
        role: "admin",
        phone: "+1 (555) 999-0001",
      },
      {
        name: "Carlos Miller",
        email: "manager@greenvalley.farm",
        password: "Manager@123",
        role: "farm_manager",
        phone: "+1 (555) 432-1098",
        farmId: greenValley._id,
      },
      {
        name: "Marcus Thorne",
        email: "inspector@agroshield.gov",
        password: "Inspector@123",
        role: "inspector",
        phone: "+1 (555) 876-5432",
        farmId: sunrisePoultry._id,
      },
    ];

    for (const userData of demoUsers) {
      const existing = await User.findOne({ email: userData.email });
      if (!existing) {
        const user = new User({
          name: userData.name,
          email: userData.email,
          password: userData.password,
          role: userData.role,
          farmId: userData.farmId || null,
          phone: userData.phone,
        });
        await user.save();
        console.log(`  ✅ Created User: ${userData.name} (${userData.role}) - ${userData.email}`);
      } else {
        console.log(`  ℹ️  User already exists: ${userData.email}`);
      }
    }

    console.log("🎉 Seeding complete successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
