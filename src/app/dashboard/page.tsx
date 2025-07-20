"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

const mockStats = {
  licenses: 2,
  devices: 3,
};

export default function DashboardHome() {
  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-0">
      <h1 className="text-3xl font-bold mb-2">Welcome to your Dashboard</h1>
      <p className="text-[var(--foreground)]/70 mb-8">
        Manage your licenses, devices, and downloads all in one place.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
        <div className="bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <Icon name="user" size={32} className="mb-2 text-[var(--primary)]" />
          <div className="text-2xl font-bold mb-1">{mockStats.licenses}</div>
          <div className="text-[var(--foreground)]/70 mb-2">
            Active Licenses
          </div>
          <Link href="/dashboard/licenses">
            <Button size="sm" variant="accent">
              View Licenses
            </Button>
          </Link>
        </div>
        <div className="bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center">
          <Icon name="lock" size={32} className="mb-2 text-[var(--accent)]" />
          <div className="text-2xl font-bold mb-1">{mockStats.devices}</div>
          <div className="text-[var(--foreground)]/70 mb-2">
            Registered Devices
          </div>
          <Link href="/dashboard/devices">
            <Button size="sm" variant="accent">
              Manage Devices
            </Button>
          </Link>
        </div>
      </div>
      <div className="bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center mb-8">
        <svg
          width="32"
          height="32"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          className="mb-2 text-[var(--primary)]"
        >
          <rect x="6" y="14" width="20" height="12" rx="2" />
          <path d="M12 14V10a4 4 0 0 1 8 0v4" />
        </svg>
        <div className="text-xl font-bold mb-1">Download Software</div>
        <div className="text-[var(--foreground)]/70 mb-2">
          Get the latest version for your device.
        </div>
        <Link href="/dashboard/downloads">
          <Button size="sm" variant="secondary">
            Go to Downloads
          </Button>
        </Link>
      </div>
    </div>
  );
}
