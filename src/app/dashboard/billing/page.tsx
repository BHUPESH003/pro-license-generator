"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import {
  Download,
  ExternalLink,
  RefreshCw,
  CreditCard,
  Receipt,
} from "lucide-react";
import apiClient from "@/lib/axios";
import { Input } from "@/components/ui/Input";

interface SubscriptionItem {
  priceId?: string;
  product?: string;
  unit_amount?: number;
  currency?: string;
  interval?: string;
  // quantity may not always be present from API, so optional
  quantity?: number;
}

type MaybeDate = Date | string | null | undefined;

interface UserSubscriptionRaw {
  _id?: string;
  stripeSubscriptionId?: string;
  id?: string;
  status?: string | null;
  cancel_at_period_end?: boolean;
  current_period_start?: MaybeDate;
  current_period_end?: MaybeDate;
  created?: MaybeDate;
  items?: SubscriptionItem[];
  latest_invoice_url?: string | null;
}

interface UserSubscription {
  id: string;
  status: string | null;
  cancel_at_period_end: boolean;
  current_period_start: Date | null;
  current_period_end: Date | null;
  created: Date | null;
  items: SubscriptionItem[];
  latest_invoice_url: string | null;
  stripeSubscriptionId: string;
}

interface InvoiceItemRaw {
  _id?: string;
  stripeInvoiceId?: string;
  id?: string;
  status?: string | null;
  amount_due?: number;
  amount_paid?: number;
  amount_remaining?: number;
  currency?: string | null;
  number?: string | null;
  hosted_invoice_url?: string | null;
  invoice_pdf?: string | null;
  created?: MaybeDate;
  period_start?: MaybeDate;
  period_end?: MaybeDate;
  charge_status?: string | null;
  receipt_url?: string | null;
  subscription?: string | null;
}

interface InvoiceItem {
  id: string;
  status: string | null;
  amount_due: number;
  amount_paid: number;
  amount_remaining: number;
  currency: string | null;
  number: string | null;
  hosted_invoice_url: string | null;
  invoice_pdf: string | null;
  created: Date | null;
  period_start: Date | null;
  period_end: Date | null;
  charge_status: string | null;
  receipt_url: string | null;
  subscription: string | null;
}

