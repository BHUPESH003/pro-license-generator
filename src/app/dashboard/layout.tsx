"use client";
import React, { useState } from "react";
import ReduxProvider from "@/store/provider";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Key,
  Smartphone,
  Download,
  LogOut,
  Menu,
  X,
  Home,
  Mail,
} from "lucide-react";
import logo from "@/assets/mycleanone_logo.png";
import ThemeToggle from "@/components/ui/ThemeToggle";

const sidebarLinks = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/licenses", label: "My Licenses", icon: Key },
  { href: "/dashboard/devices", label: "My Devices", icon: Smartphone },
  { href: "/dashboard/downloads", label: "Downloads", icon: Download },
];

async function handleLogout(router: any) {
  await fetch("/api/auth/logout", { method: "POST" });
  localStorage.removeItem("accessToken"); // clear manually
  router.push("/login");
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <ReduxProvider>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Topbar */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl shadow-lg border-b border-white/20 dark:border-slate-700/50 z-10"
        >
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="md:hidden mr-2 p-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
              onClick={() => setSidebarOpen((o) => !o)}
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5 text-slate-600 dark:text-slate-300" />
            </motion.button>
            <div className="flex items-center gap-3">
              <img
                src={logo.src}
                alt="MyCleanOne Logo"
                className="h-12 w-auto"
                style={{ maxWidth: "200px" }}
              />
              <div className="hidden sm:block h-6 w-px bg-slate-300 dark:bg-slate-600"></div>
              <span className="hidden sm:block text-sm text-slate-600 dark:text-slate-300 font-medium">
                Dashboard
              </span>
            </div>
          </div>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="/marketing"
              className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              <Home className="h-4 w-4" />
              Home
            </motion.a>
            <div className="flex items-center gap-4">
              <motion.a
                href="mailto:support@mycleanone.com"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors text-sm text-slate-600 dark:text-slate-300 font-medium"
              >
                <Mail className="h-4 w-4" />
                Support
              </motion.a>
            </div>
          </div>
        </motion.header>

        <div className="flex flex-1 min-h-0">
          {/* Sidebar for md+ */}
          <motion.aside
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden md:flex flex-col w-72 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 py-8 px-6 gap-4"
          >
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                Navigation
              </h2>
              <div className="h-px bg-gradient-to-r from-transparent via-slate-300 dark:via-slate-600 to-transparent"></div>
            </div>

            <nav className="flex flex-col gap-2">
              {sidebarLinks.map((link, index) => {
                const isActive = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg"
                          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <link.icon
                        className={`h-5 w-5 ${
                          isActive
                            ? "text-white"
                            : "text-slate-500 dark:text-slate-400"
                        }`}
                      />
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleLogout(router)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </motion.button>
              </div>
            </nav>
          </motion.aside>

          {/* Mobile sidebar drawer */}
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 flex md:hidden"
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-black/40 w-full h-full"
                onClick={() => setSidebarOpen(false)}
              />
              <motion.aside
                initial={{ x: "-100%" }}
                animate={{ x: 0 }}
                exit={{ x: "-100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="w-80 bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl border-r border-white/20 dark:border-slate-700/50 py-8 px-6 gap-4 flex flex-col h-full shadow-2xl"
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                    Menu
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

                <nav className="flex flex-col gap-2">
                  {sidebarLinks.map((link, index) => {
                    const isActive = pathname === link.href;
                    return (
                      <motion.div
                        key={link.href}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.4, delay: index * 0.1 }}
                      >
                        <Link
                          href={link.href}
                          className={`flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-200 ${
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
                                : "text-slate-500 dark:text-slate-400"
                            }`}
                          />
                          {link.label}
                        </Link>
                      </motion.div>
                    );
                  })}

                  <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSidebarOpen(false);
                        handleLogout(router);
                      }}
                      className="flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 w-full"
                    >
                      <LogOut className="h-5 w-5" />
                      Logout
                    </motion.button>
                  </div>
                </nav>
              </motion.aside>
            </motion.div>
          )}

          {/* Main content */}
          <motion.main
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex-1 bg-transparent p-4 sm:p-8 overflow-y-auto min-h-0 flex flex-col"
          >
            {children}
          </motion.main>
        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="w-full py-6 px-6 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl text-center border-t border-white/20 dark:border-slate-700/50"
        >
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              &copy; {new Date().getFullYear()} My Clean One. All rights
              reserved.
            </p>
            <div className="flex items-center gap-4">
              <a
                href="mailto:support@mycleanone.com"
                className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium transition-colors"
              >
                Contact Support
              </a>
              <div className="h-4 w-px bg-slate-300 dark:bg-slate-600"></div>
              <a
                href="/marketing"
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white font-medium transition-colors"
              >
                Back to Home
              </a>
            </div>
          </div>
        </motion.footer>
      </div>
    </ReduxProvider>
  );
}
