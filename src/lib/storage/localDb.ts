import { GUEST_DATA_KEY } from "@/lib/storage/constants";
import type { Completion, Goal, ScheduleSlot } from "@/types";

export interface GuestDatabase {
  goals: Goal[];
  slots: ScheduleSlot[];
  completions: Completion[];
}

const emptyDb = (): GuestDatabase => ({
  goals: [],
  slots: [],
  completions: [],
});

export function readGuestDb(): GuestDatabase {
  if (typeof window === "undefined") return emptyDb();
  try {
    const raw = localStorage.getItem(GUEST_DATA_KEY);
    if (!raw) return emptyDb();
    const parsed = JSON.parse(raw) as GuestDatabase;
    return {
      goals: parsed.goals ?? [],
      slots: parsed.slots ?? [],
      completions: parsed.completions ?? [],
    };
  } catch {
    return emptyDb();
  }
}

export function writeGuestDb(db: GuestDatabase): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_DATA_KEY, JSON.stringify(db));
}

export function clearGuestDb(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_DATA_KEY);
}

export function createLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
