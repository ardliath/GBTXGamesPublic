export interface Edition {
  id: string;
  status: "test" | "trial" | "upcoming" | "historical";
  label: string;
  year?: number;
  host?: string;
  lastUpdated?: string; // ISO 8601
}

export interface IndexFile {
  schemaVersion: number;
  current: string;
  editions: Edition[];
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  what3words: string | null;
  notes: string | null;
  source?: string;
  verified?: boolean;
}

export interface GameEvent {
  id: string;
  sport: string;
  category: string | null;
  date: string; // YYYY-MM-DD
  reportTime: string | null; // HH:MM
  startTime: string | null; // HH:MM
  endTime: string | null; // HH:MM
  venueId: string;
  notes: string | null;
  source?: string;
  // Used when the source has no clock time for this specific event, only its
  // order within a longer session (e.g. a swimming start list) - lets the UI
  // show "event 3 of 15" instead of a misleading/fabricated time.
  sequence?: number;
  sequenceTotal?: number;
  sessionLabel?: string;
  sessionStart?: string; // HH:MM
  sessionEnd?: string; // HH:MM
}
