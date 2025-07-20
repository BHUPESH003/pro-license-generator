"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import axios from "@/lib/axios";

export default function CreatePasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    setLoading(true);
    try {
      await axios.post("/api/auth/create-password", { token, password });
      setSuccess("Password set successfully! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to set password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Set Your Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
        {success && (
          <div className="text-[var(--success)] text-sm">{success}</div>
        )}
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Setting..." : "Set Password"}
        </Button>
      </form>
      <div className="mt-6 text-center">
        <a
          href="/marketing"
          className="inline-block px-4 py-2 rounded-lg bg-[var(--secondary)] text-[var(--link)] font-semibold hover:bg-[var(--card)] transition"
        >
          Return to Home
        </a>
      </div>
    </div>
  );
}
