# Authentic agent prompt history

Actual development environment: **OpenAI Codex**, operating on the local workspace with shell tools and Chromium/Playwright. This was not Cursor, Antigravity or OpenCode. The assignment lists those IDEs; no claim of using them is made.

This file records the exact user-authored development prompts visible in this session, in chronological order. Attachment content is reproduced verbatim below. System/developer instructions, environment metadata, tool outputs and assistant progress updates are not user development prompts. No additional debugging/refactoring prompts were invented: the agent performed that work autonomously. Earlier sessions cannot be exported from this context; if there were earlier prompts, the developer must append authentic exports before claiming a complete multi-session history.

## 1. Initial attached master prompt

The user attached `Pasted text.txt` with the following exact contents:

````text
# EDSPIRE WEATHERBOARD — SENIOR FRONTEND ENGINEERING MASTER PROMPT

## ROLE & OBJECTIVE

You are acting as a senior frontend engineer, UI/UX specialist, React/TypeScript architect, PWA engineer, and quality assurance reviewer.

Your responsibility is to implement a production-quality, interview-ready React application named **WeatherBoard**, according to the attached Edspire Frontend Technical Challenge (November 2026).

This is a real technical hiring assignment, not a tutorial, demonstration, or prototype.

**Primary objective:** Deliver a functioning, responsive, visually polished, maintainable, publicly deployable weather dashboard that satisfies the challenge requirements and can be explained and defended confidently in a technical interview.

Read the complete technical challenge PDF before making architectural decisions. Treat that document as the primary source of truth.

The expected development scope is approximately 4–6 hours of focused work. Prioritize correct, demonstrable core functionality over unnecessary engineering complexity.

Do not simply generate code and declare success. Implement, test, review, debug, and verify the application.

---

# 1. MANDATORY DEVELOPMENT PRINCIPLES

Follow these rules throughout the project:

1. Build a genuine, functional application using real weather data.
2. Never hardcode weather values or display fabricated API responses as live data.
3. Use TypeScript strict mode.
4. Keep the architecture understandable for a frontend developer.
5. Use clear, descriptive names for components, functions, hooks, and variables.
6. Avoid unnecessary abstractions, premature optimization, oversized components, and elaborate architecture for simple problems.
7. Prefer readable, maintainable solutions over clever shortcuts.
8. Keep dependencies minimal and justified.
9. Do not silently omit a requirement.
10. Do not claim unsupported functionality works.
11. Do not introduce a custom application backend unless the challenge explicitly permits it.
12. Do not hide build, deployment, or API failures.
13. Validate behavior through actual execution wherever your tools allow.
14. Do not create unnecessary files or elaborate documentation for features that do not exist.
15. Use meaningful git commits at genuine development milestones.

The final project should reflect thoughtful engineering decisions, not generic scaffold output.

## Human-readable code requirements

Write code the way a careful frontend engineer would maintain it.

- Keep functions focused.
- Extract reusable logic when there is a genuine need.
- Avoid overengineering.
- Avoid redundant state.
- Avoid overly complex conditionals.
- Avoid repetitive boilerplate.
- Avoid excessive comments.
- Avoid artificial code patterns introduced just to appear sophisticated.
- Prefer explicit error handling.
- Keep visual components separate from API integrations.

The objective is authentic engineering quality, not concealing the use of an AI agent. AI assistance is explicitly allowed in this assignment.

---

# 2. CRITICAL COMMENTING REQUIREMENT — ROMAN URDU

**All explanatory comments authored in project source code must use natural Roman Urdu.**

Code identifiers, TypeScript types, function names, filenames, and visible UI copy must remain in professional English.

Only explanatory developer comments should use Roman Urdu.

Comments must explain meaningful decisions, not repeat obvious code operations.

Examples of appropriate comments:

```ts
// Purani request cancel kar rahe hain taake outdated results show na hon.
```

```ts
// Last viewed city ka data save kar rahe hain taake offline bhi available rahe.
```

```ts
// Maximum 5 cities allow hain, isliye duplicate aur limit dono check honge.
```

```ts
// Browser support check karna zaroori hai warna notification flow fail ho sakta hai.
```

```ts
// API fail hone par cached data show karenge, lekin usko fresh data nahi kahenge.
```

```ts
// Forecast entries ko city ke local din ke mutabiq group kar rahe hain.
```

Do not comment on every line.

Add comments primarily around:

