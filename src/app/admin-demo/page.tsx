"use client";

import React from "react";
import { DataTableExample } from "@/components/admin/DataTableExample";

export default function AdminDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Admin DataTable Demo
        </h1>
        <DataTableExample />
      </div>
    </div>
  );
}
