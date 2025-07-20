"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import axios from "@/lib/axios";

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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [plan, setPlan] = useState("monthly");

  useEffect(() => {
    setOS(detectOS());
    const fetchLicenses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await axios.get("/api/licenses");
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

  const handleBuy = async () => {
    setCheckoutLoading(true);
    try {
      const res = await axios.post("/api/stripe/create-checkout-session", {
        plan,
        quantity,
      });
      window.location.href = res.data.url;
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setCheckoutLoading(false);
    }
  };

  const plans = [
    { value: "monthly", label: "Monthly", description: "Billed every month" },
    {
      value: "quarterly",
      label: "Quarterly",
      description: "Billed every 3 months",
    },
    { value: "yearly", label: "Yearly", description: "Billed every year" },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto py-8 px-2 sm:px-0">
      <h1 className="text-2xl font-bold mb-4">Download Software</h1>
      <p className="text-[var(--foreground)]/70 mb-8">
        Get the latest version of ProApp for your operating system.
      </p>
      {loading ? (
        <div className="text-center text-[var(--foreground)]/70 py-8">
          Checking license...
        </div>
      ) : error ? (
        <div className="text-center text-[var(--error)] py-8">{error}</div>
      ) : hasLicense ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {downloads.map((d) => (
            <div
              key={d.os}
              className={`bg-[var(--card)] rounded-2xl shadow-lg p-6 flex flex-col items-center text-center border-2 ${
                os === d.os ? "border-[var(--accent)]" : "border-transparent"
              }`}
            >
              <div className="text-lg font-semibold mb-2">{d.os}</div>
              <div className="text-sm text-[var(--foreground)]/70 mb-2">
                Version: {d.version}
              </div>
              <div className="text-xs text-[var(--foreground)]/50 mb-4">
                Released: {d.date}
              </div>
              <a href={d.url} download>
                <Button
                  variant={os === d.os ? "accent" : "secondary"}
                  size="md"
                >
                  {os === d.os ? "Recommended" : "Download"}
                </Button>
              </a>
            </div>
          ))}
        </div>
      ) : (
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
            No active license found
          </div>
          <div className="text-[var(--foreground)]/60 text-sm mb-2">
            You need an active license to download the software.
          </div>
          {!hasLicense && (
            <div className="flex flex-col items-center gap-4 mb-4">
              <div className="flex gap-4">
                {plans.map(
                  (p: {
                    value: string;
                    label: string;
                    description: string;
                  }) => (
                    <label
                      key={p.value}
                      className={`px-4 py-2 rounded-lg border cursor-pointer ${
                        plan === p.value
                          ? "bg-[var(--accent)] text-white"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)]"
                      }`}
                    >
                      <input
                        type="radio"
                        name="plan"
                        value={p.value}
                        checked={plan === p.value}
                        onChange={() => setPlan(p.value)}
                        className="mr-2 hidden"
                      />
                      <span className="font-semibold">{p.label}</span>
                      <span className="block text-xs text-[var(--foreground)]/70">
                        {p.description}
                      </span>
                    </label>
                  )
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm">Number of devices:</span>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Math.min(10, Number(e.target.value))))
              }
              className="w-16 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            />
          </div>
          <Button
            variant="accent"
            size="md"
            onClick={handleBuy}
            disabled={checkoutLoading}
          >
            {checkoutLoading
              ? "Redirecting..."
              : `Buy Now (${quantity} Device${quantity > 1 ? "s" : ""})`}
          </Button>
        </div>
      )}
      <div className="mt-8 text-sm text-[var(--foreground)]/60 text-center">
        <span>
          Need help? See the{" "}
          <a href="/docs" className="text-[var(--link)] hover:underline">
            installation guide
          </a>
          .
        </span>
      </div>
    </div>
  );
}
