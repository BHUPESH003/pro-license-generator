import React from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface DonutChartProps {
  data: Array<{ name: string; value: number; color: string }>;
  title: string;
  centerLabel?: string;
  height?: number;
}

export const DonutChart: React.FC<DonutChartProps> = ({
  data,
  title,
  centerLabel,
  height = 300,
}) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = ((data.value / total) * 100).toFixed(1);
      return (
        <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-[var(--foreground)]">
            {data.name}
          </p>
          <p className="text-lg font-semibold text-[var(--primary)]">
            {data.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-sm text-[var(--foreground)]">
              {entry.value}
            </span>
          </div>
        ))}
      </div>
    );
  };

  const renderCenterLabel = () => {
    if (!centerLabel) return null;

    return (
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="middle"
        className="fill-[var(--foreground)] text-lg font-semibold"
      >
        {centerLabel}
      </text>
    );
  };

  return (
    <div className="w-full">
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-4 text-center">
        {title}
      </h3>

      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
          {renderCenterLabel()}
        </PieChart>
      </ResponsiveContainer>

      {/* Summary Stats */}
      <div className="mt-4 text-center">
        <div className="text-2xl font-bold text-[var(--foreground)]">
          {total.toLocaleString()}
        </div>
        <div className="text-sm text-[var(--muted-foreground)]">Total</div>
      </div>
    </div>
  );
};

export default DonutChart;
