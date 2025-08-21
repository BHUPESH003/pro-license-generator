"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import apiClient from "@/lib/axios";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  Key,
  Smartphone,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
  Activity,
  FileText,
} from "lucide-react";
import logo from "@/assets/mycleanone_logo.png";

const adminSidebarLinks = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
    description: "Overview and metrics",
  },
  {
    href: "/admin/licenses",
    label: "Licenses",
    icon: Key,
    description: "License management",
  },
  {
    href: "/admin/devices",
    label: "Devices",
    icon: Smartphone,
    description: "Device management",
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
    description: "User management",
  },
  {
    href: "/admin/telemetry",
    label: "Telemetry",
    icon: Activity,
    description: "Telemetry explorer",
  },
  {
    href: "/admin/reports",
    label: "Reports",
    icon: BarChart3,
    description: "Business reports",
  },
  {
    href: "/admin/audit",
    label: "Audit Trail",
    icon: Shield,
    description: "Audit logging",
  },
  {
    href: "/admin/settings",
    label: "Settings",
    icon: Settings,
    description: "System settings",
  },
];

async function handleLogout(router: any) {
  try {
    await apiClient.post("/api/auth/logout");
    localStorage.removeItem("accessToken");
    router.push("/login");
  } catch (error) {
    console.error("Logout error:", error);
    // Force logout even if API call fails
    localStorage.removeItem("accessToken");
    router.push("/login");
  }
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<{
    email?: string;
    role?: string;
  } | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  // Get user info from token or API
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        // Decode JWT to get user info (basic implementation)
        const payload = JSON.parse(atob(token.split(".")[1]));
        setUserInfo({ email: payload.email, role: payload.role });
      } catch (error) {
        console.error("Error decoding token:", error);
      }
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Admin Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full flex items-center justify-between px-6 py-4 bg-white/90 dark:bg-slate-800/90 backdrop-blur-xl shadow-lg border-b border-slate-200/50 dark:border-slate-700/50 z-20 sticky top-0"
      >
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="lg:hidden mr-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Open sidebar"
          >
            <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
          </motion.button>

          <div className="flex items-center gap-3">
            <img
              src={logo.src}
              alt="MyCleanOne Logo"
              className="h-10 w-auto"
              style={{ maxWidth: "180px" }}
            />
            <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
            <div className="hidden sm:flex items-center gap-2">
              <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />
              <span className="text-sm text-slate-700 dark:text-slate-300 font-semibold">
                Admin Panel
              </span>
            </div>
          </div>
        </div>

        {/* User Info & Actions */}
        <div className="flex items-center gap-4">
          <div className="hidden md:flex flex-col items-end">
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {userInfo?.email || "Admin User"}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 capitalize">
              {userInfo?.role || "admin"}
            </span>
          </div>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleLogout(router)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-sm font-medium text-red-600 dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Logout</span>
          </motion.button>
        </div>
      </motion.header>

      <div className="flex flex-1 min-h-0">
        {/* Desktop Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="hidden lg:flex flex-col w-72 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 py-6 px-4 gap-4 sticky top-0 h-[calc(100vh-4rem)]"
        >
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Administration
            </h2>
            <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
          </div>

          <nav className="flex flex-col gap-1 flex-1">
            {adminSidebarLinks.map((link, index) => {
              const isActive =
                pathname === link.href ||
                (link.href !== "/admin" && pathname.startsWith(link.href));
              return (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                >
                  <Link
                    href={link.href}
                    className={`group flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
                      isActive
                        ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <link.icon
                      className={`h-5 w-5 ${
                        isActive
                          ? "text-white"
                          : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                      }`}
                    />
                    <div className="flex flex-col">
                      <span className="text-sm">{link.label}</span>
                      <span
                        className={`text-xs ${
                          isActive
                            ? "text-white/80"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {link.description}
                      </span>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </nav>

          {/* Footer Info */}
          <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
              <Shield className="h-4 w-4" />
              <span>Admin Access Level</span>
            </div>
          </div>
        </motion.aside>

        {/* Mobile Sidebar Overlay */}
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-black/50 w-full h-full"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-slate-200/50 dark:border-slate-700/50 py-6 px-4 gap-4 flex flex-col h-full shadow-2xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                  Admin Menu
                </h2>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Close sidebar"
                >
                  <X className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                </motion.button>
              </div>

              <nav className="flex flex-col gap-1 flex-1">
                {adminSidebarLinks.map((link, index) => {
                  const isActive =
                    pathname === link.href ||
                    (link.href !== "/admin" && pathname.startsWith(link.href));
                  return (
                    <motion.div
                      key={link.href}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.05 }}
                    >
                      <Link
                        href={link.href}
                        className={`group flex items-center gap-3 px-3 py-3 rounded-lg font-medium transition-all duration-200 ${
                          isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                            : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <link.icon
                          className={`h-5 w-5 ${
                            isActive
                              ? "text-white"
                              : "text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                          }`}
                        />
                        <div className="flex flex-col">
                          <span className="text-sm">{link.label}</span>
                          <span
                            className={`text-xs ${
                              isActive
                                ? "text-white/80"
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          >
                            {link.description}
                          </span>
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
              </nav>

              {/* Mobile Footer */}
              <div className="mt-auto pt-4 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-2 px-3 py-2 text-xs text-slate-500 dark:text-slate-400">
                  <Shield className="h-4 w-4" />
                  <span>Admin Access Level</span>
                </div>
              </div>
            </motion.aside>
          </motion.div>
        )}

        {/* Main Content Area */}
        <motion.main
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="flex-1 bg-transparent p-4 lg:p-8 overflow-y-auto min-h-0 flex flex-col"
        >
          {children}
        </motion.main>
      </div>
    </div>
  );
}
