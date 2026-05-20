import type { Goal, ScheduleSlot } from "@/types";
import { DAYS_OF_WEEK, formatTimeDisplay } from "@/lib/utils/time";
import { slotsConflictOnDay } from "@/lib/utils/schedule";
import { getSlotEmoji, getSlotTitle, isPersonalSlot } from "@/lib/utils/slotDisplay";

interface TimeSlotListProps {
  slots: ScheduleSlot[];
  goals: Goal[];
  onDelete: (slotId: string) => void;
}

export function TimeSlotList({ slots, goals, onDelete }: TimeSlotListProps) {
  if (slots.length === 0) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400">
        No time slots yet. Add manually or copy from another day.
      </p>
    );
  }

  const goalMap = new Map(goals.map((g) => [g.id, g]));
  const active = slots.filter((s) => s.isActive);

  const grouped = DAYS_OF_WEEK.map((_, dayIndex) => ({
    day: DAYS_OF_WEEK[dayIndex],
    slots: active
      .filter((s) => s.dayOfWeek === dayIndex)
      .sort((a, b) => a.startTime.localeCompare(b.startTime)),
  })).filter((g) => g.slots.length > 0);

  return (
    <div className="flex flex-col gap-4">
      {grouped.map(({ day, slots: daySlots }) => (
        <div key={day}>
          <h4 className="mb-2 font-medium text-slate-700 dark:text-slate-300">
            {day}
            <span className="ml-2 text-xs font-normal text-slate-400">
              ({daySlots.length})
            </span>
          </h4>
          <div className="flex flex-col gap-2">
            {daySlots.map((slot) => {
              const goal = slot.goalId ? goalMap.get(slot.goalId) : undefined;
              const personal = isPersonalSlot(slot);
              const overlaps = slotsConflictOnDay(slot, active);

              return (
                <div
                  key={slot.id}
                  className={`flex items-center justify-between rounded-lg border px-4 py-3 ${
                    overlaps
                      ? "border-red-400 bg-red-50/80 dark:border-red-700 dark:bg-red-950/40"
                      : "border-slate-200 dark:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{getSlotEmoji(slot, goal)}</span>
                    <div>
                      <p className="font-medium text-slate-900 dark:text-slate-100">
                        {getSlotTitle(slot, goal)}
                        {overlaps && (
                          <span className="ml-2 text-xs font-normal text-red-600">
                            Overlaps another slot
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatTimeDisplay(slot.startTime)} –{" "}
                        {formatTimeDisplay(slot.endTime)}
                        {personal && (
                          <span className="ml-2 text-xs text-slate-400">· Personal</span>
                        )}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onDelete(slot.id)}
                    className="shrink-0 text-sm text-red-500 hover:underline"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
