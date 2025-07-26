"use client";
import React, { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useRouter } from "next/navigation";
import apiClient, { setAccessToken } from "@/lib/axios";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await apiClient.post("/api/auth/login", { email, password });

      // Only redirect if the API confirms success
      if (res.data.success) {
        setAccessToken(res.data.accessToken);
        router.push("/dashboard");
      } else {
        // This is a fallback for unexpected responses
        setError("Login failed. Please try again.");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-8 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg">
      <h1 className="text-2xl font-bold mb-6">Login</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <div className="text-[var(--error)] text-sm">{error}</div>}
        <Button type="submit" variant="accent" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>
      <div className="mt-4 text-sm text-center">
        <a
          href="/register"
          className="text-[var(--link)] hover:underline font-medium"
        >
          Create an account
        </a>{" "}
        |{" "}
        <a
          href="/forgot-password"
          className="text-[var(--link)] hover:underline font-medium"
        >
          Forgot password?
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
