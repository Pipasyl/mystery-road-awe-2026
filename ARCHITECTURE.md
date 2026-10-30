# Architecture (React part, Exercise 4)

## Folder structure

```
dashboard/          DashboardPage
people-locations/   PeoplePage, PeopleList, PeopleGrid, PersonCard,
                    LocationsList, LocationCard
timeline/           TimelinePage, TimelineList, TimelineEventCard,
                    CertaintyBadge
shell/              Header (logo, title, main navigation)
components/         ViewSection, EmptyState, UI (Badge, Button, StatCard),
                    KeyDemo (presentation demo, not used by the app)
(root)              App.tsx, react-main.tsx (entry points)
                    state.ts, api.ts, types.ts, utils.ts (shared logic)
                    views.ts, main.ts (old vanilla app, shrinks over time)
```

## Rule: shared versus feature-local

- A file used by **one** feature lives in that feature's folder.
  Example: `PersonCard` is only used by People & Locations, so it lives in
  `people-locations/`.
- A file used by **two or more** features lives in `components/`.
  Example: `EmptyState` is used by the people, locations and timeline lists,
  so it lives in `components/`.
- A feature folder holds its page component (feature), its list components
  and its small presentational components.

## Rule: presentational versus feature components

- **Presentational:** only draws the props it receives (`PersonCard`,
  `PeopleGrid`).
- **Feature:** reads data from `state.ts` or calculates something, then hands
  the result down (`PeopleList`, `TimelinePage`).

## Routes (HashRouter, addresses look like `react.html#/timeline`)

| Address                     | Component                                   |
| --------------------------- | ------------------------------------------- |
| `#/`                        | DashboardPage                               |
| `#/team`                    | redirects to `#/team/people`                |
| `#/team/people`             | PeoplePage (frame) + PeopleTab              |
| `#/team/locations`          | PeoplePage (frame) + LocationsTab           |
| `#/team/people/:personId`   | PeoplePage (frame) + PersonDetail           |
| `#/timeline?person=<id>`    | TimelinePage (query param = initial filter) |
| `#/evidence`, `#/workspace` | stubs (Exercise 5)                          |
| anything else               | NotFoundPage                                |

- HashRouter is used because the React app starts from `react.html`. The part
  after `#` never goes to the server, so reload and bookmarks work.
- `/team` is a parent route. `PeoplePage` draws the title and the tabs, and
  an `<Outlet />` shows the matching child route.

## Files added for routing

- `people-locations/PeopleLocationsTabs.tsx`: the two tabs (NavLink).
- `people-locations/PersonDetail.tsx`: reads `:personId` with `useParams`.
- `people-locations/evidenceCount.ts`: counting rule shared by the list and
  the detail page.
- `timeline/TimelineFilters.tsx`: filter dropdowns, visually complete but not
  wired (no state, Exercise 5).

## Render vs. effect (Exercise 6, Demo 1)

- **Render** (the body of a component function): only works out what to show from props and state.
  Same input gives the same output. It never changes anything outside the function.
  React may call it more than once (state changes, Strict Mode), so it must be safe to repeat.
- **Effect** (`useEffect`): everything that touches the outside world — storage, timers,
  network, the page title. It runs after the screen is drawn.
- **Derived values** (like the filtered evidence list) are calculated in render, not in an effect,
  because they only read data and build something new.
