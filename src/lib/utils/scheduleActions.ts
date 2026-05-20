import type { ScheduleSlot } from "@/types";
import type { TimeSlotFormData } from "@/types";
import { validateNoOverlap } from "@/lib/utils/schedule";

export function getPreviousDayIndex(dayOfWeek: number): number {
  return (dayOfWeek + 6) % 7;
}

export type SlotTemplate = Omit<TimeSlotFormData, "dayOfWeek">;

export function buildSlotsToCreate(
  template: SlotTemplate,
  targetDays: number[],
  existingSlots: ScheduleSlot[]
): TimeSlotFormData[] {
  const toCreate: TimeSlotFormData[] = [];
  const working = [...existingSlots];

  for (const dayOfWeek of targetDays) {
    const entry: TimeSlotFormData = { ...template, dayOfWeek };
    const candidate = {
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
    };

    if (validateNoOverlap(candidate, working)) {
      toCreate.push(entry);
      working.push({
        id: `pending-${dayOfWeek}-${entry.startTime}`,
        userId: "",
        goalId: entry.goalId,
        label: entry.label,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isActive: true,
      });
    }
  }

  return toCreate;
}

export function buildCopyFromDaySlots(
  sourceDay: number,
  targetDay: number,
  existingSlots: ScheduleSlot[]
): TimeSlotFormData[] {
  const source = existingSlots.filter(
    (s) => s.isActive && s.dayOfWeek === sourceDay
  );

  const templates: SlotTemplate[] = source.map((s) => ({
    goalId: s.goalId,
    label: s.label,
    startTime: s.startTime,
    endTime: s.endTime,
  }));

  const toCreate: TimeSlotFormData[] = [];
  const working = [...existingSlots];

  for (const template of templates) {
    const entry: TimeSlotFormData = { ...template, dayOfWeek: targetDay };
    const candidate = {
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
    };

    if (validateNoOverlap(candidate, working)) {
      toCreate.push(entry);
      working.push({
        id: `pending-copy-${entry.startTime}`,
        userId: "",
        goalId: entry.goalId,
        label: entry.label,
        dayOfWeek: entry.dayOfWeek,
        startTime: entry.startTime,
        endTime: entry.endTime,
        isActive: true,
      });
    }
  }

  return toCreate;
}
