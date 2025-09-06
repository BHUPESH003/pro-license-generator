"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import {
  User,
  Smartphone,
  Download,
  TrendingUp,
  Shield,
  Zap,
  ArrowRight,
  CreditCard,
} from "lucide-react";
import { useEffect, useState } from "react";
import apiClient from "@/lib/axios";

type DashboardStats = {
  licenses: number;
  devices: number;
  latestVersion?: string;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
    },
  },
};

export default function DashboardHome() {
  const [stats, setStats] = useState<DashboardStats>({
    licenses: 0,
    devices: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await apiClient.get("/api/dashboard");

        setStats(res.data.stats);
      } catch (error) {
        console.error("Dashboard fetch error:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);
  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4 sm:px-6">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-lg">
          <Shield className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-slate-900 via-blue-800 to-purple-800 dark:from-white dark:via-blue-200 dark:to-purple-200 bg-clip-text text-transparent">
          Welcome to your Dashboard
        </h1>
        <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
          Manage your licenses, devices, and downloads all in one place.
          Everything you need to keep your software secure and up-to-date.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
      >
        {/* Licenses Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? "…" : stats.licenses}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Active
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Active Licenses
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Manage your software licenses and subscription details.
          </p>
          <Link href="/dashboard/licenses">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="accent"
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>View Licenses</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Devices Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Smartphone className="w-8 h-8 text-white" />
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-slate-900 dark:text-white">
                {loading ? "…" : stats.devices}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Registered
              </div>
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Registered Devices
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Monitor and manage all your connected devices securely.
          </p>
          <Link href="/dashboard/devices">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="accent"
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Manage Devices</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>

        {/* Billing Card */}
        <motion.div
          variants={itemVariants}
          whileHover={{ scale: 1.02, y: -5 }}
          className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-8"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CreditCard className="w-8 h-8 text-white" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
            Billing & Receipts
          </h3>
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            Manage your subscription and download past receipts.
          </p>
          <Link href="/dashboard/billing">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                size="lg"
                variant="accent"
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>Open Billing</span>
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </Link>
        </motion.div>
      </motion.div>

      {/* Downloads Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.4 }}
        whileHover={{ scale: 1.02, y: -5 }}
        className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20 dark:border-slate-700/50 p-6 sm:p-8 mb-12"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Download className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
          </div>
          <div className="text-right">
            <div className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Version
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">
              Latest
            </div>
          </div>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Download Software
        </h3>

        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Get the latest version for your device with enhanced security
          features.
        </p>

        <Link href="/dashboard/downloads">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              size="lg"
              variant="secondary"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <span>Go to Downloads</span>
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </Link>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <TrendingUp className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Performance
            </h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Monitor your software performance and system health.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl p-6 border border-purple-200 dark:border-purple-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <Shield className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Security
            </h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Keep your devices protected with the latest security updates.
          </p>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.05 }}
          className="bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-emerald-200 dark:border-emerald-800"
        >
          <div className="flex items-center gap-3 mb-3">
            <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            <h4 className="font-semibold text-slate-900 dark:text-white">
              Updates
            </h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Stay up-to-date with the latest features and improvements.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
