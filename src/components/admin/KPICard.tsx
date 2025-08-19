import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string | number;
  delta?: {
    value: number;
    type: "increase" | "decrease";
    period: string;
  };
  tooltip?: string;
  onClick?: () => void;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  delta,
  tooltip,
  onClick,
}) => {
  const formatValue = (val: string | number): string => {
    if (typeof val === "number") {
      return val.toLocaleString();
    }
    return val;
  };

  const formatDelta = (deltaValue: number): string => {
    const abs = Math.abs(deltaValue);
    if (abs >= 1000000) {
      return `${(abs / 1000000).toFixed(1)}M`;
    }
    if (abs >= 1000) {
      return `${(abs / 1000).toFixed(1)}K`;
    }
    return abs.toString();
  };

  return (
    <div
      className={`
        bg-[var(--surface)] border border-[var(--border)] rounded-lg p-6
        ${
          onClick
            ? "cursor-pointer hover:bg-[var(--card)] transition-colors"
            : ""
        }
      `}
      onClick={onClick}
      title={tooltip}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-[var(--muted-foreground)]">
          {title}
        </h3>
        {tooltip && (
          <div
            className="text-xs text-[var(--muted-foreground)]"
            title={tooltip}
          >
            ℹ️
          </div>
        )}
      </div>

      <div className="mt-2">
        <div className="text-2xl font-bold text-[var(--foreground)]">
          {formatValue(value)}
        </div>

        {delta && (
          <div className="flex items-center mt-2 text-sm">
            {delta.type === "increase" ? (
              <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span
              className={
                delta.type === "increase" ? "text-green-500" : "text-red-500"
              }
            >
              {delta.type === "increase" ? "+" : "-"}
              {formatDelta(delta.value)}
            </span>
            <span className="text-[var(--muted-foreground)] ml-1">
              {delta.period}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
