import type { GameEvent } from "./types";

export function formatDateHeading(dateStr: string): string {
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

export function formatTime(t: string | null): string {
  return t ?? "TBC";
}

export function mapsUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function what3wordsUrl(w3w: string): string {
  const words = w3w.replace(/^\/+/, "");
  return `https://what3words.com/${words}`;
}

// A rough "status" for an event relative to right now, used to surface what
// matters most: has it not started, is it on right now, or is it done.
export type EventStatus = "upcoming" | "reporting" | "live" | "past";

export function eventStatus(event: GameEvent, now: Date = new Date()): EventStatus {
  // Fall back to the enclosing session's times when this specific event has
  // no clock time of its own (e.g. swimming, ordered by sequence not time).
  const reportTime = event.reportTime ?? event.sessionStart;
  const startTime = event.startTime ?? event.sessionStart;
  const endTime = event.endTime ?? event.sessionEnd;

  if (!reportTime && !startTime) return "upcoming";

  const start = new Date(`${event.date}T${startTime ?? reportTime}:00`);
  const report = reportTime ? new Date(`${event.date}T${reportTime}:00`) : null;
  const end = endTime ? new Date(`${event.date}T${endTime}:00`) : null;

  if (end && now > end) return "past";
  if (now >= start) return "live";
  if (report && now >= report) return "reporting";
  return "upcoming";
}