- Non-obvious business logic
- Async request cancellation
- API fallback decisions
- Forecast transformation
- Cache synchronization
- Service worker behavior
- Storage failure recovery
- Notification limitations
- Complex state transitions

Do not rewrite external library code or generated files just to change their comments.

---

# 3. PROJECT INITIALIZATION

Create a React + TypeScript application using Vite.

Recommended technologies:

- React
- TypeScript
- Vite
- Tailwind CSS
- Lucide React
- vite-plugin-pwa / Workbox
- Vitest
- React Testing Library
- Playwright for browser-level tests

Use the currently installed, mutually compatible stable versions. Follow current official setup instructions and avoid deprecated configuration patterns.

Use native React hooks and lightweight custom hooks for state management.

Do not introduce Redux, a large global-state framework, or an external component library unless a genuine requirement justifies it.

Configure:

- TypeScript strict mode
- ESLint
- Consistent formatting
- Environment variable validation
- Production build
- Basic testing commands
- Appropriate .gitignore

Verify installation and build commands actually run.

---

# 4. VISUAL DESIGN — PREMIUM WEATHER PRODUCT

Create a distinctive, polished interface that feels like a thoughtfully designed consumer weather application.

The design should be inspired by:

- Linear — spacing, typography, empty states
- Vercel — structured information, interaction feedback
- Mercury — dashboard cards and confident color choices
- Stripe — helpful errors and validation
- Modern weather applications — expressive but readable weather visuals

Study design principles, not exact implementations.

## Visual direction

Use a clean, sophisticated, modern dashboard style.

Suggested visual system:

- Background: soft cool neutral
- Primary text: deep slate / midnight blue
- Secondary text: muted blue-gray
- Cards: white or lightly tinted surfaces
- Accent: controlled sky blue / indigo
- Weather visualization: contextual gradients
- Borders: subtle and consistent
- Shadows: restrained and purposeful

Typography:

Use a professional font such as Inter or Plus Jakarta Sans.

Establish clear hierarchy:

- Page title
- Selected city and local date/time
- Primary temperature
- Weather condition
- Supporting metrics
- Forecast labels
- Secondary metadata

Avoid excessive gradients, glassmorphism, large blobs, neon colors, decorative charts, and generic template-looking sections.

## Desktop layout

Design a cohesive dashboard containing:

### Header
- WeatherBoard branding
- Search entry point
- Theme toggle if implemented
- Units control if implemented
- Notification/settings control

### Main weather section
- Current city and country
- Local date and time
- Current temperature
- Feels-like temperature if available
- Weather description
- Appropriate weather icon
- Day/night visual treatment
- Weather data update timestamp

### Weather details
- Humidity
- Wind speed
- Optional useful metrics from the selected provider

### Forecast
- Five forecast days
- Day and date
- Weather condition
- High/low temperatures
- Readable condition icons

### Favourite cities
- Quick-access saved cities
- Add favourite
- Remove with confirmation
- Empty and maximum-capacity states

### Settings
- Reminder time
- Notification permission status
- Optional temperature unit selection
- Optional theme preference

Do not clutter the page.

Every section should have a meaningful role.

## Mobile design

At 375px:

- Preserve clear reading order
- Keep temperature prominent
- Make search easy to access
- Stack weather detail cards
- Make forecast easy to scan
- Avoid horizontal page scrolling
- Keep important controls reachable
- Ensure touch targets are at least 44×44px

At 768px:

- Use a balanced intermediate layout.
- Avoid a compressed desktop interface.

At 1280px:

- Use available space intentionally.
- Avoid enormous empty regions and stretched text.

Use responsive CSS rather than device-specific hacks.

---

# 5. FEATURE 1 — CITY AUTOCOMPLETE

Use GeoDB Cities API via RapidAPI as the required primary autocomplete provider.

Implement:

1. Search input with accessible label
2. Input trimming
3. 300ms debounce
4. Search suggestions
5. City, region, and country labels
6. Loading indicator
7. No-results feedback
8. Network error feedback
9. API rate-limit feedback
10. Keyboard selection
11. Mouse/touch selection
12. Escape to dismiss
13. Click-outside dismissal
14. Proper focus behavior

## Data behavior

Use actual API responses.

Each selected city should have normalized data:

- Stable identifier
- Name
- Country
- Region, if available
- Latitude
- Longitude
- Timezone, if available

Use coordinates for weather requests rather than ambiguous city names.

Examples of ambiguous names:

- London
- Springfield
- Paris

Display enough location context to distinguish results.

## Async safety

Use AbortController or an equivalent request cancellation approach.

