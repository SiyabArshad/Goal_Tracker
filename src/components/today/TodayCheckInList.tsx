"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { fetchGoals } from "@/services/dataAccess";
import { fetchSlotsForDay } from "@/services/dataAccess";
import { fetchCompletionsForDate } from "@/services/dataAccess";
import {
  markSlotCompleted,
  syncTodayMissedSlots,
} from "@/services/completionService";
import { TodaySlotCard } from "@/components/today/TodaySlotCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { getTodayDateKey } from "@/lib/utils/time";
import { getSlotEmoji, getSlotTitle } from "@/lib/utils/slotDisplay";
import type { Completion, Goal, ScheduleSlot } from "@/types";
import { format } from "date-fns";

export function TodayCheckInList() {
  const { userId } = useAuth();
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const dayOfWeek = today.getDay();
  const dateKey = getTodayDateKey();

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [fetchedSlots, fetchedGoals] = await Promise.all([
        fetchSlotsForDay(userId, dayOfWeek),
        fetchGoals(userId),
      ]);

      await syncTodayMissedSlots(userId, fetchedSlots, dateKey);

      const fetchedCompletions = await fetchCompletionsForDate(userId, dateKey);
      setSlots(fetchedSlots);
      setGoals(fetchedGoals);
      setCompletions(fetchedCompletions);
    } finally {
      setLoading(false);
    }
  }, [userId, dayOfWeek, dateKey]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const goalMap = new Map(goals.map((g) => [g.id, g]));

  async function handleMarkComplete(slot: ScheduleSlot) {
    if (!userId) return;
    await markSlotCompleted(userId, slot, dateKey);
    await loadData();
  }

  if (loading) return <LoadingSpinner />;

  const completedCount = completions.filter(
    (c) => c.status === "completed" || c.status === "supplementary"
  ).length;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Today&apos;s check-in
        </h1>
        <p className="mt-1 text-slate-500">
          {format(today, "EEEE, MMMM d, yyyy")} · {completedCount}/{slots.length} done
        </p>
      </div>

      {slots.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-600">
          <p className="text-slate-500">
            Nothing scheduled for today. Add time slots on the Schedule page.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {slots.map((slot) => {
            const goal = slot.goalId ? goalMap.get(slot.goalId) : undefined;
            const completion = completions.find((c) => c.slotId === slot.id);
            return (
              <TodaySlotCard
                key={slot.id}
                slot={slot}
                title={getSlotTitle(slot, goal)}
                emoji={getSlotEmoji(slot, goal)}
                completion={completion}
                onMarkComplete={() => handleMarkComplete(slot)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
