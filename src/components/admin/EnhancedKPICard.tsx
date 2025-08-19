"use client";

import React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus, Loader2 } from "lucide-react";

interface EnhancedKPICardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  trend?: number;
  subtitle?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export function EnhancedKPICard({
  title,
  value,
  icon: Icon,
  trend,
  subtitle,
  color = "blue",
  loading = false,
  onClick,
  className = "",
}: EnhancedKPICardProps) {
  const colorClasses = {
    blue: {
      gradient: "from-blue-500 to-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      text: "text-blue-600 dark:text-blue-400",
    },
    green: {
      gradient: "from-green-500 to-green-600",
      bg: "bg-green-50 dark:bg-green-900/20",
      text: "text-green-600 dark:text-green-400",
    },
    purple: {
      gradient: "from-purple-500 to-purple-600",
      bg: "bg-purple-50 dark:bg-purple-900/20",
      text: "text-purple-600 dark:text-purple-400",
    },
    orange: {
      gradient: "from-orange-500 to-orange-600",
      bg: "bg-orange-50 dark:bg-orange-900/20",
      text: "text-orange-600 dark:text-orange-400",
    },
    red: {
      gradient: "from-red-500 to-red-600",
      bg: "bg-red-50 dark:bg-red-900/20",
      text: "text-red-600 dark:text-red-400",
    },
  };

  const getTrendIcon = () => {
    if (trend === undefined || trend === 0) return Minus;
    return trend > 0 ? TrendingUp : TrendingDown;
  };

  const getTrendColor = () => {
    if (trend === undefined || trend === 0) return "text-slate-500";
    return trend > 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400";
  };

  const formatTrend = () => {
    if (trend === undefined) return null;
    const sign = trend > 0 ? "+" : "";
    return `${sign}${trend.toFixed(1)}%`;
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 
        border border-slate-200/50 dark:border-slate-700/50 shadow-lg 
        hover:shadow-xl transition-all duration-300
        ${onClick ? "cursor-pointer" : ""}
        ${className}
      `}
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className={`p-3 rounded-lg bg-gradient-to-r ${colorClasses[color].gradient}`}
        >
          {loading ? (
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          ) : (
            <Icon className="h-6 w-6 text-white" />
          )}
        </div>

        {trend !== undefined && !loading && (
          <div className={`flex items-center gap-1 ${getTrendColor()}`}>
            <TrendIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{formatTrend()}</span>
          </div>
        )}
      </div>

      <div className="space-y-1">
        {loading ? (
          <>
            <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-3/4"></div>
            {subtitle && (
              <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded animate-pulse w-1/2"></div>
            )}
          </>
        ) : (
          <>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">
              {typeof value === "number" ? value.toLocaleString() : value}
            </h3>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
              {title}
            </p>
            {subtitle && (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {subtitle}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}

export default EnhancedKPICard;
