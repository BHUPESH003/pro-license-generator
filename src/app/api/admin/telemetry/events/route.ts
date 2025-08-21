import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import TelemetryEvent from "@/models/TelemetryEvent";
import User from "@/models/User";
import License from "@/models/License";
import { withAdminAuth } from "@/lib/adminAuth";

interface TelemetryEventListItem {
  _id: string;
  occurredAt: Date;
  eventType: string;
  appVersion?: string;
  os?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  deviceGuid: string;
  sessionId?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  license: {
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
  };
}

interface TelemetryEventListResponse {
  success: boolean;
  data: {
    rows: TelemetryEventListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

async function handleGet(req: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(req.url);

    // Handle CSV export
    if (searchParams.get("export") === "csv") {
      return handleCsvExport(searchParams);
    }

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = Math.min(
      parseInt(searchParams.get("pageSize") || "25"),
      100
    );
    const sortBy = searchParams.get("sortBy") || "occurredAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Build filter query
    const filterQuery: any = {};

    // Device GUID filter
    const deviceGuidFilter = searchParams.get("filter_deviceGuid");
    if (deviceGuidFilter) {
      filterQuery.deviceGuid = { $regex: deviceGuidFilter, $options: "i" };
    }

    // License key filter
    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    let licenseIds: string[] = [];
    if (licenseKeyFilter) {
      const licenses = await License.find(
        { licenseKey: { $regex: licenseKeyFilter, $options: "i" } },
        { _id: 1 }
      );
      licenseIds = licenses.map((l) => (l._id as any).toString());
      if (licenseIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            rows: [],
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
      filterQuery.licenseId = { $in: licenseIds };
    }

    // User email filter
    const userEmailFilter = searchParams.get("filter_userEmail");
    let userIds: string[] = [];
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      userIds = users.map((u) => (u._id as any).toString());
      if (userIds.length === 0) {
        return NextResponse.json({
          success: true,
          data: {
            rows: [],
            page,
            pageSize,
            total: 0,
            totalPages: 0,
          },
        });
      }
      filterQuery.userId = { $in: userIds };
    }

    // Event type filter
    const eventTypeFilter = searchParams.get("filter_eventType");
    if (eventTypeFilter) {
      filterQuery.eventType = { $regex: eventTypeFilter, $options: "i" };
    }

    // Date range filters
    const occurredAfter = searchParams.get("filter_occurredAfter");
    const occurredBefore = searchParams.get("filter_occurredBefore");
    if (occurredAfter || occurredBefore) {
      filterQuery.occurredAt = {};
      if (occurredAfter) {
        filterQuery.occurredAt.$gte = new Date(occurredAfter);
      }
      if (occurredBefore) {
        filterQuery.occurredAt.$lte = new Date(occurredBefore);
      }
    }

    // App version filter
    const appVersionFilter = searchParams.get("filter_appVersion");
    if (appVersionFilter) {
      filterQuery.appVersion = { $regex: appVersionFilter, $options: "i" };
    }

    // OS filter
    const osFilter = searchParams.get("filter_os");
    if (osFilter) {
      filterQuery.os = { $regex: osFilter, $options: "i" };
    }

    // Session ID filter
    const sessionIdFilter = searchParams.get("filter_sessionId");
    if (sessionIdFilter) {
      filterQuery.sessionId = { $regex: sessionIdFilter, $options: "i" };
    }

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortDir === "desc" ? -1 : 1;

    // Calculate pagination
    const skip = (page - 1) * pageSize;

    // Execute aggregation pipeline for efficient data retrieval
    const pipeline = [
      { $match: filterQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [
            {
              $project: {
                email: 1,
                name: 1,
              },
            },
          ],
        },
      },
      {
        $lookup: {
          from: "licenses",
          localField: "licenseId",
          foreignField: "_id",
          as: "license",
          pipeline: [
            {
              $project: {
                licenseKey: 1,
                status: 1,
                plan: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          license: { $arrayElemAt: ["$license", 0] },
        },
      },
      {
        $project: {
          occurredAt: 1,
          eventType: 1,
          appVersion: 1,
          os: 1,
          metadata: 1,
          idempotencyKey: 1,
          deviceGuid: 1,
          sessionId: 1,
          user: 1,
          license: 1,
        },
      },
      { $sort: sortObject },
    ];

    // Get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await TelemetryEvent.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: pageSize }];
    const events = await TelemetryEvent.aggregate(dataPipeline);

    const totalPages = Math.ceil(total / pageSize);

    const response: TelemetryEventListResponse = {
      success: true,
      data: {
        rows: events,
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching telemetry events:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch telemetry events",
        error:
          process.env.NODE_ENV === "development"
            ? (error as Error).message
            : undefined,
      },
      { status: 500 }
    );
  }
}

async function handleCsvExport(searchParams: URLSearchParams) {
  try {
    // Build the same filter query as the main GET request
    const filterQuery: any = {};

    const deviceGuidFilter = searchParams.get("filter_deviceGuid");
    if (deviceGuidFilter) {
      filterQuery.deviceGuid = { $regex: deviceGuidFilter, $options: "i" };
    }

    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    if (licenseKeyFilter) {
      const licenses = await License.find(
        { licenseKey: { $regex: licenseKeyFilter, $options: "i" } },
        { _id: 1 }
      );
      const licenseIds = licenses.map((l) => (l._id as any).toString());
      if (licenseIds.length === 0) {
        return new NextResponse(
          "Occurred At,Event Type,App Version,OS,Device GUID,Session ID,User Email,User Name,License Key,License Plan,Metadata,Idempotency Key\n",
          {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition":
                "attachment; filename=telemetry-events-export.csv",
            },
          }
        );
      }
      filterQuery.licenseId = { $in: licenseIds };
    }

    const userEmailFilter = searchParams.get("filter_userEmail");
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      const userIds = users.map((u) => (u._id as any).toString());
      if (userIds.length === 0) {
        return new NextResponse(
          "Occurred At,Event Type,App Version,OS,Device GUID,Session ID,User Email,User Name,License Key,License Plan,Metadata,Idempotency Key\n",
          {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition":
                "attachment; filename=telemetry-events-export.csv",
            },
          }
        );
      }
      filterQuery.userId = { $in: userIds };
    }

    const eventTypeFilter = searchParams.get("filter_eventType");
    if (eventTypeFilter) {
      filterQuery.eventType = { $regex: eventTypeFilter, $options: "i" };
    }

    // Date filters
    const occurredAfter = searchParams.get("filter_occurredAfter");
    const occurredBefore = searchParams.get("filter_occurredBefore");
    if (occurredAfter || occurredBefore) {
      filterQuery.occurredAt = {};
      if (occurredAfter) filterQuery.occurredAt.$gte = new Date(occurredAfter);
      if (occurredBefore)
        filterQuery.occurredAt.$lte = new Date(occurredBefore);
    }

    const appVersionFilter = searchParams.get("filter_appVersion");
    if (appVersionFilter) {
      filterQuery.appVersion = { $regex: appVersionFilter, $options: "i" };
    }

    const osFilter = searchParams.get("filter_os");
    if (osFilter) {
      filterQuery.os = { $regex: osFilter, $options: "i" };
    }

    const sessionIdFilter = searchParams.get("filter_sessionId");
    if (sessionIdFilter) {
      filterQuery.sessionId = { $regex: sessionIdFilter, $options: "i" };
    }

    // Aggregation pipeline for CSV export
    const pipeline = [
      { $match: filterQuery },
      {
        $lookup: {
          from: "users",
          localField: "userId",
          foreignField: "_id",
          as: "user",
          pipeline: [{ $project: { email: 1, name: 1 } }],
        },
      },
      {
        $lookup: {
          from: "licenses",
          localField: "licenseId",
          foreignField: "_id",
          as: "license",
          pipeline: [{ $project: { licenseKey: 1, plan: 1 } }],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          license: { $arrayElemAt: ["$license", 0] },
        },
      },
      { $sort: { occurredAt: -1 } },
      { $limit: 10000 }, // Limit export to 10k records for performance
    ];

    const events = await TelemetryEvent.aggregate(pipeline as any);

    // Generate CSV
    const csvHeaders =
      "Occurred At,Event Type,App Version,OS,Device GUID,Session ID,User Email,User Name,License Key,License Plan,Metadata,Idempotency Key\n";
    const csvRows = events
      .map((event) => {
        const formatDate = (date: Date | null | undefined) =>
          date ? new Date(date).toISOString() : "";

        const formatMetadata = (
          metadata: Record<string, any> | null | undefined
        ) => {
          if (!metadata || typeof metadata !== "object") return "";
          try {
            return JSON.stringify(metadata).replace(/"/g, '""');
          } catch {
            return "";
          }
        };

        return [
          formatDate(event.occurredAt),
          event.eventType || "",
          event.appVersion || "",
          event.os || "",
          event.deviceGuid || "",
          event.sessionId || "",
          event.user?.email || "",
          event.user?.name || "",
          event.license?.licenseKey || "",
          event.license?.plan || "",
          formatMetadata(event.metadata),
          event.idempotencyKey || "",
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",");
      })
      .join("\n");

    return new NextResponse(csvHeaders + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition":
          "attachment; filename=telemetry-events-export.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting telemetry events:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export telemetry events" },
      { status: 500 }
    );
  }
}

export const GET = withAdminAuth(handleGet);
