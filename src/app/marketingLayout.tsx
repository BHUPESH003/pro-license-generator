"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import logo from "@/assets/mycleanone_logo.png";
import apiClient from "@/lib/axios";

const navLinks = [
  { href: "/marketing", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
];

async function checkAuth() {
  try {
    const res = await apiClient.get("/api/auth/me");
    return !!res.data.user;
  } catch (err) {
    return false;
  }
}

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const router = useRouter();

  // Check auth status on mount and when tab regains focus
  useEffect(() => {
    const updateAuth = async () => {
      try {
        const res = await apiClient.get("/api/auth/me");
        setLoggedIn(!!res.data.user);
      } catch {
        setLoggedIn(false);
      }
    };

    updateAuth(); // Initial check
    window.addEventListener("focus", updateAuth); // Recheck on window focus

    return () => window.removeEventListener("focus", updateAuth);
  }, []);
  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      localStorage.removeItem("accessToken"); // clear manually
      setLoggedIn(false);
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };
  return (
    <div className="flex flex-col min-h-screen bg-[var(--background)] text-[var(--foreground)]">
      <header className="w-full py-4 px-6 shadow bg-[var(--surface)] flex items-center justify-between rounded-b-2xl relative">
        <img
          src={logo.src}
          alt="MyCleanOne Logo"
          className="h-16 w-auto"
          style={{ maxWidth: "250px" }}
          onClick={() => router.push("/")}
        />
        <nav className="hidden sm:flex gap-2 sm:gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-1.5 rounded-lg text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
            >
              {link.label}
            </Link>
          ))}
          {loggedIn ? (
            <>
              <Link
                href="/dashboard"
                className="px-3 py-1.5 rounded-lg text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
              >
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="px-3 py-1.5 rounded-lg text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-3 py-1.5 rounded-lg text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-3 py-1.5 rounded-lg text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
              >
                Register
              </Link>
            </>
          )}
        </nav>
        <button
          className="sm:hidden flex items-center px-3 py-2 border rounded text-[var(--primary)] border-[var(--primary)] focus:outline-none"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
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
        {open && (
          <div className="absolute top-full left-0 w-full bg-[var(--surface)] shadow-lg rounded-b-2xl flex flex-col items-center z-50 sm:hidden animate-fade-in">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="w-full px-6 py-3 text-center text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium border-b border-[var(--border)] last:border-b-0"
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            {loggedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="w-full px-6 py-3 text-center text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium border-b border-[var(--border)]"
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => {
                    setOpen(false);
                    handleLogout();
                  }}
                  className="w-full px-6 py-3 text-center text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="w-full px-6 py-3 text-center text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium border-b border-[var(--border)]"
                  onClick={() => setOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="w-full px-6 py-3 text-center text-[var(--link)] hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition font-medium"
                  onClick={() => setOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </header>
      <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="w-full py-8 px-6 bg-[var(--surface)] text-center text-sm text-[var(--foreground)]/80 rounded-t-2xl mt-auto shadow-inner flex flex-col gap-4 items-center">
        <div className="flex flex-wrap gap-6 justify-center mb-2">
          <Link href="/marketing" className="hover:underline">
            Home
          </Link>
          <Link href="/pricing" className="hover:underline">
            Pricing
          </Link>
          <Link href="/docs" className="hover:underline">
            Docs
          </Link>
          <Link href="/login" className="hover:underline">
            Login
          </Link>
          <Link href="/register" className="hover:underline">
            Register
          </Link>
        </div>
        <div className="flex gap-4 justify-center mb-2">
          <a href="mailto:support@mycleanone.com" className="hover:underline">
            support@mycleanone.com
          </a>
          <span>|</span>
          <span>+91 8950798051</span>
        </div>
        <div className="flex gap-4 justify-center">
          <a
            href="https://twitter.com/yourbrand"
            target="_blank"
            rel="noopener"
            aria-label="Twitter"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="text-blue-400"
            >
              <path d="M20 3.9a8.1 8.1 0 0 1-2.36.65A4.1 4.1 0 0 0 19.45 2a8.19 8.19 0 0 1-2.6.99A4.09 4.09 0 0 0 9.85 7.03a11.6 11.6 0 0 1-8.42-4.27a4.09 4.09 0 0 0 1.27 5.46A4.07 4.07 0 0 1 .8 7.1v.05a4.09 4.09 0 0 0 3.28 4.01a4.1 4.1 0 0 1-1.85.07a4.1 4.1 0 0 0 3.82 2.84A8.22 8.22 0 0 1 0 17.54A11.6 11.6 0 0 0 6.29 19.5c7.55 0 11.68-6.26 11.68-11.68c0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 20 3.9z" />
            </svg>
          </a>
          <a
            href="https://github.com/yourbrand"
            target="_blank"
            rel="noopener"
            aria-label="GitHub"
          >
            <svg
              width="20"
              height="20"
              fill="currentColor"
              className="text-gray-700 dark:text-gray-300"
            >
              <path d="M10 .3a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34c-.45-1.15-1.1-1.46-1.1-1.46c-.9-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.89 1.52 2.34 1.08 2.91.83c.09-.65.35-1.08.63-1.33c-2.22-.25-4.56-1.11-4.56-4.95c0-1.09.39-1.98 1.03-2.68c-.1-.25-.45-1.27.1-2.65c0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.38.2 2.4.1 2.65c.64.7 1.03 1.59 1.03 2.68c0 3.85-2.34 4.7-4.57 4.95c.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 10 .3z" />
            </svg>
          </a>
        </div>
        <div className="text-xs text-[var(--foreground)]/50">
          &copy; {new Date().getFullYear()} My Clean One. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