When a user types quickly, ensure an older response cannot replace a newer search result.

Debounce requests, not input responsiveness.

The challenge specifies results following a 300ms input pause. Start the request at the debounce threshold and display its response as soon as available; do not falsely guarantee network completion within 300ms.

## Validation

Support:

- Empty input
- Whitespace-only input
- Search that returns no matching cities
- API unavailable
- API rate limited
- Offline search
- Invalid selection

A city should be chosen from a valid suggestion rather than accepting an arbitrary unresolved text value.

Validate on blur and submission.

Do not use vague messages such as "Something went wrong."

Example:

"We couldn't load city suggestions. Check your internet connection and try again."

## Credential safety

GeoDB RapidAPI credentials may be exposed in a client-only application.

Investigate whether safe browser-direct usage is possible under the challenge's constraints.

Never describe Vite environment variables as secret storage. Values exposed through VITE_* variables are bundled into the frontend.

Never expose private server credentials or privileged keys.

If a provider requires a genuinely secret credential that cannot safely be used from the browser, do not bypass this restriction. Document the limitation and the compliant alternative.

---

# 6. FEATURE 2 — REAL WEATHER DATA

Implement a provider-independent weather service abstraction.

Primary provider:

OpenWeatherMap

Fallback provider:

Open-Meteo

Use the appropriate free-tier endpoints.

Never depend on paid endpoints without verifying availability.

## Required current conditions

- Temperature
- Humidity
- Wind speed
- Weather condition
- Weather icon

Optional, when genuinely available:

- Feels-like temperature
- Rain probability
- Sunrise/sunset
- Cloud cover

## Five-day forecast

Display five distinct forecast calendar days with valid API data.

OpenWeatherMap's free 5-day forecast typically contains observations in three-hour intervals.

Convert and aggregate these into daily cards carefully.

Important:

- Respect the destination city's timezone.
- Do not accidentally use the user's computer timezone.
- Avoid UTC date grouping errors.
- Derive daily high/low values from the available forecast samples.
- Do not label incomplete sample ranges as guaranteed full-day extremes.
- Handle partial first/last days consistently.
- Document the aggregation method.

Open-Meteo should be normalized into the same application-level weather model.

## API resilience

For every request, support:

- Loading
- Success
- Empty data
- Timeout
- Offline
- Authorization error
- Rate limit
- Server error
- Invalid response

Use descriptive error messages.

Examples:

"Weather data is temporarily unavailable. Showing the last saved forecast."

"The weather provider is receiving too many requests. Trying another source."

"We couldn't refresh the weather because your device is offline."

## Fallback strategy

1. Request primary provider.
2. Validate the returned response.
3. On an appropriate recoverable failure, try Open-Meteo.
4. Normalize both providers to the same data structure.
5. If both fail, try valid cached weather data for that city.
6. Clearly identify when displayed data is cached.

Avoid unnecessary duplicate requests.

Ensure the fallback handles:

- HTTP 429
- Provider outage
- Network failures
- Timeouts
- Invalid payloads

Do not silently conceal an API failure if it affects the freshness of displayed data.

---

# 7. FEATURE 3 — FORM VALIDATION

All submittable inputs must have appropriate client-side validation.

Required behaviors:

- Validation on blur
- Validation on submit
- Clear error text adjacent to the input
- Error state removed after correction
- Error linked to input for accessibility

For the city search:

- Reject empty input
- Reject whitespace-only input
- Require a valid city selection
- Handle zero search results
- Handle network failure

For reminder settings:

- Validate time input
- Validate permission availability
- Prevent invalid settings from being treated as active

Do not rely exclusively on alerts, toast messages, or browser-native validation bubbles.

Use accessible error descriptions.

---

# 8. FEATURE 4 — FAVOURITE CITIES

Implement favourite city management.

Maximum allowed: **5 cities**.

Features:

- Save current city
- Remove saved city
- Open any saved city instantly
- Persist across refreshes
- Maintain consistent ordering
- Prevent duplicates
- Clearly indicate already-saved cities
- Show an informative maximum-limit message

Use stable city identifiers or a carefully defined coordinate/location identity.

Do not compare only display names.

## Removal confirmation

When the user removes a favourite, show a clean confirmation dialog.

Example:

"Remove London from your favourites?"

Actions:

- Cancel
- Remove city

Support keyboard interaction and focus restoration.

Avoid using a browser alert as the default if a lightweight accessible dialog can be implemented cleanly.

