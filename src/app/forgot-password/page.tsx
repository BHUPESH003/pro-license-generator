"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import axios from "@/lib/axios";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      await axios.post("/api/auth/forgot-password", { email });
      setSuccess(
        "If an account exists for this email, a password reset link has been sent."
      );
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to send reset email");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
        {success && (
          <div className="text-[var(--success)] text-sm">{success}</div>
        )}
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
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
