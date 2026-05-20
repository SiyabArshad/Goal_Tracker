"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/Button";

export function GuestContinueButton() {
  const router = useRouter();
  const { enterGuestMode } = useAuth();

  async function handleGuest() {
    await enterGuestMode();
    router.push("/today/");
  }

  return (
    <Button type="button" variant="secondary" fullWidth onClick={handleGuest}>
      Continue as guest (saved on this device)
    </Button>
  );
}
