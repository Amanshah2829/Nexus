
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db';
import Tenant from '@/app/models/Tenant';
import User from '@/app/models/User';
import Asset from '@/app/models/Asset';
import Complaint from '@/app/models/Complaint';
import Lead from '@/app/models/Lead';
import Solution from '@/app/models/Solution';
import AssetLog from '@/app/models/AssetLog';
import Counter from '@/app/models/Counter';

export const dynamic = 'force-dynamic';

const CORPORATE_LOCATIONS = [
    "Global HQ - Executive Floor",
    "Innovation Hub - R&D Wing",
    "Tower A - Financial Center",
    "Tower B - Engineering Lab",
    "Data Center - Secure Vault",
    "Logistics Hub - Warehouse 7",
    "EMEA Regional Office",
    "APAC Operations Center"
];

const ASSET_MODELS = [
    { make: "Apple", model: "MacBook Pro M3", type: "user" },
    { make: "Dell", model: "Precision 7875", type: "user" },
    { make: "Cisco", model: "Meraki MX68", type: "network" },
    { make: "Juniper", model: "EX4100-F", type: "network" },
    { make: "Fortinet", model: "FortiGate 60F", type: "network" },
    { make: "HP", model: "LaserJet Enterprise", type: "peripheral" },
    { make: "Logitech", model: "Rally Bar", type: "peripheral" }
];

const CATEGORIES = ["Connectivity", "Cybersecurity", "Hardware", "Cloud Access", "Infrastructure", "Power", "AV/Conferencing"];
const LEAD_SOURCES = ["Inbound Inquiry", "Enterprise Referral", "Partner Network", "Global Summit", "Direct Outreach"];

