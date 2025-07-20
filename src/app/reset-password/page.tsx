"use client";
import React, { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import axios from "@/lib/axios";

export default function ResetPasswordPage() {
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
      await axios.post("/api/auth/reset-password", { token, password });
      setSuccess("Password reset successful! Redirecting to login...");
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Reset Password</h1>
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
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a
          href="/login"
          className="text-[var(--link)] hover:underline font-medium"
        >
          Back to login
        </a>
      </div>
    </div>
  );
}
