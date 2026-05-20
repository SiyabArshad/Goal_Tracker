import {
  createLocalId,
  readGuestDb,
  writeGuestDb,
} from "@/lib/storage/localDb";
import { GUEST_USER_ID } from "@/lib/storage/constants";
import type { Goal } from "@/types";

const DEFAULT_EMOJI = "🎯";

export async function fetchGoals(_userId: string): Promise<Goal[]> {
  const db = readGuestDb();
  return [...db.goals].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function createGoal(
  _userId: string,
  input: Pick<Goal, "name" | "description" | "emoji" | "targetHours">
): Promise<string> {
  const db = readGuestDb();
  const now = new Date().toISOString();
  const id = createLocalId();
  db.goals.push({
    id,
    userId: GUEST_USER_ID,
    name: input.name,
    description: input.description,
    emoji: input.emoji || DEFAULT_EMOJI,
    targetHours: input.targetHours,
    completedHours: 0,
    createdAt: now,
    updatedAt: now,
  });
  writeGuestDb(db);
  return id;
}

export async function updateGoal(
  _userId: string,
  goalId: string,
  input: Partial<Pick<Goal, "name" | "description" | "emoji" | "targetHours">>
): Promise<void> {
  const db = readGuestDb();
  const goal = db.goals.find((g) => g.id === goalId);
  if (!goal) return;
  Object.assign(goal, input, { updatedAt: new Date().toISOString() });
  writeGuestDb(db);
}

export async function deleteGoal(_userId: string, goalId: string): Promise<void> {
  const db = readGuestDb();
  db.goals = db.goals.filter((g) => g.id !== goalId);
  writeGuestDb(db);
}

export async function addCompletedHours(
  _userId: string,
  goalId: string,
  hours: number
): Promise<void> {
  const db = readGuestDb();
  const goal = db.goals.find((g) => g.id === goalId);
  if (!goal) return;
  goal.completedHours += hours;
  goal.updatedAt = new Date().toISOString();
  writeGuestDb(db);
}

export async function deleteAllGoals(_userId: string): Promise<number> {
  const db = readGuestDb();
  const count = db.goals.length;
  db.goals = [];
  writeGuestDb(db);
  return count;
}
