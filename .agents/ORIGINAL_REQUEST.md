# Original User Request

## Initial Request — 2026-06-12T21:32:23Z

Fix remaining visual bugs and polish the OOP Academy Tauri desktop app (React + TypeScript + Tauri v2). The app is an interactive C++ learning platform with exercise pages, a code editor (Monaco), and a pop-out window feature.

Working directory: /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app
Integrity mode: development

## Requirements

### R1. Fix the pop-out editor window — it opens but is blank

The "Pop Out" button successfully spawns a separate OS window via Tauri's `WebviewWindow`, but that window renders completely blank/white. The popout page component is at `src/pages/PopoutEditorPage.tsx` and is routed via `src/App.tsx` (check for `location.pathname === "/popout"`). The `WebviewWindow` is created in `src/pages/ExercisePage.tsx` inside `spawnPopoutWindow()` with `url: '/popout?id=${exercise.id}'`. The window needs to:
- Actually render the `PopoutEditorPage` component with the Monaco code editor visible
- Have a translucent/frosted-glass background (the window is created with `transparent: true` and `decorations: false`)
- Use a liquid-glass aesthetic with backdrop blur and subtle animated gradients
- The Tauri capabilities are in `src-tauri/capabilities/default.json` and the app config is in `src-tauri/tauri.conf.json` — both may need adjustments for the webview to load correctly

### R2. Fix exercise description padding and remaining plain-text descriptions

Looking at the exercise page, the problem description text (title + description + hints) is flush against the left edge of the content area with no breathing room. The `ProblemCard` component (`src/components/exercise/ProblemCard.tsx`) needs proper left/right padding so the markdown text doesn't touch the sidebar boundary. Additionally, many exercises in `src/data/exercises.ts` still use plain single-line text descriptions instead of rich markdown. All 36 exercise descriptions should be converted to detailed, structured markdown with headings, numbered requirements, inline `code` formatting, and conceptual hints. The `ProblemCard` already uses `react-markdown` with `prose prose-invert` classes — the descriptions just need to be written properly.

### R3. Fix "Run & Test" button clipping against the right edge

In the first screenshot, the "Run & Test" button is cut off at the right edge of the app window. The toolbar area in `ExercisePage.tsx` needs enough right padding/margin so all buttons (Pop Out, Reset, Run & Test) are fully visible and never clip against the window boundary, even at the minimum window width (1100px).

### R4. Premium visual polish for buttons and UI elements

The editor toolbar buttons (Pop Out, Reset, Run & Test) should look premium and world-class. There is already a CSS design system in `src/index.css` with `.editor-btn`, `.editor-btn--ghost`, `.editor-btn--secondary`, and `.editor-btn--primary` classes. Make sure these classes are actually being used by the components and that the visual result is polished — proper gradients, subtle shadows, hover states, and a disabled state for the "Run & Test" button during compilation.

## Acceptance Criteria

### Pop-out window
- [ ] Clicking "Pop Out" opens a separate OS window that renders the Monaco code editor with the exercise's starter code visible
- [ ] The popout window has a translucent/frosted-glass background — not opaque white or opaque black
- [ ] The popout window can be dragged independently of the main app window
- [ ] The popout window has a visible close button and title bar

### Padding & descriptions
- [ ] The problem description text has at least 20px of left padding from the sidebar boundary
- [ ] The "Run & Test" button does not clip or overflow the right edge of the app at any supported window width
- [ ] All 36 exercise descriptions in `src/data/exercises.ts` use markdown formatting (headings, bullet lists, inline code) — zero remaining plain-text one-liners
- [ ] The markdown renders correctly in the `ProblemCard` component with proper typography

### Visual polish
- [ ] All editor toolbar buttons use the `.editor-btn` CSS class system
- [ ] The "Run & Test" button has a visible gradient background and glow shadow when not running
- [ ] The "Run & Test" button has a distinct disabled/muted appearance when code is running
- [ ] Hover states on all buttons produce a visible visual change

### Build & stability
- [ ] `npx vite build` completes with zero errors
- [ ] No TypeScript errors from `npx tsc --noEmit` (unused variable warnings TS6133/TS6198 are acceptable)
- [ ] The app starts successfully with `npm run tauri dev` — no console crashes
