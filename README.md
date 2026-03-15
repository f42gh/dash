# dash

ADHD-focused personal dashboard. Minimizes daily decision fatigue with a "Today Mode" view.

## Tech Stack

- **Runtime / Bundler**: [Bun](https://bun.sh/)
- **Framework**: React 19 + TypeScript
- **Styling**: CSS Modules / Tailwind (TBD)
- **Data**: localStorage (local-only, `.db` files gitignored)
- **Fonts**: Noto Sans JP + JetBrains Mono

## Getting Started

```bash
# Install dependencies
bun install

# Start dev server
bun run dev

# Build for production
bun run build
```

## Project Structure

```
src/
├── components/
│   ├── today/       # FocusZone, HabitTracker, TodoList, JobHuntDeadline
│   ├── overview/    # Phase 2
│   ├── layout/      # Header, ModeSwitch
│   └── shared/      # Card, CheckButton, ProgressRing
├── hooks/           # useStorage, useTheme, useToday
├── types/           # Type definitions
├── utils/           # storage, date, theme helpers
├── App.tsx
├── main.tsx
└── index.css
```

## Features

- **Today Mode** (Phase 1): Focus zone, habit tracker, 3-item TODO, job hunt deadline
- **Overview Mode** (Phase 2): Weekly habits, skill map, job hunt timeline, company list
- **Auto theme**: Time-based theme switching (morning / day / evening / night)

See [SPEC.md](./SPEC.md) for full specification.