## Storage behavior

Use localStorage through safe utilities.

Handle:

- Missing data
- Corrupted JSON
- Invalid schema
- Disabled storage
- Quota exceeded
- Duplicate entries

The application must remain functional if localStorage fails.

Explain the reduced persistence capability unobtrusively when necessary.

---

# 9. FEATURE 5 — INSTALLABLE PWA

Configure a fully functional Progressive Web App.

Requirements:

- Valid manifest
- Application name
- Short name
- Theme color
- Standalone display
- Appropriate start URL
- 192×192 PNG icon
- 512×512 PNG icon
- Maskable icon when feasible
- Registered service worker
- Correct production asset paths
- HTTPS deployment

The app should be installable on supported desktop and mobile browsers.

## Offline behavior

Persist the most recently successfully viewed city and its weather snapshot.

The application must work offline for that city after a successful online visit.

When offline:

- Load the application shell
- Restore last-viewed city
- Display cached weather snapshot
- Display forecast if previously cached
- Show an explicit offline banner
- Display last-updated timestamp
- Prevent unavailable network operations from appearing successful

Do not confuse browser HTTP cache with application weather snapshot persistence.

Implement a clear cache strategy:

- Precache static app shell
- Cache required static assets
- Store the last-viewed weather data safely
- Restore that data when the app is offline

Use appropriate cache versioning and update strategies.

Avoid storing all weather data indefinitely.

Consider using a lightweight persistent snapshot store, or the Cache API/IndexedDB where appropriate.

If localStorage is used for snapshots, implement safe recovery from storage errors.

## Offline UX

Example banner:

"You're offline. Showing the last saved weather for Karachi."

Do not display "Live weather" for cached information.

If the application has never been used online, display a meaningful first-use offline state.

---

# 10. FEATURE 6 — NOTIFICATION SYSTEM

This feature requires special architectural judgment.

The challenge requires a morning reminder at a user-selected time, including when the browser tab is closed.

However:

A client-only application cannot universally guarantee exact scheduled, closed-tab Web Push without a reliable external push sender or managed service.

Do not implement a fake closed-tab reminder using only setTimeout or setInterval.

Do not claim that a service worker remains continuously active.

Do not claim that Periodic Background Sync guarantees exact delivery times.

## Implementation strategy

First investigate current browser capabilities and challenge constraints.

Prefer, in order:

1. A genuinely functional standards-compliant solution using an allowed free managed push service, if it fits the no-custom-backend scope and can be deployed safely.
2. Browser-supported notification functionality with realistic guarantees.
3. A clearly documented best-effort active-app reminder fallback where closed-tab delivery is unavailable.

A managed push solution must have a legitimate scheduling mechanism. Do not assume that simply registering a subscription schedules future messages.

Never expose privileged push credentials in frontend code.

Do not add a custom backend in violation of the brief.

## Notification UX

Implement a reminder settings interface.

User can:

- View notification support
- Select morning reminder time
- Understand what permission enables
- Request permission through a user gesture
- Enable or disable reminders
- View permission state
- Change reminder time
- Trigger a test notification where supported

Before requesting permission, show a concise explanation of why it is needed.

Do not prompt automatically on page load.

Handle:

- Granted
- Denied
- Default
- Unsupported browser
- Missing service worker
- Insecure context
- Browser-specific limitations

Use service-worker notifications where appropriate.

When the user clicks a notification, open or focus the WeatherBoard application.

Avoid repeated reminder delivery within the same applicable day where technically enforceable.

If exact closed-tab reminders are not implemented, say so clearly in the UI and README.

Never use misleading "Enabled" indicators when only partial functionality exists.

## Technical documentation

Document:

- What actually works
- What requires browser support
- What requires the app to remain open
- What works when the tab is closed
- Whether any external scheduler is used
- Known delivery limitations

Make this feature honest, functional, and professionally defensible.

---

# 11. FEATURE 7 — RESPONSIVE AND ACCESSIBLE UI

Verify the application at:

- 375px
- 768px
- 1280px

Also test at intermediate viewport sizes to detect layout problems.

Requirements:

- No horizontal page scroll
- No clipped controls
- No unreadable temperature values
- No overlapping forecast cards
- No inaccessible menus
- No input overflow
- Minimum 44×44px mobile touch targets

Accessibility requirements:

- Semantic HTML
- Visible focus indicators
- Keyboard-operable search
- Accessible autocomplete behavior
- Accessible modal confirmation
- Accessible notification settings
- Appropriate ARIA labels
- Sufficient color contrast
- Reduced-motion support
- Meaningful loading and status announcements

