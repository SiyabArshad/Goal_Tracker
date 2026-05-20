import type { Goal, ScheduleSlot } from "@/types";

export function isPersonalSlot(slot: ScheduleSlot): boolean {
  return slot.goalId === null || slot.goalId === "";
}

export function getSlotEmoji(slot: ScheduleSlot, goal?: Goal): string {
  if (goal) return goal.emoji;
  return "📋";
}

export function getSlotTitle(slot: ScheduleSlot, goal?: Goal): string {
  if (goal) return goal.name;
  return slot.label?.trim() || "Personal time";
}
