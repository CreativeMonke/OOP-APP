# Handoff Report: Codebase Exploration for E2E Test Suite Design

## 1. Observation

### Pop-out Window URL Routing
- **File**: `src/main.tsx` (Lines 9–11)
  ```typescript
  <BrowserRouter>
    <App />
  </BrowserRouter>
  ```
- **File**: `src/App.tsx` (Lines 21–25)
  ```typescript
  const isPopout = location.pathname === "/popout";
  if (isPopout) {
    return <PopoutEditorPage />;
  }
  ```
- **File**: `src/pages/ExercisePage.tsx` (Line 118)
  ```typescript
  url: `/popout?id=${exercise.id}`,
  ```
- **File**: `PROJECT.md` (Lines 11–13, 20–22)
  - Milestone 2: `"R1: Pop-out Routing & Glass Background: Fix pop-out blank page by migrating to HashRouter, adjusting window URL, and editing CSS for transparency."`
  - Interface Contract: `"URL format: index.html#/popout?id=<exercise_id>"`

### Translucent Glass & Backdrop Blur
- **File**: `src/pages/PopoutEditorPage.tsx` (Lines 70–74)
  ```typescript
  background: "rgba(17, 17, 19, 0.75)",
  backdropFilter: "blur(60px) saturate(1.8)",
  WebkitBackdropFilter: "blur(60px) saturate(1.8)",
  ```
- **File**: `src/index.css` (Lines 92–95)
  ```css
  .glass-panel {
    background: rgba(255, 255, 255, 0.045);
    backdrop-filter: blur(20px) saturate(1.4);
    -webkit-backdrop-filter: blur(20px) saturate(1.4);
  ```
- **File**: `src/pages/ExercisePage.tsx` (Lines 123–125)
  ```typescript
  decorations: false,
  transparent: true,
  shadow: false,
  ```
- **File**: `src-tauri/tauri.conf.json` (Line 13)
  ```json
  "macOSPrivateApi": true,
  ```

### Exercise List Format
- **File**: `src/data/exercises.ts` (Lines 18–26)
  - 36 exercises stored inside the array `EXERCISES: Exercise[]`
  - Verbatim first exercise description setting:
    ```typescript
    description: `### Implement a BankAccount Class\n\nYou are tasked with modeling a simple \`BankAccount\` in C++.\n\n**Core Requirements:**\n1. **State:** Keep track of a private \`double balance\` and \`std::string owner\`.\n2. **Deposit:** The \`deposit(double amount)\` method should add the specified amount to the balance, but **ignore negative amounts** entirely.\n3. **Withdraw:** The \`withdraw(double amount)\` method must subtract the amount *only* if the account holds sufficient funds. If the withdrawal is successful, return \`true\`; otherwise, return \`false\` and leave the balance unchanged.\n4. **Display:** Implement a \`print()\` method that outputs the account details exactly like this:\n   \`Account[owner]: $balance\`\n   Ensure the balance is printed with exactly **2 decimal places** (e.g., \`Account[Alice]: $120.00\`).\n\n*Hint: Use \`<iomanip>\` for formatting.*`,
    ```
  - Analysis shows that **all 36 exercises** use backticks (template literals) for `description: ` and contain Markdown content. No exercises use double quotes (`"`) for descriptions.

### ProblemCard Component Layout Padding
- **File**: `src/components/exercise/ProblemCard.tsx` (Lines 35, 81)
  ```typescript
  // Outer Wrapper:
  <div className="flex flex-col gap-4 px-8 py-6">
  ...
  // Hints Box:
  <div key={i} className="text-xs text-amber-200/70 px-3 py-1.5 rounded-lg"
  ```

### ExercisePage Toolbar Spacing & Padding
- **File**: `src/pages/ExercisePage.tsx` (Lines 176, 178, 192)
  - Outermost editor layout container padding:
    ```typescript
    className="flex-1 flex flex-col overflow-hidden p-5 gap-4"
    ```
  - Toolbar buttons wrapper:
    ```typescript
    className="flex items-center gap-2.5"
    ```
  - Buttons do not contain any custom inline margins or margin-right utility classes.

### editor-btn CSS Height Alignment
- **File**: `src/index.css` (Lines 262, 281, 293, 311)
  - Base button style:
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
      font-family: var(--font-sans);
      cursor: pointer;
      outline: none;
      transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      user-select: none;
      line-height: 1;
    }
    ```
  - Modifiers:
    ```css
    .editor-btn--ghost { border: 1px solid transparent; }
    .editor-btn--secondary { border: 1px solid rgba(255, 255, 255, 0.08); }
    .editor-btn--primary { border: 1px solid rgba(139, 92, 246, 0.5); }
    ```

### TypeScript and Vite Build Configs
- **File**: `package.json` (Line 6–13)
  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "tauri": "tauri",
    "tauri:dev": "tauri dev",
    "tauri:build": "tauri build"
  }
  ```
