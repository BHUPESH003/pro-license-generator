"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Users,
  Shield,
  Activity,
  Webhook,
  Cog,
  Save,
  RefreshCw,
} from "lucide-react";
import AdminProtection from "@/components/admin/AdminProtection";
import { Button } from "@/components/ui/Button";
import GeneralSettings from "@/components/admin/settings/GeneralSettings";
import AdminManagement from "@/components/admin/settings/AdminManagement";
import RateLimitSettings from "@/components/admin/settings/RateLimitSettings";
import SystemHealth from "@/components/admin/settings/SystemHealth";
import WebhookMonitoring from "@/components/admin/settings/WebhookMonitoring";
import SystemConfiguration from "@/components/admin/settings/SystemConfiguration";

type SettingsTab =
  | "general"
  | "admins"
  | "rate-limits"
  | "health"
  | "webhooks"
  | "config";

const settingsTabs = [
  {
    id: "general" as const,
    label: "General",
    icon: Settings,
    description: "System configuration",
  },
  {
    id: "admins" as const,
    label: "Admin Users",
    icon: Users,
    description: "Admin role management",
  },
  {
    id: "rate-limits" as const,
    label: "Rate Limits",
    icon: Shield,
    description: "API rate limiting",
  },
  {
    id: "health" as const,
    label: "System Health",
    icon: Activity,
    description: "Health monitoring",
  },
  {
    id: "webhooks" as const,
    label: "Webhooks",
    icon: Webhook,
    description: "Webhook status",
  },
  {
    id: "config" as const,
    label: "Configuration",
    icon: Cog,
    description: "System config",
  },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<SettingsTab>("general");
  const [hasChanges, setHasChanges] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate save operation
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSaving(false);
    setHasChanges(false);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case "general":
        return <GeneralSettings onSettingsChange={() => setHasChanges(true)} />;
      case "admins":
        return <AdminManagement />;
      case "rate-limits":
        return (
          <RateLimitSettings onSettingsChange={() => setHasChanges(true)} />
        );
      case "health":
        return <SystemHealth />;
      case "webhooks":
        return <WebhookMonitoring />;
      case "config":
        return (
          <SystemConfiguration onSettingsChange={() => setHasChanges(true)} />
        );
      default:
        return <GeneralSettings onSettingsChange={() => setHasChanges(true)} />;
    }
  };

  return (
    <AdminProtection>
      <div className="space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              System Settings
            </h1>
            <p className="text-slate-600 dark:text-slate-400 mt-1">
              Configure system settings, manage admin users, and monitor system
              health
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>

            {hasChanges && (
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={isSaving}
                className="flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            )}
          </div>
        </motion.div>

        {/* Settings Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg overflow-hidden"
        >
          {/* Tab Navigation */}
          <div className="border-b border-slate-200/50 dark:border-slate-700/50">
            <div className="flex overflow-x-auto">
              {settingsTabs.map((tab, index) => (
                <motion.button
                  key={tab.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-3 px-6 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 ${
                    activeTab === tab.id
                      ? "border-blue-500 text-blue-600 dark:text-blue-400 bg-blue-50/50 dark:bg-blue-900/20"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/30"
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  <div className="text-left">
                    <div>{tab.label}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      {tab.description}
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
            className="p-6"
          >
            {renderTabContent()}
          </motion.div>
        </motion.div>
      </div>
    </AdminProtection>
  );
}