export default function BillingPage() {
  const [loading, setLoading] = React.useState(false);
  const [subs, setSubs] = React.useState<UserSubscription[]>([]);
  const [invoices, setInvoices] = React.useState<InvoiceItem[]>([]);
  const [userId, setUserId] = React.useState<string>("");
  const [qtyDraft, setQtyDraft] = React.useState<Record<string, number>>({});

  const toDate = (d: MaybeDate): Date | null => {
    if (!d) return null;
    if (d instanceof Date) return d;
    const dt = new Date(d);
    return isNaN(dt.getTime()) ? null : dt;
  };

  const normalizeSubscription = (s: UserSubscriptionRaw): UserSubscription => ({
    id: s._id || s.stripeSubscriptionId || s.id || "unknown",
    status: s.status ?? null,
    cancel_at_period_end: Boolean(s.cancel_at_period_end),
    current_period_start: toDate(s.current_period_start),
    current_period_end: toDate(s.current_period_end),
    created: toDate(s.created),
    items: s.items || [],
    latest_invoice_url: s.latest_invoice_url ?? null,
    stripeSubscriptionId: s.stripeSubscriptionId || "",
  });

  const normalizeInvoice = (inv: InvoiceItemRaw): InvoiceItem => ({
    id: inv._id || inv.stripeInvoiceId || inv.id || "unknown",
    status: inv.status ?? null,
    amount_due: inv.amount_due ?? 0,
    amount_paid: inv.amount_paid ?? 0,
    amount_remaining: inv.amount_remaining ?? 0,
    currency: inv.currency ?? null,
    number: inv.number ?? null,
    hosted_invoice_url: inv.hosted_invoice_url ?? null,
    invoice_pdf: inv.invoice_pdf ?? null,
    created: toDate(inv.created),
    period_start: toDate(inv.period_start),
    period_end: toDate(inv.period_end),
    charge_status: inv.charge_status ?? null,
    receipt_url: inv.receipt_url ?? null,
    subscription: inv.subscription ?? null,
  });

  const loadData = React.useCallback(async () => {
    setLoading(true);
    try {
      try {
        const meRes = await apiClient.get("/api/auth/me");
        const me = meRes.data?.user || meRes.data?.data?.user || meRes.data;
        if (me?._id) setUserId(me._id);
      } catch {}

      const [s, i] = await Promise.all([
        apiClient.get("/api/user/billing/subscriptions"),
        apiClient.get("/api/user/billing/invoices"),
      ]);
      const subsRaw: UserSubscriptionRaw[] = s.data.data.subscriptions || [];
      const invRaw: InvoiceItemRaw[] = i.data.data.invoices || [];
      const normalizedSubs = subsRaw.map(normalizeSubscription);
      const normalizedInvoices = invRaw.map(normalizeInvoice);
      setSubs(normalizedSubs);
      setInvoices(normalizedInvoices);

      const draft: Record<string, number> = {};
      normalizedSubs.forEach((sub) => {
        const q = sub.items?.[0]?.quantity;
        if (typeof q === "number") draft[sub.id] = q;
      });
      setQtyDraft(draft);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    loadData();
  }, [loadData]);

 

  const onCancelAtPeriodEnd = async (subscriptionId: string) => {
    if (!userId) return;
    const ok = window.confirm(
      "Are you sure you want to cancel at period end? Your license key will be deactivated at the end of the current billing period."
    );
    if (!ok) return;
    setLoading(true);
    try {
      await apiClient.post("/api/stripe/subscription-management", {
        action: "cancel",
        subscriptionId,
        userId,
        cancelAtPeriodEnd: true,
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const onCancelNow = async (subscriptionId: string) => {
    if (!userId) return;
    const ok = window.confirm(
      "Are you sure you want to cancel now? This will immediately deactivate your license key."
    );
    if (!ok) return;
    setLoading(true);
    try {
      await apiClient.post("/api/stripe/subscription-management", {
        action: "cancel",
        subscriptionId,
        userId,
        cancelAtPeriodEnd: false,
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const onUpdateQuantity = async (subscriptionId: string) => {
    if (!userId) return;
    const newQuantity = qtyDraft[subscriptionId];
    if (!newQuantity || newQuantity < 1) return;
    setLoading(true);
    try {
      await apiClient.post("/api/stripe/subscription-management", {
        action: "update_quantity",
        subscriptionId,
        userId,
        newQuantity,
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  };

  const currency = (c?: string | null) => (c || "usd").toUpperCase();
  const money = (n?: number, c?: string | null) =>
    typeof n === "number" ? `${(n / 100).toFixed(2)} ${currency(c)}` : "-";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Billing</h1>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Your Subscription
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Subscription receipts are available from each subscription card via
            “View latest invoice”. New receipts generate automatically every
            billing cycle and will appear here.
          </p>
          {subs.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">
              No active subscriptions.
            </p>
          ) : (
            <div className="space-y-4">
              {subs.map((s) => (
                <div
                  key={s.id}
                  className="rounded border border-[var(--border)] p-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-[var(--foreground)]">
                      <div className="font-medium">
                        {s.items[0]?.product || s.items[0]?.priceId || s.id}
                      </div>
                      <div className="text-[var(--muted-foreground)]">
                        {s.items[0]?.interval || "-"} • {s.status}
                        {s.cancel_at_period_end && (
                          <span className="ml-2 text-[var(--muted-foreground)]">(cancels at period end)</span>
                        )}
                      </div>
                    </div>
                    {s.latest_invoice_url && (
                      <a
                        href={s.latest_invoice_url}
                        target="_blank"
                        className="text-sm text-blue-600 flex items-center gap-1"
                      >
                        View latest invoice <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                  <div className="mt-2 text-xs text-[var(--muted-foreground)]">
                    Period:{" "}
                    {s.current_period_start
                      ? new Date(s.current_period_start).toLocaleDateString()
                      : "-"}{" "}
                    →{" "}
                    {s.current_period_end
                      ? new Date(s.current_period_end).toLocaleDateString()
                      : "-"}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex flex-col gap-2">
                    <div className="flex gap-2 flex-wrap">
                      {s.status !== "canceled" && (
                        <>
                          <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => onCancelAtPeriodEnd(s.stripeSubscriptionId)}
                          >
                            Cancel at period end
                          </Button>
                          <Button
                            variant="secondary"
                            disabled={loading}
                            onClick={() => onCancelNow(s.stripeSubscriptionId)}
                          >
                            Cancel now
                          </Button>
                        </>
                      )}
                    </div>

                    {/* Update quantity
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={1}
                        value={qtyDraft[s.id] ?? ""}
                        placeholder="Quantity"
                        onChange={(e) =>
                          setQtyDraft((prev) => ({
                            ...prev,
                            [s.id]: Number(e.target.value),
                          }))
                        }
                        className="w-24"
                      />
                      <Button
                        variant="secondary"
                        disabled={loading || !qtyDraft[s.id]}
                        onClick={() => onUpdateQuantity(s.stripeSubscriptionId)}
                      >
                        Update quantity
                      </Button>
                    </div> */}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-[var(--foreground)] mb-2">
            Invoices & Receipts
          </h2>
          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            This section lists receipts for one-time payments. Subscription
            receipts are shown on the subscription cards above.
          </p>
          {invoices.length === 0 ? (
            <p className="text-[var(--muted-foreground)]">No invoices found.</p>
          ) : (
            <div className="space-y-3 max-h-[60vh] overflow-auto admin-scrollbar">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="rounded border border-[var(--border)] p-3 flex items-center justify-between"
                >
                  <div className="text-sm">
                    <div className="font-medium text-[var(--foreground)]">
                      {inv.number || inv.id}
                    </div>
                    <div className="text-[var(--muted-foreground)] text-xs">
                      {inv.created?.toLocaleDateString()} •{" "}
                      {money(inv.amount_paid || inv.amount_due, inv.currency)} •{" "}
                      {inv.status}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {inv.invoice_pdf && (
                      <a
                        href={inv.invoice_pdf}
                        target="_blank"
                        className="text-sm flex items-center gap-1"
                      >
                        <Download className="h-4 w-4" /> PDF
                      </a>
                    )}
                    {inv.hosted_invoice_url && (
                      <a
                        href={inv.hosted_invoice_url}
                        target="_blank"
                        className="text-sm flex items-center gap-1"
                      >
                        <Receipt className="h-4 w-4" /> View
                      </a>
                    )}
                    {inv.receipt_url && (
                      <a
                        href={inv.receipt_url}
                        target="_blank"
                        className="text-sm flex items-center gap-1"
                      >
                        <ExternalLink className="h-4 w-4" /> Receipt
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
