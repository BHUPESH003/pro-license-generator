"use client";

import React from "react";
import { Loader2, RefreshCw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  variant?: "spinner" | "dots" | "pulse";
  className?: string;
  fullScreen?: boolean;
}

export default function LoadingState({
  message = "Loading...",
  size = "md",
  variant = "spinner",
  className = "",
  fullScreen = false,
}: LoadingStateProps) {
  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const renderSpinner = () => (
    <Loader2
      className={`${sizeClasses[size]} animate-spin text-blue-600 dark:text-blue-400`}
    />
  );

  const renderDots = () => (
    <div className="flex space-x-1">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={`${
            size === "sm" ? "w-2 h-2" : size === "md" ? "w-3 h-3" : "w-4 h-4"
          } bg-blue-600 dark:bg-blue-400 rounded-full animate-bounce`}
          style={{ animationDelay: `${i * 0.1}s` }}
        />
      ))}
    </div>
  );

  const renderPulse = () => (
    <div
      className={`${sizeClasses[size]} bg-blue-600 dark:bg-blue-400 rounded-full animate-pulse`}
    />
  );

  const renderLoader = () => {
    switch (variant) {
      case "dots":
        return renderDots();
      case "pulse":
        return renderPulse();
      default:
        return renderSpinner();
    }
  };

  const content = (
    <div
      className={`flex flex-col items-center justify-center space-y-4 ${className}`}
    >
      {renderLoader()}
      {message && (
        <p
          className={`${textSizeClasses[size]} text-slate-600 dark:text-slate-400 text-center`}
        >
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50">
        {content}
      </div>
    );
  }

  return content;
}

// Inline loading spinner for buttons and small spaces
export function InlineLoader({
  size = "sm",
  className = "",
}: {
  size?: "xs" | "sm" | "md";
  className?: string;
}) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-5 w-5",
  };

  return (
    <Loader2 className={`${sizeClasses[size]} animate-spin ${className}`} />
  );
}

// Page loading overlay
export function PageLoader({
  message = "Loading page...",
}: {
  message?: string;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-full shadow-lg flex items-center justify-center mb-6">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 dark:text-blue-400" />
        </div>
        <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
          {message}
        </h2>
        <p className="text-slate-600 dark:text-slate-400">
          Please wait while we load your content
        </p>
      </div>
    </div>
  );
}

// Refresh loader for data updates
export function RefreshLoader({
  isRefreshing,
  onRefresh,
  className = "",
}: {
  isRefreshing: boolean;
  onRefresh: () => void;
  className?: string;
}) {
  return (
    <button
      onClick={onRefresh}
      disabled={isRefreshing}
      className={`p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 ${className}`}
      title={isRefreshing ? "Refreshing..." : "Refresh"}
    >
      <RefreshCw
        className={`h-4 w-4 ${
          isRefreshing ? "animate-spin" : ""
        } text-slate-600 dark:text-slate-400`}
      />
    </button>
  );
}

// Loading overlay for specific sections
export function SectionLoader({
  message = "Loading...",
  className = "",
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={`absolute inset-0 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm flex items-center justify-center rounded-lg ${className}`}
    >
      <div className="text-center">
        <Loader2 className="h-6 w-6 animate-spin text-blue-600 dark:text-blue-400 mx-auto mb-2" />
        <p className="text-sm text-slate-600 dark:text-slate-400">{message}</p>
      </div>
    </div>
  );
}
