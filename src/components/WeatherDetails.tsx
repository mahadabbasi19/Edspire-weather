import { Droplets, Wind, Thermometer, RefreshCw } from "lucide-react";
import type { Unit, WeatherSnapshot } from "../types";
import { temperature } from "../utils/storage";
import { condition } from "../services/weather";
import { WeatherIcon } from "./WeatherIcon";
export function WeatherDetails({
  data,
  unit,
  now,
  loading,
  online,
  onRefresh,
}: {
  data: WeatherSnapshot | null;
  unit: Unit;
  now: number;
  loading: boolean;
  online: boolean;
  onRefresh: () => void;
}) {
  const temp = (value: number) => `${temperature(value, unit)}°`;
  return (
    <>
      <section className="metrics" aria-label="Weather details">
        {[
          {
            label: "Feels like",
            value: data ? temp(data.current.feelsLike) : "—",
            note: "How it feels outside",
            icon: Thermometer,
          },
          {
            label: "Humidity",
            value: data ? `${data.current.humidity}%` : "—",
            note: "Relative humidity",
            icon: Droplets,
          },
          {
            label: "Wind speed",
            value: data ? `${Math.round(data.current.wind)} km/h` : "—",
            note: "At 10 metres above ground",
            icon: Wind,
          },
        ].map((m) => (
          <article className="panel metric" key={m.label}>
            <div>
              <m.icon size={20} />
              <span>{m.label}</span>
            </div>
            <strong>{m.value}</strong>
            <small>{m.note}</small>
          </article>
        ))}
      </section>
      <section className="panel forecast">
        <div className="section-heading">
          <div>
            <div className="eyebrow">THE DAYS AHEAD</div>
            <h2>5-day forecast</h2>
          </div>
          <button
            className="icon-button"
            disabled={loading || !online}
            aria-label="Refresh weather"
            onClick={onRefresh}
          >
            <RefreshCw size={18} className={loading ? "spin" : ""} />
          </button>
        </div>
        {data ? (
          <>
            <div className="forecast-grid">
              {data.forecast.map((day) => (
                <article className="forecast-day" key={day.date}>
                  <strong>
                    {day.date ===
                    (data.provider === "OpenWeather"
                      ? new Date(now + data.offset * 1000)
                          .toISOString()
                          .slice(0, 10)
                      : new Intl.DateTimeFormat("en-CA", {
                          timeZone: data.timezone,
                          year: "numeric",
                          month: "2-digit",
                          day: "2-digit",
                        }).format(new Date(now)))
                      ? "Today"
                      : new Date(day.date + "T12:00:00Z").toLocaleDateString(
                          "en-GB",
                          {
                            weekday: "short",
                            timeZone: "UTC",
                          },
                        )}
                  </strong>
                  <small>
                    {new Date(day.date + "T12:00:00Z").toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", timeZone: "UTC" },
                    )}
                  </small>
                  <WeatherIcon code={day.code} size={35} />
                  <span className="forecast-condition">
                    {condition(day.code)}
                  </span>
                  <div>
                    <b>{temp(day.high)}</b>
                    <span>{temp(day.low)}</span>
                  </div>
                </article>
              ))}
            </div>
            <p className="fine">
              {data.forecast[0].sampled
                ? "High / low of available 3-hour samples; edge days may be partial."
                : "Daily high / low · City local calendar days"}
            </p>
          </>
        ) : (
          <p className="empty-copy">
            {loading
              ? "Loading five days of possibilities…"
              : "Your five-day forecast will appear here."}
          </p>
        )}
      </section>
    </>
  );
}
