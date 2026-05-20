"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createSlot,
  deleteSlot,
  fetchGoals,
  fetchSlots,
} from "@/services/dataAccess";
import {
  buildCopyFromDaySlots,
  buildSlotsToCreate,
  getPreviousDayIndex,
} from "@/lib/utils/scheduleActions";
import { countOverlappingSlots } from "@/lib/utils/schedule";
import { TimeSlotForm } from "@/components/schedule/TimeSlotForm";
import type { TimeSlotFormData } from "@/types";
import { TimeSlotList } from "@/components/schedule/TimeSlotList";
import { DataManagementPanel } from "@/components/data/DataManagementPanel";
import { Card } from "@/components/ui/Card";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Goal, ScheduleSlot } from "@/types";

export default function SchedulePage() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(
    async (isRefresh = false) => {
      if (!userId) return;
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      try {
        const [fetchedGoals, fetchedSlots] = await Promise.all([
          fetchGoals(userId),
          fetchSlots(userId),
        ]);
        setGoals(fetchedGoals);
        setSlots(fetchedSlots.filter((s) => s.isActive));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const overlapCount = useMemo(() => countOverlappingSlots(slots), [slots]);

  async function createMany(entries: TimeSlotFormData[]): Promise<number> {
    if (!userId) return 0;
    let added = 0;
    for (const data of entries) {
      await createSlot(userId, { ...data, isActive: true });
      added++;
    }
    if (added > 0) await loadData(true);
    return added;
  }

  async function handleAdd(data: TimeSlotFormData) {
    await createMany([data]);
  }

  async function handleCopyFromPreviousDay(targetDay: number) {
    const sourceDay = getPreviousDayIndex(targetDay);
    const entries = buildCopyFromDaySlots(sourceDay, targetDay, slots);
    const added = await createMany(entries);
    return { added };
  }

  async function handleApplyToAllWeek(template: Omit<TimeSlotFormData, "dayOfWeek">) {
    const entries = buildSlotsToCreate(template, [0, 1, 2, 3, 4, 5, 6], slots);
    const added = await createMany(entries);
    return { added };
  }

  async function handleDeleteSlot(slotId: string) {
    if (!userId) return;
    await deleteSlot(userId, slotId);
    await loadData(true);
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
          Weekly schedule
        </h1>
        <p className="mt-1 text-slate-500">
          Link slots to goals or add personal blocks (job, uni). No overlapping times.
        </p>
        {overlapCount > 0 && (
          <p className="mt-2 text-sm text-red-600 dark:text-red-400">
            {overlapCount} overlapping slot{overlapCount > 1 ? "s" : ""} detected — remove
            duplicates or clear timetable below.
          </p>
        )}
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card title="Add time slot">
          {refreshing && (
            <p className="mb-3 text-sm text-indigo-600 dark:text-indigo-400">
              Updating schedule…
            </p>
          )}
          <TimeSlotForm
            goals={goals}
            existingSlots={slots}
            onAdd={handleAdd}
            onCopyFromPreviousDay={handleCopyFromPreviousDay}
            onApplyToAllWeek={handleApplyToAllWeek}
          />
        </Card>

        <Card title="Your timetable">
          <TimeSlotList slots={slots} goals={goals} onDelete={handleDeleteSlot} />
        </Card>
      </div>

      <DataManagementPanel
        slotCount={slots.length}
        goalCount={goals.length}
        onDataChanged={() => loadData(true)}
      />
    </div>
  );
}
