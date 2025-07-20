"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import axios from "@/lib/axios";

export default function MarketingLandingPage() {
  const [loading, setLoading] = useState(false);

  const handleBuyPro = async () => {
    setLoading(true);
    try {
      const res = await axios.post("/api/stripe/create-checkout-session", {
        plan: "pro",
      });
      window.location.href = res.data.url;
    } catch {
      alert("Failed to start checkout. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 w-full">
      {/* Hero Section */}
      <section className="max-w-2xl text-center mb-16">
        <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
          Modern Software Licensing Made Simple
        </h1>
        <p className="text-lg text-[var(--foreground)]/80 dark:text-[var(--foreground)]/90 mb-8">
          Secure, scalable, and user-friendly licensing, authentication, and
          payments for your SaaS or downloadable software.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/register">
            <Button variant="accent" size="lg">
              Start Free Trial
            </Button>
          </Link>
          <Link href="/login">
            <Button variant="secondary" size="lg">
              Login
            </Button>
          </Link>
        </div>
      </section>
      {/* Features Section */}
      <section className="max-w-4xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] shadow-lg">
          <Icon name="lock" size={32} className="mb-2 text-[var(--primary)]" />
          <h3 className="font-semibold text-lg mb-1">Secure Authentication</h3>
          <p className="text-[var(--foreground)]/70 text-sm">
            Robust email-based onboarding, password reset, and JWT-protected
            dashboard.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] shadow-lg">
          <Icon name="user" size={32} className="mb-2 text-[var(--accent)]" />
          <h3 className="font-semibold text-lg mb-1">
            Easy License Management
          </h3>
          <p className="text-[var(--foreground)]/70 text-sm">
            Automated license key generation, device management, and user
            dashboard.
          </p>
        </div>
        <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-[var(--card)] shadow-lg">
          <svg
            width="32"
            height="32"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            className="mb-2 text-[var(--primary)]"
          >
            <rect x="6" y="14" width="20" height="12" rx="2" />
            <path d="M12 14V10a4 4 0 0 1 8 0v4" />
          </svg>
          <h3 className="font-semibold text-lg mb-1">Stripe Payments</h3>
          <p className="text-[var(--foreground)]/70 text-sm">
            Seamless, secure checkout and instant license delivery with Stripe
            integration.
          </p>
        </div>
      </section>
      {/* Use Cases Section */}
      <section className="max-w-4xl w-full mb-16">
        <h2 className="text-2xl font-bold text-center mb-6">
          Use Cases & Industry Applications
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
          <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
            <h4 className="font-semibold mb-2">SaaS Platforms</h4>
            <p className="text-[var(--foreground)]/70 text-sm">
              Manage user subscriptions, trial periods, and secure access to
              your cloud-based software.
            </p>
          </div>
          <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
            <h4 className="font-semibold mb-2">Downloadable Software</h4>
            <p className="text-[var(--foreground)]/70 text-sm">
              Distribute license keys, control activations, and protect your
              desktop or mobile apps.
            </p>
          </div>
          <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
            <h4 className="font-semibold mb-2">Agencies & Consultancies</h4>
            <p className="text-[var(--foreground)]/70 text-sm">
              Offer client-specific licensing, device management, and easy
              onboarding for B2B solutions.
            </p>
          </div>
          <div className="bg-[var(--card)] p-6 rounded-2xl shadow-lg">
            <h4 className="font-semibold mb-2">Indie Developers</h4>
            <p className="text-[var(--foreground)]/70 text-sm">
              Monetize your side projects with secure payments and instant
              license delivery.
            </p>
          </div>
        </div>
      </section>
      {/* Pricing Section */}
      <section className="max-w-3xl w-full mb-16">
        <h2 className="text-2xl font-bold text-center mb-6">Pricing</h2>
        <div className="flex flex-col lg:flex-row gap-8 justify-center">
          <div className="flex-1 bg-[var(--card)] p-8 rounded-2xl shadow-lg text-center border border-[var(--border)]">
            <h3 className="font-semibold text-xl mb-2">Monthly</h3>
            <p className="text-3xl font-bold mb-2">
              $19<span className="text-base font-normal">/mo</span>
            </p>
            <ul className="text-[var(--foreground)]/70 text-sm mb-4 space-y-1">
              <li>Up to 10 devices</li>
              <li>Email-based authentication</li>
              <li>Basic dashboard</li>
            </ul>
            <a href="/dashboard/downloads">
              <Button size="md">Get Started</Button>
            </a>
          </div>
          <div className="flex-1 bg-[var(--card)] p-8 rounded-2xl shadow-lg text-center border-2 border-[var(--accent)]">
            <h3 className="font-semibold text-xl mb-2">Quarterly</h3>
            <p className="text-3xl font-bold mb-2">
              $49<span className="text-base font-normal">/qtr</span>
            </p>
            <ul className="text-[var(--foreground)]/70 text-sm mb-4 space-y-1">
              <li>Up to 10 devices</li>
              <li>Email-based authentication</li>
              <li>Basic dashboard</li>
            </ul>
            <a href="/dashboard/downloads">
              <Button size="md">Get Started</Button>
            </a>
          </div>
          <div className="flex-1 bg-[var(--card)] p-8 rounded-2xl shadow-lg text-center border-2 border-[var(--primary)]">
            <h3 className="font-semibold text-xl mb-2">Yearly</h3>
            <p className="text-3xl font-bold mb-2">
              $179<span className="text-base font-normal">/yr</span>
            </p>
            <ul className="text-[var(--foreground)]/70 text-sm mb-4 space-y-1">
              <li>Up to 10 devices</li>
              <li>Email-based authentication</li>
              <li>Basic dashboard</li>
            </ul>
            <a href="/dashboard/downloads">
              <Button size="md">Get Started</Button>
            </a>
          </div>
        </div>
      </section>
      {/* Testimonials Section */}
      <section className="max-w-3xl w-full mb-16">
        <h2 className="text-2xl font-bold text-center mb-6">
          What Our Users Say
        </h2>
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="flex-1 bg-[var(--card)] p-6 rounded-2xl shadow-lg text-center">
            <p className="italic mb-2">
              “The onboarding was seamless and the dashboard is super
              intuitive!”
            </p>
            <span className="text-sm text-[var(--foreground)]/60">
              — SaaS Founder
            </span>
          </div>
          <div className="flex-1 bg-[var(--card)] p-6 rounded-2xl shadow-lg text-center">
            <p className="italic mb-2">
              “Stripe payments and license delivery just work. Highly
              recommended.”
            </p>
            <span className="text-sm text-[var(--foreground)]/60">
              — Indie Developer
            </span>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="text-center mb-8">
        <Link href="/register">
          <Button variant="accent" size="lg">
            Get Started
          </Button>
        </Link>
      </section>
    </div>
  );
}
