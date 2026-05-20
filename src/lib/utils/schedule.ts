import type { Goal, ScheduleSlot } from "@/types";
import {
  minutesToTimeString,
  parseTimeToMinutes,
  slotsOverlap,
} from "@/lib/utils/time";

export interface ProposedSlot {
  goalId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface GenerateScheduleOptions {
  goals: Goal[];
  activeDays: number[];
  existingSlots?: ScheduleSlot[];
  dailyStartTime?: string;
  dailyEndTime?: string;
  slotDurationMinutes?: number;
}

type TimeRange = { startTime: string; endTime: string };

function rangesOnDay(
  day: number,
  proposed: ProposedSlot[],
  existing: ScheduleSlot[]
): TimeRange[] {
  const fromExisting = existing
    .filter((s) => s.isActive && s.dayOfWeek === day)
    .map((s) => ({ startTime: s.startTime, endTime: s.endTime }));
  const fromProposed = proposed
    .filter((p) => p.dayOfWeek === day)
    .map((p) => ({ startTime: p.startTime, endTime: p.endTime }));
  return [...fromExisting, ...fromProposed].sort((a, b) =>
    a.startTime.localeCompare(b.startTime)
  );
}

function overlapsAny(
  candidate: TimeRange & { dayOfWeek: number },
  proposed: ProposedSlot[],
  existing: ScheduleSlot[]
): boolean {
  const onDay = rangesOnDay(candidate.dayOfWeek, proposed, existing);
  return onDay.some((r) =>
    slotsOverlap(candidate.startTime, candidate.endTime, r.startTime, r.endTime)
  );
}

/** Find the next free window on a day that fits `durationMinutes`. */
function findFreeWindow(
  day: number,
  durationMinutes: number,
  proposed: ProposedSlot[],
  existing: ScheduleSlot[],
  dayStart: string,
  dayEnd: string
): TimeRange | null {
  const dayStartMin = parseTimeToMinutes(dayStart);
  const dayEndMin = parseTimeToMinutes(dayEnd);
  const occupied = rangesOnDay(day, proposed, existing);

  let cursor = dayStartMin;

  for (const block of occupied) {
    const blockStart = parseTimeToMinutes(block.startTime);
    const blockEnd = parseTimeToMinutes(block.endTime);

    if (blockStart - cursor >= durationMinutes) {
      const end = Math.min(cursor + durationMinutes, blockStart, dayEndMin);
      if (end - cursor >= durationMinutes) {
        return {
          startTime: minutesToTimeString(cursor),
          endTime: minutesToTimeString(end),
        };
      }
    }
    cursor = Math.max(cursor, blockEnd);
  }

  if (dayEndMin - cursor >= durationMinutes) {
    return {
      startTime: minutesToTimeString(cursor),
      endTime: minutesToTimeString(cursor + durationMinutes),
    };
  }

  return null;
}

export function validateNoOverlap(
  newSlot: Pick<ScheduleSlot, "dayOfWeek" | "startTime" | "endTime">,
  existingSlots: ScheduleSlot[],
  excludeSlotId?: string
): boolean {
  const sameDaySlots = existingSlots.filter(
    (s) => s.dayOfWeek === newSlot.dayOfWeek && s.id !== excludeSlotId
  );
  return !sameDaySlots.some((s) =>
    slotsOverlap(newSlot.startTime, newSlot.endTime, s.startTime, s.endTime)
  );
}

export function slotsConflictOnDay(
  slot: Pick<ScheduleSlot, "dayOfWeek" | "startTime" | "endTime" | "id">,
  allSlots: ScheduleSlot[]
): boolean {
  const others = allSlots.filter(
    (s) => s.dayOfWeek === slot.dayOfWeek && s.id !== slot.id && s.isActive
  );
  return others.some((s) =>
    slotsOverlap(slot.startTime, slot.endTime, s.startTime, s.endTime)
  );
}

export function countOverlappingSlots(slots: ScheduleSlot[]): number {
  const active = slots.filter((s) => s.isActive);
  let count = 0;
  for (const slot of active) {
    if (slotsConflictOnDay(slot, active)) count++;
  }
  return count;
}

const MAX_GENERATION_ATTEMPTS = 200;

/**
 * Places goal time into free gaps only. Never stacks on existing blocks.
 * Weekly hours per goal are spread across selected days (not 1 slot per total hour globally).
 */
export function generateWeeklySchedule(
  options: GenerateScheduleOptions
): ProposedSlot[] {
  const {
    goals,
    activeDays,
    existingSlots = [],
    dailyStartTime = "09:00",
    dailyEndTime = "22:00",
    slotDurationMinutes = 60,
  } = options;

  const sortedDays = [...activeDays].sort((a, b) => a - b);
  const activeGoals = goals.filter((g) => g.targetHours > 0);
  if (activeGoals.length === 0 || sortedDays.length === 0) {
    return [];
  }

  const proposed: ProposedSlot[] = [];
  let attempts = 0;

  for (const goal of activeGoals) {
    const weeklyMinutes = goal.targetHours * 60;
    const minutesPerDay = weeklyMinutes / sortedDays.length;
    const slotsPerDay = Math.max(
      1,
      Math.ceil(minutesPerDay / slotDurationMinutes)
    );

    for (const day of sortedDays) {
      let placedToday = 0;

      while (placedToday < slotsPerDay && attempts < MAX_GENERATION_ATTEMPTS) {
        attempts++;

        const window = findFreeWindow(
          day,
          slotDurationMinutes,
          proposed,
          existingSlots,
          dailyStartTime,
          dailyEndTime
        );

        if (!window) break;

        const candidate: ProposedSlot = {
          goalId: goal.id,
          dayOfWeek: day,
          startTime: window.startTime,
          endTime: window.endTime,
        };

        if (!overlapsAny(candidate, proposed, existingSlots)) {
          proposed.push(candidate);
          placedToday++;
        } else {
          break;
        }
      }
    }
  }

  return proposed;
}

export function calculateGoalProgressPercent(goal: Goal): number {
  if (goal.targetHours <= 0) return 0;
  return Math.min(100, Math.round((goal.completedHours / goal.targetHours) * 100));
}
