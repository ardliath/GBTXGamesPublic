import type { GameEvent, IndexFile, Venue } from "./types";

const dataUrl = (path: string) => `${import.meta.env.BASE_URL}data/${path}`;

async function getJson<T>(path: string): Promise<T> {
  const res = await fetch(dataUrl(path), { cache: "no-cache" });
  if (!res.ok) {
    throw new Error(`Failed to load ${path}: ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export function loadIndex(): Promise<IndexFile> {
  return getJson<IndexFile>("index.json");
}

export function loadEvents(editionId: string): Promise<GameEvent[]> {
  return getJson<GameEvent[]>(`games/${editionId}/events.json`);
}

export function loadVenues(editionId: string): Promise<Venue[]> {
  return getJson<Venue[]>(`games/${editionId}/venues.json`);
}
