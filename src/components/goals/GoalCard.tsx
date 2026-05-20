import type { Goal } from "@/types";
import { calculateGoalProgressPercent } from "@/lib/utils/schedule";

interface GoalCardProps {
  goal: Goal;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const progress = calculateGoalProgressPercent(goal);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{goal.emoji}</span>
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-slate-100">{goal.name}</h3>
            {goal.description && (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                {goal.description}
              </p>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={onEdit}
              className="text-sm text-indigo-600 hover:underline"
            >
              Edit
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="text-sm text-red-500 hover:underline"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-sm text-slate-600 dark:text-slate-400">
          <span>
            {goal.completedHours.toFixed(1)}h / {goal.targetHours}h
          </span>
          <span>{progress}%</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
