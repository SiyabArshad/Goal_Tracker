"use client";

import { FormEvent, useEffect, useState } from "react";
import type { Goal, ScheduleSlot, TimeSlotFormData } from "@/types";
import { validateNoOverlap } from "@/lib/utils/schedule";
import { getPreviousDayIndex } from "@/lib/utils/scheduleActions";
import { DAYS_OF_WEEK } from "@/lib/utils/time";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { DayPicker } from "@/components/schedule/DayPicker";

interface TimeSlotFormProps {
  goals: Goal[];
  existingSlots: ScheduleSlot[];
  onAdd: (data: TimeSlotFormData) => Promise<void>;
  onCopyFromPreviousDay: (targetDay: number) => Promise<{ added: number }>;
  onApplyToAllWeek: (template: Omit<TimeSlotFormData, "dayOfWeek">) => Promise<{ added: number }>;
}

export function TimeSlotForm({
  goals,
  existingSlots,
  onAdd,
  onCopyFromPreviousDay,
  onApplyToAllWeek,
}: TimeSlotFormProps) {
  const [slotType, setSlotType] = useState<"goal" | "personal">("goal");
  const [goalId, setGoalId] = useState(goals[0]?.id ?? "");
  const [label, setLabel] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState(1);
  const [startTime, setStartTime] = useState("09:00");
  const [endTime, setEndTime] = useState("10:00");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (goals.length > 0 && !goalId) setGoalId(goals[0].id);
  }, [goals, goalId]);

  function getTemplate(): Omit<TimeSlotFormData, "dayOfWeek"> | null {
    if (slotType === "goal" && !goalId) return null;
    if (slotType === "personal" && !label.trim()) return null;
    if (startTime >= endTime) return null;
    return {
      goalId: slotType === "goal" ? goalId : null,
      label: slotType === "personal" ? label.trim() : undefined,
      startTime,
      endTime,
    };
  }

  function validateTemplate(): string | null {
    if (slotType === "goal" && goals.length === 0) {
      return "Create a goal first, or use a personal time block.";
    }
    if (slotType === "goal" && !goalId) return "Select a goal.";
    if (slotType === "personal" && !label.trim()) {
      return "Enter a name (e.g. University, Job).";
    }
    if (startTime >= endTime) return "End time must be after start time.";
    return null;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const err = validateTemplate();
    if (err) {
      setError(err);
      return;
    }

    const data: TimeSlotFormData = { ...getTemplate()!, dayOfWeek };
    if (!validateNoOverlap(data, existingSlots)) {
      setError("This time slot overlaps with an existing slot. One activity per time.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onAdd(data);
      setStartTime(endTime);
      const [h, m] = endTime.split(":").map(Number);
      setEndTime(
        `${String(Math.min(23, h + 1)).padStart(2, "0")}:${String(m).padStart(2, "0")}`
      );
      if (slotType === "personal") setLabel("");
    } catch {
      setError("Failed to add time slot. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopyPrevious() {
    setLoading(true);
    setError("");
    try {
      const { added } = await onCopyFromPreviousDay(dayOfWeek);
      if (added === 0) {
        setError(
          `Nothing to copy — ${DAYS_OF_WEEK[getPreviousDayIndex(dayOfWeek)]} is empty or everything overlaps.`
        );
      }
    } catch {
      setError("Failed to copy from previous day.");
    } finally {
      setLoading(false);
    }
  }

  async function handleAllWeek() {
    const err = validateTemplate();
    if (err) {
      setError(err);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const { added } = await onApplyToAllWeek(getTemplate()!);
      if (added === 0) setError("No free slots this week for these times.");
    } catch {
      setError("Failed to apply to all week.");
    } finally {
      setLoading(false);
    }
  }

  const prevDay = DAYS_OF_WEEK[getPreviousDayIndex(dayOfWeek)].slice(0, 3);
  const curDay = DAYS_OF_WEEK[dayOfWeek].slice(0, 3);

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Block type
        </span>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSlotType("goal")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              slotType === "goal"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Goal
          </button>
          <button
            type="button"
            onClick={() => setSlotType("personal")}
            className={`rounded-lg px-3 py-2 text-sm font-medium transition ${
              slotType === "personal"
                ? "bg-indigo-600 text-white"
                : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
            }`}
          >
            Personal (job / uni)
          </button>
        </div>
      </div>

      {slotType === "goal" ? (
        goals.length === 0 ? (
          <p className="text-sm text-amber-600 dark:text-amber-400">
            No goals yet. Use a personal block, or create a goal first.
          </p>
        ) : (
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Goal
            </label>
            <select
              value={goalId}
              onChange={(e) => setGoalId(e.target.value)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-600 dark:bg-slate-900"
            >
              {goals.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.emoji} {g.name}
                </option>
              ))}
            </select>
          </div>
        )
      ) : (
        <Input
          label="What is this time for?"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="e.g. University lectures, Part-time job"
          required
        />
      )}

      <DayPicker value={dayOfWeek} onChange={setDayOfWeek} />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Start time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          required
        />
        <Input
          label="End time"
          type="time"
          value={endTime}
          onChange={(e) => setEndTime(e.target.value)}
          required
        />
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <Button type="submit" fullWidth disabled={loading || (slotType === "goal" && goals.length === 0)}>
        {loading ? "Adding..." : "Add time slot"}
      </Button>

      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={handleCopyPrevious}>
          Copy {prevDay} → {curDay}
        </Button>
        <Button type="button" variant="secondary" size="sm" disabled={loading} onClick={handleAllWeek}>
          Apply to all week
        </Button>
      </div>
    </form>
  );
}
