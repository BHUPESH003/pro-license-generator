import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/db";
import License from "@/models/License";
import User from "@/models/User";
import Device from "@/models/Device";
import AdminAudit from "@/models/AdminAudit";

interface LicenseListItem {
  _id: string;
  licenseKey: string;
  status: "active" | "inactive";
  plan: string;
  mode?: "subscription" | "payment";
  planType?: "monthly" | "quarterly" | "yearly";
  purchaseDate: Date;
  expiryDate: Date;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  deviceCount: number;
  lastActivity?: Date;
  stripeSubscriptionId?: string;
}

interface LicenseListResponse {
  success: boolean;
  data: {
    rows: LicenseListItem[];
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export async function GET(request: NextRequest) {
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
    const sortBy = searchParams.get("sortBy") || "purchaseDate";
    const sortDir = searchParams.get("sortDir") || "desc";

    // Build filter query
    const filterQuery: any = {};

    // Status filter
    const statusFilter = searchParams.get("filter_status");
    if (statusFilter) {
      filterQuery.status = statusFilter;
    }

    // Plan filter
    const planFilter = searchParams.get("filter_plan");
    if (planFilter) {
      filterQuery.plan = planFilter;
    }

    // Mode filter
    const modeFilter = searchParams.get("filter_mode");
    if (modeFilter) {
      filterQuery.mode = modeFilter;
    }

    // Plan type filter
    const planTypeFilter = searchParams.get("filter_planType");
    if (planTypeFilter) {
      filterQuery.planType = planTypeFilter;
    }

    // License key search
    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    if (licenseKeyFilter) {
      filterQuery.licenseKey = { $regex: licenseKeyFilter, $options: "i" };
    }

    // User email search
    const userEmailFilter = searchParams.get("filter_userEmail");
    let userIds: string[] = [];
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      userIds = users.map((u: any) => (u._id as any).toString());
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

    // Date range filters
    const purchaseDateAfter = searchParams.get("filter_purchaseDateAfter");
    const purchaseDateBefore = searchParams.get("filter_purchaseDateBefore");
    if (purchaseDateAfter || purchaseDateBefore) {
      filterQuery.purchaseDate = {};
      if (purchaseDateAfter) {
        filterQuery.purchaseDate.$gte = new Date(purchaseDateAfter);
      }
      if (purchaseDateBefore) {
        filterQuery.purchaseDate.$lte = new Date(purchaseDateBefore);
      }
    }

    const expiryDateAfter = searchParams.get("filter_expiryDateAfter");
    const expiryDateBefore = searchParams.get("filter_expiryDateBefore");
    if (expiryDateAfter || expiryDateBefore) {
      filterQuery.expiryDate = {};
      if (expiryDateAfter) {
        filterQuery.expiryDate.$gte = new Date(expiryDateAfter);
      }
      if (expiryDateBefore) {
        filterQuery.expiryDate.$lte = new Date(expiryDateBefore);
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
          from: "devices",
          localField: "_id",
          foreignField: "licenseId",
          as: "devices",
          pipeline: [
            {
              $project: {
                lastActivity: 1,
                status: 1,
              },
            },
          ],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          deviceCount: { $size: "$devices" },
          lastActivity: {
            $max: "$devices.lastActivity",
          },
        },
      },
      {
        $project: {
          licenseKey: 1,
          status: 1,
          plan: 1,
          mode: 1,
          planType: 1,
          purchaseDate: 1,
          expiryDate: 1,
          stripeSubscriptionId: 1,
          user: 1,
          deviceCount: 1,
          lastActivity: 1,
        },
      },
      { $sort: sortObject },
    ];

    // Get total count
    const totalPipeline = [...pipeline, { $count: "total" }];
    const totalResult = await License.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    // Get paginated results
    const dataPipeline = [...pipeline, { $skip: skip }, { $limit: pageSize }];
    const licenses = await License.aggregate(dataPipeline);

    const totalPages = Math.ceil(total / pageSize);

    const response: LicenseListResponse = {
      success: true,
      data: {
        rows: licenses,
        page,
        pageSize,
        total,
        totalPages,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching licenses:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch licenses",
        error:
          process.env.NODE_ENV === "development"
            ? (error instanceof Error ? error.message : String(error))
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

    const statusFilter = searchParams.get("filter_status");
    if (statusFilter) filterQuery.status = statusFilter;

    const planFilter = searchParams.get("filter_plan");
    if (planFilter) filterQuery.plan = planFilter;

    const modeFilter = searchParams.get("filter_mode");
    if (modeFilter) filterQuery.mode = modeFilter;

    const planTypeFilter = searchParams.get("filter_planType");
    if (planTypeFilter) filterQuery.planType = planTypeFilter;

    const licenseKeyFilter = searchParams.get("filter_licenseKey");
    if (licenseKeyFilter) {
      filterQuery.licenseKey = { $regex: licenseKeyFilter, $options: "i" };
    }

    const userEmailFilter = searchParams.get("filter_userEmail");
    if (userEmailFilter) {
      const users = await User.find(
        { email: { $regex: userEmailFilter, $options: "i" } },
        { _id: 1 }
      );
      const userIds = users.map((u: any) => (u._id as any).toString());
      if (userIds.length === 0) {
        return new NextResponse(
          "License Key,Status,Plan,Mode,Plan Type,User Email,User Name,Device Count,Purchase Date,Expiry Date,Last Activity\n",
          {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": "attachment; filename=licenses-export.csv",
            },
          }
        );
      }
      filterQuery.userId = { $in: userIds };
    }

    // Date filters
    const purchaseDateAfter = searchParams.get("filter_purchaseDateAfter");
    const purchaseDateBefore = searchParams.get("filter_purchaseDateBefore");
    if (purchaseDateAfter || purchaseDateBefore) {
      filterQuery.purchaseDate = {};
      if (purchaseDateAfter)
        filterQuery.purchaseDate.$gte = new Date(purchaseDateAfter);
      if (purchaseDateBefore)
        filterQuery.purchaseDate.$lte = new Date(purchaseDateBefore);
    }

    const expiryDateAfter = searchParams.get("filter_expiryDateAfter");
    const expiryDateBefore = searchParams.get("filter_expiryDateBefore");
    if (expiryDateAfter || expiryDateBefore) {
      filterQuery.expiryDate = {};
      if (expiryDateAfter)
        filterQuery.expiryDate.$gte = new Date(expiryDateAfter);
      if (expiryDateBefore)
        filterQuery.expiryDate.$lte = new Date(expiryDateBefore);
    }

    // Aggregation pipeline for CSV export
    const pipeline: any[] = [
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
          from: "devices",
          localField: "_id",
          foreignField: "licenseId",
          as: "devices",
          pipeline: [{ $project: { lastActivity: 1 } }],
        },
      },
      {
        $addFields: {
          user: { $arrayElemAt: ["$user", 0] },
          deviceCount: { $size: "$devices" },
          lastActivity: { $max: "$devices.lastActivity" },
        },
      },
      { $sort: { purchaseDate: -1 } },
    ];

    const licenses = await License.aggregate(pipeline as any);

    // Generate CSV
    const csvHeaders =
      "License Key,Status,Plan,Mode,Plan Type,User Email,User Name,Device Count,Purchase Date,Expiry Date,Last Activity\n";
    const csvRows = licenses
      .map((license) => {
        const formatDate = (date: Date | null | undefined) =>
          date ? new Date(date).toISOString().split("T")[0] : "";

        return [
          license.licenseKey || "",
          license.status || "",
          license.plan || "",
          license.mode || "",
          license.planType || "",
          license.user?.email || "",
          license.user?.name || "",
          license.deviceCount || 0,
          formatDate(license.purchaseDate),
          formatDate(license.expiryDate),
          formatDate(license.lastActivity),
        ]
          .map((field) => `"${String(field).replace(/"/g, '""')}"`)
          .join(",");
      })
      .join("\n");

    return new NextResponse(csvHeaders + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=licenses-export.csv",
      },
    });
  } catch (error) {
    console.error("Error exporting licenses:", error);
    return NextResponse.json(
      { success: false, message: "Failed to export licenses" },
      { status: 500 }
    );
  }
}
