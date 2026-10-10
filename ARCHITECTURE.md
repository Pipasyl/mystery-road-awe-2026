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
