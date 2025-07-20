"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import axios from "@/lib/axios";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [acceptedTos, setAcceptedTos] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [acceptedEula, setAcceptedEula] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    if (!acceptedTos || !acceptedPrivacy || !acceptedEula) {
      setError(
        "You must accept the Terms of Service, Privacy Policy, and EULA to register."
      );
      setLoading(false);
      return;
    }
    try {
      await axios.post("/api/auth/register", { email, password });
      setSuccess(
        "Registration successful! Please check your email to set your password."
      );
      setTimeout(() => router.push("/login"), 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Register</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptedTos}
              onChange={(e) => setAcceptedTos(e.target.checked)}
            />
            I agree to the{" "}
            <a
              href="/legal/tos"
              target="_blank"
              className="text-[var(--link)] hover:underline"
            >
              Terms of Service
            </a>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptedPrivacy}
              onChange={(e) => setAcceptedPrivacy(e.target.checked)}
            />
            I agree to the{" "}
            <a
              href="/legal/privacy"
              target="_blank"
              className="text-[var(--link)] hover:underline"
            >
              Privacy Policy
            </a>
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={acceptedEula}
              onChange={(e) => setAcceptedEula(e.target.checked)}
            />
            I agree to the{" "}
            <a
              href="/legal/eula"
              target="_blank"
              className="text-[var(--link)] hover:underline"
            >
              End User License Agreement (EULA)
            </a>
          </label>
        </div>
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
        {success && (
          <div className="text-[var(--success)] text-sm">{success}</div>
        )}
        <Button
          type="submit"
          variant="accent"
          disabled={
            loading || !acceptedTos || !acceptedPrivacy || !acceptedEula
          }
        >
          {loading
            ? "Registering..."
            : "Register & Receive Password Setup Email"}
        </Button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a
          href="/login"
          className="text-[var(--link)] hover:underline font-medium"
        >
          Already have an account? Login
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
