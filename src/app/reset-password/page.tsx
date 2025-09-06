"use client";
import React, { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import apiClient from "@/lib/axios";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [strength, setStrength] = useState<string>("");
  const router = useRouter();

  const checkStrength = (pwd: string) => {
    const rules = [
      /[a-z]/.test(pwd),
      /[A-Z]/.test(pwd),
      /\d/.test(pwd),
      /[^A-Za-z0-9]/.test(pwd),
      pwd.length >= 8,
    ];
    const score = rules.filter(Boolean).length;
    if (pwd.length === 0) return "";
    if (score <= 2) return "weak";
    if (score === 3 || score === 4) return "medium";
    return "strong";
  };

  const validatePolicy = (pwd: string) => {
    return (
      /[a-z]/.test(pwd) &&
      /[A-Z]/.test(pwd) &&
      /\d/.test(pwd) &&
      /[^A-Za-z0-9]/.test(pwd) &&
      pwd.length >= 8
    );
  };

  const onPasswordChange = (v: string) => {
    setPassword(v);
    setStrength(checkStrength(v));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    if (!password || password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (!validatePolicy(password)) {
      setError(
        "Password must be at least 8 chars with upper, lower, number, and symbol."
      );
      return;
    }
    setLoading(true);
    try {
      await apiClient.post("/api/auth/reset-password", { token, password });
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
          onChange={(e) => onPasswordChange(e.target.value)}
          required
        />
        {password.length > 0 && (
          <div className="text-xs mt-1">
            <span
              className={
                strength === "strong"
                  ? "text-green-600"
                  : strength === "medium"
                  ? "text-yellow-600"
                  : "text-red-600"
              }
            >
              Strength: {strength}
            </span>
          </div>
        )}
        <Input
          type="password"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
        />
        <div className="text-xs text-[var(--foreground)]/70">
          Must include: 8+ chars, upper, lower, number, symbol.
        </div>
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

export default function ResetPasswordPage() {
  return (
    <Suspense>
      <ResetPasswordForm />
    </Suspense>
  );
}
