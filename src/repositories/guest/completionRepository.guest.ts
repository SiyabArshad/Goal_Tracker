import { createLocalId, readGuestDb, writeGuestDb } from "@/lib/storage/localDb";
import { GUEST_USER_ID } from "@/lib/storage/constants";
import type { Completion, CompletionStatus } from "@/types";
import { subDays, format } from "date-fns";

export async function fetchCompletionsForDate(
  _userId: string,
  date: string
): Promise<Completion[]> {
  return readGuestDb().completions.filter((c) => c.date === date);
}

export async function fetchCompletionsInRange(
  _userId: string,
  days: number
): Promise<Completion[]> {
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  return readGuestDb().completions.filter((c) => c.date >= startDate);
}

export async function fetchMissedCompletions(
  _userId: string
): Promise<Completion[]> {
  return readGuestDb().completions.filter((c) => c.status === "missed");
}

export async function createCompletion(
  _userId: string,
  input: Omit<Completion, "id" | "userId" | "completedAt">
): Promise<string> {
  const db = readGuestDb();
  const id = createLocalId();
  db.completions.push({
    id,
    userId: GUEST_USER_ID,
    ...input,
    completedAt: new Date().toISOString(),
  });
  writeGuestDb(db);
  return id;
}

export async function updateCompletionStatus(
  _userId: string,
  completionId: string,
  status: CompletionStatus
): Promise<void> {
  const db = readGuestDb();
  const item = db.completions.find((c) => c.id === completionId);
  if (!item) return;
  item.status = status;
  item.completedAt = new Date().toISOString();
  writeGuestDb(db);
}

export async function getCompletionForSlotAndDate(
  _userId: string,
  slotId: string,
  date: string
): Promise<Completion | null> {
  return (
    readGuestDb().completions.find(
      (c) => c.slotId === slotId && c.date === date
    ) ?? null
  );
}

export async function deleteAllCompletions(_userId: string): Promise<number> {
  const db = readGuestDb();
  const count = db.completions.length;
  db.completions = [];
  writeGuestDb(db);
  return count;
}
