import { useCallback, useEffect, useState } from "react";
import { Bell, ArrowUpRight } from "lucide-react";
import { read, write } from "../utils/storage";
const validTime = (v: string) => /^(0[0-9]|1[01]):[0-5][0-9]$/.test(v);
export function Reminders({ city }: { city: string }) {
  const [time, setTime] = useState(() =>
      read(
        "wb-reminder-time",
        (v): v is string => typeof v === "string" && validTime(v),
        "08:00",
      ),
    ),
    [enabled, setEnabled] = useState(() =>
      read(
        "wb-reminder-enabled",
        (v): v is boolean => typeof v === "boolean",
        false,
      ),
    ),
    [permission, setPermission] = useState<
      NotificationPermission | "unsupported"
    >(() =>
      "Notification" in window ? Notification.permission : "unsupported",
    ),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const supported =
    permission !== "unsupported" &&
    isSecureContext &&
    "serviceWorker" in navigator;
  const notify = useCallback(
    async (test = false) => {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration?.active)
        throw new Error(
          "The service worker is not ready. Open the production build and reload once.",
        );
      await registration.showNotification(
        test
          ? "Your outlook is a click away"
          : "Good morning from WeatherBoard",
        {
          body: `Check the latest weather for ${city}.`,
          icon: "/icons/icon-192.png",
          tag: test ? "wb-test" : "wb-morning",
          data: { url: "/" },
        },
      );
    },
    [city],
  );
  useEffect(() => {
    if (!enabled || !supported) return;
    const tick = () => {
      if (Notification.permission !== "granted") {
        setPermission(Notification.permission);
        setEnabled(false);
        write("wb-reminder-enabled", false);
        return;
      }
      const now = new Date(),
        day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
      if (
        now.getHours() * 60 + now.getMinutes() !==
        Number(time.slice(0, 2)) * 60 + Number(time.slice(3))
      )
        return;
      if (
        read(
          "wb-reminder-day",
          (v): v is string => typeof v === "string",
          "",
        ) === day
      )
        return;
      write("wb-reminder-day", day);
      void notify().catch((e) => setError((e as Error).message));
    };
    const timer = setInterval(tick, 15000);
    tick();
    return () => clearInterval(timer);
  }, [enabled, time, supported, notify]);
  return (
    <section className="panel reminder">
      <div className="section-heading">
        <span className="icon-box">
          <Bell size={20} />
        </span>
        <span className="eyebrow">A BETTER START</span>
      </div>
      <h2>Your morning, with clarity.</h2>
      <p>A gentle nudge to check the weather before you head out.</p>
      <form
        noValidate
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          setMessage("");
          if (enabled) {
            setEnabled(false);
            write("wb-reminder-enabled", false);
            return;
          }
          if (!validTime(time)) {
            setError("Choose a morning time between 00:00 and 11:59.");
            return;
          }
          if (!supported) {
            setError(
              "Notifications need a supported browser, HTTPS, and an active service worker.",
            );
            return;
          }
          try {
            const result = await Notification.requestPermission();
            setPermission(result);
            if (result !== "granted" || Notification.permission !== "granted") {
              setPermission(Notification.permission);
              setError(
                "Notifications are not allowed. Check browser site permissions and operating system notification settings.",
              );
              return;
            }
            if (!(await navigator.serviceWorker.getRegistration())?.active)
              throw new Error(
                "Service worker is not ready. Reload the production app and try again.",
              );
            setEnabled(true);
            write("wb-reminder-time", time);
            write("wb-reminder-enabled", true);
          } catch (e) {
            setError((e as Error).message);
          }
        }}
      >
        <label htmlFor="reminder-time">
          Morning reminder <small>Device local time</small>
        </label>
        <input
          id="reminder-time"
          type="time"
          min="00:00"
          max="11:59"
          value={time}
          aria-invalid={!!error}
          aria-describedby="reminder-help reminder-error"
          onBlur={() => {
            if (!validTime(time))
              setError("Choose a morning time between 00:00 and 11:59.");
          }}
          onChange={(e) => {
            setTime(e.target.value);
            setError("");
            if (validTime(e.target.value))
              write("wb-reminder-time", e.target.value);
            else {
              setEnabled(false);
              write("wb-reminder-enabled", false);
            }
          }}
        />
        <button className="primary" type="submit">
          {enabled && permission === "granted"
            ? "Turn off active-app reminder"
            : "Allow active-app reminder"}
          <ArrowUpRight size={17} />
        </button>
      </form>
      <p id="reminder-help" className="fine">
        Best effort while the app is open. Closed-tab delivery is unavailable.
        Permission: {permission}.
      </p>
      {error && (
        <p id="reminder-error" className="error" role="alert">
          {error}
        </p>
      )}
      {permission === "granted" && (
        <button
          className="text-button"
          onClick={() => {
            void notify(true)
              .then(() => setMessage("Test notification sent to your browser."))
              .catch((e) => setError((e as Error).message));
          }}
        >
          Send a test notification
        </button>
      )}
      <p role="status" className="fine">
        {message}
      </p>
    </section>
  );
}
