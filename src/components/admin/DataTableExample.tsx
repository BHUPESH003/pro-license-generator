"use client";

import React from "react";
import { DataTable } from "./DataTable";
import { FilterConfig, ActionConfig, DataTableColumn } from "./types";
import { createDateColumn, createStatusColumn, formatTableDate } from "./utils";

// Example data interface
interface ExampleUser {
  id: string;
  email: string;
  name: string;
  role: string;
  status: "active" | "inactive";
  lastSeenAt: string;
  createdAt: string;
}

export function DataTableExample() {
  // Define columns
  const columns: DataTableColumn[] = [
    {
      field: "email",
      headerName: "Email",
      width: 200,
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      field: "name",
      headerName: "Name",
      width: 150,
      sortable: true,
      filter: "agTextColumnFilter",
    },
    {
      field: "role",
      headerName: "Role",
      width: 120,
      sortable: true,
      filter: "agSetColumnFilter",
    },
    createStatusColumn("status", "Status", 120),
    createDateColumn("lastSeenAt", "Last Seen", 150),
    createDateColumn("createdAt", "Created", 150),
  ];

  // Define filters
  const filters: FilterConfig[] = [
    {
      field: "email",
      type: "text",
      label: "Email",
      placeholder: "Search by email...",
    },
    {
      field: "role",
      type: "select",
      label: "Role",
      options: [
        { value: "admin", label: "Admin" },
        { value: "user", label: "User" },
      ],
    },
    {
      field: "status",
      type: "select",
      label: "Status",
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
      ],
    },
    {
      field: "createdAt",
      type: "date",
      label: "Created After",
    },
  ];

  // Define actions
  const actions: ActionConfig<ExampleUser>[] = [
    {
      label: "Edit",
      onClick: (user) => {
        console.log("Edit user:", user);
      },
      variant: "primary",
    },
    {
      label: "Deactivate",
      onClick: (user) => {
        console.log("Deactivate user:", user);
      },
      variant: "error",
      condition: (user) => user.status === "active",
    },
    {
      label: "Activate",
      onClick: (user) => {
        console.log("Activate user:", user);
      },
      variant: "primary",
      condition: (user) => user.status === "inactive",
    },
  ];

  const handleRowClick = (user: ExampleUser) => {
    console.log("Row clicked:", user);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">DataTable Example</h1>

      <DataTable<ExampleUser>
        columns={columns}
        endpoint="/api/admin/users"
        filters={filters}
        actions={actions}
        exportEnabled={true}
        pageSize={25}
        defaultSort={{ field: "createdAt", direction: "desc" }}
        onRowClick={handleRowClick}
        className="bg-white"
      />
    </div>
  );
}

export default DataTableExample;
