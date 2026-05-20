import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { ScheduleSlot } from "@/types";
import type { ProposedSlot } from "@/lib/utils/schedule";

function slotsCollection(userId: string) {
  return collection(db, "users", userId, "slots");
}

function mapSlotDoc(id: string, data: Record<string, unknown>): ScheduleSlot {
  const rawGoalId = data.goalId as string | null | undefined;
  const goalId =
    rawGoalId === undefined || rawGoalId === null || rawGoalId === ""
      ? null
      : rawGoalId;

  return {
    id,
    userId: data.userId as string,
    goalId,
    label: (data.label as string) ?? undefined,
    dayOfWeek: data.dayOfWeek as number,
    startTime: data.startTime as string,
    endTime: data.endTime as string,
    isActive: (data.isActive as boolean) ?? true,
  };
}

export async function fetchSlots(userId: string): Promise<ScheduleSlot[]> {
  const snapshot = await getDocs(slotsCollection(userId));
  return snapshot.docs.map((d) => mapSlotDoc(d.id, d.data()));
}

export async function fetchSlotsForDay(
  userId: string,
  dayOfWeek: number
): Promise<ScheduleSlot[]> {
  const q = query(
    slotsCollection(userId),
    where("dayOfWeek", "==", dayOfWeek),
    where("isActive", "==", true)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs
    .map((d) => mapSlotDoc(d.id, d.data()))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function createSlot(
  userId: string,
  input: Omit<ScheduleSlot, "id" | "userId">
): Promise<string> {
  const docRef = await addDoc(slotsCollection(userId), {
    userId,
    goalId: input.goalId,
    label: input.label ?? null,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    isActive: true,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function deleteSlot(userId: string, slotId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "slots", slotId));
}

export async function createSlotsBatch(
  userId: string,
  slots: ProposedSlot[]
): Promise<void> {
  const batch = writeBatch(db);
  slots.forEach((slot) => {
    const ref = doc(slotsCollection(userId));
    batch.set(ref, {
      userId,
      goalId: slot.goalId,
      label: null,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isActive: true,
      createdAt: serverTimestamp(),
    });
  });
  await batch.commit();
}

export async function deactivateAllSlots(userId: string): Promise<void> {
  const slots = await fetchSlots(userId);
  if (slots.length === 0) return;

  const batch = writeBatch(db);
  slots.forEach((slot) => {
    batch.update(doc(db, "users", userId, "slots", slot.id), { isActive: false });
  });
  await batch.commit();
}

/** Permanently remove all timetable slots (use to reset a messy schedule). */
export async function deleteAllSlots(userId: string): Promise<number> {
  const slots = await fetchSlots(userId);
  if (slots.length === 0) return 0;

  const chunkSize = 400;
  for (let i = 0; i < slots.length; i += chunkSize) {
    const batch = writeBatch(db);
    slots.slice(i, i + chunkSize).forEach((slot) => {
      batch.delete(doc(db, "users", userId, "slots", slot.id));
    });
    await batch.commit();
  }

  return slots.length;
}
