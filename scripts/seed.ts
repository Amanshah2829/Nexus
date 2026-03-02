
/**
 * @fileoverview Enhanced Seed script to populate the database with 500+ entries per feature.
 * To run this script: `npm run db:seed`
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import dbConnect from '../app/lib/db';
import Solution from '../app/models/Solution';
import Tenant from '../app/models/Tenant';
import User from '../app/models/User';
import Asset from '../app/models/Asset';
import Complaint from '../app/models/Complaint';
import Lead from '../app/models/Lead';

const BUILDINGS = ["Boys Hostel", "Girls Hostel", "Academic Block A", "Academic Block B", "Library", "Staff Quarters", "Guest House", "Admin Wing"];
const ASSET_MODELS = [
    { make: "Dell", model: "OptiPlex 7010", type: "user" },
    { make: "HP", model: "EliteBook 840", type: "user" },
    { make: "TP-Link", model: "RE300", type: "network" },
    { make: "Cisco", model: "Catalyst 2960", type: "network" },
    { make: "Ubiquiti", model: "UniFi AP AC Pro", type: "network" },
];
const CATEGORIES = ["Connectivity", "Hardware", "Software", "Security", "Account Access", "Power", "Peripheral"];

const seedDB = async () => {
  console.log('Connecting to the database...');
  await dbConnect();
  console.log('Database connected.');

  // 1. Find or Create a Tenant
  let tenant = await Tenant.findOne({ name: "Vynsec Creations" });
  if (!tenant) {
    tenant = await Tenant.create({
      name: "Vynsec Creations",
      status: "active",
      subscriptionPlan: "enterprise",
      subscriptionStatus: "active",
      locations: BUILDINGS
    });
  }
  const tenantId = tenant._id;

  // 2. Wipe existing data for a clean slate
  console.log('Cleaning existing data...');
  await Promise.all([
      User.deleteMany({ tenant: tenantId, email: { $ne: "admin@vynsec.com" } }),
      Asset.deleteMany({ tenant: tenantId }),
      Complaint.deleteMany({ tenant: tenantId }),
      Lead.deleteMany({ }),
      Solution.deleteMany({ tenant: tenantId }),
  ]);

  // 3. Create Support Staff
  console.log('Creating users...');
  const engineers = [];
  for (let i = 1; i <= 20; i++) {
      engineers.push(await User.create({
          name: `Engineer ${i}`,
          email: `engineer${i}@vynsec.com`,
          password: "password123",
          role: "engineer",
          tenant: tenantId,
          isVerified: true
      }));
  }

  // 4. Create Assets (500)
  console.log('Generating 500 assets...');
  const assets = [];
  for (let i = 1; i <= 500; i++) {
      const model = ASSET_MODELS[i % ASSET_MODELS.length];
      assets.push({
          tenant: tenantId,
          serialNumber: `SN-PROD-${1000 + i}`,
          assetNo: `AST-${5000 + i}`,
          make: model.make,
          model: model.model,
          status: i % 15 === 0 ? 'defective' : 'available',
          location: BUILDINGS[i % BUILDINGS.length],
          purchaseDate: new Date()
      });
  }
  await Asset.insertMany(assets);

  // 5. Create Complaints (500)
  console.log('Generating 500 complaints...');
  const complaints = [];
  for (let i = 1; i <= 500; i++) {
      complaints.push({
          id: `CMP-${2000 + i}`,
          ticketNumber: `TKT-2024-X${i}`,
          tenant: tenantId,
          title: `Reported issue with ${CATEGORIES[i % CATEGORIES.length]} #${i}`,
          description: `User reports that the system is not behaving as expected. Requires diagnostics. Logged as part of mass data simulation.`,
          status: i % 3 === 0 ? 'closed' : 'created',
          priority: i % 10 === 0 ? 'critical' : 'medium',
          building: BUILDINGS[i % BUILDINGS.length],
          room: `RM-${100 + i}`,
          reporter: `Reporter ${i}`,
          reporterEmail: `user${i}@example.com`,
          category: CATEGORIES[i % CATEGORIES.length].toLowerCase(),
          createdAt: new Date(),
          history: [{ action: 'Complaint Created', user: 'System', timestamp: new Date() }]
      });
  }
  await Complaint.insertMany(complaints);

  // 6. Create Leads (500)
  console.log('Generating 500 leads...');
  const leads = [];
  for (let i = 1; i <= 500; i++) {
      leads.push({
          company: `Global Tech ${i}`,
          contactName: `Executive ${i}`,
          email: `exec${i}@gt${i}.com`,
          status: i % 5 === 0 ? 'closed-won' : 'new',
          value: Math.floor(Math.random() * 10000) + 500
      });
  }
  await Lead.insertMany(leads);

  // 7. Create Solutions (500)
  console.log('Generating 500 KB articles...');
  const solutions = [];
  for (let i = 1; i <= 500; i++) {
      solutions.push({
          tenant: tenantId,
          title: `Troubleshooting Guide for ${CATEGORIES[i % CATEGORIES.length]}`,
          description: `Standard operating procedure for resolving common ${CATEGORIES[i % CATEGORIES.length]} faults.`,
          resolution: `1. Verify physical power.\n2. Ping local gateway.\n3. Reset configuration.\n4. Escalate if unresolved.`,
          category: CATEGORIES[i % CATEGORIES.length],
          createdBy: engineers[0]._id
      });
  }
  await Solution.insertMany(solutions);

  console.log('Seeding complete! 2500+ records created.');
  mongoose.connection.close();
};

seedDB().catch(err => {
  console.error('An error occurred during database seeding:', err);
  mongoose.connection.close();
});
