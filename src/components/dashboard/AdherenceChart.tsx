"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DayProgress } from "@/types";
import { formatProgressDate } from "@/services/progressService";

interface AdherenceChartProps {
  progress: DayProgress[];
}

export function AdherenceChart({ progress }: AdherenceChartProps) {
  const chartData = progress.map((p) => ({
    date: formatProgressDate(p.date),
    completed: p.completed,
    missed: p.missed,
    supplementary: p.supplementary,
    adherence: p.adherencePercent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700" />
        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 12 }} />
        <Tooltip />
        <Legend />
        <Bar dataKey="completed" name="Completed" fill="#22c55e" stackId="a" />
        <Bar dataKey="supplementary" name="Superpower" fill="#f59e0b" stackId="a" />
        <Bar dataKey="missed" name="Missed" fill="#ef4444" stackId="a" />
      </BarChart>
    </ResponsiveContainer>
  );
}
