"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DocsPage() {
  const quickStartSteps = [
    {
      step: 1,
      title: "Create Your Account",
      description:
        "Register for a free account and verify your email address to get started.",
      icon: "👤",
      color: "from-blue-500 to-cyan-500",
    },
    {
      step: 2,
      title: "Set Up Password",
      description:
        "Use the secure link sent to your email to create your password.",
      icon: "🔒",
      color: "from-purple-500 to-pink-500",
    },
    {
      step: 3,
      title: "Access Dashboard",
      description: "Log in and explore your personalized dashboard interface.",
      icon: "📊",
      color: "from-emerald-500 to-teal-500",
    },
    {
      step: 4,
      title: "Upgrade to Pro",
      description:
        "Purchase a Pro plan to unlock advanced features and capabilities.",
      icon: "⭐",
      color: "from-orange-500 to-red-500",
    },
    {
      step: 5,
      title: "Manage Resources",
      description:
        "Easily manage your licenses and devices from the central dashboard.",
      icon: "⚙️",
      color: "from-indigo-500 to-purple-500",
    },
  ];

  const apiFeatures = [
    {
      title: "Authentication",
      description:
        "Complete auth flows including register, login, password reset, and setup.",
      icon: "🔐",
      color: "from-blue-500 to-cyan-500",
      features: [
        "User Registration",
        "Secure Login",
        "Password Reset",
        "Email Verification",
      ],
    },
    {
      title: "License Management",
      description:
        "Full license lifecycle management via dashboard or programmatic API.",
      icon: "📄",
      color: "from-purple-500 to-pink-500",
      features: [
        "License Creation",
        "Activation/Deactivation",
        "Status Tracking",
        "Bulk Operations",
      ],
    },
    {
      title: "Device Control",
      description: "Comprehensive device management and activation tracking.",
      icon: "📱",
      color: "from-emerald-500 to-teal-500",
      features: [
        "Device Registration",
        "Name Management",
        "Activation Limits",
        "Usage Analytics",
      ],
    },
    {
      title: "Payment Processing",
      description: "Secure Stripe integration for seamless Pro plan purchases.",
      icon: "💳",
      color: "from-orange-500 to-red-500",
      features: [
        "Stripe Integration",
        "Secure Payments",
        "Subscription Management",
        "Invoice Generation",
      ],
    },
  ];

  const supportOptions = [
    {
      title: "Email Support",
      description: "Get direct help from our expert support team",
      icon: "📧",
      action: "support@mycleanone.com",
      link: "mailto:support@mycleanone.com",
      color: "from-blue-500 to-purple-600",
    },
    {
      title: "Documentation",
      description: "Browse our comprehensive guides and tutorials",
      icon: "📚",
      action: "View Docs",
      link: "/docs",
      color: "from-emerald-500 to-teal-600",
    },
    {
      title: "API Reference",
      description: "Complete API documentation for developers",
      icon: "🔧",
      action: "API Docs",
      link: "/api-docs",
      color: "from-purple-500 to-pink-600",
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 30 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div
          className="w-full h-full bg-repeat bg-[length:60px_60px]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-6 py-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl mb-6 shadow-xl shadow-blue-500/25">
            <span className="text-3xl">📖</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent leading-tight">
            Documentation
          </h1>
          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Get started with My Clean One Platform. Find comprehensive guides,
            API documentation, and support resources to help you succeed.
          </p>
        </motion.div>

        {/* Quick Start Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Quick Start Guide
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Follow these simple steps to get up and running in minutes
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {quickStartSteps.map((step, index) => (
              <motion.div
                key={step.step}
                variants={cardVariants}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  <div
                    className={`w-12 h-12 bg-gradient-to-r ${step.color} rounded-2xl flex items-center justify-center shadow-lg mr-4`}
                  >
                    <span className="text-xl text-white">{step.icon}</span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-2xl font-bold text-slate-900 dark:text-white mr-2">
                      {step.step}
                    </span>
                    <div className="w-8 h-0.5 bg-gradient-to-r from-slate-300 to-transparent"></div>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {step.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        {/* API Overview Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              API Overview
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              Powerful APIs to integrate with your applications
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {apiFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + index * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center shadow-lg mr-4`}
                  >
                    <span className="text-2xl text-white">{feature.icon}</span>
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {feature.description}
                </p>
                <div className="space-y-3">
                  {feature.features.map((item, itemIndex) => (
                    <motion.div
                      key={itemIndex}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + itemIndex * 0.1 }}
                      className="flex items-center space-x-3"
                    >
                      <div
                        className={`w-4 h-4 bg-gradient-to-r ${feature.color} rounded-full flex items-center justify-center flex-shrink-0`}
                      >
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                      <span className="text-slate-700 dark:text-slate-300">
                        {item}
                      </span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2 }}
            className="mt-8 text-center"
          >
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800/50">
              <p className="text-slate-700 dark:text-slate-300">
                For API integration or advanced use cases, contact{" "}
                <a
                  href="mailto:support@mycleanone.com"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium transition-colors duration-200"
                >
                  support@mycleanone.com
                </a>
              </p>
            </div>
          </motion.div>
        </motion.div>

        {/* Support Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-20"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4">
              Need Help?
            </h2>
            <p className="text-lg text-slate-600 dark:text-slate-400">
              We're here to support you every step of the way
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportOptions.map((option, index) => (
              <motion.div
                key={option.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.1 }}
                whileHover={{ scale: 1.02, y: -5 }}
                className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-3xl p-8 shadow-xl border border-white/20 dark:border-slate-700/50 hover:shadow-2xl transition-all duration-300 text-center"
              >
                <div
                  className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-6`}
                >
                  <span className="text-2xl text-white">{option.icon}</span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
                  {option.title}
                </h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
                  {option.description}
                </p>
                <motion.a
                  href={option.link}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`inline-flex items-center px-6 py-3 bg-gradient-to-r ${option.color} text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300`}
                >
                  {option.action}
                </motion.a>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl p-8 md:p-12 text-white shadow-2xl shadow-blue-500/25">
            <div className="max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-blue-100 mb-8">
                Join thousands of developers using our platform to manage
                software licenses efficiently.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/register">
                    <button className="bg-white text-blue-600 hover:bg-gray-100 font-semibold px-8 py-4 text-lg rounded-xl shadow-lg transition-all duration-300">
                      Start Free Trial
                    </button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link href="/pricing">
                    <button className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 text-lg rounded-xl border border-white/30 hover:border-white/50 transition-all duration-300">
                      View Pricing
                    </button>
                  </Link>
                </motion.div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
