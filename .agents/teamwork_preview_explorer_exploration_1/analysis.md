# Codebase Analysis Report: E2E Test Suite Preparation

This report details the exact files, code locations, and structural properties for the E2E testing of the seven specified requirements in the OOP Academy Polish application.

---

## 1. Pop-out Window URL Routing Configuration

### Target Files & Locations
- **`src/main.tsx`** — Line 3, 9–11: Router configuration
- **`src/App.tsx`** — Line 21–25: Switch check for pop-out rendering
- **`src/pages/ExercisePage.tsx`** — Line 118: Spawning the pop-out window with WebviewWindow
- **`PROJECT.md`** — Lines 11–13, 20–22: Interface contracts and milestone plan

### Technical Analysis & Findings
- **Current Setup**:
  - `src/main.tsx` wraps the application in React Router DOM's `<BrowserRouter>`.
  - `src/pages/ExercisePage.tsx` spawns a new Tauri window using:
    ```typescript
    const popout = new WebviewWindow("editor-popout", {
      url: `/popout?id=${exercise.id}`,
      ...
    });
    ```
  - `src/App.tsx` intercepts the render path if `location.pathname === "/popout"`, bypassing the standard `<Routes>` wrapper to display the editor directly:
    ```typescript
    const isPopout = location.pathname === "/popout";
    if (isPopout) {
      return <PopoutEditorPage />;
    }
    ```
- **Migration Plan**:
  - Spawning separate windows in Tauri using `BrowserRouter` can lead to blank pages during reloading or direct window instantiation because filesystem-based builds cannot handle arbitrary paths without server-side rewrites.
  - A migration to `HashRouter` is planned/in-progress (as noted in `PROJECT.md` under Milestone 2: `R1: Pop-out Routing & Glass Background`).
  - Under `HashRouter`, the router inside `src/main.tsx` will be changed from `<BrowserRouter>` to `<HashRouter>`.
  - The URL routing contract for spawning pop-out windows will change from `/popout?id=<exercise_id>` to `index.html#/popout?id=<exercise_id>`.

---

## 2. Translucent Glass & Backdrop Blur Settings

### Target Files & Locations
- **`src/pages/PopoutEditorPage.tsx`** — Line 70–76: Inline styles for pop-out container
- **`src/index.css`** — Line 92–99: `.glass-panel` class styling
- **`src/pages/ExercisePage.tsx`** — Line 123–125: WebviewWindow configuration
- **`src-tauri/tauri.conf.json`** — Line 13: macOS private API toggle
- **`src/components/layout/TopBar.tsx`** — Line 26–27: Backdrop filters
- **`src/components/layout/Sidebar.tsx`** — Line 36–37: Backdrop filters
- **`src/components/layout/CommandPalette.tsx`** — Line 79, 88: Tailwind backdrop-blur classes

### Technical Analysis & Findings
- **CSS Styles**:
  - The pop-out editor container (`src/pages/PopoutEditorPage.tsx`) has the following custom style object:
    ```typescript
    background: "rgba(17, 17, 19, 0.75)",
    backdropFilter: "blur(60px) saturate(1.8)",
    WebkitBackdropFilter: "blur(60px) saturate(1.8)",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.08)",
    ```
    This defines an opacity of 75%, blur radius of 60px, saturation of 1.8, and a 1px border with 8% white opacity.
  - The standard global `.glass-panel` class in `src/index.css` uses:
    ```css
    background: rgba(255, 255, 255, 0.045);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
    border: 1px solid rgba(255, 255, 255, 0.09);
    ```
- **Tauri Window Properties**:
  - The window is instantiated in `src/pages/ExercisePage.tsx` with:
    - `decorations: false` — Frameless window (crucial for custom title bar and rounded corners).
    - `transparent: true` — Allows web/CSS transparency and backdrop blur to render through the native window.
    - `shadow: false` — Hides the OS-drawn shadow, preventing black background glitching on transparent regions.
  - In `src-tauri/tauri.conf.json`, `"macOSPrivateApi": true` is enabled under `"app"`, which exposes macOS-specific APIs for transparency and blur.

---

## 3. Exercise List Format and All 36 Exercises

### Target Files & Locations
- **`src/data/exercises.ts`** — Holds all categories and exercise metadata
- **`update_exercises.js`** — A root-level helper script for replacing exercise descriptions

