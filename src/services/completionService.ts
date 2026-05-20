import {
  createCompletion,
  fetchCompletionsForDate,
  getCompletionForSlotAndDate,
  updateCompletionStatus,
  addCompletedHours,
} from "@/services/dataAccess";
import { getSlotDurationMinutes, canMarkSlotComplete } from "@/lib/utils/time";
import { isPersonalSlot } from "@/lib/utils/slotDisplay";
import type { Completion, ScheduleSlot } from "@/types";

async function addGoalHoursIfLinked(
  userId: string,
  slot: ScheduleSlot,
  hours: number
): Promise<void> {
  if (isPersonalSlot(slot) || !slot.goalId) return;
  await addCompletedHours(userId, slot.goalId, hours);
}

export async function markSlotCompleted(
  userId: string,
  slot: ScheduleSlot,
  date: string
): Promise<Completion> {
  if (!canMarkSlotComplete(slot.endTime)) {
    throw new Error("You can only mark this done after the time slot ends.");
  }

  const existing = await getCompletionForSlotAndDate(userId, slot.id, date);

  if (existing?.status === "completed" || existing?.status === "supplementary") {
    return existing;
  }

  const hours = getSlotDurationMinutes(slot.startTime, slot.endTime) / 60;

  if (existing) {
    await updateCompletionStatus(userId, existing.id, "completed");
    await addGoalHoursIfLinked(userId, slot, hours);
    return { ...existing, status: "completed" };
  }

  await createCompletion(userId, {
    slotId: slot.id,
    goalId: slot.goalId,
    date,
    status: "completed",
  });
  await addGoalHoursIfLinked(userId, slot, hours);

  const updated = await getCompletionForSlotAndDate(userId, slot.id, date);
  return updated!;
}

export async function markSlotMissed(
  userId: string,
  slot: ScheduleSlot,
  date: string
): Promise<Completion> {
  const existing = await getCompletionForSlotAndDate(userId, slot.id, date);
  if (existing) return existing;

  if (isPersonalSlot(slot)) {
    return {
      id: "",
      userId,
      slotId: slot.id,
      goalId: null,
      date,
      status: "completed",
    };
  }

  const id = await createCompletion(userId, {
    slotId: slot.id,
    goalId: slot.goalId,
    date,
    status: "missed",
  });

  return {
    id,
    userId,
    slotId: slot.id,
    goalId: slot.goalId,
    date,
    status: "missed",
  };
}

export async function applySuperpower(
  userId: string,
  completion: Completion,
  slot: ScheduleSlot
): Promise<Completion> {
  if (completion.status !== "missed") {
    throw new Error("Superpower can only be used on missed goals.");
  }

  if (isPersonalSlot(slot) || !slot.goalId) {
    throw new Error("Superpower only applies to goal-linked slots.");
  }

  await updateCompletionStatus(userId, completion.id, "supplementary");
  const hours = getSlotDurationMinutes(slot.startTime, slot.endTime) / 60;
  await addCompletedHours(userId, slot.goalId, hours);

  return { ...completion, status: "supplementary" };
}

export async function syncTodayMissedSlots(
  userId: string,
  slots: ScheduleSlot[],
  date: string
): Promise<void> {
  const completions = await fetchCompletionsForDate(userId, date);
  const now = new Date();

  for (const slot of slots) {
    if (isPersonalSlot(slot)) continue;

    const existing = completions.find((c) => c.slotId === slot.id);
    if (existing) continue;

    const slotEnded = canMarkSlotComplete(slot.endTime, now);
    if (slotEnded) {
      await markSlotMissed(userId, slot, date);
    }
  }
}
