import { addMinutes, format, parse } from "date-fns";

export const DAYS_OF_WEEK = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export function parseTimeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

export function minutesToTimeString(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

export function getSlotDurationMinutes(startTime: string, endTime: string): number {
  return parseTimeToMinutes(endTime) - parseTimeToMinutes(startTime);
}

export function slotsOverlap(
  startA: string,
  endA: string,
  startB: string,
  endB: string
): boolean {
  const aStart = parseTimeToMinutes(startA);
  const aEnd = parseTimeToMinutes(endA);
  const bStart = parseTimeToMinutes(startB);
  const bEnd = parseTimeToMinutes(endB);
  return aStart < bEnd && bStart < aEnd;
}

export function formatTimeDisplay(time: string): string {
  const parsed = parse(time, "HH:mm", new Date());
  return format(parsed, "h:mm a");
}

export function getTodayDateKey(): string {
  return format(new Date(), "yyyy-MM-dd");
}

export function canMarkSlotComplete(endTime: string, now: Date = new Date()): boolean {
  const endWithBuffer = addMinutes(
    parse(endTime, "HH:mm", now),
    1
  );
  return now >= endWithBuffer;
}

export function isSlotInFuture(startTime: string, now: Date = new Date()): boolean {
  const start = parse(startTime, "HH:mm", now);
  return now < start;
}

export function isSlotPast(endTime: string, now: Date = new Date()): boolean {
  const endWithBuffer = addMinutes(parse(endTime, "HH:mm", now), 1);
  return now >= endWithBuffer;
}
