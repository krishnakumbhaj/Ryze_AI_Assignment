import React from "react";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  type?: "bar" | "line" | "pie";
  title?: string;
  data?: ChartDataPoint[];
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

function BarChart({ data }: { data: ChartDataPoint[] }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-2 h-[200px] py-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1 h-full justify-end">
          <span className="text-[11px] text-gray-700 font-medium">{d.value}</span>
          <div
            className="w-full max-w-12 bg-indigo-500 rounded-t hover:bg-indigo-600 transition-colors min-h-1"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className="text-[11px] text-gray-500 text-center whitespace-nowrap">{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data }: { data: ChartDataPoint[] }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 400;
  const h = 200;
  const padding = 20;

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (w - 2 * padding),
    y: h - padding - (d.value / max) * (h - 2 * padding),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

  return (
    <div className="relative h-[200px] w-full">
      <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`}>
        <path className="fill-indigo-500/10" d={areaPath} />
        <path className="fill-none stroke-indigo-500 stroke-2" d={linePath} />
        {points.map((p, i) => (
          <circle key={i} className="fill-indigo-500" cx={p.x} cy={p.y} r={4} />
        ))}
      </svg>
    </div>
  );
}

function PieChart({ data }: { data: ChartDataPoint[] }) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  let currentAngle = 0;
  const cx = 80, cy = 80, r = 70;

  const slices = data.map((d, i) => {
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;
    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);
    const largeArc = angle > 180 ? 1 : 0;

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    return { pathData, color: PIE_COLORS[i % PIE_COLORS.length], label: d.label, value: d.value };
  });

  return (
    <div className="flex items-center gap-6">
      <svg className="w-40 h-40" viewBox="0 0 160 160">
        {slices.map((s, i) => (
          <path key={i} d={s.pathData} fill={s.color} />
        ))}
      </svg>
      <div className="flex flex-col gap-1.5">
        {slices.map((s, i) => (
          <div key={i} className="flex items-center gap-2 text-[13px] text-gray-700">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: s.color }} />
            {s.label}: {s.value}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chart({ type = "bar", title, data = [] }: ChartProps) {
  return (
    <div className="p-4">
      {title && <h4 className="text-sm font-semibold text-gray-700 m-0 mb-3">{title}</h4>}
      {type === "bar" && <BarChart data={data} />}
      {type === "line" && <LineChart data={data} />}
      {type === "pie" && <PieChart data={data} />}
    </div>
  );
}
