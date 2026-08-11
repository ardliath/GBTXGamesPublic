export interface Edition {
  id: string;
  status: "test" | "trial" | "upcoming" | "historical";
  label: string;
  year?: number;
  host?: string;
}

export interface IndexFile {
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
}
