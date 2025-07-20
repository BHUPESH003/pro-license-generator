import React from "react";

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[var(--foreground)]">
        <p>
          <strong>Last updated:</strong> June 30, 2024
        </p>
        <p>
          This is a placeholder for your Privacy Policy. Please replace this
          text with your actual privacy content before launching your platform.
        </p>
        <h2>1. Information We Collect</h2>
        <p>
          We collect information you provide when registering, making purchases,
          or using our services...
        </p>
        <h2>2. How We Use Information</h2>
        <p>Your information is used to provide and improve our services...</p>
        <h2>3. Data Security</h2>
        <p>We implement reasonable security measures to protect your data...</p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
