"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface SuperpowerButtonProps {
  onActivate: () => Promise<void>;
  disabled?: boolean;
}

export function SuperpowerButton({ onActivate, disabled }: SuperpowerButtonProps) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      await onActivate();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="superpower"
      size="sm"
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <Zap className="h-4 w-4" />
      {loading ? "Activating..." : "Superpower"}
    </Button>
  );
}
