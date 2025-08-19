import { NextRequest, NextResponse } from "next/server";
import {
  withAdminReadSecurity,
  withAdminExportSecurity,
} from "@/lib/securityMiddleware";
import { commonSchemas } from "@/lib/inputValidation";
import dbConnect from "@/lib/db";
import Device from "@/models/Device";
import User from "@/models/User";
import License from "@/models/License";
import TelemetryEvent from "@/models/TelemetryEvent";

interface DeviceListItem {
  _id: string;
  name: string;
  os: string;
  deviceGuid?: string;
  status: "active" | "inactive";
  lastActivity: Date;
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
  telemetryStats: {
    totalEvents: number;
    lastEventDate?: Date;
    recentEventTypes: string[];
  };
}

interface DeviceListResponse {
  success: boolean;
  data: {
    rows: DeviceListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

async function getDevicesHandler(request: NextRequest) {
  try {
    await dbConnect();

    const { searchParams } = new URL(request.url);

    // Handle CSV export
    if (searchParams.get("export") === "csv") {
      return handleCsvExport(searchParams);
    }

    // Parse query parameters
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "25");
    const sortBy = searchParams.get("sortBy") || "lastActivity";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Build filter query
    const filterQuery: any = {};

    // Status filter
    const statusFilter = searchParams.get("filter_status");
    if (statusFilter) {
      filterQuery.status = statusFilter;
    }

    // OS filter
    const osFilter = searchParams.get("filter_os");
    if (osFilter) {
      filterQuery.os = { $regex: osFilter, $options: "i" };
    }

    // Device GUID search
    const deviceGuidFilter = searchParams.get("filter_deviceGuid");
    if (deviceGuidFilter) {
      filterQuery.deviceGuid = { $regex: deviceGuidFilter, $options: "i" };
    }

    // Device name search
    const nameFilter = searchParams.get("filter_name");
    if (nameFilter) {
      filterQuery.name = { $regex: nameFilter, $options: "i" };
    }

    // User email search
    const userEmailFilter = searchParams.get("filter_userEmail");
    let userIds: string[] = [];
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      userIds = users.map((u) => u._id.toString());
      if (userIds.length === 0) {
        // No users found, return empty result
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

    // License key search
    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    let licenseIds: string[] = [];
    if (licenseKeyFilter) {
      const licenses = await License.find(
        { licenseKey: { $regex: licenseKeyFilter, $options: "i" } },
        { _id: 1 }
      );
      licenseIds = licenses.map((l) => l._id.toString());
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

    // Date range filters
    const lastActivityAfter = searchParams.get("filter_lastActivityAfter");
    const lastActivityBefore = searchParams.get("filter_lastActivityBefore");
    if (lastActivityAfter || lastActivityBefore) {
      filterQuery.lastActivity = {};
      if (lastActivityAfter) {
        filterQuery.lastActivity.$gte = new Date(lastActivityAfter);
      }
      if (lastActivityBefore) {
        filterQuery.lastActivity.$lte = new Date(lastActivityBefore);
      }
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
          name: 1,
          os: 1,
          deviceGuid: 1,
          status: 1,
          lastActivity: 1,
          user: 1,
          license: 1,
        },
      },
      { $sort: sortObject },
    ];

    // Get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await Device.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: pageSize }];
    const devices = await Device.aggregate(dataPipeline);

    // Get telemetry stats for each device
    const deviceIds = devices.map((d) => d._id);
    const telemetryStats = await TelemetryEvent.aggregate([
      {
        $match: {
          deviceGuid: { $in: devices.map((d) => d.deviceGuid).filter(Boolean) },
        },
      },
      {
        $group: {
          _id: "$deviceGuid",
          totalEvents: { $sum: 1 },
          lastEventDate: { $max: "$occurredAt" },
          eventTypes: { $addToSet: "$eventType" },
        },
      },
    ]);

    // Create telemetry stats lookup
    const telemetryLookup = new Map();
    telemetryStats.forEach((stat) => {
      telemetryLookup.set(stat._id, {
        totalEvents: stat.totalEvents,
        lastEventDate: stat.lastEventDate,
        recentEventTypes: stat.eventTypes.slice(0, 3), // Top 3 event types
      });
    });

    // Enhance devices with telemetry stats
    const enhancedDevices = devices.map((device) => ({
      ...device,
      telemetryStats: telemetryLookup.get(device.deviceGuid) || {
        totalEvents: 0,
        lastEventDate: null,
        recentEventTypes: [],
      },
    }));

    const totalPages = Math.ceil(total / pageSize);

    const response: DeviceListResponse = {
      success: true,
      data: {
        rows: enhancedDevices,
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching devices:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch devices",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 }
    );
  }
}

async function handleCsvExport(searchParams: URLSearchParams) {
  try {
    // Build the same filter query as the main GET request
    const filterQuery: any = {};

    const statusFilter = searchParams.get("filter_status");
    if (statusFilter) filterQuery.status = statusFilter;

    const osFilter = searchParams.get("filter_os");
    if (osFilter) filterQuery.os = { $regex: osFilter, $options: "i" };

    const deviceGuidFilter = searchParams.get("filter_deviceGuid");
    if (deviceGuidFilter) {
      filterQuery.deviceGuid = { $regex: deviceGuidFilter, $options: "i" };
    }

    const nameFilter = searchParams.get("filter_name");
    if (nameFilter) {
      filterQuery.name = { $regex: nameFilter, $options: "i" };
    }

    const userEmailFilter = searchParams.get("filter_userEmail");
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      const userIds = users.map((u) => u._id.toString());
      if (userIds.length === 0) {
        return new NextResponse(
          "Device Name,OS,Device GUID,Status,User Email,User Name,License Key,License Plan,Last Activity\n",
          {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": "attachment; filename=devices-export.csv",
            },
          }
        );
      }
      filterQuery.userId = { $in: userIds };
    }

    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    if (licenseKeyFilter) {
      const licenses = await License.find(
        { licenseKey: { $regex: licenseKeyFilter, $options: "i" } },
        { _id: 1 }
      );
      const licenseIds = licenses.map((l) => l._id.toString());
      if (licenseIds.length === 0) {
        return new NextResponse(
          "Device Name,OS,Device GUID,Status,User Email,User Name,License Key,License Plan,Last Activity\n",
          {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": "attachment; filename=devices-export.csv",
            },
          }
        );
      }
      filterQuery.licenseId = { $in: licenseIds };
    }

