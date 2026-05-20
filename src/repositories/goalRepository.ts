import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import type { Goal } from "@/types";

const DEFAULT_EMOJI = "🎯";

function goalsCollection(userId: string) {
  return collection(db, "users", userId, "goals");
}

function mapGoalDoc(id: string, data: Record<string, unknown>): Goal {
  return {
    id,
    userId: data.userId as string,
    name: data.name as string,
    description: (data.description as string) ?? "",
    emoji: (data.emoji as string) || DEFAULT_EMOJI,
    targetHours: (data.targetHours as number) ?? 0,
    completedHours: (data.completedHours as number) ?? 0,
    createdAt: (data.createdAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? "",
    updatedAt: (data.updatedAt as { toDate?: () => Date })?.toDate?.()?.toISOString() ?? "",
  };
}

export async function fetchGoals(userId: string): Promise<Goal[]> {
  const q = query(goalsCollection(userId), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => mapGoalDoc(d.id, d.data()));
}

export async function createGoal(
  userId: string,
  input: Pick<Goal, "name" | "description" | "emoji" | "targetHours">
): Promise<string> {
  const docRef = await addDoc(goalsCollection(userId), {
    userId,
    name: input.name,
    description: input.description,
    emoji: input.emoji || DEFAULT_EMOJI,
    targetHours: input.targetHours,
    completedHours: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateGoal(
  userId: string,
  goalId: string,
  input: Partial<Pick<Goal, "name" | "description" | "emoji" | "targetHours">>
): Promise<void> {
  await updateDoc(doc(db, "users", userId, "goals", goalId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteGoal(userId: string, goalId: string): Promise<void> {
  await deleteDoc(doc(db, "users", userId, "goals", goalId));
}

export async function addCompletedHours(
  userId: string,
  goalId: string,
  hours: number
): Promise<void> {
  const goals = await fetchGoals(userId);
  const goal = goals.find((g) => g.id === goalId);
  if (!goal) return;

  await updateDoc(doc(db, "users", userId, "goals", goalId), {
    completedHours: goal.completedHours + hours,
    updatedAt: serverTimestamp(),
  });
}
