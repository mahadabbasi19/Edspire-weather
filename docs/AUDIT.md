# Delivery audit — 13 November 2026

This audit distinguishes deterministic tests, real-network checks and unverified platform behavior. It does not treat implemented source as proof of external provider configuration.

## Commands and observed results

| Check                            | Observed result                                                                                                                                                                                                                                                                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `npm run lint`                   | Passed, no errors or warnings                                                                                                                                                                                                                                                                                    |
| `npm test`                       | 27 tests passed in 6 files                                                                                                                                                                                                                                                                                       |
| `npm run build`                  | TypeScript strict check and Vite production/PWA build passed                                                                                                                                                                                                                                                     |
| `npm run test:e2e`               | 13 Chromium production-browser tests passed                                                                                                                                                                                                                                                                      |
| `node scripts/live-check.mjs`    | Real Open-Meteo weather and geocoding HTTP 200; London selected; five cards; no page errors                                                                                                                                                                                                                      |
| `node scripts/accessibility.mjs` | No axe violations at 375 px across both themes and day/night card styles; this is not proof of full accessibility compliance                                                                                                                                                                                     |
| `npm audit --omit=dev`           | Zero runtime dependency advisories                                                                                                                                                                                                                                                                               |
| Full dependency audit            | Four low build-tool advisories remain in deepmerge / node-resolve / Workbox / PWA plugin chain; no high or critical findings. Patched glob/minimatch overrides removed the moderate findings. Deepmerge's advisory currently has no compatible patched release; force-downgrading the PWA stack was not applied. |

The PWA plugin emits an upstream `inlineDynamicImports` deprecation warning while building the worker; it still produces a working worker. Browser tests emit a harmless terminal color-environment warning. Neither was hidden or represented as an application failure.

## Seven core requirements

| Requirement                         | Status                                                               | Evidence and boundaries                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ----------------------------------- | -------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 01 GeoDB city autocomplete          | Partially implemented / configuration blocked                        | GeoDB adapter implemented; contract fixture test passes. Real Open-Meteo fallback suggestions verified. No GeoDB project key supplied, so GeoDB live account/CORS/quota validation remains pending. Keyboard, debounce, cancellation, error/no-results and blur/submit validation tested.                                                                                                                                                                                       |
| 02 Real weather + five-day forecast | Implemented and verified for Open-Meteo; OpenWeather live unverified | Real Karachi/London weather and five days in live browser. OpenWeather normalization, sample grouping and primary fallback tested. Real OpenWeather account requires a key.                                                                                                                                                                                                                                                                                                     |
| 03 Form validation                  | Implemented and verified                                             | Empty/whitespace/unresolved city, blur/submit, missing results, provider failures, morning time, permission and service-worker requirements.                                                                                                                                                                                                                                                                                                                                    |
| 04 Five favourites                  | Implemented and verified                                             | Limit/duplicate unit tests, namesake identity test, refresh persistence, keyboard confirmation/focus and quota-failure browser tests.                                                                                                                                                                                                                                                                                                                                           |
| 05 PWA/offline                      | Implemented and verified in local production Chromium                | Generated manifest, 192/512/maskable PNGs, worker activation, actual offline reload with five cards, empty offline state. Physical desktop/mobile installation and cache eviction behavior remain unverified.                                                                                                                                                                                                                                                                   |
| 06 Closed-tab morning push          | Partially implemented; scheduling requirement not implemented        | Worker notification interface and honest active-app reminder. Permission/validation/delivery errors tested. No scheduler, sender or privileged push credentials. Successful UI/worker-call contract uses a mocked registration in unit tests. Native OS display could not be verified: Chromium's permission query/request could report granted while `Notification.permission` and actual worker display were denied by the host. No successful native OS delivery is claimed. |
| 07 Responsive design                | Implemented and verified in Chromium                                 | No document overflow at 375/600/768/1024/1280; final controls inspected and mobile unit buttons enlarged to 44×44. Keyboard search and dialog focus tests pass. Screenshots reviewed at desktop/mobile.                                                                                                                                                                                                                                                                         |

## Edge-case coverage

- Corrupted JSON, invalid schema, blocked reads and quota writes: unit tests; quota failure also tested in browser.
- Repeated favourite, sixth city, same-name distinct coordinates: unit tests.
- Rapid search race: delayed old response cannot replace the latest suggestions.
- HTTP 401/403/429/503, connection failure, invalid JSON and invalid weather response: unit tests and visible HTTP 429 browser state.
- Fallback selection and cancellation: fixtures test primary failure and user abort separately.
- UTC midnight versus destination date: UTC+05 test verifies grouping into distinct local dates.
- Theme/unit persistence: browser test; no reload required for conversion.
- Offline reload: real service worker and persistent snapshot, not just an HTTP cache or mocked online flag.
- Notification denied/unsupported and delivery failure: browser tests. Valid/invalid time and permission-success UI contract: unit tests.
- Request timeout is implemented using `AbortSignal.timeout(12000)`; an actual 12-second timeout was not separately forced in this run.

## Reference research and process

Six public reference sites were visited in Chromium. Private Vercel dashboard interactions and gated Mobbin flows were unavailable; Mercury demo stayed at Loading. Public screens/previews were inspected instead. Scope is recorded in DESIGN.md.

The authentic user prompts are in PROMPTS.md. Actual tool: Codex; do not describe this as a Cursor/Antigravity/OpenCode session. The confidential challenge PDF was read completely and excluded from public Git assets.

## Remaining actions

1. Configure owner-approved public-client project keys and verify GeoDB/OpenWeather on the final deployment domain.
2. Establish an owned permanent deployment; an anonymous temporary preview is not a stable submission URL.
3. If exact closed-tab reminders are mandatory for acceptance, agree on an allowed managed scheduler/push service and configure it with private credentials kept outside the frontend.
4. Verify physical-device installation and OS notification display on the target browser/device. The rest of the application does not depend on those permissions.

The README contains the email-ready limitation explanation. No submission email was sent by this agent.
