import React from "react";

export default function EulaPage() {
  return (
    <div className="max-w-3xl mx-auto py-12 px-4 bg-[var(--surface)] text-[var(--foreground)] rounded-2xl shadow-lg mt-8">
      <h1 className="text-3xl font-bold mb-6">
        End User License Agreement (EULA)
      </h1>
      <div className="prose prose-sm sm:prose lg:prose-lg max-w-none text-[var(--foreground)]">
        <p>
          <strong>Last updated:</strong> June 30, 2024
        </p>
        <p>
          This is a placeholder for your End User License Agreement. Please
          replace this text with your actual EULA content before launching your
          platform.
        </p>
        <h2>1. License Grant</h2>
        <p>
          Subject to these terms, you are granted a limited, non-exclusive
          license to use the software...
        </p>
        <h2>2. Restrictions</h2>
        <p>
          You may not reverse engineer, decompile, or redistribute the
          software...
        </p>
        <h2>3. Termination</h2>
        <p>This agreement is effective until terminated by either party...</p>
        {/* Add more sections as needed */}
      </div>
    </div>
  );
}
