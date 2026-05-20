import { TrendingUp, Target, AlertTriangle, Zap } from "lucide-react";

interface StatsSummaryProps {
  overallAdherence: number;
  totalGoals: number;
  missedCount: number;
  superpowerCount: number;
}

export function StatsSummary({
  overallAdherence,
  totalGoals,
  missedCount,
  superpowerCount,
}: StatsSummaryProps) {
  const stats = [
    {
      label: "Plan adherence",
      value: `${overallAdherence}%`,
      icon: TrendingUp,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950",
    },
    {
      label: "Active goals",
      value: String(totalGoals),
      icon: Target,
      color: "text-green-600 bg-green-50 dark:bg-green-950",
    },
    {
      label: "Missed (past)",
      value: String(missedCount),
      icon: AlertTriangle,
      color: "text-red-600 bg-red-50 dark:bg-red-950",
    },
    {
      label: "Superpowers used",
      value: String(superpowerCount),
      icon: Zap,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {stats.map(({ label, value, icon: Icon, color }) => (
        <div
          key={label}
          className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900"
        >
          <div className={`mb-3 inline-flex rounded-lg p-2 ${color}`}>
            <Icon className="h-5 w-5" />
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">{value}</p>
          <p className="text-sm text-slate-500">{label}</p>
        </div>
      ))}
    </div>
  );
}
