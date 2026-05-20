"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  createGoal,
  deleteGoal,
  fetchGoals,
  fetchSlots,
  updateGoal,
} from "@/services/dataAccess";
import { GoalList } from "@/components/goals/GoalList";
import { GoalForm } from "@/components/goals/GoalForm";
import { DataManagementPanel } from "@/components/data/DataManagementPanel";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import type { Goal } from "@/types";

export default function GoalsPage() {
  const { userId } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [slotCount, setSlotCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | undefined>();

  const loadGoals = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const [fetched, slots] = await Promise.all([
        fetchGoals(userId),
        fetchSlots(userId),
      ]);
      setGoals(fetched);
      setSlotCount(slots.filter((s) => s.isActive).length);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadGoals();
  }, [loadGoals]);

  async function handleCreate(data: {
    name: string;
    description: string;
    emoji: string;
    targetHours: number;
  }) {
    if (!userId) return;
    await createGoal(userId, data);
    setShowForm(false);
    await loadGoals();
  }

  async function handleUpdate(data: {
    name: string;
    description: string;
    emoji: string;
    targetHours: number;
  }) {
    if (!userId || !editingGoal) return;
    await updateGoal(userId, editingGoal.id, data);
    setEditingGoal(undefined);
    await loadGoals();
  }

  async function handleDelete(goalId: string) {
    if (!userId || !confirm("Delete this goal?")) return;
    await deleteGoal(userId, goalId);
    await loadGoals();
  }

  if (loading) return <LoadingSpinner />;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Your goals</h1>
          <p className="mt-1 text-slate-500">
            Define goals with target hours. Link them on your weekly schedule.
          </p>
        </div>
        {!showForm && !editingGoal && (
          <Button onClick={() => setShowForm(true)}>+ New goal</Button>
        )}
      </div>

      {(showForm || editingGoal) && (
        <Card title={editingGoal ? "Edit goal" : "Create a new goal"}>
          <GoalForm
            initialGoal={editingGoal}
            onSubmit={editingGoal ? handleUpdate : handleCreate}
            onCancel={() => {
              setShowForm(false);
              setEditingGoal(undefined);
            }}
          />
        </Card>
      )}

      <GoalList
        goals={goals}
        onEdit={(goal) => {
          setEditingGoal(goal);
          setShowForm(false);
        }}
        onDelete={handleDelete}
      />

      <DataManagementPanel
        slotCount={slotCount}
        goalCount={goals.length}
        onDataChanged={loadGoals}
      />
    </div>
  );
}
