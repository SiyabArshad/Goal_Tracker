import {
  createLocalId,
  readGuestDb,
  writeGuestDb,
} from "@/lib/storage/localDb";
import { GUEST_USER_ID } from "@/lib/storage/constants";
import type { ScheduleSlot } from "@/types";
import type { ProposedSlot } from "@/lib/utils/schedule";

export async function fetchSlots(_userId: string): Promise<ScheduleSlot[]> {
  return readGuestDb().slots;
}

export async function fetchSlotsForDay(
  _userId: string,
  dayOfWeek: number
): Promise<ScheduleSlot[]> {
  return readGuestDb()
    .slots.filter((s) => s.dayOfWeek === dayOfWeek && s.isActive)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
}

export async function createSlot(
  _userId: string,
  input: Omit<ScheduleSlot, "id" | "userId">
): Promise<string> {
  const db = readGuestDb();
  const id = createLocalId();
  db.slots.push({
    id,
    userId: GUEST_USER_ID,
    goalId: input.goalId,
    label: input.label,
    dayOfWeek: input.dayOfWeek,
    startTime: input.startTime,
    endTime: input.endTime,
    isActive: true,
  });
  writeGuestDb(db);
  return id;
}

export async function deleteSlot(_userId: string, slotId: string): Promise<void> {
  const db = readGuestDb();
  db.slots = db.slots.filter((s) => s.id !== slotId);
  writeGuestDb(db);
}

export async function createSlotsBatch(
  _userId: string,
  slots: ProposedSlot[]
): Promise<void> {
  const db = readGuestDb();
  for (const slot of slots) {
    db.slots.push({
      id: createLocalId(),
      userId: GUEST_USER_ID,
      goalId: slot.goalId,
      dayOfWeek: slot.dayOfWeek,
      startTime: slot.startTime,
      endTime: slot.endTime,
      isActive: true,
    });
  }
  writeGuestDb(db);
}

export async function deleteAllSlots(_userId: string): Promise<number> {
  const db = readGuestDb();
  const count = db.slots.length;
  db.slots = [];
  writeGuestDb(db);
  return count;
}
