"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import logo from "@/assets/mycleanone_logo.png";
import apiClient from "@/lib/axios";

const navLinks = [
  { href: "/marketing", label: "Home" },
  { href: "/pricing", label: "Pricing" },
  { href: "/docs", label: "Docs" },
  {
    href: "/privacypolicy",
    label: "Privacy Policy",
    hasDropdown: true,
    dropdownItems: [
      {
        href: "/privacypolicy/generalprivacypolicy",
        label: "General Privacy Policy",
      },
      { href: "/privacypolicy/productspolicy", label: "Products Policy" },
      {
        href: "/privacypolicy/cancellationpolicy",
        label: "Cancellation and Refund Policy",
      },
      { href: "/privacypolicy/companyguidelines", label: "Company Guidelines" },
      {
        href: "/privacypolicy/mypersonalinfo",
        label: "My Personal Information",
      },
    ],
  },
];

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const [loggedIn, setLoggedIn] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("accessToken");
      setLoggedIn(!!token);
    }
  }, []);

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/auth/logout");
      localStorage.removeItem("accessToken");
      router.push("/login");
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 text-slate-900 dark:text-slate-100">
      {/* Header */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full py-6 px-8 bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg shadow-slate-200/20 dark:shadow-slate-900/20 flex items-center justify-between relative z-50"
      >
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="cursor-pointer"
        >
          <img
            src={logo.src}
            alt="MyCleanOne Logo"
            className="h-16 w-auto drop-shadow-lg"
            style={{ maxWidth: "250px" }}
            onClick={() => router.push("/")}
          />
        </motion.div>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {navLinks.map((link, index) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative"
              onMouseEnter={() => link.hasDropdown && setDropdownOpen(true)}
              onMouseLeave={() => link.hasDropdown && setDropdownOpen(false)}
            >
              <Link
                href={link.href}
                className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-300 font-medium text-base relative hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20 flex items-center space-x-1"
              >
                <span>{link.label}</span>
                {link.hasDropdown && (
                  <ChevronDown
                    className={`w-4 h-4 transition-transform duration-300 ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                )}
                <motion.div
                  className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                  initial={{ width: 0 }}
                  whileHover={{ width: "100%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>

              {/* Dropdown for Privacy Policy */}
              {link.hasDropdown && (
                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 mt-2 z-50"
                      onMouseEnter={() => setDropdownOpen(true)}
                      onMouseLeave={() => setDropdownOpen(false)}
                    >
                      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700/50 p-2 min-w-[280px] backdrop-blur-xl">
                        {link.dropdownItems?.map((item, itemIndex) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: itemIndex * 0.05,
                            }}
                          >
                            <Link
                              href={item.href}
                              className="flex items-center px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 text-sm font-medium"
                              onClick={() => setDropdownOpen(false)}
                            >
                              {item.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                      {/* Dropdown Arrow */}
                      <div className="absolute -top-2 left-6 w-4 h-4 bg-white dark:bg-slate-800 border-l border-t border-white/20 dark:border-slate-700/50 rotate-45"></div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </motion.div>
          ))}

          {loggedIn ? (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  href="/dashboard"
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-300 font-medium text-base hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                >
                  Dashboard
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <button
                  onClick={handleLogout}
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-300 font-medium text-base hover:shadow-lg hover:shadow-red-100 dark:hover:shadow-red-900/20"
                >
                  Logout
                </button>
              </motion.div>
            </>
          ) : (
            <>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Link
                  href="/login"
                  className="px-4 py-2.5 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-300 font-medium text-base hover:shadow-lg hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                >
                  Login
                </Link>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Link
                  href="/register"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg transition-all duration-300 font-medium text-base transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25"
                >
                  Get Started
                </Link>
              </motion.div>
            </>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="lg:hidden flex items-center p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors duration-200"
          onClick={() => setOpen((o) => !o)}
          aria-label="Toggle navigation"
        >
          <motion.div
            animate={open ? { rotate: 180 } : { rotate: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg
              className="h-6 w-6 text-slate-700 dark:text-slate-300"
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
          </motion.div>
        </motion.button>

        {/* Mobile Menu */}
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="absolute top-full left-0 w-full bg-white/95 dark:bg-slate-800/95 backdrop-blur-xl shadow-2xl rounded-b-2xl border border-slate-200/50 dark:border-slate-700/50 lg:hidden z-50"
            >
              <div className="p-4 space-y-2">
                {navLinks.map((link, index) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="block w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 font-medium text-base hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                      onClick={() => setOpen(false)}
                    >
                      {link.label}
                    </Link>
                    {/* Mobile Dropdown Items */}
                    {link.hasDropdown && link.dropdownItems && (
                      <div className="ml-4 mt-2 space-y-1">
                        {link.dropdownItems.map((item, itemIndex) => (
                          <motion.div
                            key={item.href}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              duration: 0.3,
                              delay: index * 0.1 + itemIndex * 0.05,
                            }}
                          >
                            <Link
                              href={item.href}
                              className="block w-full px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 text-sm"
                              onClick={() => setOpen(false)}
                            >
                              • {item.label}
                            </Link>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                ))}

                {loggedIn ? (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Link
                        href="/dashboard"
                        className="block w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 font-medium text-base hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                        onClick={() => setOpen(false)}
                      >
                        Dashboard
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <button
                        onClick={() => {
                          setOpen(false);
                          handleLogout();
                        }}
                        className="block w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-200 font-medium text-base text-left hover:shadow-md hover:shadow-red-100 dark:hover:shadow-red-900/20"
                      >
                        Logout
                      </button>
                    </motion.div>
                  </>
                ) : (
                  <>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.4 }}
                    >
                      <Link
                        href="/login"
                        className="block w-full px-4 py-3 rounded-xl text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-slate-700/50 transition-all duration-200 font-medium text-base hover:shadow-md hover:shadow-blue-100 dark:hover:shadow-blue-900/20"
                        onClick={() => setOpen(false)}
                      >
                        Login
                      </Link>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 }}
                    >
                      <Link
                        href="/register"
                        className="block w-full px-4 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 font-medium text-base text-center hover:shadow-lg hover:shadow-blue-500/25"
                        onClick={() => setOpen(false)}
                      >
                        Get Started
                      </Link>
                    </motion.div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Main Content */}
      <motion.main
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="flex-1 w-full max-w-7xl mx-auto px-6 py-12"
      >
        {children}
      </motion.main>

      {/* Footer */}
      <motion.footer
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        className="w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-white mt-auto relative overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-16">
          {/* Main Footer Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="lg:col-span-2"
            >
              <div className="flex items-center mb-6">
                <img
                  src={logo.src}
                  alt="MyCleanOne Logo"
                  className="h-12 w-auto mr-4"
                  style={{ maxWidth: "180px" }}
                />
              </div>
              <p className="text-slate-300 text-lg leading-relaxed mb-6 max-w-md">
                Modern software licensing made simple. Secure, scalable, and
                user-friendly solutions for your SaaS or downloadable software.
              </p>
              <div className="flex space-x-4">
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://twitter.com/yourbrand"
                  target="_blank"
                  rel="noopener"
                  aria-label="Twitter"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="text-blue-400"
                  >
                    <path d="M20 3.9a8.1 8.1 0 0 1-2.36.65A4.1 4.1 0 0 0 19.45 2a8.19 8.19 0 0 1-2.6.99A4.09 4.09 0 0 0 9.85 7.03a11.6 11.6 0 0 1-8.42-4.27a4.09 4.09 0 0 0 1.27 5.46A4.07 4.07 0 0 1 .8 7.1v.05a4.09 4.09 0 0 0 3.28 4.01a4.1 4.1 0 0 1-1.85.07a4.1 4.1 0 0 0 3.82 2.84A8.22 8.22 0 0 1 0 17.54A11.6 11.6 0 0 0 6.29 19.5c7.55 0 11.68-6.26 11.68-11.68c0-.18-.01-.36-.02-.54A8.18 8.18 0 0 0 20 3.9z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://github.com/yourbrand"
                  target="_blank"
                  rel="noopener"
                  aria-label="GitHub"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="text-slate-300"
                  >
                    <path d="M10 .3a10 10 0 0 0-3.16 19.49c.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34c-.45-1.15-1.1-1.46-1.1-1.46c-.9-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.89 1.52 2.34 1.08 2.91.83c.09-.65.35-1.08.63-1.33c-2.22-.25-4.56-1.11-4.56-4.95c0-1.09.39-1.98 1.03-2.68c-.1-.25-.45-1.27.1-2.65c0 0 .84-.27 2.75 1.02a9.56 9.56 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.38.2 2.4.1 2.65c.64.7 1.03 1.59 1.03 2.68c0 3.85-2.34 4.7-4.57 4.95c.36.31.68.92.68 1.85v2.74c0 .27.18.58.69.48A10 10 0 0 0 10 .3z" />
                  </svg>
                </motion.a>
                <motion.a
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  href="https://linkedin.com/company/yourbrand"
                  target="_blank"
                  rel="noopener"
                  aria-label="LinkedIn"
                  className="p-3 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all duration-300 border border-white/20"
                >
                  <svg
                    width="20"
                    height="20"
                    fill="currentColor"
                    className="text-blue-500"
                  >
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </motion.a>
              </div>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
            >
              <h3 className="text-xl font-bold mb-6 text-white">Quick Links</h3>
              <ul className="space-y-4">
                {navLinks.map((link, index) => (
                  <motion.li
                    key={link.href}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  >
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-all duration-300 font-medium text-base hover:translate-x-2 inline-block"
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* Contact Info */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
            >
              <h3 className="text-xl font-bold mb-6 text-white">Contact Us</h3>
              <div className="space-y-4">
                <motion.a
                  whileHover={{ scale: 1.02, x: 5 }}
                  href="mailto:support@mycleanone.com"
                  className="flex items-center text-slate-300 hover:text-white transition-all duration-300 group"
                >
                  <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                  </div>
                  <span className="text-base">support@mycleanone.com</span>
                </motion.a>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center text-slate-300 group"
                >
                  <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                    </svg>
                  </div>
                  <span className="text-base">+91 8885336085</span>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="flex items-center text-slate-300 group"
                >
                  <div className="p-2 rounded-lg bg-white/10 mr-3 group-hover:bg-white/20 transition-all duration-300">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-base">Mumbai, India</span>
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.1 }}
            className="border-t border-white/10 pt-8"
          >
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="text-slate-400 text-sm mb-4 md:mb-0">
                &copy; {new Date().getFullYear()} My Clean One. All rights
                reserved.
              </div>
              <div className="flex space-x-6">
                <Link
                  href="/legal/privacy"
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Privacy Policy
                </Link>
                <Link
                  href="/legal/tos"
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  Terms of Service
                </Link>
                {/* <Link
                  href="/legal/eula"
                  className="text-slate-400 hover:text-white transition-colors duration-300 text-sm"
                >
                  EULA
                </Link> */}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.footer>
    </div>
  );
}
