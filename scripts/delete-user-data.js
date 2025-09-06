/**
 * Delete all data associated with a user from MongoDB
 *
 * Usage:
 *   node scripts/delete-user-data.js --email user@example.com --dry-run
 *   node scripts/delete-user-data.js --userId 65f1c2... --force
 *
 * Flags:
 *   --email   Email of the user to delete (mutually exclusive with --userId)
 *   --userId  MongoDB ObjectId of the user to delete
 *   --dry-run Show what would be deleted without actually deleting
 *   --force   Perform the deletion without interactive confirmation
 */

const mongoose = require("mongoose");
require("dotenv").config();

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable");
  process.exit(1);
}

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = { email: null, userId: null, dryRun: false, force: false };
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--email") opts.email = args[++i];
    else if (a === "--userId") opts.userId = args[++i];
    else if (a === "--dry-run") opts.dryRun = true;
    else if (a === "--force") opts.force = true;
  }
  if (!opts.email && !opts.userId) {
    console.error("Provide either --email or --userId");
    process.exit(1);
  }
  if (opts.email && opts.userId) {
    console.error("Use only one of --email or --userId");
    process.exit(1);
  }
  return opts;
}

// Define minimal models pointing to expected collections
function getModels() {
  // Use loose schemas to avoid keeping in sync with app code
  const loose = new mongoose.Schema({}, { strict: false });
  return {
    User: mongoose.model("User", loose, "users"),
    License: mongoose.model("License", loose, "licenses"),
    Device: mongoose.model("Device", loose, "devices"),
    TelemetryEvent: mongoose.model("TelemetryEvent", loose, "telemetryevents"),
    BillingSubscription: mongoose.model(
      "BillingSubscription",
      loose,
      "billingsubscriptions"
    ),
    BillingInvoice: mongoose.model("BillingInvoice", loose, "billinginvoices"),
    ProcessedWebhookEvent: mongoose.model(
      "ProcessedWebhookEvent",
      loose,
      "processedwebhookevents"
    ),
    AdminAudit: mongoose.model("AdminAudit", loose, "adminaudits"),
  };
}

async function main() {
  const { email, userId, dryRun, force } = parseArgs();
  await mongoose.connect(MONGODB_URI);
  console.log("Connected to MongoDB");

  const { User, License, Device, TelemetryEvent, BillingSubscription, BillingInvoice, ProcessedWebhookEvent, AdminAudit } = getModels();

  // Resolve user
  const userFilter = email ? { email } : { _id: new mongoose.Types.ObjectId(userId) };
  const user = await User.findOne(userFilter).lean();
  if (!user) {
    console.error("User not found for:", email || userId);
    process.exit(1);
  }

  const uid = user._id;
  const uidStr = String(uid);

  // Build deletion specs
  const deletions = [
    { name: "Licenses", model: License, filter: { userId: uid } },
    { name: "Devices", model: Device, filter: { userId: uid } },
    { name: "TelemetryEvents", model: TelemetryEvent, filter: { userId: uid } },
    { name: "BillingSubscriptions", model: BillingSubscription, filter: { userId: uid } },
    { name: "BillingInvoices", model: BillingInvoice, filter: { userId: uid } },
    // ProcessedWebhookEvent stores userId as string
    { name: "ProcessedWebhookEvents", model: ProcessedWebhookEvent, filter: { userId: uidStr } },
    // AdminAudit references actorUserId
    { name: "AdminAudits", model: AdminAudit, filter: { actorUserId: uid } },
  ];

  // Count phase
  const counts = {};
  for (const d of deletions) {
    counts[d.name] = await d.model.countDocuments(d.filter);
  }
  console.log("\nPlanned deletion for user:", user.email || uidStr);
  console.table(
    Object.entries(counts).map(([k, v]) => ({ collection: k, count: v }))
  );

  // Confirm unless --force or dry-run
  if (!dryRun && !force) {
    console.error("\nRefusing to delete without --force (or use --dry-run to preview)");
    process.exit(1);
  }

  if (dryRun) {
    console.log("\nDry run complete. No data was deleted.");
    await mongoose.disconnect();
    return;
  }

  // Execute deletions in parallel
  const results = await Promise.all(
    deletions.map(async (d) => {
      const res = await d.model.deleteMany(d.filter);
      return { name: d.name, deletedCount: res.deletedCount || 0 };
    })
  );

  // Finally, delete the user document
  const userRes = await User.deleteOne({ _id: uid });

  console.log("\nDeletion results:")
  console.table(
    results
      .concat([{ name: "Users", deletedCount: userRes.deletedCount || 0 }])
      .map((r) => ({ collection: r.name, deleted: r.deletedCount }))
  );

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

main().catch(async (err) => {
  console.error("Error during deletion:", err);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});


