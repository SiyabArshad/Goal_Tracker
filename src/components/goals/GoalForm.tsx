"use client";

import { FormEvent, useState } from "react";
import type { Goal } from "@/types";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { EmojiPicker } from "@/components/goals/EmojiPicker";

interface GoalFormProps {
  initialGoal?: Goal;
  onSubmit: (data: {
    name: string;
    description: string;
    emoji: string;
    targetHours: number;
  }) => Promise<void>;
  onCancel?: () => void;
}

export function GoalForm({ initialGoal, onSubmit, onCancel }: GoalFormProps) {
  const [name, setName] = useState(initialGoal?.name ?? "");
  const [description, setDescription] = useState(initialGoal?.description ?? "");
  const [emoji, setEmoji] = useState(initialGoal?.emoji ?? "🎯");
  const [targetHours, setTargetHours] = useState(
    String(initialGoal?.targetHours ?? 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const hours = parseFloat(targetHours);

    if (!name.trim()) {
      setError("Goal name is required.");
      return;
    }
    if (isNaN(hours) || hours <= 0) {
      setError("Target hours must be greater than 0.");
      return;
    }

    setLoading(true);
    setError("");
    try {
      await onSubmit({
        name: name.trim(),
        description: description.trim(),
        emoji,
        targetHours: hours,
      });
    } catch {
      setError("Failed to save goal.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <Input
        label="Goal name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Learn React"
        required
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="What do you want to achieve?"
      />
      <EmojiPicker value={emoji} onChange={setEmoji} />
      <Input
        label="Target hours (total to achieve this goal)"
        type="number"
        min="1"
        step="0.5"
        value={targetHours}
        onChange={(e) => setTargetHours(e.target.value)}
        required
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="flex gap-3">
        <Button type="submit" disabled={loading}>
          {loading ? "Saving..." : initialGoal ? "Update goal" : "Create goal"}
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
