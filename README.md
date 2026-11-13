# WeatherBoard

A client-only React weather dashboard: real current conditions, five local-calendar forecast days, saved cities, and an offline forecast that stays honest about its age.

**Live URL:** [WeatherBoard](https://mahadabbasi19.github.io/Edspire-weather/) — GitHub Pages, HTTPS.
**Repository:** [mahadabbasi19/Edspire-weather](https://github.com/mahadabbasi19/Edspire-weather).
**Submission status:** GeoDB autocomplete, OpenWeather current/five-day weather, and Open-Meteo fallback are implemented and checked with real requests. Favourites, validation, responsive layouts and offline PWA behavior are tested. Closed-tab reminders are not implemented; active-app reminders are explicitly labelled. See **Known Limitations** before submission.

## Run locally

Node 22.12+ or 24 LTS and npm are recommended.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

The app starts at `http://127.0.0.1:5173`. The default location is Karachi; no weather values are hardcoded. The production service worker is deliberately absent in development.

```sh
npm run build
npm run preview
```

Use the production preview at `http://127.0.0.1:4173` to test PWA/offline features. Visit online, wait for weather and worker activation, reload once, then disconnect and reload.

## Configuration and API safety

| Variable                   | Purpose                                                    | When absent                                       |
| -------------------------- | ---------------------------------------------------------- | ------------------------------------------------- |
| `VITE_GEODB_API_KEY`       | GeoDB Cities via RapidAPI, primary autocomplete            | Explicitly labelled Open-Meteo geocoding fallback |
| `VITE_OPENWEATHER_API_KEY` | OpenWeather current weather and free 5-day/3-hour forecast | Open-Meteo weather, with visible source notice    |

| `VITE_BASE_PATH` | Hosting directory; use `/Edspire-weather/` on Pages | Root directory `/` |

All `VITE_*` values are **public build inputs**, visible in the JavaScript bundle and requests. They are not secret storage. Use only dedicated limited project credentials approved for browser distribution. Never put a privileged push/scheduler key, service account, or private credential here. Restrict provider quotas and permissions wherever the account supports them; do not assume either provider offers domain restrictions. If your key must remain private, a permitted server-side proxy is required; this submission intentionally contains no custom backend. `.env.local` is ignored by Git.

Configure variables in Vercel before building; changes require a redeploy. Invalid keys produce actionable errors. GeoDB failure is shown rather than silently switching providers. Missing configuration is visibly distinguished from a rate limit or network failure.

## Implemented features

- Debounced (300 ms) city suggestions with city/region/country context, keyboard navigation, pointer selection, Escape/outside dismissal, request cancellation, and inline blur/submit validation.
- Real temperature, apparent temperature, humidity, wind, condition icons, day/night presentation, city-local clock, update time, and five forecast cards.
- OpenWeather → Open-Meteo recovery for rate limits, authorization failures, outages, invalid payloads, network errors, and timeouts. Existing snapshots remain labelled as saved data on refresh failure.
- Up to five favourites with coordinate identity, duplicate prevention, stable ordering, persistent storage, and a native accessible confirmation dialog with focus restoration.
- Manifest with 192/512 PNG and maskable icons, production Workbox worker, precached shell, offline reload and last successful snapshot restoration.
- Morning reminder settings, user-initiated permission request, denied/unsupported feedback, worker test notifications, and **best-effort active-app** reminders.
- Light/dark theme with initial system detection and persistence; persistent Celsius/Fahrenheit display conversion.
- Responsive layouts checked at 375, 600, 768, 1024 and 1280 pixels, visible focus, reduced motion, semantic landmarks and accessible search/dialog controls.

## Architecture

React + TypeScript strict mode, Vite, Lucide, vite-plugin-pwa/Workbox. Native CSS keeps the design small and explicit; no CSS framework or large component system is needed. Vitest/Testing Library cover service and UI logic; Playwright exercises the production build.

| File                                 | Responsibility                                                      |
| ------------------------------------ | ------------------------------------------------------------------- |
| `src/App.tsx`                        | Page composition, selected city, weather lifecycle and preferences  |
| `src/components/CitySearch.tsx`      | Combobox, debounce, cancellation, accessible validation             |
| `src/components/FavouritesPanel.tsx` | Saved city shortcuts and removal dialog                             |
| `src/components/WeatherDetails.tsx`  | Weather metrics and five-day presentation                           |
| `src/components/Reminders.tsx`       | Permission and active-app reminder settings                         |
| `src/services/cities.ts`             | GeoDB adapter and explicit keyless geocoding mode                   |
| `src/services/weather.ts`            | Provider boundary, normalization and fallback orchestration         |
| `src/services/http.ts`               | 12-second timeout, HTTP and connection failures                     |
| `src/utils/storage.ts`               | Validated bounded persistence and recovery; unit conversion         |
| `src/sw.ts`                          | Shell precache, navigation fallback and notification click handling |

The UI consumes `City` and `WeatherSnapshot`, never provider response shapes. Requests use coordinates, not ambiguous display names. Obsolete searches and weather loads are aborted and cannot overwrite the current selection. Explanatory source comments use Roman Urdu.

### Forecast aggregation

OpenWeather's free endpoint returns 3-hour samples. Each Unix timestamp is shifted by the destination city's API-provided UTC offset, then grouped by its local date. The first five distinct dates are shown, including the first partial day. High/low are the extrema of available `temp_min`/`temp_max` samples, **not promised full-day extremes**. The condition nearest local noon represents each date. The final edge day can also be partial. OpenWeather supplies a fixed offset; a DST transition during the window may require an IANA timezone enrichment for exact historical/future grouping. Open-Meteo supplies daily high/low and dates directly using `timezone=auto`. Temperatures remain Celsius internally; OpenWeather wind m/s is converted to km/h once.

### Recovery and offline architecture

Each configured primary weather request is validated; any non-cancellation failure triggers one Open-Meteo attempt. When no primary key exists, no unnecessary primary request is made. Failed refreshes preserve the matching city snapshot and show an error. Changing to a different city never labels the previous city's weather as the new city's weather.

Workbox precaches versioned local JS, CSS, HTML and icons; it does not indiscriminately cache API requests. A separate validated `localStorage` entry stores only the last successful city snapshot, including its forecast and retrieval timestamp. Snapshots older than seven days are rejected. Corrupted data is ignored, favourites are deduplicated and capped at five, and storage write failures show a reduced-persistence banner. Storage failure prevents guaranteed offline weather persistence but does not break online weather. Browser-managed caches can be evicted.

The next visit restores the last successful city. Offline views show a banner and “Saved forecast”, never “Live”. A first-use offline state has no invented data. Reconnection refreshes automatically. The licensed DM Sans variable font is bundled locally and precached; a system stack remains available. There is no external font dependency. Browser network hints are not authoritative: failed network requests can show “Connection unavailable” even when `navigator.onLine` is true. This is deliberately distinguished from a confirmed offline event. [MDN explains this browser limitation](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/onLine).

### Notifications: actual delivery contract

No external scheduler or push sender is configured. Permission is requested only after the user clicks a button beneath an explanation. Settings require a valid morning time (00:00–11:59, **device local timezone**), granted permission, secure context and an active worker. Test messages use `ServiceWorkerRegistration.showNotification`. Clicking a notification focuses or opens this app.

While the app is open, a 15-second check attempts delivery during the selected minute. A persisted local-calendar day marker and notification tag reduce repeats. Sleeping devices, browser throttling, permission changes, storage failures and simultaneous tabs can prevent or duplicate delivery; no exact-time promise is made. Failed delivery is surfaced. A closed tab does **not** schedule or send a message. Service workers are event driven, not persistent timer processes.

A proper closed-tab solution needs a trusted external scheduler plus a push sender, subscription lifecycle storage and server-side credentials. A managed service is possible with a configured account and suitable scheduler, but merely creating a browser subscription does not schedule messages. OneSignal's scheduling API requires a privileged REST key and cannot safely be invoked from this public client.

Sources: [MDN Push API](https://developer.mozilla.org/en-US/docs/Web/API/Push_API), [MDN background operation](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps/Guides/Offline_and_background_operation), [Apple Web Push](https://developer.apple.com/documentation/usernotifications/sending-web-push-notifications-in-web-apps-and-browsers), [OneSignal API](https://github.com/OneSignal/onesignal-node-api/blob/main/DefaultApi.md).

## Design decisions and reference research

The original design combines cool neutral surfaces, restrained sage/forest accents, amber weather icons, one strong temperature focal point, thin borders, and a consistent spacing scale. Supporting text is subordinate without hiding recovery actions. Desktop separates weather from places/settings; tablet and mobile progressively stack those regions. No decorative chart suggests unavailable hourly data.

All six reference URLs were opened and public screens captured in Chromium. Research scope and access limits are recorded in [docs/DESIGN.md](docs/DESIGN.md). Linear informed hierarchy and restraint; Vercel's public deployment documentation/screens informed compact statuses; Stripe's public checkout and demo informed field grouping and local feedback; Mercury's public product preview informed card hierarchy and calm surfaces; Dribbble's actual weather search results informed forecast scanning. Mobbin's full screen/flow library was gated; only public previews were available. No authenticated dashboard or gated notification flow is claimed as reviewed. No layout, branding or illustrations were copied.

## Testing

```sh
npm run lint
npm test
npm run build
npx playwright install chromium
npm run test:e2e
```

Browser interaction tests intercept both configured and keyless providers **only in tests**, so they are deterministic and never depend on live API quotas. **30 unit/component tests and 16 production-browser tests pass.** Scripts in `scripts/` separately check real requests. Evidence in [docs/deployment-check.json](docs/deployment-check.json) records the public HTTPS deployment, real GeoDB/OpenWeather requests, manifest, worker control, mobile overflow and offline reload. Request credentials are redacted in evidence. Initial live-check evidence captured an earlier 401 key and verified fallback; the updated key was then checked successfully in `docs/scoped-local-check.json` and on the public site.

The measured local Lighthouse run scored **95 Performance, 100 Accessibility, 100 Best Practices, 100 SEO** (mobile simulation; one run, not a universal guarantee). The complete category summary, including the tool's additional agentic-browsing score, is in [docs/lighthouse-summary.json](docs/lighthouse-summary.json). Axe found no violations at 375 px in both themes and day/night card styles. Physical-device install/OS notification delivery are not claimed.

Automated responsive screenshots use test fixtures; they must not be represented as live data. [Public desktop screenshot](docs/screenshots/deployed-desktop.png) and [public mobile screenshot](docs/screenshots/deployed-mobile.png) use real provider requests. See [docs/AUDIT.md](docs/AUDIT.md) for the requirement checklist and [docs/DELIVERY.md](docs/DELIVERY.md) for the final report and email draft.

## Deployment

The verified public deployment uses **GitHub Pages**, an allowed static-hosting alternative in the PDF. `gh-pages` contains built artifacts plus `.nojekyll`; `main` contains source. HTTPS is enforced. The Pages build uses:

```sh
VITE_BASE_PATH=/Edspire-weather/ npm run build
```

Publish `dist` to the existing `gh-pages` branch using forward commits. Keep the matching manifest scope/start URL, worker navigation fallback, notification URL, font and icon paths; the configuration derives them from the base. Do not force-push or put `.env.local` in Git. Test locally with `VITE_BASE_PATH=/Edspire-weather/ npm run preview -- --port 4174` at `http://127.0.0.1:4174/Edspire-weather/`.

For Vercel: import this repository's `main` branch, choose Vite, build `npm run build`, output `dist`, install `npm ci`. Set `VITE_BASE_PATH=/`, add the owner-approved public client keys, and deploy. `vercel.json` sets worker/manifest revalidation headers. `.vercelignore` excludes documents, prompt history and tests from deployment inputs. No backend, server functions or custom routing service are used.

Vercel account login was unavailable during delivery. An anonymous preview returned HTTP 403 on public verification and was not used as the live URL. GitHub Pages provided an owned, stable alternative. The earlier agent-created `weatherboard-edspire` repository was left intact when the user later supplied the intended `Edspire-weather` destination; the submission links here use the user's repository.

## Known Limitations

1. **Closed-tab daily push is not implemented.** The app supplies worker test notifications and explicitly labelled active-app reminders. A trusted scheduler/push service and private credentials are needed for closed-tab delivery. Exact delivery also remains subject to browser/OS policy.
2. **A 300 ms network-completion SLA cannot be guaranteed.** Requests begin after a 300 ms input pause; internet/provider latency and free-tier limits determine arrival. Loading and rate-limit messages replace a false timing guarantee.
3. **Platform testing is bounded.** Production Chromium offline reload and manifest installability checks pass; physical installation and OS notification display on iOS/Safari/Android/desktop hardware require those environments. On supported iOS versions, Web Push requires an installed Home Screen web app. The current host denied native OS notification display; unit tests simulate the successful worker-call contract and browser tests cover failures.
4. **Offline data is bounded and evictable.** One successful snapshot, at most seven days old; no offline autocomplete or uncached-city weather. Disabled/quota-limited storage reduces persistence. Browser network hints can remain online without internet; a connection-failure banner and saved-data label cover that case honestly.
5. **Free-tier terms apply.** Open-Meteo's free hosted API is for non-commercial use and has usage limits; commercial deployment requires suitable licensing. GeoDB free-tier rate limits may be encountered despite debounce. [Open-Meteo terms](https://open-meteo.com/en/terms), [OpenWeather free forecast](https://openweathermap.org/forecast5).
6. **Process disclosure:** Actual tool was Codex, while the PDF names Cursor/Antigravity/OpenCode. `PROMPTS.md` records the actual visible history without claiming another IDE. Acceptance of this tool choice is the reviewer's decision. The confidential challenge PDF was read and retained locally, excluded from public Git assets.

No missing API key or deployment blocker is claimed after the user's configured keys and chosen repository were verified. Four low-severity build-tool dependency advisories remain; runtime dependencies have zero reported advisories. Details are in the audit.

## Interview preparation

Be ready to explain: (1) public browser keys versus private server credentials; (2) normalized providers and cancellation-safe fallback; (3) destination-local sample aggregation and partial days; (4) shell precache versus bounded data persistence; (5) event-driven workers versus external push scheduling. These are deliberate tradeoffs, not hidden omissions.