Avoid adding ARIA unnecessarily when native HTML already provides correct semantics.

---

# 12. OPTIONAL BONUS FEATURES

Only implement bonuses after the mandatory requirements are complete and verified.

## Bonus A — Theme toggle

Support:

- Light mode
- Dark mode
- System preference detection
- Persistence
- No unexpected flash of incorrect theme where feasible

Ensure contrast remains accessible.

## Bonus B — Temperature unit toggle

Support:

- Celsius
- Fahrenheit
- Persistent preference
- Immediate UI updates
- No page reload

Keep internal weather data normalized to a consistent unit and convert for display.

Do not accidentally convert values twice.

Handle high/low temperatures and feels-like consistently.

## Bonus C — Animated weather icons

Use restrained CSS animation or a lightweight suitable library.

Respect reduced-motion preferences.

Avoid large animation dependencies for trivial effects.

Do not sacrifice application performance or clarity for animations.

---

# 13. COMPONENT ARCHITECTURE

Create a maintainable, reasonably small project structure.

Suggested organization:

```text
src/
  components/
    layout/
    search/
    weather/
    favourites/
    notifications/
    ui/
  hooks/
  services/
    weather/
    cities/
  utils/
  types/
  styles/
  App.tsx
  main.tsx

public/
  icons/

docs/
  Edspire-Frontend-Technical-Challenge.pdf

README.md
PROMPTS.md
.env.example
```

Adjust this structure if a simpler organization is more appropriate.

Suggested components:

- AppHeader
- CitySearch
- SearchSuggestions
- CurrentWeather
- WeatherMetrics
- ForecastSection
- ForecastDayCard
- FavouritesPanel
- ConfirmDialog
- NotificationSettings
- OfflineBanner
- ErrorState
- LoadingState
- EmptyState

Avoid splitting a simple component into many meaningless wrappers.

## State design

Keep clear ownership of:

- Selected city
- Weather data
- Loading state
- API error
- Favourites
- Search results
- Search query
- Notification settings
- Theme
- Unit preference
- Network status

Avoid storing derived values unnecessarily.

Avoid global state when local state and custom hooks are sufficient.

Use reusable service functions for external APIs.

---

# 14. API AND DATA MODELS

Use clear TypeScript interfaces for application data.

Define normalized models such as:

- City
- CurrentWeather
- ForecastDay
- WeatherSnapshot
- WeatherProvider
- WeatherError
- ReminderSettings

Do not allow provider-specific API response shapes to leak throughout the UI.

Create dedicated adapters for:

- OpenWeatherMap
- Open-Meteo
- GeoDB

Normalize:

- Temperature
- Wind speed
- Weather condition codes
- Timestamps
- City identity
- Forecast data

Use explicit types and runtime validation at the API boundary where beneficial.

Avoid `any`.

Do not assume external API responses are always correct.

---

# 15. LOADING, ERROR, AND EMPTY STATES

Every meaningful asynchronous interaction must have a visible status.

Create polished states for:

- First application visit
- Search in progress
- No cities found
- Search provider unavailable
- Weather loading
- Weather provider error
- Weather fallback loading
- Offline cached data
- No cached data
- No favourites saved
- Favourite limit reached
- Notification unsupported
- Permission denied

Use appropriate skeletons or compact loading indicators.

Avoid unnecessary full-screen spinners when only one section is loading.

Do not clear valid weather data immediately when a refresh starts.

Keep the interface stable and reduce layout shifts.

---

# 16. TESTING STRATEGY

Write focused tests for functionality that is most likely to fail.

## Unit tests

Cover:

- Weather response normalization
- Forecast timezone grouping
- Temperature conversion
- City input validation
- Favourite duplicate prevention
- Maximum 5 favourites
- Corrupted localStorage recovery
- API fallback selection

## Component tests

Cover:

- City search suggestions
- Empty and invalid input
- No-results message
- Favourite addition
- Removal confirmation
- Loading and error states

## Browser / integration tests

Where supported, verify:

1. Application loads.
2. User searches for a city.
3. Suggestions appear.
4. Selecting a city loads actual weather data.
5. Five forecast days appear.
6. User saves a favourite.
7. Refresh preserves the favourite.
8. Favourite can be reopened.
9. Removal requires confirmation.
10. Offline mode restores a previously loaded snapshot.
11. Theme and units work if implemented.
12. Notification settings handle denied/unsupported states.

