# WeatherBoard delivery report

## Project status and links

- Live application: https://mahadabbasi19.github.io/Edspire-weather/
- Public source repository: https://github.com/mahadabbasi19/Edspire-weather
- Source: `main`; static release: `gh-pages`. No backend was introduced.
- Implemented: real GeoDB autocomplete, OpenWeather current/five-day forecast, Open-Meteo recovery, accessible validation, five persistent favourites, responsive PWA/offline snapshots, notification settings and active-app reminders, theme and unit preferences.

The requested Vercel account was not configured; GitHub Pages is an allowed alternative in the original PDF. The public URL must be judged by the saved deployment check, not by the hosting CLI alone.

## Files and architecture

`App.tsx` owns page state/weather lifecycle. `CitySearch`, `FavouritesPanel`, `WeatherDetails` and `Reminders` own their focused interactions. `services/cities.ts`, `services/weather.ts` and `services/http.ts` isolate providers, normalization, cancellation and classified failures. `utils/storage.ts` validates bounded persistence. `sw.ts` precaches the scoped shell and handles notification clicks. Strict TypeScript and native React hooks keep the architecture small.

## Verification and compliance

`npm run lint`, `npm test`, `npm run build` and `npm run test:e2e` passed: **30 unit/component tests, 16 production-browser tests**. Real GeoDB/OpenWeather requests succeeded with the owner's configured keys. Real Open-Meteo recovery was checked separately. Offline shell/data reload and the connection banner were checked using the production worker. Axe found no violations across tested theme/day states. Local mobile Lighthouse measured 95/100/100/100 for Performance/Accessibility/Best Practices/SEO, with the complete categories saved separately.

Core requirements 1–5 and 7 are implemented and verified within the Chromium scope. Requirement 6 is partial: notification settings, worker API integration and best-effort active-app reminders exist; **closed-tab scheduling is not implemented**. AUDIT.md records the full per-requirement evidence and limits.

## Known limitations suitable for the submission email

> The dashboard is fully client-side. Morning reminders are best-effort while the app remains open; scheduled delivery after the tab closes requires an external trusted scheduler and Web Push sender, which are not configured in this deployment. The UI and README state this explicitly. Browser/OS permission and device policy also affect delivery. The app's weather, favourites and offline functionality remain independent of notification permissions.

Other bounded claims: a 300 ms request debounce does not guarantee a 300 ms internet round trip; offline storage is limited to the last successful snapshot and can be evicted; physical Safari/iOS/Android installation and OS notification display have not been verified. The actual development environment was Codex, not one of the three IDE names listed in the PDF; this is disclosed in PROMPTS.md. Four low build-tool advisories remain; runtime dependencies have zero reported advisories.

## Documentation

README.md contains setup, architecture, provider/forecast details, deployment and a dedicated Known Limitations section. PROMPTS.md preserves the authentic visible user prompt history, including the supplied master prompt, research follow-up, PDF and credential/repository updates. DESIGN.md records actual accessible reference research and gated-content limitations. AUDIT.md links the executed checks and evidence. Public screenshots contain real API results; fixture screenshots are explicitly identified.

## Five interview decisions

1. **Credentials:** Vite variables are public bundle inputs. Dedicated client keys are acceptable only with owner-approved risk/limits; privileged push credentials need a trusted service.
2. **Normalization:** Provider payloads are validated at the boundary; the UI sees one weather model. Fallback preserves the selected location and aborts obsolete requests.
3. **Forecast dates:** Destination-local grouping, extrema of available three-hour samples, representative noon conditions and explicit partial-day labels prevent false daily promises.
4. **Offline design:** A precached shell is different from a valid weather snapshot. Store one bounded snapshot, label it saved, handle storage failure and treat network hints as hints.
5. **Notifications:** Service workers wake for events; they do not guarantee perpetual timers. External scheduling is a real architectural dependency, not something to simulate with `setTimeout`.

## Remaining actions

Only configure an allowed trusted scheduler/push service if exact closed-tab reminders must be added, and verify physical-device install/notification behavior. Public links and real API setup need no further configuration after the verified release. No email was sent automatically.

## Submission email draft

To: jobs@edspire.app
Subject: WeatherBoard – Frontend Challenge Submission

Hello Edspire team,

Please find my WeatherBoard submission:

- Live app: https://mahadabbasi19.github.io/Edspire-weather/
- Public repository: https://github.com/mahadabbasi19/Edspire-weather

The app includes real GeoDB city search, OpenWeather forecasts with Open-Meteo recovery, persistent favourites, validation, responsive layouts, and offline PWA support. README.md and the authentic PROMPTS.md are included. The development environment is disclosed accurately as Codex.

One architectural limitation is documented: reminders work on a best-effort basis while the app is open. Scheduled closed-tab Web Push requires an external trusted scheduler/sender, which is not configured in this client-only deployment. No closed-tab delivery claim is made.

Validation includes 30 unit/component tests, 16 production-browser tests, real API checks, offline reload, responsive checks and accessibility auditing. Detailed results and platform limits are in docs/AUDIT.md.

Regards,
Mahad Ahmed Abbasi
