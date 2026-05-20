import {
  addDoc,
  collection,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Completion, CompletionStatus } from "@/types";
import { subDays, format } from "date-fns";

function completionsCollection(userId: string) {
  return collection(db, "users", userId, "completions");
}

function mapCompletionDoc(id: string, data: Record<string, unknown>): Completion {
  return {
    id,
    userId: data.userId as string,
    slotId: data.slotId as string,
    goalId: (data.goalId as string | null) ?? null,
    date: data.date as string,
    status: data.status as CompletionStatus,
    completedAt: (data.completedAt as { toDate?: () => Date })?.toDate?.()?.toISOString(),
  };
}

export async function fetchCompletionsForDate(
  userId: string,
  date: string
): Promise<Completion[]> {
  const q = query(
    completionsCollection(userId),
    where("date", "==", date)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapCompletionDoc(d.id, d.data()));
}

export async function fetchCompletionsInRange(
  userId: string,
  days: number
): Promise<Completion[]> {
  const startDate = format(subDays(new Date(), days), "yyyy-MM-dd");
  const q = query(
    completionsCollection(userId),
    where("date", ">=", startDate)
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapCompletionDoc(d.id, d.data()));
}

export async function fetchMissedCompletions(
  userId: string
): Promise<Completion[]> {
  const q = query(
    completionsCollection(userId),
    where("status", "==", "missed")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapCompletionDoc(d.id, d.data()));
}

export async function createCompletion(
  userId: string,
  input: Omit<Completion, "id" | "userId" | "completedAt">
): Promise<string> {
  const docRef = await addDoc(completionsCollection(userId), {
    userId,
    ...input,
    completedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateCompletionStatus(
  userId: string,
  completionId: string,
  status: CompletionStatus
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "completions", completionId), {
    status,
    completedAt: serverTimestamp(),
  });
}

export async function getCompletionForSlotAndDate(
  userId: string,
  slotId: string,
  date: string
): Promise<Completion | null> {
  const completions = await fetchCompletionsForDate(userId, date);
  return completions.find((c) => c.slotId === slotId) ?? null;
}

export async function deleteAllCompletions(userId: string): Promise<number> {
  if (typeof window === "undefined") return 0;
  const snapshot = await getDocs(completionsCollection(userId));
  if (snapshot.empty) return 0;

  const docs = snapshot.docs;
  const chunkSize = 400;
  for (let i = 0; i < docs.length; i += chunkSize) {
    const batch = writeBatch(db);
    docs.slice(i, i + chunkSize).forEach((d) => batch.delete(d.ref));
    await batch.commit();
  }

  return docs.length;
}
