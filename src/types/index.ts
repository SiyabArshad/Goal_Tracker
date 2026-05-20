export type CompletionStatus = "completed" | "missed" | "supplementary";

export interface Goal {
  id: string;
  userId: string;
  name: string;
  description: string;
  emoji: string;
  targetHours: number;
  completedHours: number;
  createdAt: string;
  updatedAt: string;
}

export interface TimeSlotFormData {
  goalId: string | null;
  label?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface ScheduleSlot {
  id: string;
  userId: string;
  /** null = personal block (job, uni, etc.) — use `label` instead */
  goalId: string | null;
  label?: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface Completion {
  id: string;
  userId: string;
  slotId: string;
  goalId: string | null;
  date: string;
  status: CompletionStatus;
  completedAt?: string;
}

export interface DayProgress {
  date: string;
  completed: number;
  missed: number;
  supplementary: number;
  total: number;
  adherencePercent: number;
}

export interface ScheduleSlotWithGoal extends ScheduleSlot {
  goal?: Goal;
}

export interface CompletionWithDetails extends Completion {
  slot?: ScheduleSlot;
  goal?: Goal;
}