### Technical Analysis & Findings
- **Storage Location**: Exercises are stored as a static array `EXERCISES` of type `Exercise[]` inside the TypeScript file `src/data/exercises.ts`.
- **Formatting details**:
  - All 36 exercises utilize **template literals (backticks)** for their `description` field, containing rich Multi-line Markdown structure.
  - No exercises use double quotes (`"`) for the `description` key.
  - Exercise object properties: `id` (string), `categoryIndex` (number), `difficulty` (string: beginner/intermediate/advanced), `title` (string), `description` (markdown string), `hints` (string[]), `starterCode` (string), `testHarness` (string).
- **List of all 36 Exercises by Category**:
  1. **Category 0: Basic Class Structure**
     - `01-bank-account` (Line 22)
     - `01-student` (Line 92)
     - `01-matrix` (Line 164)
  2. **Category 1: Static Methods & Overloading**
     - `02-counter` (Line 236)
     - `02-calculator` (Line 293)
     - `02-logger` (Line 339)
  3. **Category 2: Constructors**
     - `03-point` (Line 402)
     - `03-mystring` (Line 461)
     - `03-buffer` (Line 530)
  4. **Category 3: Operator Overloading**
     - `04-vector2d` (Line 599)
     - `04-intstack` (Line 664)
     - `04-fraction` (Line 730)
  5. **Category 4: Copy & Move Semantics**
     - `05-dynamicarray` (Line 826)
     - `05-uniquebuffer` (Line 890)
     - `05-smartmatrix` (Line 954)
  6. **Category 5: Inheritance & Abstract Classes**
     - `06-shape` (Line 1026)
     - `06-animal` (Line 1104)
     - `06-vehicle` (Line 1178)
  7. **Category 6: Polymorphism**
     - `07-car-fleet` (Line 1272)
     - `07-race-sim` (Line 1346)
     - `07-f1-championship` (Line 1425)
  8. **Category 7: Templates**
     - `08-pair` (Line 1520)
     - `08-template-stack` (Line 1579)
     - `08-sorter` (Line 1652)
  9. **Category 8: STL Usage**
     - `09-word-freq` (Line 1723)
     - `09-task-scheduler` (Line 1787)
     - `09-gradebook` (Line 1869)
  10. **Category 9: Exceptions**
      - `10-safe-divide` (Line 1943)
      - `10-db-exceptions` (Line 2016)
      - `10-safevector` (Line 2113)
  11. **Category 10: User-Defined Literals**
      - `11-distance` (Line 2198)
      - `11-temperature` (Line 2261)
      - `11-duration` (Line 2326)
  12. **Category 11: Design Patterns**
      - `12-observer` (Line 2396)
      - `12-json-tree` (Line 2494)
      - `12-command-undo` (Line 2602)

---

## 4. ProblemCard Component Layout Padding

### Target Files & Locations
- **`src/components/exercise/ProblemCard.tsx`** — Lines 35, 81

### Technical Analysis & Findings
- **Outer Wrapper Padding** (Line 35):
  - `<div className="flex flex-col gap-4 px-8 py-6">`
  - `px-8` (Horizontal Padding): `2rem` or `32px` on left and right.
  - `py-6` (Vertical Padding): `1.5rem` or `24px` on top and bottom.
  - `gap-4` (Grid Gap): `1rem` or `16px` of vertical spacing between sections.
- **Hints Box Padding** (Line 81):
  - `<div key={i} className="text-xs text-amber-200/70 px-3 py-1.5 rounded-lg" ...>`
  - `px-3` (Horizontal Padding): `0.75rem` or `12px` on left and right.
  - `py-1.5` (Vertical Padding): `0.375rem` or `6px` on top and bottom.

---

## 5. ExercisePage Toolbar Layout and Padding

### Target Files & Locations
- **`src/pages/ExercisePage.tsx`** — Lines 176–178, 192–229

### Technical Analysis & Findings
- **Toolbar Container**:
  - The outer toolbar wrapper (Line 178) is defined as:
    `<div className="flex items-center justify-between shrink-0">`
  - The button container on the right side (Line 192) is defined as:
    `<div className="flex items-center gap-2.5">`
    - Uses Tailwind's `gap-2.5` to separate buttons by `0.625rem` (10px).
    - No margin-right or padding-right classes are applied directly to individual buttons in the TSX markup.
