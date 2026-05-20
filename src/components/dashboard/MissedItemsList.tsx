"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  fetchMissedCompletions,
  fetchGoals,
  fetchSlots,
} from "@/services/dataAccess";
import { applySuperpower } from "@/services/completionService";
import { SuperpowerButton } from "@/components/dashboard/SuperpowerButton";
import { formatTimeDisplay } from "@/lib/utils/time";
import { getSlotEmoji, getSlotTitle } from "@/lib/utils/slotDisplay";
import type { Completion, Goal, ScheduleSlot } from "@/types";
import { format, parseISO } from "date-fns";

export function MissedItemsList() {
  const { userId } = useAuth();
  const [missed, setMissed] = useState<Completion[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadData() {
    if (!userId) return;
    setLoading(true);
    try {
      const [missedItems, fetchedGoals, fetchedSlots] = await Promise.all([
        fetchMissedCompletions(userId),
        fetchGoals(userId),
        fetchSlots(userId),
      ]);
      setMissed(missedItems);
      setGoals(fetchedGoals);
      setSlots(fetchedSlots);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, [userId]);

  const goalMap = new Map(goals.map((g) => [g.id, g]));
  const slotMap = new Map(slots.map((s) => [s.id, s]));

  async function handleSuperpower(completion: Completion) {
    if (!userId) return;
    const slot = slotMap.get(completion.slotId);
    if (!slot) return;
    await applySuperpower(userId, completion, slot);
    await loadData();
  }

  if (loading) return null;

  if (missed.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No missed goals in the past. Keep sticking to your plan!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {missed.map((completion) => {
        const slot = slotMap.get(completion.slotId);
        const goal = completion.goalId ? goalMap.get(completion.goalId) : undefined;
        if (!slot) return null;
        return (
          <div
            key={completion.id}
            className="flex items-center justify-between rounded-xl border border-red-200 bg-red-50/50 px-4 py-3 dark:border-red-900 dark:bg-red-950/20"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getSlotEmoji(slot, goal)}</span>
              <div>
                <p className="font-medium text-slate-900 dark:text-slate-100">
                  {getSlotTitle(slot, goal)}
                </p>
                <p className="text-sm text-slate-500">
                  {format(parseISO(completion.date), "MMM d, yyyy")}
                  {` · ${formatTimeDisplay(slot.startTime)} – ${formatTimeDisplay(slot.endTime)}`}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Mark as done in supplementary time — progress will still count.
                </p>
              </div>
            </div>
            <SuperpowerButton onActivate={() => handleSuperpower(completion)} />
          </div>
        );
      })}
    </div>
  );
}
