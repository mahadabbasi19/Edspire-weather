import { useEffect, useState } from "react";
import {
  Sun,
  Moon,
  MapPin,
  Plus,
  ArrowUpRight,
  WifiOff,
  Check,
  CloudSun,
} from "lucide-react";
import type { City, Unit } from "./types";
import { ApiError } from "./services/http";
import { loadWeather, condition } from "./services/weather";
import {
  read,
  write,
  isSnapshot,
  loadFavourites,
  addFavourite,
  temperature,
} from "./utils/storage";
import { CitySearch } from "./components/CitySearch";
import { WeatherIcon } from "./components/WeatherIcon";
import { Reminders } from "./components/Reminders";
import { FavouritesPanel } from "./components/FavouritesPanel";
import { WeatherDetails } from "./components/WeatherDetails";
const initialCity: City = {
  id: "24.861,67.001",
  name: "Karachi",
  country: "Pakistan",
  latitude: 24.8607,
  longitude: 67.0011,
  timezone: "Asia/Karachi",
};
const stored = () => read("wb-snapshot", isSnapshot, null);
export default function App() {
  const [city, setCity] = useState(() => stored()?.city ?? initialCity),
    [snapshot, setSnapshot] = useState(stored),
    [favourites, setFavourites] = useState(loadFavourites),
    [online, setOnline] = useState(navigator.onLine),
    [loading, setLoading] = useState(false),
    [error, setError] = useState(""),
    [connectionLost, setConnectionLost] = useState(false),
    [cached, setCached] = useState(!!stored()),
    [retry, setRetry] = useState(0),
    [storageFailed, setStorageFailed] = useState(false),
    [swFailed, setSwFailed] = useState(false),
    [unit, setUnit] = useState<Unit>(() =>
      read("wb-unit", (v): v is Unit => v === "C" || v === "F", "C"),
    ),
    [theme, setTheme] = useState(
      () => document.documentElement.dataset.theme ?? "light",
    ),
    [now, setNow] = useState(Date.now()),
    [status, setStatus] = useState("");
  useEffect(() => {
    const update = () => setOnline(navigator.onLine),
      fail = () => setStorageFailed(true),
      swFail = () => setSwFailed(true);
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    window.addEventListener("storage-failed", fail);
    window.addEventListener("sw-failed", swFail);
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
      window.removeEventListener("storage-failed", fail);
      window.removeEventListener("sw-failed", swFail);
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    const controller = new AbortController();
    setError("");
    setConnectionLost(false);
    if (!online) {
      setLoading(false);
      setStatus("");
      setCached(true);
      return () => controller.abort();
    }
    setLoading(true);
    setStatus("Updating weather…");
    loadWeather(city, controller.signal, () => setStatus("Trying Open-Meteo…"))
      .then((data) => {
        if (controller.signal.aborted) return;
        setSnapshot(data);
        setCached(false);
        write("wb-snapshot", data);
      })
      .catch((e) => {
        if (controller.signal.aborted) return;
        setConnectionLost(e instanceof ApiError && e.kind === "network");
        setError(
          e instanceof Error
            ? e.message
            : "Weather could not be loaded. Please retry.",
        );
        setCached(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
          setStatus("");
        }
      });
    return () => controller.abort();
  }, [city, online, retry]);
  const data = snapshot?.city.id === city.id ? snapshot : null,
    saved = favourites.some((c) => c.id === city.id);
  const temp = (value: number) => `${temperature(value, unit)}°`;
  const localDate = data
    ? new Date(now + (data.provider === "OpenWeather" ? data.offset * 1000 : 0))
    : null;
  const localZone = data?.provider === "OpenWeather" ? "UTC" : data?.timezone;
  const dateLabel = localDate
    ? new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        timeZone: localZone,
      }).format(localDate)
    : "";
  const timeLabel = localDate
    ? new Intl.DateTimeFormat("en-GB", {
        hour: "2-digit",
        minute: "2-digit",
        timeZone: localZone,
      }).format(localDate)
    : "";
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to weather
      </a>
      <header className="app-header">
        <a
          className="brand"
          href={import.meta.env.BASE_URL}
          aria-label="WeatherBoard home"
        >
          <span className="brand-icon">
            <CloudSun size={25} />
          </span>
          Weather<span>Board</span>
          <span className="brand-divider" />
          <small>YOUR EVERYDAY OUTLOOK</small>
        </a>
        <div className="header-actions">
          <div className="units" aria-label="Temperature units">
            {(["C", "F"] as const).map((u) => (
              <button
                key={u}
                aria-pressed={unit === u}
                onClick={() => {
                  setUnit(u);
                  write("wb-unit", u);
                }}
              >
                °{u}
              </button>
            ))}
          </div>
          <button
            className="icon-button"
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} theme`}
            onClick={() => {
              const value = theme === "light" ? "dark" : "light";
              setTheme(value);
              document.documentElement.dataset.theme = value;
              write("wb-theme", value);
            }}
          >
            {theme === "light" ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </header>
      <main id="main">
        <div className="page-top">
          <div>
            <div className="eyebrow">A LITTLE CLARITY, EVERY DAY</div>
            <h1>Your day. At a glance.</h1>
            <p>The forecast for wherever life takes you.</p>
          </div>
          <CitySearch onSelect={setCity} />
        </div>
        {!online && (
          <div className="banner" role="status">
            <WifiOff size={18} />
            {data
              ? `You're offline. Showing the last saved weather for ${city.name}.`
              : "You’re offline. Connect once to save a forecast for this city."}
          </div>
        )}
        {online && connectionLost && (
          <div className="banner" role="status">
            <WifiOff size={18} />
            {data
              ? `Connection unavailable. Showing the last saved weather for ${city.name}.`
              : "Connection unavailable. Reconnect and retry to load weather."}
            <button onClick={() => setRetry((x) => x + 1)}>Try again</button>
          </div>
        )}
        {swFailed && (
          <div className="banner" role="status">
            Offline installation could not start. You can still view weather
            online; reload to retry.
          </div>
        )}
        {storageFailed && (
          <div className="banner" role="status">
            Browser storage is unavailable. Your changes will last for this
            session only.
          </div>
        )}
        <div className="dashboard">
          <div className="weather-column">
            <section
              className={`current-card ${data && !data.current.isDay ? "night" : ""}`}
              aria-label="Current weather"
              aria-busy={loading}
            >
              <div className="current-top">
                <span className="location">
                  <MapPin size={18} />
                  {city.name}, {city.country}
                </span>
                <span className="weather-status">
                  <i />
                  {loading
                    ? status
                    : cached
                      ? "Saved forecast"
                      : data
                        ? "Current conditions"
                        : "Awaiting weather"}
                </span>
              </div>
              <div className="local-date">
                {dateLabel}
                {timeLabel && ` · ${timeLabel} local time`}
              </div>
              {data ? (
                <>
                  <div className="current-body">
                    <div>
                      <div className="temperature">
                        {temp(data.current.temperature)}
                        <span>{unit}</span>
                      </div>
                      <h2>
                        {data.current.description ??
                          condition(data.current.code)}
                      </h2>
                      <p>
                        Feels like {temp(data.current.feelsLike)} ·{" "}
                        {data.current.isDay ? "Daytime" : "Nighttime"}
                      </p>
                    </div>
                    <div className="hero-weather">
                      <WeatherIcon
                        code={data.current.code}
                        isDay={data.current.isDay}
                        size={132}
                      />
                    </div>
                  </div>
                  <div className="current-bottom">
                    <span>
                      Updated{" "}
                      {new Date(
                        data.updatedAt +
                          (data.provider === "OpenWeather"
                            ? data.offset * 1000
                            : 0),
                      ).toLocaleString("en-GB", {
                        timeZone: localZone,
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}{" "}
                      · {data.provider}
                    </span>
                    <button
                      onClick={() => {
                        const next = addFavourite(favourites, city);
                        setFavourites(next);
                        write("wb-favourites", next);
                      }}
                      disabled={saved || favourites.length >= 5}
                    >
                      {saved ? <Check size={16} /> : <Plus size={16} />}{" "}
                      {saved ? "Saved to favourites" : "Save city"}
                    </button>
                  </div>
                </>
              ) : (
                <div className="weather-empty">
                  <CloudSun size={70} />
                  <h2>
                    {loading
                      ? "Finding your forecast…"
                      : "No forecast available"}
                  </h2>
                  <p>
                    {loading
                      ? "Getting current conditions and the next five days."
                      : "Connect to the internet, then try refreshing."}
                  </p>
                </div>
              )}
            </section>
            {error && !connectionLost && (
              <div className="banner error-banner" role="alert">
                {error} {data ? "Showing your saved forecast." : ""}
                <button onClick={() => setRetry((x) => x + 1)}>
                  Try again
                </button>
              </div>
            )}
            {data?.notice && <p className="provider-note">{data.notice}</p>}
            <WeatherDetails
              data={data}
              unit={unit}
              now={now}
              loading={loading}
              online={online}
              onRefresh={() => setRetry((x) => x + 1)}
            />
          </div>
          <aside>
            <FavouritesPanel
              city={city}
              favourites={favourites}
              setFavourites={setFavourites}
              setCity={setCity}
            />
            <Reminders city={city.name} />
            <div className="offline-note">
              <span className="icon-box">
                <WifiOff size={19} />
              </span>
              <div>
                <strong>A forecast, even offline.</strong>
                <p>
                  Your last viewed forecast stays with you after a successful
                  visit.
                </p>
              </div>
            </div>
          </aside>
        </div>
        <footer>
          <span className="footer-brand">
            <CloudSun size={17} /> WeatherBoard
          </span>
          <span>Made for the everyday.</span>
          <span>
            Weather by{" "}
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
              Open-Meteo <ArrowUpRight size={12} />
            </a>{" "}
            &amp;{" "}
            <a
              href="https://openweathermap.org/"
              target="_blank"
              rel="noreferrer"
            >
              OpenWeather
            </a>
          </span>
        </footer>
      </main>
    </>
  );
}
