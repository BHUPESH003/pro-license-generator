import React from "react";

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[var(--foreground)]">
        <p>
          <strong>Last updated:</strong> June 30, 2024
        </p>
        <p>
          This is a placeholder for your Terms of Service. Please replace this
          text with your actual ToS content before launching your platform.
        </p>
        <h2>1. Acceptance of Terms</h2>
        <p>By using this platform, you agree to these Terms of Service...</p>
        <h2>2. User Responsibilities</h2>
        <p>Users must comply with all applicable laws and regulations...</p>
        <h2>3. Limitation of Liability</h2>
        <p>The platform is provided "as is" and without warranties...</p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
