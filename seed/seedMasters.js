import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();


import LeadStatus from "../models/LeadStatus.js";
// import LeadCategory from "../models/LeadCategory.js";
// import LeadSource from "../models/LeadSource.js";
// import LeadPriority from "../models/LeadPriority.js";

const MONGO_URI = process.env.MONGO_URI;
console.log(MONGO_URI);

// ------------------------
// Default Lead Statuses
// ------------------------

const leadStatuses = [
  {
    name: "New",
    color: "#3B82F6",
    order: 1,
    isClosed: false,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Contacted",
    color: "#06B6D4",
    order: 2,
    isClosed: false,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Qualified",
    color: "#22C55E",
    order: 3,
    isClosed: false,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Proposal Sent",
    color: "#8B5CF6",
    order: 4,
    isClosed: false,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Negotiation",
    color: "#F59E0B",
    order: 5,
    isClosed: false,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Won",
    color: "#10B981",
    order: 6,
    isClosed: true,
    isDefault: true,
    isActive: true,
  },
  {
    name: "Lost",
    color: "#EF4444",
    order: 7,
    isClosed: true,
    isDefault: true,
    isActive: true,
  },
];

// ------------------------
// Default Categories
// ------------------------

// const leadCategories = [
//   { name: "Product Inquiry", order: 1, isDefault: true, isActive: true },
//   { name: "Service Inquiry", order: 2, isDefault: true, isActive: true },
//   { name: "Support", order: 3, isDefault: true, isActive: true },
//   { name: "Existing Customer", order: 4, isDefault: true, isActive: true },
//   { name: "Partner", order: 5, isDefault: true, isActive: true },
//   { name: "Other", order: 6, isDefault: true, isActive: true },
// ];

// ------------------------
// Default Sources
// ------------------------

// const leadSources = [
//   { name: "Website", order: 1, isDefault: true, isActive: true },
//   { name: "Facebook", order: 2, isDefault: true, isActive: true },
//   { name: "Instagram", order: 3, isDefault: true, isActive: true },
//   { name: "Google Ads", order: 4, isDefault: true, isActive: true },
//   { name: "Referral", order: 5, isDefault: true, isActive: true },
//   { name: "WhatsApp", order: 6, isDefault: true, isActive: true },
//   { name: "Phone Call", order: 7, isDefault: true, isActive: true },
//   { name: "Email", order: 8, isDefault: true, isActive: true },
//   { name: "Walk-in", order: 9, isDefault: true, isActive: true },
//   { name: "Other", order: 10, isDefault: true, isActive: true },
// ];

// ------------------------
// Default Priorities
// ------------------------

// const leadPriorities = [
//   {
//     name: "Low",
//     color: "#22C55E",
//     level: 1,
//     order: 1,
//     isDefault: true,
//     isActive: true,
//   },
//   {
//     name: "Medium",
//     color: "#F59E0B",
//     level: 2,
//     order: 2,
//     isDefault: true,
//     isActive: true,
//   },
//   {
//     name: "High",
//     color: "#EF4444",
//     level: 3,
//     order: 3,
//     isDefault: true,
//     isActive: true,
//   },
//   {
//     name: "Urgent",
//     color: "#DC2626",
//     level: 4,
//     order: 4,
//     isDefault: true,
//     isActive: true,
//   },
// ];

async function seedCollection(Model, data, name) {
  for (const item of data) {
    await Model.updateOne(
      { name: item.name },
      { $setOnInsert: item },
      { upsert: true }
    );
  }

  console.log(`✅ ${name} seeded successfully`);
}

async function seedDatabase() {
  try {
    await mongoose.connect(MONGO_URI);

    console.log("🚀 Connected to MongoDB");

    await seedCollection(LeadStatus, leadStatuses, "Lead Statuses");
    // await seedCollection(LeadCategory, leadCategories, "Lead Categories");
    // await seedCollection(LeadSource, leadSources, "Lead Sources");
    // await seedCollection(LeadPriority, leadPriorities, "Lead Priorities");

    console.log("\n🎉 Database seeded successfully.");

    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed");
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();