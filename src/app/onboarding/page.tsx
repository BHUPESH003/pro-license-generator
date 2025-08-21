"use client";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

function OnboardingInner() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const router = useRouter();

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState({
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      await apiClient.post("/api/user/profile", { token, name, phone, address });
      router.push("/login");
    } catch (e: any) {
      setError(e?.response?.data?.error || "Failed to save profile");
      router.push("/login");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-16 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg border border-[var(--border)]">
      <h1 className="text-3xl font-bold mb-2">Complete your profile</h1>
      <p className="text-sm text-[var(--foreground)]/70 mb-6">
        Optional, but helps us prefill billing details.
      </p>
      <div className="flex flex-col gap-3">
        <Input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input placeholder="Mobile number" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <Input placeholder="Address line 1" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
        <Input placeholder="Address line 2" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="City" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
          <Input placeholder="State" value={address.state} onChange={(e) => setAddress({ ...address, state: e.target.value })} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input placeholder="Postal code" value={address.postal_code} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} />
          <Input placeholder="Country (ISO code e.g. IN)" value={address.country} onChange={(e) => setAddress({ ...address, country: e.target.value })} />
        </div>
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
        <div className="flex items-center justify-between mt-4">
          <Button
            variant="secondary"
            onClick={() => router.push("/login")}
          >
            Skip for now
          </Button>
          <Button
            variant="accent"
            className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white border-transparent"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save and continue"}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto mt-16 p-8">Loading...</div>}>
      <OnboardingInner />
    </Suspense>
  );
}