- **Outer Page Padding Context**:
  - The entire editor workspace area, which contains the toolbar and the editor frame, is wrapped in (Line 176):
    `<div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">`
    - This provides a padding of `p-5` (`1.25rem` or `20px`) on all sides, meaning there is a 20px gap from the rightmost button ("Run & Test") to the screen edge.
- **Clipping Vulnerability**:
  - At the minimum supported app width of `1100px` (defined in `tauri.conf.json`), the presence of the left sidebar reduces the available workspace width. The toolbar elements (filename on the left, three buttons on the right) have no wrapping configurations, leaving them susceptible to clipping.

---

## 6. editor-btn CSS Height Alignment Rules

### Target Files & Locations
- **`src/index.css`** — Lines 262–337
- **`src/pages/PopoutEditorPage.tsx`** — Lines 107, 117
- **`src/pages/ExercisePage.tsx`** — Lines 198, 209, 221

### Technical Analysis & Findings
- **Base Style Configuration** (Line 262–278):
  ```css
  .editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: none;
    font-size: 12px;
    font-weight: 600;
    line-height: 1;
    ...
  }
  ```
- **Modifiers**:
  - `.editor-btn--ghost`: `border: 1px solid transparent;`
  - `.editor-btn--secondary`: `border: 1px solid rgba(255, 255, 255, 0.08);`
  - `.editor-btn--primary`: `border: 1px solid rgba(139, 92, 246, 0.5);`
- **Height Alignment Bug**:
  - The base `.editor-btn` sets `border: none`.
  - All three modifiers override this to specify `border: 1px solid`.
  - Because global `box-sizing: border-box` is set in `src/index.css` (Line 28), elements with a border calculate their heights including the border width.
  - If a button uses the base `.editor-btn` class *without* a modifier class, it will render with `border: none`, making its computed height 2px smaller (lacking 1px top and bottom borders) compared to buttons with modifiers.
  - **Remediation**: Setting the default border style on the base class `.editor-btn` to `border: 1px solid transparent;` and having the modifier classes override only the `border-color` guarantees consistent height across all buttons regardless of modifier presence.
  - **Running State Shift**: During compilation, `.editor-btn--primary.is-running` modifies only background, color, and `border-color: rgba(139, 92, 246, 0.2);`. The border width remains 1px, preventing alignment shift.
  - **Icon and Font-Size Mismatch**: Buttons in `PopoutEditorPage.tsx` specify `text-[11px]` and icon sizes of `12px`, whereas buttons in `ExercisePage.tsx` use default `12px` font-size and `14px` icons, creating a slight height mismatch between main and pop-out window toolbars.

---

## 7. TypeScript & Vite Build Configurations

### Target Files & Locations
- **`package.json`** — Build commands and dependencies
- **`tsconfig.json`** — TypeScript rules and path mapping
- **`tsconfig.node.json`** — Node-specific TS settings
- **`vite.config.ts`** — Vite build targets and plugins

### Technical Analysis & Findings
- **package.json Scripts**:
  - `"dev": "vite"` — Launches Vite dev server at `http://localhost:1420`.
  - `"build": "tsc && vite build"` — Executes TypeScript type checking (`tsc`) followed by the Vite production build.
  - `"tauri:dev": "tauri dev"` — Boots Tauri in developer mode.
  - `"tauri:build": "tauri build"` — Invokes Tauri production build, which automatically triggers `"npm run build"` as the `beforeBuildCommand`.
- **TypeScript Settings (`tsconfig.json`)**:
  - `"target": "ES2022"`, `"module": "ESNext"`, `"moduleResolution": "bundler"`.
  - `"noEmit": true` — Confirms that `tsc` is used purely for verification, leaving compilation and bundling duties to Vite.
  - `"strict": true` — Enforces strict type-checking checks.
  - `"paths": { "@/*": ["./src/*"] }` — Configures absolute paths using the `@/` prefix to resolve to `./src/`.
- **Vite Settings (`vite.config.ts`)**:
  - Plugins: `@vitejs/plugin-react` (React hot reloading) and `@tailwindcss/vite` (Tailwind CSS v4 compile plugin).
  - Port: `1420` (forced with `strictPort: true`).
  - Build targets: `["es2021", "chrome100", "safari15"]`.
  - Minifier: `esbuild` when not in debug mode (`TAURI_DEBUG` is false).
