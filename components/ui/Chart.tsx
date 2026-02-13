import React from "react";

interface ChartDataPoint {
  label: string;
  value: number;
}

interface ChartProps {
  type?: "bar" | "line" | "pie";
  title?: string;
  data?: ChartDataPoint[];
  theme?: "light" | "dark";
}

const PIE_COLORS = ["#6366f1", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316", "#ec4899"];

function BarChart({ data, isDark }: { data: ChartDataPoint[]; isDark: boolean }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3 h-[200px] py-2">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center flex-1 gap-1.5 h-full justify-end">
          <span className={`text-[11px] font-medium ${isDark ? "text-gray-300" : "text-gray-700"}`}>{d.value}</span>
          <div
            className="w-full max-w-14 bg-gradient-to-t from-[#a5d5d5] to-[#92c9c9] rounded-t-md hover:from-[#92c9c9] hover:to-[#74bdbd] transition-all min-h-1 shadow-sm"
            style={{ height: `${(d.value / max) * 100}%` }}
          />
          <span className={`text-[11px] text-center whitespace-nowrap ${isDark ? "text-gray-400" : "text-gray-500"}`}>{d.label}</span>
        </div>
      ))}
    </div>
  );
}

function LineChart({ data, isDark }: { data: ChartDataPoint[]; isDark: boolean }) {
  if (data.length === 0) return null;
  const max = Math.max(...data.map((d) => d.value), 1);
  const w = 400;
  const h = 200;
  const padding = 30;

  const points = data.map((d, i) => ({
    x: padding + (i / Math.max(data.length - 1, 1)) * (w - 2 * padding),
    y: h - padding - (d.value / max) * (h - 2 * padding),
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - padding} L ${points[0].x} ${h - padding} Z`;

  return (
    <div className="relative h-[200px] w-full">
      <svg className="w-full h-full" viewBox={`0 0 ${w} ${h}`}>
        <defs>
             <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
               <stop offset="0%" stopColor="#a5d5d5" stopOpacity="0.28" />
               <stop offset="100%" stopColor="#a5d5d5" stopOpacity="0.05" />
             </linearGradient>
        </defs>
        <path fill="url(#areaGradient)" d={areaPath} />
           <path className="fill-none stroke-[#a5d5d5] stroke-[2.5]" d={linePath} strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <g key={i}>
               <circle className="fill-white stroke-[#a5d5d5] stroke-2" cx={p.x} cy={p.y} r={5} />
               <circle className="fill-[#a5d5d5]" cx={p.x} cy={p.y} r={2} />
          </g>
        ))}
      </svg>
    </div>
  );
}

function PieChart({ data, isDark }: { data: ChartDataPoint[]; isDark: boolean }) {
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
    <div className="flex items-center gap-6 flex-wrap">
      <svg className="w-40 h-40" viewBox="0 0 160 160">
        {slices.map((s, i) => (
          <path key={i} d={s.pathData} fill={s.color} className="hover:opacity-80 transition-opacity" />
        ))}
      </svg>
      <div className="flex flex-col gap-2">
        {slices.map((s, i) => (
          <div key={i} className={`flex items-center gap-2.5 text-[13px] ${isDark ? "text-gray-300" : "text-gray-700"}`}>
            <div className="w-3 h-3 rounded" style={{ backgroundColor: s.color }} />
            <span className="font-medium">{s.label}:</span>
            <span className={isDark ? "text-gray-400" : "text-gray-500"}>{s.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Chart({ type = "bar", title, data = [], theme = "light" }: ChartProps) {
  const isDark = theme === "dark";
  
  return (
    <div className={`p-5 rounded-xl ${isDark ? "bg-gray-800/50" : "bg-gray-50"}`}>
      {title && <h4 className={`text-sm font-semibold m-0 mb-4 ${isDark ? "text-gray-200" : "text-gray-700"}`}>{title}</h4>}
      {type === "bar" && <BarChart data={data} isDark={isDark} />}
      {type === "line" && <LineChart data={data} isDark={isDark} />}
      {type === "pie" && <PieChart data={data} isDark={isDark} />}
    </div>
  );
}
