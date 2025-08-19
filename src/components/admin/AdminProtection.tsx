"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Shield, AlertTriangle, Loader2 } from "lucide-react";

interface AdminProtectionProps {
  children: React.ReactNode;
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
}

export function AdminProtection({ children }: AdminProtectionProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const verifyAdminAccess = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          router.push("/login");
          return;
        }

        // Verify token and admin role with the server
        const response = await fetch("/api/auth/verify-admin", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (response.status === 401) {
          // Token expired or invalid
          localStorage.removeItem("accessToken");
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          // User doesn't have admin role
          setError("Access denied. Admin privileges required.");
          setIsLoading(false);
          return;
        }

        if (!response.ok) {
          throw new Error("Failed to verify admin access");
        }

        const data = await response.json();

        if (data.success && data.user?.role === "admin") {
          setIsAuthorized(true);
        } else {
          setError("Access denied. Admin privileges required.");
        }
      } catch (error) {
        console.error("Admin verification error:", error);
        setError("Failed to verify admin access. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    verifyAdminAccess();
  }, [router]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Verifying Admin Access
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            Please wait while we verify your permissions...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="max-w-md mx-auto text-center p-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/50 dark:border-slate-700/50">
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-full">
              <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Access Denied
          </h2>
          <p className="text-slate-600 dark:text-slate-400 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg transition-colors"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => router.push("/login")}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Login Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Authorized - render children
  if (isAuthorized) {
    return <>{children}</>;
  }

  // Fallback
  return null;
}

export default AdminProtection;
