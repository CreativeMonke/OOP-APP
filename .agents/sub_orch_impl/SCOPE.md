# Scope: Implementation of R1, R2, R3, R4, and E2E verification

## Architecture
- Frontend: React + TypeScript + Vite + Tailwind CSS.
- Desktop shell: Tauri v2.
- Monaco Editor is used for exercise editing.
- Exercise descriptions are loaded from `src/data/exercises.ts` and rendered via `ProblemCard.tsx`.
- Popout editor window is spawned by Tauri's `WebviewWindow` in `src/pages/ExercisePage.tsx` and routed to `PopoutEditorPage.tsx`.

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| A | R1: Pop-out Window | Fix pop-out editor window routing, blank screen, translucency, backdrop blur, title/close window controls, Tauri capabilities. | none | IN_PROGRESS |
| B | R2: Formatting & Padding | Reformat 36 exercise descriptions to markdown, add problem card side padding. | A | PLANNED |
| C | R3: Toolbar Padding | Add right margin/padding in ExercisePage.tsx to prevent button clipping. | B | PLANNED |
| D | R4: CSS Normalization | Normalize `.editor-btn` border box sizing to avoid layout shift, polish styles. | C | PLANNED |
| E | Final Milestone | Pass 100% E2E tests and perform white-box adversarial coverage hardening. | D | PLANNED |

## Interface Contracts
- HashRouter will be used for routing: path format `index.html#/popout?id=<id>` for pop-out.
- Pop-out window communication: the popup needs to fetch the exercise by ID and use Monaco editor.
