"use client";

import { useState } from "react";
import type { Completion, ScheduleSlot } from "@/types";
import {
  canMarkSlotComplete,
  formatTimeDisplay,
  isSlotInFuture,
} from "@/lib/utils/time";
import { isPersonalSlot } from "@/lib/utils/slotDisplay";
import { Button } from "@/components/ui/Button";
import { Check, Clock, X } from "lucide-react";

interface TodaySlotCardProps {
  slot: ScheduleSlot;
  title: string;
  emoji: string;
  completion?: Completion | null;
  onMarkComplete: () => Promise<void>;
}

export function TodaySlotCard({
  slot,
  title,
  emoji,
  completion,
  onMarkComplete,
}: TodaySlotCardProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const personal = isPersonalSlot(slot);

  const isCompleted =
    completion?.status === "completed" || completion?.status === "supplementary";
  const isMissed = completion?.status === "missed";
  const isSupplementary = completion?.status === "supplementary";
  const canComplete = canMarkSlotComplete(slot.endTime);
  const isFuture = isSlotInFuture(slot.startTime);

  async function handleMarkComplete() {
    setLoading(true);
    setError("");
    try {
      await onMarkComplete();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not mark complete.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`rounded-xl border p-4 transition ${
        isCompleted
          ? "border-green-200 bg-green-50 dark:border-green-900 dark:bg-green-950/30"
          : isMissed
            ? "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30"
            : "border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{emoji}</span>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">
              {title}
              {personal && (
                <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-500 dark:bg-slate-800">
                  Personal
                </span>
              )}
            </h3>
            <p className="flex items-center gap-1 text-sm text-slate-500">
              <Clock className="h-3.5 w-3.5" />
              {formatTimeDisplay(slot.startTime)} – {formatTimeDisplay(slot.endTime)}
            </p>
          </div>
        </div>

        {isCompleted && (
          <span className="flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm font-medium text-green-700 dark:bg-green-900 dark:text-green-300">
            <Check className="h-4 w-4" />
            {isSupplementary ? "Superpower ✨" : "Done"}
          </span>
        )}
        {isMissed && !personal && (
          <span className="flex items-center gap-1 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700 dark:bg-red-900 dark:text-red-300">
            <X className="h-4 w-4" />
            Missed
          </span>
        )}
        {isMissed && personal && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600 dark:bg-slate-800">
            Past
          </span>
        )}
      </div>

      {isFuture && !completion && (
        <p className="mt-3 text-sm text-slate-500">This slot hasn&apos;t started yet.</p>
      )}

      {!isCompleted && !isMissed && canComplete && (
        <div className="mt-4">
          <Button onClick={handleMarkComplete} disabled={loading} fullWidth>
            {loading ? "Saving..." : personal ? "Mark block as done" : "Mark as done for today"}
          </Button>
        </div>
      )}

      {!isCompleted && !isMissed && !canComplete && !isFuture && (
        <p className="mt-3 text-sm text-amber-600 dark:text-amber-400">
          Wait until {formatTimeDisplay(slot.endTime)} + 1 min to mark this done.
        </p>
      )}

      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}
