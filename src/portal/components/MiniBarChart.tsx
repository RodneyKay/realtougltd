import React from 'react';

interface MiniBarChartProps {
  data: { label: string; value: number }[];
  emptyLabel?: string;
}

export const MiniBarChart: React.FC<MiniBarChartProps> = ({ data, emptyLabel = 'No data yet' }) => {
  if (data.length === 0) {
    return <div className="h-40 flex items-center justify-center text-xs text-gray-400">{emptyLabel}</div>;
  }

  const max = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="flex items-end justify-between gap-3 h-40">
      {data.map((d) => {
        const heightPct = Math.max((d.value / max) * 100, 4);
        return (
          <div key={d.label} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
            <span className="text-[11px] font-bold text-gray-700">{d.value.toLocaleString()}</span>
            <div className="w-full max-w-9 rounded-t-md bg-gradient-to-t from-emerald-500 to-teal-400" style={{ height: `${heightPct}%` }} />
            <span className="text-[10px] text-gray-400 text-center leading-tight line-clamp-2 max-w-[72px]">{d.label}</span>
          </div>
        );
      })}
    </div>
  );
};
