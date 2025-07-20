"use client";
import React, { useState } from "react";
import ReduxProvider from "@/store/provider";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assets/mycleanone_logo.png";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/licenses", label: "My Licenses" },
  { href: "/dashboard/devices", label: "My Devices" },
  { href: "/dashboard/downloads", label: "Downloads" },
];

async function handleLogout(router: any) {
  await fetch("/api/auth/logout", { method: "POST" });
  router.push("/login");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  return (
    <ReduxProvider>
      <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
        {/* Topbar */}
        <header className="w-full flex items-center justify-between px-6 py-4 bg-[var(--surface)] shadow-md z-10">
          <div className="flex items-center gap-3">
            <button
              className="md:hidden mr-2"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Open sidebar"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            <img
              src={logo.src}
              alt="MyCleanOne Logo"
              className="h-14 w-auto"
              style={{ maxWidth: "250px" }}
            />
            {/* <span className="font-bold text-xl tracking-tight text-center">
              My Clean One
            </span> */}
          </div>
        </header>
        <div className="flex flex-1 min-h-0">
          {/* Sidebar for md+ */}
          <aside className="hidden md:flex flex-col w-64 bg-[var(--card)] border-r border-[var(--border)] py-8 px-4 gap-2">
            <nav className="flex flex-col gap-2">
              {sidebarLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 rounded-lg font-medium text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition"
                >
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => handleLogout(router)}
                className="px-3 py-2 rounded-lg font-medium text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition text-left"
              >
                Logout
              </button>
            </nav>
          </aside>
          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-40 flex md:hidden">
              <div
                className="bg-black/40 w-full h-full"
                onClick={() => setSidebarOpen(false)}
              />
              <aside className="w-64 bg-[var(--card)] border-r border-[var(--border)] py-8 px-4 gap-2 flex flex-col h-full shadow-2xl animate-slide-in-left">
                <button
                  className="self-end mb-4"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <svg
                    className="h-6 w-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
                <nav className="flex flex-col gap-2">
                  {sidebarLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="px-3 py-2 rounded-lg font-medium text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition"
                      onClick={() => setSidebarOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                  <button
                    onClick={() => {
                      setSidebarOpen(false);
                      handleLogout(router);
                    }}
                    className="px-3 py-2 rounded-lg font-medium text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition text-left"
                  >
                    Logout
                  </button>
                </nav>
              </aside>
            </div>
          )}
          {/* Main content */}
          <main className="flex-1 bg-[var(--background)] p-4 sm:p-8 overflow-y-auto min-h-0 flex flex-col">
            {children}
          </main>
        </div>
        {/* Minimal footer */}
        <footer className="w-full py-4 px-6 bg-[var(--surface)] text-center text-xs text-[var(--foreground)]/60 mt-auto border-t border-[var(--border)]">
          &copy; {new Date().getFullYear()} My Clean One. Need help?{" "}
          <a
            href="mailto:support@mycleanone.com"
            className="text-[var(--link)] hover:underline"
          >
            Contact Support
          </a>
        </footer>
      </div>
    </ReduxProvider>
  );
}
