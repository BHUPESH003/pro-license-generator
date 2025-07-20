"use client";

import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function PricingPage() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Pricing</h1>
      <p className="text-center text-[var(--foreground)]/70 mb-10">
        Choose the plan that fits your needs. Upgrade or downgrade anytime.
      </p>
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
      {/* FAQ Section */}
      <div className="max-w-2xl mx-auto mt-12">
        <h3 className="text-xl font-bold mb-4 text-center">
          Frequently Asked Questions
        </h3>
        <div className="mb-4">
          <div className="font-semibold mb-1">
            Can I upgrade or downgrade anytime?
          </div>
          <div className="text-[var(--foreground)]/70 text-sm">
            Yes, you can change your plan at any time from your dashboard.
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">
            Is there a free trial for Pro?
          </div>
          <div className="text-[var(--foreground)]/70 text-sm">
            Yes, you can try Pro features for 14 days before being charged.
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">
            What payment methods are accepted?
          </div>
          <div className="text-[var(--foreground)]/70 text-sm">
            We accept all major credit cards via Stripe.
          </div>
        </div>
        <div className="mb-4">
          <div className="font-semibold mb-1">Can I cancel anytime?</div>
          <div className="text-[var(--foreground)]/70 text-sm">
            Absolutely! You can cancel your subscription at any time from your
            dashboard.
          </div>
        </div>
      </div>
    </div>
  );
}
