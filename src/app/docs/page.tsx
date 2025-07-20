import React from "react";
import Link from "next/link";

export default function DocsPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4">
      <h1 className="text-4xl font-bold mb-4 text-center">Documentation</h1>
      <p className="text-center text-[var(--foreground)]/70 mb-10">
        Get started with My Clean One Platform. Find guides, API docs, and
        support resources below.
      </p>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">Quick Start</h2>
        <ol className="list-decimal list-inside text-[var(--foreground)]/80 mb-4">
          <li>Register for a free account and verify your email.</li>
          <li>Set up your password using the link sent to your email.</li>
          <li>Log in and access your dashboard.</li>
          <li>Purchase a Pro plan to unlock advanced features.</li>
          <li>Manage your licenses and devices from the dashboard.</li>
        </ol>
      </section>
      <section className="mb-10">
        <h2 className="text-2xl font-semibold mb-2">API Overview</h2>
        <ul className="text-[var(--foreground)]/80 mb-4">
          <li>
            <strong>Authentication:</strong> Register, login, password reset,
            and password setup flows.
          </li>
          <li>
            <strong>Licenses:</strong> Fetch, activate, and deactivate licenses
            via the dashboard or API.
          </li>
          <li>
            <strong>Devices:</strong> Manage device activations and names.
          </li>
          <li>
            <strong>Payments:</strong> Secure Stripe integration for Pro plan
            purchases.
          </li>
        </ul>
        <p className="text-[var(--foreground)]/70 text-sm">
          For API integration or advanced use cases, contact{" "}
          <a
            href="mailto:support@mycleanone.com"
            className="text-[var(--link)] hover:underline"
          >
            support@mycleanone.com
          </a>
          .
        </p>
      </section>
      <section>
        <h2 className="text-2xl font-semibold mb-2">Need Help?</h2>
        <p className="text-[var(--foreground)]/80 mb-2">
          Check our{" "}
          <Link href="/faq" className="text-[var(--link)] hover:underline">
            FAQ
          </Link>{" "}
          or reach out to our support team for assistance.
        </p>
        <p className="text-[var(--foreground)]/70 text-sm">
          Email:{" "}
          <a
            href="mailto:support@mycleanone.com"
            className="text-[var(--link)] hover:underline"
          >
            support@mycleanone.com
          </a>
        </p>
      </section>
    </div>
  );
}
