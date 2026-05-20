import { fetchCompletionsInRange } from "@/services/dataAccess";
import type { DayProgress } from "@/types";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

export async function getAdherenceProgress(
  userId: string,
  days: number = 14
): Promise<DayProgress[]> {
  const completions = await fetchCompletionsInRange(userId, days);
  const interval = {
    start: subDays(new Date(), days - 1),
    end: new Date(),
  };

  const allDays = eachDayOfInterval(interval);

  return allDays.map((day) => {
    const dateKey = format(day, "yyyy-MM-dd");
    const dayCompletions = completions.filter((c) => c.date === dateKey);

    const completed = dayCompletions.filter((c) => c.status === "completed").length;
    const missed = dayCompletions.filter((c) => c.status === "missed").length;
    const supplementary = dayCompletions.filter(
      (c) => c.status === "supplementary"
    ).length;
    const total = dayCompletions.length;
    const adherencePercent =
      total > 0
        ? Math.round(((completed + supplementary) / total) * 100)
        : 0;

    return {
      date: dateKey,
      completed,
      missed,
      supplementary,
      total,
      adherencePercent,
    };
  });
}

export function calculateOverallAdherence(progress: DayProgress[]): number {
  const daysWithSlots = progress.filter((p) => p.total > 0);
  if (daysWithSlots.length === 0) return 0;

  const sum = daysWithSlots.reduce((acc, p) => acc + p.adherencePercent, 0);
  return Math.round(sum / daysWithSlots.length);
}

export function formatProgressDate(date: string): string {
  return format(parseISO(date), "MMM d");
}
