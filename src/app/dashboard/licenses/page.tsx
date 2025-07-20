"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import axios from "@/lib/axios";

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const fetchLicenses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/licenses");
        setLicenses(res.data.licenses || []);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load licenses");
      } finally {
        setLoading(false);
      }
    };
    fetchLicenses();
  }, []);

  const handleCopy = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(null), 1500);
  };

  const handleActivate = async (id: string) => {
    const deviceId = prompt("Enter device name or ID to activate:");
    if (!deviceId) return;
    setActionLoading(id);
    try {
      await axios.post(`/api/licenses/${id}/activate`, { deviceId });
      setLicenses((prev) =>
        prev.map((l) =>
          l._id === id ? { ...l, deviceId, status: "active" } : l
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.error || "Activation failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (id: string) => {
    if (!window.confirm("Are you sure you want to deactivate this license?"))
      return;
    setActionLoading(id);
    try {
      await axios.post(`/api/licenses/${id}/deactivate`);
      setLicenses((prev) =>
        prev.map((l) =>
          l._id === id ? { ...l, deviceId: null, status: "inactive" } : l
        )
      );
    } catch (err: any) {
      alert(err.response?.data?.error || "Deactivation failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Licenses</h1>
      </div>
      {loading ? (
        <div className="text-center text-[var(--foreground)]/70 py-8">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center text-[var(--error)] py-8">{error}</div>
      ) : licenses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <svg
            width="48"
            height="48"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="text-[var(--border)] mb-2"
          >
            <rect x="8" y="16" width="32" height="20" rx="4" />
            <path d="M16 16V12a8 8 0 0 1 16 0v4" />
          </svg>
          <div className="text-lg font-semibold text-[var(--foreground)]/80">
            No licenses found
          </div>
          <div className="text-[var(--foreground)]/60 text-sm mb-2">
            You don't have any licenses yet. Purchase a plan to get started.
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={() => (window.location.href = "/pricing")}
          >
            View Pricing
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {licenses.map((lic) => (
            <div
              key={lic._id}
              className="bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1">
                  {lic.product || "Software License"}
                </div>
                <div className="text-sm text-[var(--foreground)]/70 mb-2">
                  License Key:
                </div>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="font-mono text-base bg-[var(--surface)] px-2 py-1 rounded select-all border border-[var(--border)] break-all">
                    {lic.licenseKey}
                  </span>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleCopy(lic.licenseKey)}
                  >
                    {copied === lic.licenseKey ? "Copied!" : "Copy"}
                  </Button>
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground)]/70">
                  <span>
                    Status:{" "}
                    <span
                      className={
                        lic.status === "active"
                          ? "text-[var(--success)] font-semibold"
                          : "text-[var(--error)] font-semibold"
                      }
                    >
                      {lic.status}
                    </span>
                  </span>
                  <span>Expires: {lic.expiration || "-"}</span>
                  <span>
                    Purchased:{" "}
                    {lic.purchaseDate
                      ? new Date(lic.purchaseDate).toLocaleDateString()
                      : "-"}
                  </span>
                  {lic.deviceId && <span>Device: {lic.deviceId}</span>}
                </div>
              </div>
              <div className="flex flex-col gap-2 min-w-[120px]">
                {lic.status === "inactive" ? (
                  <Button
                    size="sm"
                    variant="accent"
                    onClick={() => handleActivate(lic._id)}
                    disabled={actionLoading === lic._id}
                  >
                    {actionLoading === lic._id ? "Activating..." : "Activate"}
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="error"
                    onClick={() => handleDeactivate(lic._id)}
                    disabled={actionLoading === lic._id}
                  >
                    {actionLoading === lic._id
                      ? "Deactivating..."
                      : "Deactivate"}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