Use fixtures or mocked API responses only inside test code. Never present test fixtures as real production weather.

## Important edge cases

Explicitly test:

- Empty city search
- Whitespace input
- API returning zero results
- API rate limit
- Network disconnection
- Rapid search query changes
- Two cities with the same name
- Repeated favourite addition
- Sixth favourite attempt
- Corrupted localStorage
- Browser storage unavailable
- Weather provider fallback
- Different city timezone
- Mobile overflow
- Offline application reload

---

# 17. PERFORMANCE AND CODE QUALITY

Aim for a responsive, reliable application.

- Avoid unnecessary rerenders.
- Debounce autocomplete requests.
- Cancel stale network requests.
- Avoid redundant weather fetches.
- Use lightweight icons.
- Optimize image/icon assets.
- Avoid large unnecessary dependencies.
- Provide graceful fallbacks.
- Maintain consistent layout.
- Preserve accessibility.

Use Lighthouse or equivalent browser auditing when available.

Review:

- Performance
- Accessibility
- Best practices
- PWA installability and offline behavior

Do not claim a perfect audit score unless actually measured.

---

# 18. ENVIRONMENT VARIABLES AND SECURITY

Create an `.env.example` with required variable names and no real credentials.

Use proper environment configuration.

Never commit `.env.local`, tokens, private credentials, or service-account files.

Document public-client API key exposure and associated restrictions.

Do not treat frontend environment variables as secret protection.

Configure provider-side API key restrictions where available.

Validate environment setup and display useful configuration errors during development.

Never publish actual private credentials in logs, README, screenshots, or commits.

---

# 19. DOCUMENTATION

Create a professional README.md containing:

1. Project overview
2. Features implemented
3. Technology stack
4. Local setup instructions
5. Required environment variables
6. API providers
7. Architecture decisions
8. Forecast aggregation explanation
9. API fallback behavior
10. PWA and offline architecture
11. Notification design and limitations
12. Testing instructions
13. Deployment instructions
14. Known limitations
15. Live deployment URL
16. Relevant screenshots if practical

Use clear, concise technical English.

Do not describe unimplemented functionality as completed.

## PROMPTS.md — MANDATORY

The company explicitly requires the complete agent prompt history in chronological order.

Create and maintain `PROMPTS.md`.

It must accurately record:

- The actual IDE used
- Every actual submitted development prompt, in order
- Follow-up prompts
- Debugging prompts
- Refactoring prompts
- Testing prompts
- Final review prompts

Preserve the exact prompt text wherever available.

Do not fabricate prompts or claim a process occurred when it did not.

Do not silently rewrite the history to make the development process look more sophisticated.

If the IDE cannot export previous prompts, explain the limitation and ask the developer to add the authentic missing prompts.

Add short, factual notes about important engineering decisions when useful, clearly distinguishing them from prompt text.

The purpose is to demonstrate good prompting judgment and genuine iteration.

---

# 20. GIT AND DEPLOYMENT

Use git from the start.

Create meaningful commits after verified milestones.

Suggested milestones:

- Initial project setup
- Weather API and city search
- Favourites and validation
- PWA and offline support
- Notifications
- Responsive polish
- Testing and documentation

These are suggested milestones, not fabricated commit history.

Do not commit broken builds as completed milestones.

Do not force-push or destructively rewrite history without explicit authorization.

Prepare the application for deployment on Vercel.

Verify:

- Production build
- Environment configuration
- Asset paths
- Service worker registration
- HTTPS behavior
- Page refresh
- Offline functionality
- API requests on the deployed domain

If deployment access or credentials are unavailable, report the blocker explicitly. Do not invent a working live URL.

The final repository must be suitable for public review.

---

# 21. DEVELOPMENT WORKFLOW

Execute the project in controlled phases.

## PHASE 0 — REQUIREMENTS ANALYSIS

Before coding:

1. Read the complete supplied PDF.
2. Extract all mandatory requirements.
3. Identify technical contradictions.
4. Identify API credential constraints.
5. Establish a realistic architecture.
6. Build a requirement-to-implementation checklist.
7. Determine how each requirement will be verified.

Identify any limitations that cannot be resolved within the permitted scope.

Do not assume everything is straightforward.

## PHASE 1 — INITIAL SETUP

- Initialize React/TypeScript/Vite.
- Configure Tailwind.
- Configure linting and testing.
- Establish design tokens.
- Create basic layout structure.
- Verify the first successful build.

