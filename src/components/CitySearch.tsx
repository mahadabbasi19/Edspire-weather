import { useEffect, useRef, useState } from "react";
import { Search, LoaderCircle, MapPin } from "lucide-react";
import type { City } from "../types";
import { searchCities, geoConfigured } from "../services/cities";
import { cityError } from "../utils/storage";
export function CitySearch({ onSelect }: { onSelect: (city: City) => void }) {
  const [query, setQuery] = useState(""),
    [results, setResults] = useState<City[]>([]),
    [status, setStatus] = useState(""),
    [error, setError] = useState(""),
    [open, setOpen] = useState(false),
    [active, setActive] = useState(-1);
  const root = useRef<HTMLFormElement>(null),
    input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    setResults([]);
    setActive(-1);
    if (query.trim().length < 2) {
      setStatus("");
      return () => controller.abort();
    }
    setStatus("Waiting for typing to pause…"); // Purani request cancel hogi taake tez typing par purane results na aayen.
    const timer = setTimeout(() => {
      setStatus("Searching cities…");
      searchCities(query, controller.signal)
        .then((cities) => {
          if (!controller.signal.aborted) {
            setResults(cities);
            setStatus(
              cities.length ? "" : "No cities found. Try a different spelling.",
            );
          }
        })
        .catch((e) => {
          if (!controller.signal.aborted)
            setStatus(
              e instanceof Error ? e.message : "City search is unavailable.",
            );
        });
    }, 300);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);
  useEffect(() => {
    const close = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);
  function select(city: City) {
    onSelect(city);
    setQuery("");
    setError("");
    setOpen(false);
    input.current?.focus();
  }
  return (
    <form
      ref={root}
      className="search"
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (open && active >= 0 && results[active]) select(results[active]);
        else {
          setError(cityError(query, false));
          setOpen(true);
          input.current?.focus();
        }
      }}
    >
      <label className="sr-only" htmlFor="city-search">
        Search for a city
      </label>
      <Search size={19} />
      <input
        ref={input}
        id="city-search"
        role="combobox"
        autoComplete="off"
        placeholder="Search a city…"
        value={query}
        aria-expanded={open}
        aria-controls="city-options"
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `city-${active}` : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? "search-error" : undefined}
        onFocus={() => setOpen(true)}
        onBlur={() => {
          setError(cityError(query, false));
        }}
        onChange={(e) => {
          setQuery(e.target.value);
          setError("");
          setOpen(true);
        }}
        onKeyDown={(e) => {
          if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
          if (e.key === "ArrowDown" || e.key === "ArrowUp") {
            e.preventDefault();
            setOpen(true);
            setActive((i) =>
              results.length
                ? (i + (e.key === "ArrowDown" ? 1 : -1) + results.length) %
                  results.length
                : -1,
            );
          }
        }}
      />
      <button
        className="search-submit"
        aria-label="Search cities"
        type="submit"
      >
        ↵
      </button>
      {open && (query || error) && (
        <div className="suggestions">
          <div className="search-provider">
            {geoConfigured
              ? "GeoDB Cities"
              : "Open-Meteo city search · GeoDB key not configured"}
          </div>
          <ul id="city-options" role="listbox" aria-label="City suggestions">
            {results.map((city, i) => (
              <li
                key={city.id}
                id={`city-${i}`}
                role="option"
                aria-selected={active === i}
                className={active === i ? "active" : ""}
                onPointerDown={(e) => e.preventDefault()}
                onClick={() => select(city)}
              >
                <MapPin size={17} />
                <span>
                  <strong>{city.name}</strong>
                  <small>
                    {[city.region, city.country].filter(Boolean).join(", ")}
                  </small>
                </span>
              </li>
            ))}
          </ul>
          <div role="status" className="search-status">
            {status.includes("Searching") && (
              <LoaderCircle className="spin" size={16} />
            )}{" "}
            {query.trim().length < 2 ? "Type at least two letters." : status}
          </div>
          {error && (
            <p id="search-error" className="error">
              {error}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