export async function GET() {
    try {
        await dbConnect();

        // 1. Reset Database State
        await Promise.all([
            Tenant.deleteMany({}),
            User.deleteMany({}),
            Asset.deleteMany({}),
            Complaint.deleteMany({}),
            Lead.deleteMany({}),
            Solution.deleteMany({}),
            AssetLog.deleteMany({}),
            Counter.deleteMany({})
        ]);

        // 2. Create the Flagship Tenant
        const futureDate = new Date();
        futureDate.setFullYear(futureDate.getFullYear() + 1);

        const tenant = await Tenant.create({
            name: "Nexus Corporate Systems",
            status: "active",
            subscriptionPlan: "enterprise",
            subscriptionStatus: "active",
            subscriptionEndDate: futureDate,
            locations: CORPORATE_LOCATIONS,
            monthlyCost: 1299,
            branding: {
                enabled: true,
                companyName: "Nexus Corp",
                tagline: "Sovereign Infrastructure Intelligence",
                primaryColor: "190 90% 50%", // Cyan
                accentColor: "240 5% 15%",
                backgroundColor: "240 10% 4%"
            }
        });
        const tenantId = tenant._id;

        // 3. Create Named Demo Users
        const demoUsers = [
            { name: "Primary Super Admin", email: "bl4ck9998@gmail.com", role: "super-admin", status: "active", password: "00000000" },
            { name: "John Doe", email: "admin@nexus.com", role: "admin", status: "active" },
            { name: "Alice Smith", email: "alice@nexus.com", role: "super-admin", status: "active" },
            { name: "Charlie Brown", email: "charlie@nexus.com", role: "engineer", status: "active" },
            { name: "Bob Wilson", email: "bob@nexus.com", role: "hod", status: "active" },
            { name: "Sarah Connor", email: "sarah@nexus.com", role: "sales", status: "active" },
            { name: "Eve Online", email: "eve@nexus.com", role: "viewer", status: "active" }
        ];

        const createdUsers = [];
        for (const u of demoUsers) {
            const user = await User.create({
                ...u,
                password: u.password || "password123",
                tenant: u.role === 'super-admin' ? null : tenantId,
                isVerified: true,
                avatar: `https://avatar.vercel.sh/${u.name.replace(' ', '')}.png`
            });
            createdUsers.push(user);
        }

        // Generate additional background engineers (~40 more)
        const engineers = [createdUsers.find(u => u.role === 'engineer')];
        for (let i = 1; i <= 40; i++) {
            const eng = await User.create({
                name: `Staff Engineer ${i}`,
                email: `engineer${i}@nexus.com`,
                password: "password123",
                role: "engineer",
                status: "active",
                tenant: tenantId,
                isVerified: true
            });
            engineers.push(eng);
        }

        // 4. Generate Mass Assets (500)
        const assetsToInsert = [];
        for (let i = 1; i <= 500; i++) {
            const modelInfo = ASSET_MODELS[Math.floor(Math.random() * ASSET_MODELS.length)];
            const status = i % 20 === 0 ? 'damaged' : i % 8 === 0 ? 'allotted' : 'available';
            
            assetsToInsert.push({
                tenant: tenantId,
                serialNumber: `NXS-SN-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${i}`,
                assetNo: `VYN-AST-${2000 + i}`,
                make: modelInfo.make,
                model: modelInfo.model,
                macAddress: `${Math.floor(Math.random()*255).toString(16)}:${Math.floor(Math.random()*255).toString(16)}:${Math.floor(Math.random()*255).toString(16)}:AA:BB:CC`.toUpperCase(),
                status: status,
                location: CORPORATE_LOCATIONS[Math.floor(Math.random() * CORPORATE_LOCATIONS.length)],
                purchaseDate: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
                allottedTo: status === 'allotted' ? {
                    name: `Executive User ${i}`,
                    email: `user${i}@client.com`,
                    building: CORPORATE_LOCATIONS[Math.floor(Math.random() * CORPORATE_LOCATIONS.length)],
                    roomNumber: `Floor ${Math.floor(Math.random() * 50) + 1}, Suite ${i}`
                } : undefined
            });
        }
        await Asset.insertMany(assetsToInsert);

        // 5. Generate Mass Complaints (500)
        const complaintsToInsert = [];
        const possibleStatuses = ['created', 'scheduled', 'visited', 'observation', 'follow-up', 'closed'];
        const priorities = ['low', 'medium', 'high', 'critical'];

        for (let i = 1; i <= 500; i++) {
            const status = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
            const engineer = engineers[Math.floor(Math.random() * engineers.length)];
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            
            complaintsToInsert.push({
                id: `CMP-${String(i).padStart(4, '0')}`,
                ticketNumber: `TKT-2024-NEXUS-${String(i).padStart(4, '0')}`,
                tenant: tenantId,
                title: `${category} Fault Detected at ${CORPORATE_LOCATIONS[Math.floor(Math.random() * CORPORATE_LOCATIONS.length)]}`,
                description: `This is a high-priority incident report for automated ticket #${i}. The reported issue affects critical operations in the ${category} segment. Immediate onsite intervention is requested.`,
                type: 'complaint',
                status: status,
                priority: priorities[Math.floor(Math.random() * priorities.length)],
                building: CORPORATE_LOCATIONS[Math.floor(Math.random() * CORPORATE_LOCATIONS.length)],
                room: `Zone ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`,
                reporter: `Staff Member ${i}`,
                reporterEmail: `staff${i}@nexus.com`,
                assignedTo: status !== 'created' ? engineer._id : undefined,
                category: category.toLowerCase(),
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
                history: [
                    { action: 'Ticket Initialized', user: 'System', timestamp: new Date(Date.now() - 9000000000) },
                    ...(status !== 'created' ? [{ action: 'Engineer Dispatched', user: 'John Doe', timestamp: new Date(Date.now() - 8000000000) }] : [])
                ]
            });
        }
        await Complaint.insertMany(complaintsToInsert);

        // 6. Generate Mass Leads (500)
        const leadsToInsert = [];
        const leadStatusKeys = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost'];
        for (let i = 1; i <= 500; i++) {
            leadsToInsert.push({
                company: `Enterprise Client ${i} Corp`,
                contactName: `CTO ${i}`,
                email: `cto${i}@enterprise${i}.com`,
                status: leadStatusKeys[Math.floor(Math.random() * leadStatusKeys.length)],
                source: LEAD_SOURCES[Math.floor(Math.random() * LEAD_SOURCES.length)],
                value: Math.floor(Math.random() * 150000) + 5000,
                owner: createdUsers.find(u => u.role === 'sales')?._id,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 15000000000))
            });
        }
        await Lead.insertMany(leadsToInsert);

        // 7. Generate Mass Solutions (500)
        const solutionsToInsert = [];
        for (let i = 1; i <= 500; i++) {
            const cat = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
            solutionsToInsert.push({
                tenant: tenantId,
                title: `Corporate Policy: ${cat} Resolution Protocol v${i}`,
                description: `Standard resolution procedure for ${cat} incidents in a high-security environment.`,
                category: cat,
                resolution: `1. Authenticate with hardware key.\n2. Isolate the affected node.\n3. Apply patch NXS-${i}.\n4. Re-run verification checklist.`,
                createdBy: engineers[0]._id,
                createdAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000))
            });
        }
        await Solution.insertMany(solutionsToInsert);

        return NextResponse.json({
            success: true,
            message: "Enterprise seeding complete! Super Admin account 'bl4ck9998@gmail.com' is now active.",
            summary: {
                tenants: 1,
                users: createdUsers.length + engineers.length - 1,
                assets: 500,
                complaints: 500,
                leads: 500,
                solutions: 500
            }
        });

    } catch (error: any) {
        console.error("Critical Seeding Failure:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
