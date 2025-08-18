import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";

// POST: ingest telemetry events (public via licenseKey+deviceGuid)
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      licenseKey,
      deviceGuid,
      sessionId,
      appVersion,
      os,
      events,
    } = body || {};

    if (!licenseKey || !deviceGuid || !Array.isArray(events) || events.length === 0) {
      return NextResponse.json(
        { error: "licenseKey, deviceGuid and non-empty events array are required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const license = await License.findOne({ licenseKey }).select("_id userId");
    if (!license) {
      return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
    }

    // Basic per-request cap to avoid abuse
    const capped = events.slice(0, 100);

    let accepted = 0;
    const now = new Date();
    for (const e of capped) {
      const doc = {
        userId: license.userId,
        licenseId: license._id,
        deviceGuid,
        sessionId,
        eventType: e.eventType,
        occurredAt: e.occurredAt ? new Date(e.occurredAt) : now,
        appVersion,
        os,
        metadata: e.metadata || {},
        idempotencyKey: e.idempotencyKey,
      } as any;
      try {
        if (e.idempotencyKey) {
          await TelemetryEvent.updateOne(
            { idempotencyKey: e.idempotencyKey },
            { $setOnInsert: doc },
            { upsert: true }
          );
        } else {
          await TelemetryEvent.create(doc);
        }
        accepted++;
      } catch (err: any) {
        // ignore duplicate idempotencyKey
        if (!(err?.code === 11000)) {
          console.error("Telemetry ingest error:", err?.message || err);
        }
      }
    }

    return NextResponse.json({ success: true, acceptedCount: accepted });
  } catch (e) {
    return NextResponse.json({ error: "Failed to record events" }, { status: 500 });
  }
}

// GET: retrieve telemetry events (public via licenseKey+deviceGuid)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const licenseKey = searchParams.get("licenseKey");
    const deviceGuid = searchParams.get("deviceGuid");
    const eventType = searchParams.get("eventType") || undefined;
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10), 200);
    const since = searchParams.get("since");

    if (!licenseKey || !deviceGuid) {
      return NextResponse.json(
        { error: "licenseKey and deviceGuid are required" },
        { status: 400 }
      );
    }

    await dbConnect();
    const license = await License.findOne({ licenseKey }).select("_id userId");
    if (!license) {
      return NextResponse.json({ error: "Invalid license key" }, { status: 404 });
    }

    const query: any = { licenseId: license._id, deviceGuid };
    if (eventType) query.eventType = eventType;
    if (since) query.occurredAt = { $gte: new Date(since) };

    const events = await TelemetryEvent.find(query)
      .sort({ occurredAt: -1 })
      .limit(limit)
      .lean();

    return NextResponse.json({ success: true, events });
  } catch (e) {
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}