    // Date filters
    const lastActivityAfter = searchParams.get("filter_lastActivityAfter");
    const lastActivityBefore = searchParams.get("filter_lastActivityBefore");
    if (lastActivityAfter || lastActivityBefore) {
      filterQuery.lastActivity = {};
      if (lastActivityAfter)
        filterQuery.lastActivity.$gte = new Date(lastActivityAfter);
      if (lastActivityBefore)
        filterQuery.lastActivity.$lte = new Date(lastActivityBefore);
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
      { $sort: { lastActivity: -1 } },
    ];

    const devices = await Device.aggregate(pipeline);

    // Generate CSV
    const csvHeaders =
      "Device Name,OS,Device GUID,Status,User Email,User Name,License Key,License Plan,Last Activity\n";
    const csvRows = devices
      .map((device) => {
        const formatDate = (date: Date | null | undefined) =>
          date ? new Date(date).toISOString().split("T")[0] : "";

        return [
          device.name || "",
          device.os || "",
          device.deviceGuid || "",
          device.status || "",
          device.user?.email || "",
          device.user?.name || "",
          device.license?.licenseKey || "",
          device.license?.plan || "",
          formatDate(device.lastActivity),
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",");
      })
      .join("\n");

    return new NextResponse(csvHeaders + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=devices-export.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting devices:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export devices" },
      { status: 500 }
    );
  }
}

// Apply security middleware with input validation
const securedGetDevicesHandler = withAdminReadSecurity(getDevicesHandler, {
  query: {
    ...commonSchemas.pagination,
    ...commonSchemas.deviceFilters,
    ...commonSchemas.sorting,
    export: { type: "string", enum: ["csv"] },
  },
});

// For CSV exports, use export-specific security
const exportDevicesHandler = withAdminExportSecurity(getDevicesHandler, {
  query: {
    ...commonSchemas.deviceFilters,
    ...commonSchemas.sorting,
    export: { type: "string", enum: ["csv"], required: true },
  },
});

export const GET = async (request: NextRequest) => {
  const { searchParams } = new URL(request.url);
  const isExport = searchParams.get("export") === "csv";

  if (isExport) {
    return exportDevicesHandler(request);
  } else {
    return securedGetDevicesHandler(request);
  }
};
