"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

const downloads = [
  {
    os: "Windows",
    version: "2.1.0",
    date: "2024-06-30",
    url: "/downloads/proapp-windows.exe",
  },
  {
    os: "macOS",
    version: "2.1.0",
    date: "2024-06-30",
    url: "/downloads/proapp-macos.dmg",
  },
  {
    os: "Linux",
    version: "2.1.0",
    date: "2024-06-30",
    url: "/downloads/proapp-linux.AppImage",
  },
];

function detectOS() {
  if (typeof window === "undefined") return null;
  const { userAgent } = window.navigator;
  if (/Windows/i.test(userAgent)) return "Windows";
  if (/Mac/i.test(userAgent)) return "macOS";
  if (/Linux/i.test(userAgent)) return "Linux";
  return null;
}

export default function DownloadsPage() {
  const [os, setOS] = useState<string | null>(null);
  const [hasLicense, setHasLicense] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  // Purchase options are intentionally removed from downloads page

  useEffect(() => {
    setOS(detectOS());
    const fetchLicenses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/api/licenses");
        const licenses = res.data.licenses || [];
        setHasLicense(licenses.some((l: any) => l.status === "active"));
      } catch (err: any) {
        setError(err.response?.data?.error || "Failed to check license");
        setHasLicense(false);
      } finally {
        setLoading(false);
      }
    };
    fetchLicenses();
  }, []);

  // Note: No buy/plan selection on downloads page

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-2 sm:px-0">
      <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
        Download Software
      </h1>
      <p className="text-xl text-slate-600 dark:text-slate-300 mb-10 leading-relaxed">
        Get the latest version of ProApp for your operating system with enhanced
        security features and improved performance.
      </p>
      {loading ? (
        <div className="text-center text-slate-600 dark:text-slate-300 py-12">
          <div className="text-lg font-medium">Checking license status...</div>
          <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Please wait a moment
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-red-600 dark:text-red-400 py-12">
          <div className="text-lg font-semibold">Error Occurred</div>
          <div className="text-base mt-2">{error}</div>
        </div>
      ) : hasLicense ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {downloads.map((d) => (
            <div
              key={d.os}
              className={`bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-2 ${
                os === d.os ? "border-[var(--accent)]" : "border-transparent"
              }`}
            >
              <div className="text-2xl font-bold mb-3 text-slate-900 dark:text-white">
                {d.os}
              </div>
              <div className="text-base text-slate-600 dark:text-slate-300 mb-2 font-medium">
                Version {d.version}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mb-6">
                Released {d.date}
              </div>
              <a href={d.url} download>
                <Button
                  variant={os === d.os ? "accent" : "secondary"}
                  size="md"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent"
                >
                  {os === d.os ? "Download Now" : "Download"}
                </Button>
              </a>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-6">
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
          <div className="text-2xl font-bold text-slate-900 dark:text-white">
            License Required
          </div>
          <div className="text-lg text-slate-600 dark:text-slate-300 text-center max-w-md">
            You need an active license to download the software.
          </div>
          <a href="/dashboard/licenses">
            <Button
              variant="accent"
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent text-lg font-semibold px-8 py-3"
            >
              Go to Licenses
            </Button>
          </a>
        </div>
      )}
      <div className="mt-12 text-center">
        <div className="text-lg text-slate-600 dark:text-slate-300 mb-2">
          Need help with installation?
        </div>
        <a
          href="/docs"
          className="text-[var(--link)] hover:underline text-lg font-medium"
        >
          View our comprehensive installation guide
        </a>
      </div>
    </div>
  );
}
