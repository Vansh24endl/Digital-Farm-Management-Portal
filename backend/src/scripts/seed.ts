import mongoose from "mongoose";
import dotenv from "dotenv";
import connectDB from "../config/db";
import User from "../models/User";
import Farm from "../models/Farm";
import Audit from "../models/Audit";
import DiseaseReport from "../models/DiseaseReport";
import Inventory from "../models/Inventory";
import Visitor from "../models/Visitor";
import ChecklistSubmission from "../models/ChecklistSubmission";

dotenv.config();

const seedData = async () => {
  try {
    console.log("🌱 Connecting to MongoDB for comprehensive seeding...");
    await connectDB();

    // ─── 1. SEED FARMS ────────────────────────────────────────────────────────
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

    // ─── 2. SEED USERS ────────────────────────────────────────────────────────
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
        console.log(`  ✅ Created User: ${userData.name} (${userData.role})`);
      }
    }

    // ─── 3. SEED AUDITS ───────────────────────────────────────────────────────
    const auditCount = await Audit.countDocuments();
    if (auditCount < 4) {
      const audits = [
        {
          farmId: greenValley._id,
          title: "Entrance Footbath & Trench Decontamination Verification",
          findings: "All chlorine dips active at 200ppm virucidal concentration.",
          riskLevel: "low",
          status: "completed",
          sector: "Sector 1 · Main Gate",
          dueDate: "Today",
          auditor: "Dr. Ananya Reyes",
          progress: 100,
          items: [
            { text: "Verify vehicle tire sprayer pressure and virucide reserve", done: true },
            { text: "Check entrance disinfectant footbath pH and active PPM", done: true },
            { text: "Log entry biometric access records for past 24 hours", done: true },
          ],
        },
        {
          farmId: sunrisePoultry._id,
          title: "Avian Vector Mesh Barrier & Bird-Proofing Audit",
          findings: "Slight mesh tear noted on North Gable vent of Poultry House B.",
          riskLevel: "high",
          status: "in-progress",
          sector: "Zone 2 · Poultry House B",
          dueDate: "Tomorrow",
          auditor: "Marcus Thorne",
          progress: 33,
          items: [
            { text: "Inspect high-wire perimeter netting for tear or intrusion", done: true },
            { text: "Verify wild migratory bird scare cannons and sonic deterrents", done: false },
            { text: "Audit rodent bait stations along perimeter perimeter fence", done: false },
          ],
        },
        {
          farmId: greenValley._id,
          title: "Personnel Shower-In Decontamination Protocol Check",
          findings: "Staff shower logs verified. PPE locker room sterilization compliant.",
          riskLevel: "medium",
          status: "in-progress",
          sector: "Sector 4 · Bio-Air Lock",
          dueDate: "In 2 days",
          auditor: "Carlos Miller",
          progress: 66,
          items: [
            { text: "Examine employee shower logs for past 48 hours", done: true },
            { text: "Check clean-zone laundry sterilization temperature", done: true },
            { text: "Audit HEPA filter differential pressure gauge readings", done: false },
          ],
        },
        {
          farmId: oakRidge._id,
          title: "Carcass Incinerator & Rendering Transport Seals",
          findings: "Awaiting weekly biological waste incineration run.",
          riskLevel: "low",
          status: "pending",
          sector: "Hub A · Disposal Unit",
          dueDate: "In 4 days",
          auditor: "Marcus Thorne",
          progress: 0,
          items: [
            { text: "Inspect airtight mortality containment bin gaskets", done: false },
            { text: "Verify secondary burner operating temp reaches 850°C", done: false },
            { text: "Audit rendering transfer log & vehicle disinfection pass", done: false },
          ],
        },
      ];

      await Audit.insertMany(audits);
      console.log(`  ✅ Added ${audits.length} Audits in MongoDB`);
    } else {
      console.log(`  ℹ️  Audits already exist (${auditCount} records)`);
    }

    // ─── 4. SEED DISEASE REPORTS ──────────────────────────────────────────────
    const reportCount = await DiseaseReport.countDocuments();
    if (reportCount === 0) {
      const reports = [
        {
          farmId: sunrisePoultry._id,
          diseaseName: "Newcastle Disease (NDV) Avian Vector Alert",
          animalType: "poultry",
          severity: "high",
          status: "investigating",
          location: "Zone 2 · Poultry House B",
          speciesAffected: "Commercial Broiler Flock (1,000 birds)",
          symptoms: "Respiratory rales, green watery diarrhea, neurological torticollis signs",
          description: "Rapid transmission risk detected in zone 2. Buffer zone established around House B. Swabs sent for RT-PCR verification.",
          coordinates: { x: 42, y: 35 },
        },
        {
          farmId: greenValley._id,
          diseaseName: "PRRSv Swine Reproductive & Respiratory Syndrome",
          animalType: "pig",
          severity: "medium",
          status: "investigating",
          location: "Sector 4 · Swine Gestation Pen #14",
          speciesAffected: "Breeding Sows & Piglets",
          symptoms: "Mild cyanosis of ear tips, localized fever, respiratory distress in nursery",
          description: "Low-positive viral load observed during scheduled bi-weekly serology. Cohort isolated in bio-containment shed.",
          coordinates: { x: 68, y: 55 },
        },
        {
          farmId: sunrisePoultry._id,
          diseaseName: "Avian Mycoplasma Synoviae Routine Screening",
          animalType: "poultry",
          severity: "low",
          status: "resolved",
          location: "Hatchery Wing C",
          speciesAffected: "Breeder Hens",
          symptoms: "Minor joint swelling in localized sample",
          description: "PCR amplification confirmed non-pathogenic isolate. Treatment completed, birds cleared for production.",
          coordinates: { x: 28, y: 72 },
        },
      ];

      await DiseaseReport.insertMany(reports);
      console.log(`  ✅ Created ${reports.length} Disease Outbreak Reports in MongoDB`);
    } else {
      console.log(`  ℹ️  Disease Reports already exist (${reportCount} records)`);
    }

    // ─── 5. SEED INVENTORY ────────────────────────────────────────────────────
    const inventoryCount = await Inventory.countDocuments();
    if (inventoryCount === 0) {
      const inventoryItems = [
        {
          farmId: greenValley._id,
          itemName: "Virkon-S Virucidal Broad Spectrum Disinfectant",
          category: "disinfectant",
          quantity: 140,
          unit: "kg",
          minimumStock: 50,
        },
        {
          farmId: greenValley._id,
          itemName: "Tyvek Hazmat Level-4 Bio-Suits",
          category: "ppe",
          quantity: 45,
          unit: "sets",
          minimumStock: 25,
        },
        {
          farmId: sunrisePoultry._id,
          itemName: "N95 Particulate Bio-Respirators (Box of 50)",
          category: "ppe",
          quantity: 6,
          unit: "boxes",
          minimumStock: 15, // LOW STOCK TRIGGER
        },
        {
          farmId: sunrisePoultry._id,
          itemName: "Chlorine Dioxide Concentrated Foot-Dip Solution",
          category: "disinfectant",
          quantity: 8,
          unit: "liters",
          minimumStock: 20, // LOW STOCK TRIGGER
        },
        {
          farmId: oakRidge._id,
          itemName: "Swab Specimen PCR Viral Transport Medium Vials",
          category: "equipment",
          quantity: 320,
          unit: "vials",
          minimumStock: 100,
        },
        {
          farmId: greenValley._id,
          itemName: "Oxytetracycline Injectable 200mg/ml",
          category: "medicine",
          quantity: 55,
          unit: "bottles",
          minimumStock: 20,
        },
        {
          farmId: sunrisePoultry._id,
          itemName: "Vehicle Automated Wheel Sprayer Nozzles (Spares)",
          category: "equipment",
          quantity: 18,
          unit: "units",
          minimumStock: 10,
        },
        {
          farmId: oakRidge._id,
          itemName: "Digital Infrared Livestock Thermometer Scanners",
          category: "equipment",
          quantity: 6,
          unit: "units",
          minimumStock: 4,
        },
      ];

      await Inventory.insertMany(inventoryItems);
      console.log(`  ✅ Created ${inventoryItems.length} Inventory Items in MongoDB`);
    } else {
      console.log(`  ℹ️  Inventory items already exist (${inventoryCount} records)`);
    }

    // ─── 6. SEED VISITORS ─────────────────────────────────────────────────────
    const visitorCount = await Visitor.countDocuments();
    if (visitorCount === 0) {
      const visitors = [
        {
          farmId: greenValley._id,
          name: "Rajesh Sharma",
          role: "Feed Logistics Driver",
          company: "NutriFeed Commercial Logistics",
          phone: "+91 98112 34567",
          purpose: "Bulk Swine Feed Delivery & Auger Sanitation",
          temperature: "36.6°C",
          status: "IN",
          checkIn: new Date(Date.now() - 45 * 60 * 1000), // 45 mins ago
        },
        {
          farmId: sunrisePoultry._id,
          name: "Dr. Vikram Joshi",
          role: "State Epidemiologist",
          company: "State Dept. of Animal Husbandry",
          phone: "+91 98451 22334",
          purpose: "Annual Biosecurity & Serological Quarantine Inspection",
          temperature: "36.4°C",
          status: "IN",
          checkIn: new Date(Date.now() - 110 * 60 * 1000), // ~2 hours ago
        },
        {
          farmId: greenValley._id,
          name: "Amit Patel",
          role: "HVAC & Bio-Filter Tech",
          company: "AgriAir Filtration Systems",
          phone: "+91 97234 56789",
          purpose: "Negative Pressure Filter Replacement in Shed 2",
          temperature: "36.5°C",
          status: "OUT",
          checkIn: new Date(Date.now() - 360 * 60 * 1000),
          checkOut: new Date(Date.now() - 60 * 60 * 1000),
        },
        {
          farmId: oakRidge._id,
          name: "Suresh Nair",
          role: "Rendering Logistics Driver",
          company: "BioWaste Transport Services",
          phone: "+91 99001 23456",
          purpose: "Sealed Bio-Container Collection for Rendering",
          temperature: "36.7°C",
          status: "OUT",
          checkIn: new Date(Date.now() - 480 * 60 * 1000),
          checkOut: new Date(Date.now() - 300 * 60 * 1000),
        },
      ];

      await Visitor.insertMany(visitors);
      console.log(`  ✅ Created ${visitors.length} Visitors in MongoDB`);
    } else {
      console.log(`  ℹ️  Visitors already exist (${visitorCount} records)`);
    }

    // ─── 7. SEED CHECKLIST SUBMISSIONS ────────────────────────────────────────
    const checklistCount = await ChecklistSubmission.countDocuments();
    if (checklistCount === 0) {
      const submissions = [
        {
          farmId: greenValley._id,
          zone: "Zone 1 - Perimeter & Hatchery",
          submittedAt: new Date(Date.now() - 3 * 3600 * 1000),
          items: [
            { itemId: "chk-1", title: "Entrance footbath chemical PPM level checked", category: "Sanitation", status: "passed" },
            { itemId: "chk-2", title: "Vehicle disinfectant arch pressure at >40 PSI", category: "Vehicle Bio-Pass", status: "passed" },
            { itemId: "chk-3", title: "Staff shower-in hygiene compliance logged", category: "Personnel", status: "passed" },
            { itemId: "chk-4", title: "Mortality bin sealed with virucidal spray", category: "Disposal", status: "passed" },
            { itemId: "chk-5", title: "Perimeter bird deterrent sonic cannons operational", category: "Vector Defense", status: "warning" },
          ],
          summary: { total: 5, passed: 4, warning: 1, critical: 0 },
        },
        {
          farmId: sunrisePoultry._id,
          zone: "Zone 2 - Production House B",
          submittedAt: new Date(Date.now() - 14 * 3600 * 1000),
          items: [
            { itemId: "chk-6", title: "Water line chlorination sensor verified (1.5 ppm)", category: "Water Supply", status: "passed" },
            { itemId: "chk-7", title: "Air filtration intake screen inspected for bird contact", category: "Ventilation", status: "passed" },
            { itemId: "chk-8", title: "Feed silo moisture seal and fungal inspection", category: "Feed Bio-Safety", status: "passed" },
            { itemId: "chk-9", title: "Flock mortality examination and swab sample collected", category: "Flock Health", status: "critical" },
          ],
          summary: { total: 4, passed: 3, warning: 0, critical: 1 },
        },
      ];

      await ChecklistSubmission.insertMany(submissions);
      console.log(`  ✅ Created ${submissions.length} Checklist Submissions in MongoDB`);
    } else {
      console.log(`  ℹ️  Checklists already exist (${checklistCount} records)`);
    }

    console.log("🎉 Complete database population successful!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seedData();
