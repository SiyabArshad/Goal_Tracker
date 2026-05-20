"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  deleteAllCompletions,
  deleteAllGoals,
  deleteAllSlots,
  deleteAllUserData,
} from "@/services/dataAccess";
import { clearGuestDb } from "@/lib/storage/localDb";
import { isGuestUserId } from "@/lib/storage/guestMode";

interface DataManagementPanelProps {
  slotCount: number;
  goalCount: number;
  onDataChanged: () => void;
}

const linkClass =
  "text-sm text-red-600/90 hover:text-red-600 hover:underline disabled:opacity-40 disabled:no-underline dark:text-red-400";

export function DataManagementPanel({
  slotCount,
  goalCount,
  onDataChanged,
}: DataManagementPanelProps) {
  const { userId } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  if (goalCount === 0 && slotCount === 0) return null;

  async function runAction(
    key: string,
    action: () => Promise<void>,
    confirmMessage: string
  ) {
    if (!userId || !confirm(confirmMessage)) return;
    setLoading(key);
    try {
      await action();
      onDataChanged();
    } finally {
      setLoading(null);
    }
  }

  const busy = loading !== null;

  return (
    <footer className="mt-10 border-t border-slate-100 pt-4 dark:border-slate-800">
      <p className="mb-2 text-xs text-slate-400">Remove data</p>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
        {slotCount > 0 && (
          <button
            type="button"
            disabled={busy}
            className={linkClass}
            onClick={() =>
              runAction(
                "schedule",
                async () => {
                  await deleteAllSlots(userId!);
                  await deleteAllCompletions(userId!);
                },
                `Clear timetable (${slotCount} blocks) and check-ins?`
              )
            }
          >
            {loading === "schedule" ? "Clearing…" : "Clear timetable"}
          </button>
        )}
        {goalCount > 0 && slotCount > 0 && (
          <span className="text-slate-300 dark:text-slate-600">·</span>
        )}
        {goalCount > 0 && (
          <button
            type="button"
            disabled={busy}
            className={linkClass}
            onClick={() =>
              runAction(
                "goals",
                async () => {
                  await deleteAllGoals(userId!);
                },
                `Delete all ${goalCount} goals?`
              )
            }
          >
            {loading === "goals" ? "Deleting…" : "Delete all goals"}
          </button>
        )}
        {(goalCount > 0 || slotCount > 0) && (
          <>
            <span className="text-slate-300 dark:text-slate-600">·</span>
            <button
              type="button"
              disabled={busy}
              className={linkClass}
              onClick={() =>
                runAction(
                  "all",
                  async () => {
                    await deleteAllUserData(userId!);
                    if (isGuestUserId(userId!)) clearGuestDb();
                  },
                  "Delete everything (goals, timetable, history)? Cannot be undone."
                )
              }
            >
              {loading === "all" ? "Deleting…" : "Reset all"}
            </button>
          </>
        )}
      </div>
    </footer>
  );
}
