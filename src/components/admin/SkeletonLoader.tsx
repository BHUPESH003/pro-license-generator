"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  rounded?: boolean;
  animate?: boolean;
}

export function Skeleton({
  className = "",
  width,
  height,
  rounded = false,
  animate = true,
}: SkeletonProps) {
  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height)
    style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`bg-slate-200 dark:bg-slate-700 ${
        animate ? "animate-pulse" : ""
      } ${rounded ? "rounded-full" : "rounded"} ${className}`}
      style={style}
    />
  );
}

// Table skeleton loader
export function TableSkeleton({
  rows = 5,
  columns = 4,
  showHeader = true,
}: {
  rows?: number;
  columns?: number;
  showHeader?: boolean;
}) {
  return (
    <div className="space-y-4">
      {showHeader && (
        <div
          className="grid gap-4"
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} height={20} />
          ))}
        </div>
      )}

      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div
            key={rowIndex}
            className="grid gap-4"
            style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
          >
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton key={colIndex} height={16} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Card skeleton loader
export function CardSkeleton({
  showImage = false,
  showTitle = true,
  showDescription = true,
  showActions = true,
  className = "",
}: {
  showImage?: boolean;
  showTitle?: boolean;
  showDescription?: boolean;
  showActions?: boolean;
  className?: string;
}) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 ${className}`}
    >
      {showImage && <Skeleton height={200} className="mb-4" />}

      {showTitle && <Skeleton height={24} width="60%" className="mb-3" />}

      {showDescription && (
        <div className="space-y-2 mb-4">
          <Skeleton height={16} width="100%" />
          <Skeleton height={16} width="80%" />
          <Skeleton height={16} width="90%" />
        </div>
      )}

      {showActions && (
        <div className="flex gap-2">
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={100} />
        </div>
      )}
    </div>
  );
}

// Dashboard skeleton loader
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Skeleton height={32} width={200} className="mb-2" />
          <Skeleton height={16} width={300} />
        </div>
        <div className="flex gap-2">
          <Skeleton height={40} width={100} />
          <Skeleton height={40} width={120} />
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
          >
            <div className="flex items-center justify-between mb-4">
              <Skeleton height={20} width={100} />
              <Skeleton height={24} width={24} rounded />
            </div>
            <Skeleton height={32} width={80} className="mb-2" />
            <Skeleton height={14} width={120} />
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Skeleton height={24} width={150} className="mb-4" />
          <Skeleton height={300} />
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6">
          <Skeleton height={24} width={150} className="mb-4" />
          <Skeleton height={300} />
        </div>
      </div>
    </div>
  );
}

// List skeleton loader
export function ListSkeleton({
  items = 5,
  showAvatar = true,
  showActions = true,
}: {
  items?: number;
  showAvatar?: boolean;
  showActions?: boolean;
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: items }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-4">
            {showAvatar && <Skeleton height={48} width={48} rounded />}
            <div>
              <Skeleton height={20} width={150} className="mb-2" />
              <Skeleton height={14} width={200} />
            </div>
          </div>

          {showActions && (
            <div className="flex gap-2">
              <Skeleton height={32} width={32} />
              <Skeleton height={32} width={32} />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// Form skeleton loader
export function FormSkeleton({
  fields = 4,
  showSubmit = true,
}: {
  fields?: number;
  showSubmit?: boolean;
}) {
  return (
    <div className="space-y-6">
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i}>
          <Skeleton height={16} width={100} className="mb-2" />
          <Skeleton height={40} width="100%" />
        </div>
      ))}

      {showSubmit && (
        <div className="flex justify-end gap-2 pt-4">
          <Skeleton height={40} width={80} />
          <Skeleton height={40} width={100} />
        </div>
      )}
    </div>
  );
}

// Detail view skeleton loader
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Skeleton height={64} width={64} rounded />
          <div>
            <Skeleton height={28} width={200} className="mb-2" />
            <Skeleton height={16} width={150} />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton height={36} width={80} />
          <Skeleton height={36} width={100} />
        </div>
      </div>

      {/* Content sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <Skeleton height={20} width={120} className="mb-4" />
              <div className="space-y-3">
                <Skeleton height={16} width="100%" />
                <Skeleton height={16} width="90%" />
                <Skeleton height={16} width="95%" />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6"
            >
              <Skeleton height={20} width={100} className="mb-4" />
              <div className="space-y-2">
                <Skeleton height={14} width="100%" />
                <Skeleton height={14} width="80%" />
                <Skeleton height={14} width="90%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
