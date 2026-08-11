import { useEffect, useMemo, useState } from "react";
import { loadEvents, loadIndex, loadVenues } from "./api";
import { eventStatus, formatDateHeading, formatTime, mapsUrl, what3wordsUrl } from "./format";
import type { GameEvent, IndexFile, Venue } from "./types";
import { useMyEvents } from "./useMyEvents";

const STATUS_LABEL: Record<string, string> = {
  live: "Happening now",
  reporting: "Report now",
  upcoming: "Upcoming",
  past: "Finished",
};

export default function App() {
  const [index, setIndex] = useState<IndexFile | null>(null);
  const [editionId, setEditionId] = useState<string | null>(null);
  const [events, setEvents] = useState<GameEvent[] | null>(null);
  const [venues, setVenues] = useState<Venue[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [myEventsOnly, setMyEventsOnly] = useState(false);
  const [search, setSearch] = useState("");

  const { selected: myEventIds, toggle: toggleMyEvent } = useMyEvents(editionId ?? "none");

  // Load the edition registry once, then default to whichever edition is "current".
  useEffect(() => {
    loadIndex()
      .then((idx) => {
        setIndex(idx);
        setEditionId(idx.current);
      })
      .catch((e: Error) => setError(e.message));
  }, []);

  // Load the selected edition's schedule + venues whenever it changes.
  useEffect(() => {
    if (!editionId) return;
    setEvents(null);
    setVenues(null);
    setSelectedDate(null);
    setSearch("");
    Promise.all([loadEvents(editionId), loadVenues(editionId)])
      .then(([ev, ve]) => {
        setEvents(ev);
        setVenues(ve);
        const firstDate = [...new Set(ev.map((e) => e.date))].sort()[0] ?? null;
        setSelectedDate(firstDate);
      })
      .catch((e: Error) => setError(e.message));
  }, [editionId]);

  const venueById = useMemo(() => {
    const map = new Map<string, Venue>();
    for (const v of venues ?? []) map.set(v.id, v);
    return map;
  }, [venues]);

  const dates = useMemo(() => {
    return [...new Set((events ?? []).map((e) => e.date))].sort();
  }, [events]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const currentEdition = index?.editions.find((ed) => ed.id === editionId);

  const searchTerm = search.trim().toLowerCase();

  const dayEvents = useMemo(() => {
    if (!events || !selectedDate) return [];
    return events
      .filter((e) => e.date === selectedDate)
      .filter((e) => !myEventsOnly || myEventIds.has(e.id))
      .filter((e) => {
        if (!searchTerm) return true;
        const venueName = venueById.get(e.venueId)?.name ?? "";
        const haystack = `${e.sport} ${e.category ?? ""} ${venueName}`.toLowerCase();
        return haystack.includes(searchTerm);
      })
      .sort((a, b) =>
        (a.reportTime ?? a.startTime ?? a.sessionStart ?? "").localeCompare(
          b.reportTime ?? b.startTime ?? b.sessionStart ?? "",
        ),
      );
  }, [events, selectedDate, myEventsOnly, myEventIds, searchTerm, venueById]);

  if (error) {
    return (
      <main className="page">
        <p className="error">Couldn't load the schedule: {error}</p>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="header">
        <h1>Games Schedule</h1>
        {index && (
          <select
            className="edition-picker"
            value={editionId ?? ""}
            onChange={(e) => setEditionId(e.target.value)}
            aria-label="Games edition"
          >
            {index.editions.map((ed) => (
              <option key={ed.id} value={ed.id}>
                {ed.label}
                {ed.id === index.current ? " (current)" : ""}
              </option>
            ))}
          </select>
        )}
      </header>

      {currentEdition?.lastUpdated && (
        <p className="last-updated">
          Schedule last updated{" "}
          {new Date(currentEdition.lastUpdated).toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>
      )}

      {!events && !error && <p className="status-text">Loading…</p>}

      {events && events.length === 0 && (
        <p className="status-text">No schedule published for this edition yet.</p>
      )}

      {events && events.length > 0 && (
        <>
          <nav className="day-tabs" aria-label="Day">
            {dates.map((d) => (
              <button
                key={d}
                className={`day-tab${d === selectedDate ? " active" : ""}${d === todayStr ? " today" : ""}`}
                onClick={() => setSelectedDate(d)}
              >
                {new Date(`${d}T00:00:00`).toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </button>
            ))}
          </nav>

          <div className="filters-row">
            <div className="search-box">
              <input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sport, category or venue…"
                aria-label="Search this day's schedule"
              />
              {search && (
                <button
                  type="button"
                  className="search-clear"
                  onClick={() => setSearch("")}
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>

            <label className="my-events-toggle">
              <input
                type="checkbox"
                checked={myEventsOnly}
                onChange={(e) => setMyEventsOnly(e.target.checked)}
              />
              My events only
            </label>
          </div>

          {selectedDate && <h2 className="day-heading">{formatDateHeading(selectedDate)}</h2>}

          {dayEvents.length === 0 && (
            <p className="status-text">
              {searchTerm
                ? `Nothing matching "${search}" on this day.`
                : myEventsOnly
                  ? "You haven't starred any events on this day."
                  : "Nothing scheduled."}
            </p>
          )}

          <ul className="event-list">
            {dayEvents.map((event) => {
              const venue = venueById.get(event.venueId);
              const status = eventStatus(event);
              const isMine = myEventIds.has(event.id);
              return (
                <li key={event.id} className={`event-card status-${status}`}>
                  <div className="event-card-top">
                    <div>
                      <p className="event-sport">{event.sport}</p>
                      {event.category && <p className="event-category">{event.category}</p>}
                    </div>
                    <button
                      className={`star-button${isMine ? " starred" : ""}`}
                      onClick={() => toggleMyEvent(event.id)}
                      aria-pressed={isMine}
                      aria-label={isMine ? "Remove from my events" : "Add to my events"}
                    >
                      {isMine ? "★" : "☆"}
                    </button>
                  </div>

                  <p className={`event-status-badge badge-${status}`}>{STATUS_LABEL[status]}</p>

                  {event.reportTime || event.startTime ? (
                    <dl className="event-times">
                      <div>
                        <dt>Report by</dt>
                        <dd>{formatTime(event.reportTime)}</dd>
                      </div>
                      <div>
                        <dt>Starts</dt>
                        <dd>{formatTime(event.startTime)}</dd>
                      </div>
                      {event.endTime && (
                        <div>
                          <dt>Ends</dt>
                          <dd>{formatTime(event.endTime)}</dd>
                        </div>
                      )}
                    </dl>
                  ) : (
                    event.sequence && (
                      <p className="event-sequence">
                        No fixed time - event {event.sequence} of {event.sequenceTotal} in{" "}
                        {event.sessionLabel ?? "this session"}
                        {event.sessionStart && ` (session runs ${event.sessionStart}–${event.sessionEnd})`}
                      </p>
                    )
                  )}

                  {venue && (
                    <div className="event-venue">
                      <a href={mapsUrl(venue.address)} target="_blank" rel="noreferrer">
                        📍 {venue.name}
                      </a>
                      {venue.what3words && (
                        <a
                          className="w3w-link"
                          href={what3wordsUrl(venue.what3words)}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {venue.what3words}
                        </a>
                      )}
                    </div>
                  )}

                  {event.notes && <p className="event-notes">{event.notes}</p>}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </main>
  );
}
