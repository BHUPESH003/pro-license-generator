"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

export default function DevicesPage() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/api/devices");
        setDevices(res.data.devices || []);
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to load devices");
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const handleRename = async (deviceId: string, currentName: string) => {
    if (!renameValue) return;
    setActionLoading(deviceId);
    try {
      await apiClient.post(`/api/devices/${deviceId}/rename`, {
        newName: renameValue,
      });
      setDevices((prev) =>
        prev.map((d) =>
          d.deviceId === deviceId ? { ...d, deviceId: renameValue } : d
        )
      );
      setRenamingId(null);
      setRenameValue("");
    } catch (err: any) {
      alert(err.response?.data?.error || "Rename failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDeactivate = async (deviceId: string) => {
    if (!window.confirm("Are you sure you want to deactivate this device?"))
      return;
    setActionLoading(deviceId);
    try {
      await apiClient.post(`/api/devices/${deviceId}/deactivate`);
      setDevices((prev) => prev.filter((d) => d.deviceId !== deviceId));
    } catch (err: any) {
      alert(err.response?.data?.error || "Deactivation failed");
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">My Devices</h1>
      </div>
      {loading ? (
        <div className="text-center text-[var(--foreground)]/70 py-8">
          Loading...
        </div>
      ) : error ? (
        <div className="text-center text-[var(--error)] py-8">{error}</div>
      ) : devices.length === 0 ? (
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
            No devices registered
          </div>
          <div className="text-[var(--foreground)]/60 text-sm mb-2">
            You don't have any devices registered yet. Activate a license to
            register a device.
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={() => (window.location.href = "/dashboard/licenses")}
          >
            View Licenses
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {devices.map((device) => (
            <div
              key={device.deviceId}
              className="bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
            >
              <div className="flex-1">
                <div className="font-semibold text-lg mb-1 flex items-center gap-2">
                  {renamingId === device.deviceId ? (
                    <>
                      <input
                        className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] mr-2"
                        value={renameValue}
                        onChange={(e) => setRenameValue(e.target.value)}
                        autoFocus
                      />
                      <Button
                        size="sm"
                        variant="accent"
                        onClick={() =>
                          handleRename(device.deviceId, device.deviceId)
                        }
                        disabled={actionLoading === device.deviceId}
                      >
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => setRenamingId(null)}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      {device.deviceId}
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => {
                          setRenamingId(device.deviceId);
                          setRenameValue(device.deviceId);
                        }}
                      >
                        Rename
                      </Button>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-[var(--foreground)]/70 mt-2">
                  <span>
                    License:{" "}
                    <span className="font-mono bg-[var(--surface)] px-2 py-1 rounded border border-[var(--border)]">
                      {device.licenseKey}
                    </span>
                  </span>
                  <span>
                    Status:{" "}
                    <span
                      className={
                        device.status === "active"
                          ? "text-[var(--success)] font-semibold"
                          : "text-[var(--error)] font-semibold"
                      }
                    >
                      {device.status}
                    </span>
                  </span>
                  <span>
                    Purchased:{" "}
                    {device.purchaseDate
                      ? new Date(device.purchaseDate).toLocaleDateString()
                      : "-"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 sm:mt-0">
                <Button
                  size="sm"
                  variant="error"
                  onClick={() => handleDeactivate(device.deviceId)}
                  disabled={actionLoading === device.deviceId}
                >
                  {actionLoading === device.deviceId
                    ? "Deactivating..."
                    : "Deactivate"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
