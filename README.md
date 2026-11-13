# WeatherBoard

A client-only React weather dashboard: real current conditions, five local-calendar forecast days, saved cities, and an offline forecast that stays honest about its age.

**Live URL:** Pending deployment authentication. No public URL is claimed yet.  
**Repository:** Pending publication.  
**Submission status:** The app works without keys using Open-Meteo. GeoDB and OpenWeather adapters are implemented; their live account verification requires project keys. Closed-tab reminders are not implemented. See **Known Limitations** before submission.

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

The next visit restores the last successful city. Offline views show a banner and “Saved forecast”, never “Live”. A first-use offline state has no invented data. Reconnection refreshes automatically. External Google font requests are optional: the system font stack keeps the offline shell readable.

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

Browser interaction tests use fixtures **only in tests**, so they are deterministic. `scripts/live-check.mjs` separately checks live keyless APIs against a running production preview. Its saved evidence is [docs/live-check.json](docs/live-check.json): HTTP 200 weather for Karachi/London, HTTP 200 London geocoding, five forecast cards and no JavaScript page errors. Screenshots from automated responsive tests use fixtures and must not be presented as live weather; `live-desktop.png` comes from real requests.

See [docs/AUDIT.md](docs/AUDIT.md) for exact results, requirements and remaining verification. No Lighthouse score, Safari/iOS install result, physical-device notification delivery or public-domain API test is claimed without execution.

## Deployment

Vercel: import the public repository, choose Vite, build `npm run build`, output `dist`, install `npm ci`. Add optional public project keys in the project environment, then deploy. `vercel.json` supplies a no-cache worker/manifest policy. No server functions or rewrite backend are used. The app is a single page with no client routes.

After deployment, verify HTTPS, manifest/icon responses, worker control, refresh, real search/weather on that domain, notification permission behavior and offline reload. Paste the verified live URL above. GitHub publication requires authenticated account access; Vercel publication requires an authenticated account/project. Never submit invented URLs.

## Known Limitations

1. **Closed-tab daily push is not implemented.** The app supplies worker test notifications and explicitly labelled active-app reminders. A trusted scheduler/push service and private credentials are needed for closed-tab delivery. Exact delivery also remains subject to browser/OS policy.
2. **GeoDB and OpenWeather account verification is pending.** Their adapters are implemented and tested with fixtures, but no real project keys were supplied. Keyless Open-Meteo search/weather work and were checked live. This is a configuration blocker, not an assertion that browser usage is impossible.
3. **A 300 ms network-completion SLA cannot be guaranteed.** Requests begin after a 300 ms input pause; internet/provider latency and free-tier limits determine arrival. Visible loading and rate-limit recovery replace a false timing guarantee.
4. **Platform testing is bounded.** Production Chromium offline reload is tested; actual installation and OS notification display on iOS, Safari, Android and desktop hardware require those environments. On iOS, Web Push requires an installed Home Screen web app on supported versions. Secure context, permission and OS settings still apply.
5. **Offline data is bounded and evictable.** One successful snapshot, at most seven days old; no offline autocomplete or uncached-city weather. Disabled/quota-limited storage reduces persistence. Optional web font loading falls back to system fonts offline.
6. **Free-tier terms apply.** Open-Meteo's free hosted API is for non-commercial use and has usage limits; a commercial deployment needs suitable licensing. GeoDB free-tier rate limits may be encountered despite debounce. [Open-Meteo terms](https://open-meteo.com/en/terms), [OpenWeather free forecast](https://openweathermap.org/forecast5).
7. **Process disclosure:** Actual tool was Codex, while the PDF names Cursor/Antigravity/OpenCode. `PROMPTS.md` records the actual visible history without claiming another IDE. Acceptance of this tool choice is the reviewer's decision.
8. **Publication remains unverified until URLs are filled above.** A working local build alone does not satisfy the PDF's submission requirement. The supplied PDF is marked confidential and retained locally, excluded from Git/public assets.

## Interview preparation

Be ready to explain: (1) public browser keys versus private server credentials; (2) normalized providers and cancellation-safe fallback; (3) destination-local sample aggregation and partial days; (4) shell precache versus bounded data persistence; (5) event-driven workers versus external push scheduling. These are deliberate tradeoffs, not hidden omissions.