## PHASE 2 — CORE WEATHER FUNCTIONALITY

- GeoDB city autocomplete.
- Request cancellation.
- Form validation.
- Weather provider integration.
- Five-day forecast normalization.
- Weather fallback behavior.
- Loading and error states.

Prioritize correctness over visual complexity.

## PHASE 3 — PERSISTENT FEATURES

- Favourite cities.
- Confirmation dialog.
- Storage recovery.
- Last-viewed city.
- Cached weather snapshot.

## PHASE 4 — PWA AND NOTIFICATIONS

- Manifest.
- App icons.
- Service worker.
- Offline app shell.
- Offline weather recovery.
- Offline banner.
- Best valid notification implementation.
- Explicit limitations.

Test offline functionality rather than merely registering a service worker.

## PHASE 5 — VISUAL POLISH

- Desktop layout.
- Tablet layout.
- Mobile layout.
- Consistent spacing.
- Typography hierarchy.
- Responsive forecast cards.
- Accessible interactions.
- Optional bonuses only when justified.

## PHASE 6 — TESTING AND REFINEMENT

- Run tests.
- Run lint.
- Run TypeScript checks.
- Run production build.
- Inspect the UI in a browser.
- Test all required breakpoints.
- Test network failures.
- Verify persistent state.
- Verify offline behavior.

Fix actual failures before finalizing.

## PHASE 7 — DOCUMENTATION AND DELIVERY

- Complete README.
- Complete authentic PROMPTS.md.
- Verify .env.example.
- Review repository contents.
- Verify public deployment.
- Confirm final links.

Do not declare completion until the verification checklist is complete.

---

# 22. FINAL QUALITY AUDIT

Before completion, act as a strict senior frontend interviewer.

Audit the application against each original challenge requirement.

For every requirement, classify its status as:

- Implemented and verified
- Implemented but not verified
- Partially implemented
- Not implemented
- Blocked by technical limitations

Provide supporting evidence, such as:

- Relevant source files
- Passing tests
- Browser behavior
- Build output
- Real deployment verification

Check for:

- Missing features
- Broken APIs
- Exposed secrets
- Incorrect dates/timezones
- Invalid forecast calculations
- Unhandled promises
- Race conditions
- Unnecessary dependencies
- Console errors
- Dead code
- Responsive overflow
- Inaccessible controls
- Misleading notification claims
- Broken offline mode
- Outdated documentation

Fix all reasonable issues within the scope.

Do not suppress errors merely to make tests pass.

---

# 23. FINAL DELIVERABLE REPORT

When implementation work is complete, provide:

### A. Project status

What was actually implemented.

### B. Files and architecture

Important source files and their responsibilities.

### C. Verification results

Actual commands executed and their outcomes.

### D. Requirement compliance

A checklist covering all seven core requirements.

### E. Known limitations

Especially notification delivery and browser compatibility.

### F. Deployment

The verified live URL, if deployed.

### G. Repository

The verified public GitHub URL, if published.

### H. Documentation

Confirm README.md and authentic PROMPTS.md.

### I. Interview preparation

Identify five important engineering decisions the developer should understand and explain.

### J. Remaining actions

List only genuine unresolved blockers, not generic suggestions.

---

# FINAL EXECUTION INSTRUCTION

Begin by inspecting the challenge document and current workspace.

Produce a concise requirement checklist and architecture plan, then proceed through implementation, testing, and verification.

Make reasonable technical decisions autonomously.

Do not repeatedly ask for confirmation for ordinary implementation details.

Only request user intervention when genuinely required, such as API credentials, service configuration, or deployment authorization.

Never invent completed tests, tool execution, GitHub links, deployment results, or working features.

Build WeatherBoard to a standard that a senior frontend engineer could review, understand, maintain, and confidently discuss in an interview.

**The goal is a reliable, beautiful, genuinely working product — not merely code that appears complete.**````

The accompanying user request was:

