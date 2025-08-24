"use client";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

export default function LicensesPage() {
  const [licenses, setLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [renewPlan, setRenewPlan] = useState<Record<string, string>>({});
  const [purchasePlan, setPurchasePlan] = useState("monthly");
  const [purchaseQuantity, setPurchaseQuantity] = useState<string>("1");

  useEffect(() => {
    const fetchLicenses = async () => {
      setLoading(true);
      setError("");
      try {
        const res = await apiClient.get("/api/licenses");
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

  const startCheckout = async (
    plan: string,
    mode: "subscription" | "payment",
    licenseId?: string,
    quantityOverride?: number
  ) => {
    const res = await apiClient.post("/api/stripe/create-checkout-session", {
      plan,
      quantity: quantityOverride || 1,
      mode,
      licenseId,
    });
    window.location.href = res.data.url;
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-8 px-2 sm:px-0">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
          My Licenses
        </h1>
      </div>

      {/* Purchase licenses */}
      <div className="bg-[var(--card)] rounded-2xl shadow-lg p-6 mb-8 border border-[var(--border)]">
        <div className="text-lg font-semibold mb-4">Purchase licenses</div>
        <div className="flex items-center gap-3 flex-wrap mb-4">
          <select
            className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            value={purchasePlan}
            onChange={(e) => setPurchasePlan(e.target.value)}
          >
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
            <option value="yearly">Yearly</option>
          </select>
          <input
            type="number"
            className="w-24 px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
            value={purchaseQuantity}
            onChange={(e) => setPurchaseQuantity(e.target.value)}
            placeholder="Qty"
          />
        </div>
        <Button
          size="md"
          variant="accent"
          className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent"
          disabled={!purchaseQuantity || Number(purchaseQuantity) < 1}
          onClick={() =>
            startCheckout(
              purchasePlan,
              "subscription",
              undefined,
              Math.max(1, parseInt(purchaseQuantity || "1", 10) || 1)
            )
          }
        >
          Subscribe
        </Button>
        <Button
          size="md"
          variant="secondary"
          className="ml-2"
          disabled={!purchaseQuantity || Number(purchaseQuantity) < 1}
          onClick={() =>
            startCheckout(
              purchasePlan,
              "payment",
              undefined,
              Math.max(1, parseInt(purchaseQuantity || "1", 10) || 1)
            )
          }
        >
          Pay now
        </Button>
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
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent"
            onClick={() => (window.location.href = "/pricing")}
          >
            View Plans
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
                  <span>
                    Expires:{" "}
                    {lic.expiryDate
                      ? new Date(lic.expiryDate).toLocaleDateString()
                      : "-"}
                  </span>
                  <span>
                    Purchased:{" "}
                    {lic.purchaseDate
                      ? new Date(lic.purchaseDate).toLocaleDateString()
                      : "-"}
                  </span>
                  {lic.deviceId && <span>Device: {lic.deviceId}</span>}
                </div>
                {lic.expiryDate && new Date(lic.expiryDate) < new Date() && (
                  <div className="mt-2 inline-flex items-center gap-2 text-[var(--error)] bg-red-500/10 border border-red-200 dark:border-red-900/40 rounded-full px-3 py-1 text-xs font-semibold w-fit">
                    <span className="h-2 w-2 rounded-full bg-[var(--error)]"></span>
                    Expired
                  </div>
                )}
              </div>
              {lic.status !== "active" && (
                <div className="flex items-center gap-3">
                  <select
                    className="px-2 py-1 rounded border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground)]"
                    value={renewPlan[lic._id] || "monthly"}
                    onChange={(e) =>
                      setRenewPlan((prev) => ({
                        ...prev,
                        [lic._id]: e.target.value,
                      }))
                    }
                  >
                    <option value="monthly">Monthly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="yearly">Yearly</option>
                  </select>
                  <Button
                    size="sm"
                    variant="accent"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent"
                    onClick={() =>
                      startCheckout(
                        renewPlan[lic._id] || "monthly",
                        "payment",
                        lic._id
                      )
                    }
                  >
                    Pay now
                  </Button>
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() =>
                      startCheckout(
                        renewPlan[lic._id] || "monthly",
                        "subscription",
                        lic._id
                      )
                    }
                  >
                    Setup mandate
                  </Button>
                </div>
              )}
              {/* <div className="flex flex-col gap-2">
                <div className="text-xs text-[var(--foreground)]/60">Manage billing</div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={async () => {
                      try {
                        // In a real app you'd fetch the customer id; for now rely on portal redirect header if set by middleware or via future API
                        const res = await apiClient.post("/api/stripe/portal", undefined, {
                          headers: {
                            // placeholder; requires customer id header to be set
                            "x-stripe-customer-id": lic.stripeCustomerId || "",
                          },
                        });
                        if (res.data.url) window.location.href = res.data.url;
                        else alert("Unable to open billing portal.");
                      } catch (e) {
                        alert("Unable to open billing portal.");
                      }
                    }}
                  >
                    Open billing portal
                  </Button>
                </div>
              </div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