- **File**: `tsconfig.json` (Lines 2, 12, 14, 19–20)
  ```json
  "compilerOptions": {
    "target": "ES2022",
    "noEmit": true,
    "strict": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  }
  ```

---

## 2. Logic Chain

1. **Pop-out Window URL Routing**:
   - Spawning sub-windows dynamically via Tauri's `WebviewWindow` requires a URL. The current routing utilizes standard HTML5 History-based routing (`BrowserRouter`), which fails when loading pages on reload/direct window instantiations because Tauri loads from static file paths.
   - Migrating to `HashRouter` will change the app entry wrapper from `BrowserRouter` to `HashRouter` and update window URLs to use hash-based routing (`index.html#/popout?id=...`), resolving the page reload issue.

2. **Translucent Glass & Backdrop Blur**:
   - For a desktop window to render translucent backdrop-blur effects (e.g. macOS vibrancy or Windows acrylic), the window itself must have `transparent: true` and `decorations: false` in Tauri's properties.
   - CSS-level transparency is configured via `background: rgba(...)` and `backdrop-filter: blur(...)`.
   - The native level config `macOSPrivateApi: true` in `tauri.conf.json` enables the private APIs required for desktop blur rendering.

3. **Exercise List Format**:
   - `src/data/exercises.ts` compiles 36 exercise data points statically inside source code.
   - All exercise descriptions are confirmed to be in markdown backtick format, allowing consistent rendering by the `<ReactMarkdown>` component inside `ProblemCard.tsx`.

4. **ProblemCard Layout Padding**:
   - The wrapper uses Tailwind's `px-8` and `py-6`.
   - Horizontal padding is `2rem` (32px), vertical padding is `1.5rem` (24px).
   - This provides the E2E test suite the exact padding sizes to verify via CSS pixel assertions.

5. **ExercisePage Toolbar Spacing & Padding**:
   - Buttons are separated by `gap-2.5` (10px).
   - The container has a padding of `20px` (`p-5`) relative to the screen edge.
   - No individual margins are applied to buttons; any clipping occurs due to the sidebar squeezing the remaining workspace width under `1100px`.

6. **editor-btn CSS Height Alignment**:
   - Base `.editor-btn` has `border: none`, while modifier classes (`--ghost`, `--secondary`, `--primary`) define a `border: 1px solid`.
   - Under `box-sizing: border-box`, any button using `.editor-btn` without a modifier class will be 2px shorter than modifier buttons.
   - To prevent height shifts, the base class should define `border: 1px solid transparent;` and modifiers should override only the border color.

7. **TypeScript & Vite Build**:
   - `package.json` build command compiles TS with `tsc` (type-checking only, as `noEmit` is enabled in `tsconfig.json`) and outputs the bundle with `vite build`. E2E scripts can execute `npm run build` to verify the build health.

---

## 3. Caveats
- Investigated only the React frontend code structures and Tauri configurations.
- Did not compile/run the Tauri desktop environment locally since the subagent operates in read-only investigation mode.
- Assumed standard Tauri v2 window behavior on macOS.

---

## 4. Conclusion
The current codebase properties are structured and ready for E2E test assertions:
- Pop-out window URL routing configurations reside in `src/main.tsx`, `src/App.tsx`, and `src/pages/ExercisePage.tsx` (spawner), with a migration to `HashRouter` planned.
- Backdrop blur configs reside in `src/pages/PopoutEditorPage.tsx` and `src-tauri/tauri.conf.json`.
- The 36 exercises are stored in `src/data/exercises.ts` and use markdown strings.
- Padding and height alignment configs are defined in `src/components/exercise/ProblemCard.tsx` (`px-8 py-6`) and `src/index.css` (`.editor-btn` height shift hazard).
- Build checking can be verified by running `npm run build`.

---

## 5. Verification Method

To independently verify these findings:
1. Run `npm run build` from the project root to ensure type safety and bundling compile successfully.
2. Inspect `src/data/exercises.ts` and verify that the number of exercise elements matches exactly 36:
   ```bash
   grep -c 'id: "' src/data/exercises.ts
   ```
   (Should return `36`).
3. Check the CSS classes of `ProblemCard.tsx` and ensure `px-8 py-6` remains in the outer div.
4. Verify that `.editor-btn` modifiers all specify `border: 1px solid` to prevent height shifts when modifier classes are present.
