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
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [quantity, setQuantity] = useState<number>(1);
  const [plan, setPlan] = useState("monthly");

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

  const handleBuy = async () => {
    setCheckoutLoading(true);
    try {
      const res = await apiClient.post("/api/stripe/create-checkout-session", {
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
            You need an active license to download the software. Choose a plan
            that fits your needs and get started today.
          </div>
          {!hasLicense && (
            <div className="flex flex-col items-center gap-6 mb-6">
              <div className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                Select Your Plan
              </div>
              <div className="flex gap-4">
                {plans.map(
                  (p: {
                    value: string;
                    label: string;
                    description: string;
                  }) => (
                    <label
                      key={p.value}
                      className={`px-6 py-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                        plan === p.value
                          ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-lg"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--foreground)] hover:border-[var(--accent)]"
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
                      <div className="font-bold text-lg mb-1">{p.label}</div>
                      <div className="text-sm opacity-80">{p.description}</div>
                    </label>
                  )
                )}
              </div>
            </div>
          )}
          <div className="flex items-center gap-3 mb-4">
            <span className="text-lg font-medium text-slate-700 dark:text-slate-300">
              Number of devices:
            </span>
            <input
              type="number"
              min={1}
              max={10}
              value={quantity}
              onChange={(e) => {
                const value = e.target.value;
                // Allow empty string or valid number input
                if (value === "" || /^[0-9\b]+$/.test(value)) {
                  setQuantity(Number(value));
                }
              }}
              onBlur={() => {
                const numericValue = Math.max(
                  1,
                  Math.min(10, Number(quantity))
                );
                setQuantity(numericValue);
              }}
              className="w-20 px-3 py-2 rounded-lg border-2 border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)] text-center font-semibold text-lg focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
            />
            <span className="text-lg text-slate-600 dark:text-slate-400 font-medium">
              device{quantity > 1 ? "s" : ""}
            </span>
          </div>
          <Button
            variant="accent"
            size="lg"
            onClick={handleBuy}
            disabled={checkoutLoading}
            className="text-lg font-semibold px-8 py-3"
          >
            {checkoutLoading
              ? "Redirecting to checkout..."
              : `Purchase License (${quantity} Device${
                  quantity > 1 ? "s" : ""
                })`}
          </Button>
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
