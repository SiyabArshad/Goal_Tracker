"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGoals, fetchCompletionsInRange } from "@/services/dataAccess";
import {
  getAdherenceProgress,
  calculateOverallAdherence,
} from "@/services/progressService";
import { AdherenceChart } from "@/components/dashboard/AdherenceChart";
import { StatsSummary } from "@/components/dashboard/StatsSummary";
import { MissedItemsList } from "@/components/dashboard/MissedItemsList";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { DayProgress } from "@/types";

export function DashboardView() {
  const { userId } = useAuth();
  const [progress, setProgress] = useState<DayProgress[]>([]);
  const [overallAdherence, setOverallAdherence] = useState(0);
  const [totalGoals, setTotalGoals] = useState(0);
  const [missedCount, setMissedCount] = useState(0);
  const [superpowerCount, setSuperpowerCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (!userId) return;
      setLoading(true);
      try {
        const [dayProgress, goals, completions] = await Promise.all([
          getAdherenceProgress(userId, 14),
          fetchGoals(userId),
          fetchCompletionsInRange(userId, 30),
        ]);
        setProgress(dayProgress);
        setOverallAdherence(calculateOverallAdherence(dayProgress));
        setTotalGoals(goals.length);
        setMissedCount(completions.filter((c) => c.status === "missed").length);
        setSuperpowerCount(
          completions.filter((c) => c.status === "supplementary").length
        );
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Dashboard</h1>
        <p className="mt-1 text-slate-500">
          Track how well you stick to your plan over the last 14 days.
        </p>
      </div>

      <StatsSummary
        overallAdherence={overallAdherence}
        totalGoals={totalGoals}
        missedCount={missedCount}
        superpowerCount={superpowerCount}
      />

      <Card title="Adherence chart" description="Completed vs missed vs superpower per day">
        <AdherenceChart progress={progress} />
      </Card>

      <Card
        title="Missed goals"
        description="Use Superpower to count these as done in supplementary time"
      >
        <MissedItemsList />
      </Card>
    </div>
  );
}
