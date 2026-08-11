import { useCallback, useEffect, useState } from "react";

// Per-edition "my events" selection, kept purely client-side (localStorage).
// No account, no server - this is just a personal shortlist on this device.
export function useMyEvents(editionId: string) {
  const storageKey = `gbtx.myEvents.${editionId}`;
  const [selected, setSelected] = useState<Set<string>>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      return new Set(raw ? (JSON.parse(raw) as string[]) : []);
    } catch {
      return new Set();
    }
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      setSelected(new Set(raw ? (JSON.parse(raw) as string[]) : []));
    } catch {
      setSelected(new Set());
    }
  }, [storageKey]);

  const toggle = useCallback(
    (eventId: string) => {
      setSelected((prev) => {
        const next = new Set(prev);
        if (next.has(eventId)) {
          next.delete(eventId);
        } else {
          next.add(eventId);
        }
        try {
          localStorage.setItem(storageKey, JSON.stringify([...next]));
        } catch {
          // localStorage unavailable (private browsing etc.) - selection just won't persist
        }
        return next;
      });
    },
    [storageKey],
  );

  return { selected, toggle };
}