```text
## IMPORTANT — TECHNICAL LIMITATIONS & DELIVERY POLICY

If any requirement cannot be reliably implemented due to browser restrictions, API limitations, free-tier restrictions, security concerns, or the challenge's client-side-only architecture, do not force an unreliable workaround.

Follow these rules:

1. First investigate whether a legitimate, technically correct solution exists within the assignment's constraints.
2. If feasible, implement and thoroughly test it.
3. If genuinely infeasible, do not waste development time on fragile workarounds.
4. Do not implement fake functionality or misrepresent partially working features.
5. Keep the rest of the application fully functional.
6. Clearly document the limitation in README.md, including its technical reason and what would be required to implement it properly.
7. Maintain a dedicated **Known Limitations** section.
8. In the final delivery report, provide a concise, professional explanation of each unimplemented requirement that can be included in the submission email.
9. Never claim that something is impossible without verifying the relevant technical constraints.
10. Prioritize completion and quality of all feasible mandatory requirements before implementing optional bonuses.

**Important:** Avoid omitting core requirements merely because they are difficult. Only leave out functionality when there is a genuine technical or platform limitation that cannot reasonably be resolved within the permitted architecture.

The final deliverable should be a professional, functional application with transparently documented technical limitations.



analyze everything do everything best
```

## 2. Companion interface context

Two interface-generated messages reported a null companion page and null document view. They contained no additional development instruction or reference screen. No design inspection was inferred from them.

## 3. Design research follow-up

```text
## MANDATORY UI/UX REFERENCE RESEARCH

Before finalizing the WeatherBoard design, study all six design references explicitly specified by Edspire:

1. **Linear (linear.app):** Study typography hierarchy, spacing, clean layouts, focused interactions, and empty states.
2. **Vercel Dashboard (vercel.com):** Study status indicators, meaningful interaction feedback, subtle motion, and compact information presentation.
3. **Stripe (stripe.com):** Study inline validation, form feedback, accessible errors, and actionable recovery messages.
4. **Mercury (mercury.com):** Study calm color palettes, structured dashboards, card composition, and data hierarchy.
5. **Dribbble (search: "weather dashboard"):** Study real weather dashboard concepts, including current-weather cards, forecast layouts, weather iconography, and visual balance.
6. **Mobbin (mobbin.com):** Study mobile search interfaces, notification permission flows, settings, and touch-friendly interactions.

**Research expectations:**

- Actually inspect accessible reference screens and interactions, rather than relying solely on generic descriptions.
- Identify which ideas are relevant to this specific weather dashboard.
- Create an original, coherent design system informed by the references.
- Do not copy layouts, branding, illustrations, or entire component designs.
- Do not combine unrelated visual styles into an inconsistent interface.
- Prioritize readability, functionality, accessibility, and responsive behavior.
- If a reference is inaccessible or requires a subscription, acknowledge that instead of claiming it was reviewed.
- Document significant design choices briefly in README.md.

**Design quality gate:**

Before completing the UI, review the application as a senior product designer. Check typography, spacing, visual hierarchy, color consistency, responsiveness, loading/empty/error states, keyboard accessibility, and the overall consumer-product experience.

The result should feel like one carefully designed product, not a collection of unrelated dashboard templates.
```

## 4. Challenge PDF supplied

The user supplied `Edspire-Frontend-Technical-Challenge.pdf` and wrote:

```text
pdf
```

The supplied PDF was extracted and read in full, then used to check the seven core requirements. It is marked confidential and is retained locally rather than published in this repository.

## Factual implementation notes (not prompts)

- The workspace was empty. React/TypeScript/Vite was initialized with strict typing.
- Missing project API keys led to an explicit keyless Open-Meteo mode, not fabricated responses. GeoDB/OpenWeather contracts and fallback paths were tested using fixtures only in tests.
- Browser documentation was checked before implementing an honest active-app notification fallback. No closed-tab scheduling claim was made.
- Production Chromium tests exercised responsive layouts, keyboard search, favourites, storage failure and actual service-worker offline reload. Separate browser checks requested live Open-Meteo data.
- All six requested reference URLs were visited; gated/private screens are identified in `docs/DESIGN.md`.
- Source was refactored into focused favourites and weather-details components after the first test pass. No invented user prompt is attributed to that autonomous review.

## 5. Credentials and chosen repository

The user answered the pending setup questions with:

```text
cofigured:
/Users/mahadahmedabbasi/Desktop/Edspire/.env.local
```

```text
i have made github repo but didnot setup vercel:
[https://github.com/mahadabbasi19/Edspire-weather.git](https://github.com/mahadabbasi19/Edspire-weather.git)
```

The chosen repository was empty and public. Source was pushed there without rewriting history. An earlier agent-created `weatherboard-edspire` repository was left intact when the user's chosen destination arrived.

## 6. Updated weather credential

IDE context showed `.env.local` as the active file. The user's exact follow-up was:

```text
i have updated openweather api key in .env.local so use that one
```

Credential values are intentionally excluded from this history. The app was rebuilt to use the updated local value.
