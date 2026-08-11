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
  const reportOrStart = event.reportTime ?? event.startTime;
  if (!reportOrStart) return "upcoming";

  const start = new Date(`${event.date}T${(event.startTime ?? event.reportTime)}:00`);
  const report = event.reportTime ? new Date(`${event.date}T${event.reportTime}:00`) : null;
  const end = event.endTime ? new Date(`${event.date}T${event.endTime}:00`) : null;

  if (end && now > end) return "past";
  if (now >= start) return "live";
  if (report && now >= report) return "reporting";
  return "upcoming";
}
