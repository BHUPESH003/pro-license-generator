"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Activity,
  Smartphone,
  User,
  CreditCard,
  Calendar,
  Code,
  Monitor,
  Hash,
  Eye,
  EyeOff,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

interface TelemetryEvent {
  _id: string;
  occurredAt: string;
  eventType: string;
  appVersion?: string;
  os?: string;
  metadata?: Record<string, any>;
  idempotencyKey?: string;
  deviceGuid: string;
  sessionId?: string;
  user: {
    _id: string;
    email: string;
    name?: string;
  };
  license: {
    _id: string;
    licenseKey: string;
    status: "active" | "inactive";
    plan: string;
  };
}

interface TelemetryDetailDrawerProps {
  event: TelemetryEvent;
  isOpen: boolean;
  onClose: () => void;
}

export default function TelemetryDetailDrawer({
  event,
  isOpen,
  onClose,
}: TelemetryDetailDrawerProps) {
  const [showRawMetadata, setShowRawMetadata] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  const formatMetadata = (metadata: Record<string, any> | undefined) => {
    if (!metadata || typeof metadata !== "object") return null;

    return Object.entries(metadata).map(([key, value]) => ({
      key,
      value:
        typeof value === "object"
          ? JSON.stringify(value, null, 2)
          : String(value),
      type: typeof value,
    }));
  };

  const metadataFields = formatMetadata(event.metadata);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white dark:bg-slate-800 shadow-2xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Telemetry Event Details
                </h2>
                <p className="text-sm text-gray-600">Event ID: {event._id}</p>
              </div>
              <Button variant="secondary" onClick={onClose} className="p-2">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Event Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-blue-600" />
                  Event Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Event Type
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {event.eventType}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(event.eventType, "eventType")
                        }
                        className="p-1"
                      >
                        {copiedField === "eventType" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Occurred At
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <p className="text-sm text-gray-900">
                        {new Date(event.occurredAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {event.appVersion && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        App Version
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Code className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">
                          {event.appVersion}
                        </p>
                      </div>
                    </div>
                  )}
                  {event.os && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Operating System
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Monitor className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900">{event.os}</p>
                      </div>
                    </div>
                  )}
                  {event.sessionId && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">
                        Session ID
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {event.sessionId}
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            copyToClipboard(event.sessionId!, "sessionId")
                          }
                          className="p-1"
                        >
                          {copiedField === "sessionId" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                  {event.idempotencyKey && (
                    <div className="md:col-span-2">
                      <label className="text-sm font-medium text-gray-600">
                        Idempotency Key
                      </label>
                      <div className="flex items-center gap-2 mt-1">
                        <Hash className="h-4 w-4 text-gray-400" />
                        <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                          {event.idempotencyKey}
                        </p>
                        <Button
                          variant="secondary"
                          onClick={() =>
                            copyToClipboard(
                              event.idempotencyKey!,
                              "idempotencyKey"
                            )
                          }
                          className="p-1"
                        >
                          {copiedField === "idempotencyKey" ? (
                            <Check className="h-3 w-3 text-green-600" />
                          ) : (
                            <Copy className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Device Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Smartphone className="h-5 w-5 text-green-600" />
                  Device Information
                </h3>
                <div>
                  <label className="text-sm font-medium text-gray-600">
                    Device GUID
                  </label>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {event.deviceGuid}
                    </p>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        copyToClipboard(event.deviceGuid, "deviceGuid")
                      }
                      className="p-1"
                    >
                      {copiedField === "deviceGuid" ? (
                        <Check className="h-3 w-3 text-green-600" />
                      ) : (
                        <Copy className="h-3 w-3" />
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* User Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <User className="h-5 w-5 text-purple-600" />
                  User Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Email
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900">
                        {event.user.email}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(event.user.email, "userEmail")
                        }
                        className="p-1"
                      >
                        {copiedField === "userEmail" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  {event.user.name && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">
                        Name
                      </label>
                      <p className="text-sm text-gray-900 mt-1">
                        {event.user.name}
                      </p>
                    </div>
                  )}
                  <div className="md:col-span-2">
                    <label className="text-sm font-medium text-gray-600">
                      User ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {event.user._id}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(event.user._id, "userId")
                        }
                        className="p-1"
                      >
                        {copiedField === "userId" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* License Information */}
              <Card className="p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-orange-600" />
                  License Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      License Key
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {event.license.licenseKey}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(
                            event.license.licenseKey,
                            "licenseKey"
                          )
                        }
                        className="p-1"
                      >
                        {copiedField === "licenseKey" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Plan
                    </label>
                    <p className="text-sm text-gray-900 mt-1">
                      {event.license.plan}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      Status
                    </label>
                    <div className="mt-1">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          event.license.status === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {event.license.status}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">
                      License ID
                    </label>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-sm text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                        {event.license._id}
                      </p>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(event.license._id, "licenseId")
                        }
                        className="p-1"
                      >
                        {copiedField === "licenseId" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Metadata */}
              {metadataFields && metadataFields.length > 0 && (
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                      <Code className="h-5 w-5 text-indigo-600" />
                      Metadata ({metadataFields.length} fields)
                    </h3>
                    <Button
                      variant="secondary"
                      onClick={() => setShowRawMetadata(!showRawMetadata)}
                      className="flex items-center gap-2"
                    >
                      {showRawMetadata ? (
                        <>
                          <EyeOff className="h-4 w-4" />
                          Hide Raw JSON
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4" />
                          Show Raw JSON
                        </>
                      )}
                    </Button>
                  </div>

                  {showRawMetadata ? (
                    <div className="relative">
                      <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                        {JSON.stringify(event.metadata, null, 2)}
                      </pre>
                      <Button
                        variant="secondary"
                        onClick={() =>
                          copyToClipboard(
                            JSON.stringify(event.metadata, null, 2),
                            "metadata"
                          )
                        }
                        className="absolute top-2 right-2 p-1"
                      >
                        {copiedField === "metadata" ? (
                          <Check className="h-3 w-3 text-green-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {metadataFields.map(({ key, value, type }) => (
                        <div
                          key={key}
                          className="border border-gray-200 rounded-lg p-3"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-medium text-gray-600">
                              {key}
                            </label>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                {type}
                              </span>
                              <Button
                                variant="secondary"
                                onClick={() =>
                                  copyToClipboard(value, `metadata-${key}`)
                                }
                                className="p-1"
                              >
                                {copiedField === `metadata-${key}` ? (
                                  <Check className="h-3 w-3 text-green-600" />
                                ) : (
                                  <Copy className="h-3 w-3" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-900 overflow-x-auto">
                            {type === "object" ? (
                              <pre>{value}</pre>
                            ) : (
                              <span>{value}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
