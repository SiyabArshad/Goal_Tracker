import { GUEST_MODE_KEY, GUEST_USER_ID } from "@/lib/storage/constants";

export function isGuestUserId(userId: string): boolean {
  return userId === GUEST_USER_ID;
}

export function isGuestModeEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return localStorage.getItem(GUEST_MODE_KEY) === "true";
}

export function enableGuestMode(): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(GUEST_MODE_KEY, "true");
}

export function disableGuestMode(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(GUEST_MODE_KEY);
}
