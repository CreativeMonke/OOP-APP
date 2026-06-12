# Project: OOP Academy Polish

## Architecture
- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite. Router uses React Router DOM. Monaco Editor for code input.
- **Backend/Desktop wrapper**: Tauri v2. Uses WebviewWindow to spawn pop-out windows.
- **Data Model**: Static C++ exercises stored in `src/data/exercises.ts`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | E2E Test Suite | Create static/E2E test suite in `run_e2e_tests.js` verifying routing, markdown structure, padding, and build status. | none | IN_PROGRESS (f29c24f9-7298-4f7e-82e4-18566d4c801f) |
| 2 | R1: Pop-out Routing & Glass Background | Fix pop-out blank page by migrating to HashRouter, adjusting window URL, and editing CSS for transparency. | M1 | IN_PROGRESS (1c872de0-0fda-40fc-91e4-fe536e213b5e) |
| 3 | R2: Reformat Exercise Descriptions & Padding | Update all 36 exercise descriptions to markdown, ensure ProblemCard has proper padding. | M1 | IN_PROGRESS (1c872de0-0fda-40fc-91e4-fe536e213b5e) |
| 4 | R3: Button Clipping & Layout | Fix layout to avoid clipping of Run & Test button at min width (1100px). | M1 | IN_PROGRESS (1c872de0-0fda-40fc-91e4-fe536e213b5e) |
| 5 | R4: CSS Polish & Visual States | Polish `.editor-btn` in index.css to resolve height alignment shift. Make sure state indicators are perfect. | M1, M2, M3, M4 | IN_PROGRESS (1c872de0-0fda-40fc-91e4-fe536e213b5e) |
| 6 | Integration & Verification | Run all verification checks, compile the project, run E2E test suite. | M2, M3, M4, M5 | PLANNED |

## Interface Contracts
### Main Window ↔ Popout Window
- URL format: `index.html#/popout?id=<exercise_id>`
- Query parameters: `id` (exercise identifier)

## Code Layout
- `src/main.tsx` — App entry point & Router configuration.
- `src/App.tsx` — Main application shell & routing switch.
- `src/pages/ExercisePage.tsx` — Main exercise workspace layout & toolbar.
- `src/pages/PopoutEditorPage.tsx` — Pop-out editor page window component.
- `src/components/exercise/ProblemCard.tsx` — Renders description of exercise.
- `src/data/exercises.ts` — Catalog of 36 C++ exercises.
- `src/index.css` — Global styles, design system, `.editor-btn` styling.
- `src-tauri/tauri.conf.json` — Tauri configuration (permissions, window definitions).
- `src-tauri/capabilities/default.json` — Tauri v2 capabilities.
