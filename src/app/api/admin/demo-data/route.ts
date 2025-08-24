import { NextRequest, NextResponse } from "next/server";
import { withAdminReadSecurity } from "@/lib/securityMiddleware";

// Demo data generator
function generateDemoData(count: number = 1000) {
  const statuses = ["active", "inactive", "pending"];
  const roles = ["admin", "user", "moderator"];
  const names = [
    "John Doe",
    "Jane Smith",
    "Bob Johnson",
    "Alice Brown",
    "Charlie Wilson",
    "Diana Davis",
    "Eve Miller",
    "Frank Garcia",
    "Grace Lee",
    "Henry Taylor",
    "Ivy Anderson",
    "Jack Thomas",
    "Kate Jackson",
    "Liam White",
    "Mia Harris",
    "Noah Martin",
    "Olivia Thompson",
    "Paul Garcia",
    "Quinn Rodriguez",
    "Ruby Lewis",
  ];

  const data = [];
  for (let i = 1; i <= count; i++) {
    const name = names[Math.floor(Math.random() * names.length)];
    const email = `${name.toLowerCase().replace(" ", ".")}${i}@example.com`;
    const createdAt = new Date(
      Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000
    );
    const lastLogin =
      Math.random() > 0.3
        ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
        : null;

    data.push({
      id: i,
      name: `${name} ${i}`,
      email,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      role: roles[Math.floor(Math.random() * roles.length)],
      score: Math.floor(Math.random() * 100),
      isVerified: Math.random() > 0.3,
      lastLogin: lastLogin?.toISOString(),
      createdAt: createdAt.toISOString(),
    });
  }

  return data;
}

async function getDemoDataHandler(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = Math.min(
    parseInt(searchParams.get("pageSize") || "25"),
    100
  );
  const sortBy = searchParams.get("sortBy") || "createdAt";
  const sortDir = searchParams.get("sortDir") || "desc";

  // Generate demo data
  let data = generateDemoData(1000);

  // Apply filters
  const nameFilter = searchParams.get("filter_name");
  if (nameFilter) {
    data = data.filter((item) =>
      item.name.toLowerCase().includes(nameFilter.toLowerCase())
    );
  }

  const emailFilter = searchParams.get("filter_email");
  if (emailFilter) {
    data = data.filter((item) =>
      item.email.toLowerCase().includes(emailFilter.toLowerCase())
    );
  }

  const statusFilter = searchParams.get("filter_status");
  if (statusFilter) {
    data = data.filter((item) => item.status === statusFilter);
  }

  const roleFilter = searchParams.get("filter_role");
  if (roleFilter) {
    data = data.filter((item) => item.role === roleFilter);
  }

  const scoreFilter = searchParams.get("filter_score");
  if (scoreFilter) {
    const minScore = parseInt(scoreFilter);
    data = data.filter((item) => item.score >= minScore);
  }

  const createdAfter = searchParams.get("filter_createdAfter");
  if (createdAfter) {
    const afterDate = new Date(createdAfter);
    data = data.filter((item) => new Date(item.createdAt) >= afterDate);
  }

  const createdBefore = searchParams.get("filter_createdBefore");
  if (createdBefore) {
    const beforeDate = new Date(createdBefore);
    data = data.filter((item) => new Date(item.createdAt) <= beforeDate);
  }

  // Apply global search
  const search = searchParams.get("search");
  if (search) {
    const searchLower = search.toLowerCase();
    data = data.filter(
      (item) =>
        item.name.toLowerCase().includes(searchLower) ||
        item.email.toLowerCase().includes(searchLower) ||
        item.status.toLowerCase().includes(searchLower) ||
        item.role.toLowerCase().includes(searchLower)
    );
  }

  // Handle CSV export
  if (searchParams.get("export") === "csv") {
    const csvHeaders =
      "ID,Name,Email,Status,Role,Score,Verified,Last Login,Created At\n";
    const csvRows = data
      .map((item) => {
        const lastLogin = item.lastLogin
          ? new Date(item.lastLogin).toISOString()
          : "";
        const createdAt = new Date(item.createdAt).toISOString();
        return `${item.id},"${item.name}","${item.email}","${item.status}","${item.role}",${item.score},${item.isVerified},"${lastLogin}","${createdAt}"`;
      })
      .join("\n");

    return new NextResponse(csvHeaders + csvRows, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": "attachment; filename=demo-data-export.csv",
      },
    });
  }

  // Sort data
  data.sort((a, b) => {
    let aVal = a[sortBy as keyof typeof a];
    let bVal = b[sortBy as keyof typeof b];

    // Handle date strings
    if (sortBy === "createdAt" || sortBy === "lastLogin") {
      aVal = aVal ? new Date(aVal as string).getTime() : 0;
      bVal = bVal ? new Date(bVal as string).getTime() : 0;
    }

    // Handle numbers
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "desc" ? bVal - aVal : aVal - bVal;
    }

    // Handle strings
    const aStr = String(aVal || "").toLowerCase();
    const bStr = String(bVal || "").toLowerCase();

    if (sortDir === "desc") {
      return bStr.localeCompare(aStr);
    } else {
      return aStr.localeCompare(bStr);
    }
  });

  // Calculate pagination
  const total = data.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  // Simulate network delay for demo purposes
  await new Promise((resolve) =>
    setTimeout(resolve, Math.random() * 500 + 200)
  );

  return NextResponse.json({
    success: true,
    data: {
      rows: paginatedData,
      page,
      pageSize,
      total,
      totalPages,
    },
  });
}

// Apply security middleware
const securedHandler = withAdminReadSecurity(getDemoDataHandler, {
  query: {
    page: { type: "string" },
    pageSize: { type: "string" },
    sortBy: { type: "string" },
    sortDir: { type: "string", enum: ["asc", "desc"] },
    search: { type: "string" },
    export: { type: "string", enum: ["csv"] },
    // Filter parameters
    filter_name: { type: "string" },
    filter_email: { type: "string" },
    filter_status: { type: "string", enum: ["active", "inactive", "pending"] },
    filter_role: { type: "string", enum: ["admin", "user", "moderator"] },
    filter_score: { type: "string" },
    filter_createdAfter: { type: "string" },
    filter_createdBefore: { type: "string" },
  },
});

export const GET = securedHandler;
