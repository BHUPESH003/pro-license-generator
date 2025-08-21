#!/usr/bin/env node

/**
 * Script to verify that all required database indexes are properly defined
 * This script checks the index definitions in the Mongoose models
 */

const mongoose = require("mongoose");
require("dotenv").config();

// Import models to register schemas
const License = require("../src/models/License.ts").default;
const Device = require("../src/models/Device.ts").default;
const TelemetryEvent = require("../src/models/TelemetryEvent.ts").default;
const AdminAudit = require("../src/models/AdminAudit.ts").default;

async function verifyIndexes() {
  try {
    console.log("🔍 Verifying database indexes...\n");

    // Connect to MongoDB
    if (!process.env.MONGODB_URI) {
      throw new Error("MONGODB_URI environment variable is required");
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Verify License indexes
    console.log("📄 License Model Indexes:");
    const licenseIndexes = License.schema.indexes();
    licenseIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. ${JSON.stringify(index[0])} ${JSON.stringify(
          index[1] || {}
        )}`
      );
    });

    // Verify Device indexes
    console.log("\n📱 Device Model Indexes:");
    const deviceIndexes = Device.schema.indexes();
    deviceIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. ${JSON.stringify(index[0])} ${JSON.stringify(
          index[1] || {}
        )}`
      );
    });

    // Verify TelemetryEvent indexes
    console.log("\n📊 TelemetryEvent Model Indexes:");
    const telemetryIndexes = TelemetryEvent.schema.indexes();
    telemetryIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. ${JSON.stringify(index[0])} ${JSON.stringify(
          index[1] || {}
        )}`
      );
    });

    // Verify AdminAudit indexes
    console.log("\n🔒 AdminAudit Model Indexes:");
    const auditIndexes = AdminAudit.schema.indexes();
    auditIndexes.forEach((index, i) => {
      console.log(
        `  ${i + 1}. ${JSON.stringify(index[0])} ${JSON.stringify(
          index[1] || {}
        )}`
      );
    });

    console.log("\n✅ Index verification completed successfully!");

    // Verify required indexes are present
    const requiredIndexes = {
      License: [
        { licenseKey: 1 },
        { status: 1 },
        { plan: 1 },
        { mode: 1 },
        { userId: 1 },
        { purchaseDate: -1 },
        { expiryDate: -1 },
        { status: 1, purchaseDate: -1 },
        { plan: 1, mode: 1 },
        { userId: 1, status: 1 },
      ],
      Device: [
        { deviceGuid: 1 },
        { userId: 1 },
        { licenseId: 1 },
        { lastActivity: -1 },
        { status: 1 },
        { os: 1 },
        { name: 1 },
        { status: 1, lastActivity: -1 },
        { userId: 1, status: 1 },
        { os: 1, status: 1 },
      ],
      TelemetryEvent: [
        { userId: 1, occurredAt: -1 },
        { licenseId: 1, occurredAt: -1 },
        { deviceGuid: 1, occurredAt: -1 },
        { eventType: 1, occurredAt: -1 },
        { idempotencyKey: 1 },
        { userId: 1, eventType: 1, occurredAt: -1 },
        { deviceGuid: 1, eventType: 1, occurredAt: -1 },
      ],
      AdminAudit: [
        { actorUserId: 1, createdAt: -1 },
        { entityType: 1, entityId: 1 },
        { createdAt: -1 },
        { entityType: 1, createdAt: -1 },
        { action: 1, createdAt: -1 },
        { actorUserId: 1, entityType: 1, createdAt: -1 },
      ],
    };

    console.log("\n🔍 Checking required indexes...");
    let allIndexesPresent = true;

    for (const [modelName, requiredIndexList] of Object.entries(
      requiredIndexes
    )) {
      const model = { License, Device, TelemetryEvent, AdminAudit }[modelName];
      const modelIndexes = model.schema.indexes().map((idx) => idx[0]);

      for (const requiredIndex of requiredIndexList) {
        const found = modelIndexes.some(
          (idx) => JSON.stringify(idx) === JSON.stringify(requiredIndex)
        );

        if (!found) {
          console.log(
            `❌ Missing index in ${modelName}: ${JSON.stringify(requiredIndex)}`
          );
          allIndexesPresent = false;
        }
      }
    }

    if (allIndexesPresent) {
      console.log("✅ All required indexes are present!");
    } else {
      console.log("❌ Some required indexes are missing!");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Error verifying indexes:", error.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
  }
}

verifyIndexes();
