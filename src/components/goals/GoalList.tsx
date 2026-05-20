"use client";

import type { Goal } from "@/types";
import { GoalCard } from "@/components/goals/GoalCard";

interface GoalListProps {
  goals: Goal[];
  onEdit: (goal: Goal) => void;
  onDelete: (goalId: string) => void;
}

export function GoalList({ goals, onEdit, onDelete }: GoalListProps) {
  if (goals.length === 0) {
    return (
      <p className="text-center text-slate-500 dark:text-slate-400">
        No goals yet. Create your first goal to get started.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {goals.map((goal) => (
        <GoalCard
          key={goal.id}
          goal={goal}
          onEdit={() => onEdit(goal)}
          onDelete={() => onDelete(goal.id)}
        />
      ))}
    </div>
  );
}
