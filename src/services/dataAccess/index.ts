import { isGuestUserId } from "@/lib/storage/guestMode";
import * as firestoreGoals from "@/repositories/goalRepository";
import * as guestGoals from "@/repositories/guest/goalRepository.guest";
import * as firestoreSchedule from "@/repositories/scheduleRepository";
import * as guestSchedule from "@/repositories/guest/scheduleRepository.guest";
import * as firestoreCompletions from "@/repositories/completionRepository";
import * as guestCompletions from "@/repositories/guest/completionRepository.guest";

function goals(userId: string) {
  return isGuestUserId(userId) ? guestGoals : firestoreGoals;
}

function schedule(userId: string) {
  return isGuestUserId(userId) ? guestSchedule : firestoreSchedule;
}

function completions(userId: string) {
  return isGuestUserId(userId) ? guestCompletions : firestoreCompletions;
}

// Goals
export const fetchGoals = (userId: string) => goals(userId).fetchGoals(userId);
export const createGoal = (
  userId: string,
  input: Parameters<typeof firestoreGoals.createGoal>[1]
) => goals(userId).createGoal(userId, input);
export const updateGoal = (
  userId: string,
  goalId: string,
  input: Parameters<typeof firestoreGoals.updateGoal>[2]
) => goals(userId).updateGoal(userId, goalId, input);
export const deleteGoal = (userId: string, goalId: string) =>
  goals(userId).deleteGoal(userId, goalId);
export const addCompletedHours = (
  userId: string,
  goalId: string,
  hours: number
) => goals(userId).addCompletedHours(userId, goalId, hours);

// Schedule
export const fetchSlots = (userId: string) => schedule(userId).fetchSlots(userId);
export const fetchSlotsForDay = (userId: string, dayOfWeek: number) =>
  schedule(userId).fetchSlotsForDay(userId, dayOfWeek);
export const createSlot = (
  userId: string,
  input: Parameters<typeof firestoreSchedule.createSlot>[1]
) => schedule(userId).createSlot(userId, input);
export const deleteSlot = (userId: string, slotId: string) =>
  schedule(userId).deleteSlot(userId, slotId);
export const createSlotsBatch = (
  userId: string,
  slots: Parameters<typeof firestoreSchedule.createSlotsBatch>[1]
) => schedule(userId).createSlotsBatch(userId, slots);
export const deleteAllSlots = (userId: string) =>
  schedule(userId).deleteAllSlots(userId);

// Completions
export const fetchCompletionsForDate = (userId: string, date: string) =>
  completions(userId).fetchCompletionsForDate(userId, date);
export const fetchCompletionsInRange = (userId: string, days: number) =>
  completions(userId).fetchCompletionsInRange(userId, days);
export const fetchMissedCompletions = (userId: string) =>
  completions(userId).fetchMissedCompletions(userId);
export const createCompletion = (
  userId: string,
  input: Parameters<typeof firestoreCompletions.createCompletion>[1]
) => completions(userId).createCompletion(userId, input);
export const updateCompletionStatus = (
  userId: string,
  completionId: string,
  status: Parameters<typeof firestoreCompletions.updateCompletionStatus>[2]
) => completions(userId).updateCompletionStatus(userId, completionId, status);
export const getCompletionForSlotAndDate = (
  userId: string,
  slotId: string,
  date: string
) => completions(userId).getCompletionForSlotAndDate(userId, slotId, date);
export const deleteAllCompletions = (userId: string) =>
  completions(userId).deleteAllCompletions(userId);

// Bulk delete
export async function deleteAllGoals(userId: string): Promise<number> {
  if (isGuestUserId(userId)) {
    return guestGoals.deleteAllGoals(userId);
  }
  const list = await firestoreGoals.fetchGoals(userId);
  await Promise.all(list.map((g) => firestoreGoals.deleteGoal(userId, g.id)));
  return list.length;
}

export async function deleteAllUserData(userId: string): Promise<{
  goals: number;
  slots: number;
  completions: number;
}> {
  const [goalsCount, slotsCount, completionsCount] = await Promise.all([
    deleteAllGoals(userId),
    deleteAllSlots(userId),
    deleteAllCompletions(userId),
  ]);
  return {
    goals: goalsCount,
    slots: slotsCount,
    completions: completionsCount,
  };
}
