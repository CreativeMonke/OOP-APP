# Handoff Report — OOP Academy Tauri Desktop App Analysis

## 1. Observation

Direct observations made on the code files inside the workspace:

### R1: Pop-out window blank issue
- **File**: `src/pages/ExercisePage.tsx` (lines 117-128)
  ```typescript
  const popout = new WebviewWindow("editor-popout", {
    url: `/popout?id=${exercise.id}`,
    title: `${exercise.title} — Editor`,
    width: 820,
    height: 620,
    center: true,
    decorations: false,
    transparent: true,
    shadow: false,
    skipTaskbar: false,
    alwaysOnTop: false,
  });
  ```
- **File**: `src/App.tsx` (lines 20-25)
  ```typescript
  // The popout window renders a completely bare page — no shell, no sidebar
  const isPopout = location.pathname === "/popout";

  if (isPopout) {
    return <PopoutEditorPage />;
  }
  ```
- **File**: `src/main.tsx` (lines 7-13)
  ```typescript
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </React.StrictMode>
  );
  ```
- **File**: `src/index.css` (lines 33-39)
  ```css
  html,
  body,
  #root {
    height: 100%;
    width: 100%;
    overflow: hidden;
    background: var(--color-base);
  ```

### R2: ProblemCard padding and plain-text descriptions
- **File**: `src/components/exercise/ProblemCard.tsx` (line 35)
  ```typescript
  return (
    <div className="flex flex-col gap-4 px-8 py-6">
  ```
- **File**: `src/data/exercises.ts` contains 36 exercises, but from `03-buffer` (line 534) onwards, their `description` fields are plain-text one-liners:
  - `03-buffer` (line 534): `"Implement a Buffer<T> (or Buffer for bytes) with Rule of Five. Constructor allocates n elements. Copy constructor deep copies. Move constructor steals the pointer..."`
  - `04-vector2d` (line 603): `"Create a Vector2D class with double x and y. Overload: binary +, unary - (negate), scalar * (both v*k and k*v as friend)..."`
  - `04-intstack` (line 668): `"Build an IntStack with operator+=(int) to push, operator[](int) for index access (0 = bottom), prefix ++ pops..."`

### R3: Run & Test button clipping
- **File**: `src/pages/ExercisePage.tsx` (lines 175-178)
  ```typescript
  {/* Editor + results */}
  <div className="flex-1 flex flex-col overflow-hidden p-5 gap-4">
    {/* Toolbar */}
    <div className="flex items-center justify-between shrink-0">
  ```

### R4: CSS class system editor-btn
- **File**: `src/index.css` (lines 262-268)
  ```css
  .editor-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 7px 14px;
    border-radius: 8px;
    border: none;
  ```
- modifiers (lines 280-337) like `.editor-btn--ghost`, `.editor-btn--secondary`, `.editor-btn--primary` specify `border: 1px solid ...`.

### Overall project build & test commands
- **File**: `package.json` (lines 6-13)
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

---

## 2. Logic Chain

### R1: Pop-out window blank issue
1. In a production build, Tauri loads static files directly via a custom protocol handler (e.g. `tauri://localhost` or `https://tauri.localhost`). It maps paths to physical files inside the `dist` directory.
2. Unlike a traditional web server or the Vite development server (which handles SPA route redirection), Tauri's asset protocol does not rewrite `/popout` to `/index.html`. Thus, loading `/popout?id=...` directly fails with a 404 / blank screen.
3. Using `HashRouter` instead of `BrowserRouter` resolves this since the entry point is always `index.html`, and React Router parses the hash path (e.g. `index.html#/popout?id=...`).
4. Additionally, since the `html, body, #root` element in `src/index.css` has `background: var(--color-base)` (solid `#111113`), the background remains opaque black/grey even when `transparent: true` is set on the window. Overriding `html` and `body` to `background: transparent` (while preserving `#111113` background inside `App.tsx`'s root wrapper) allows transparency in the pop-out window.

### R2: ProblemCard padding & plain-text descriptions
1. `ProblemCard.tsx` uses the Tailwind padding class `px-8` which translates to 32px of horizontal padding. If the text touches the sidebar boundary, it may be due to how Tailwind class loading or the enclosing flex container behaves. Adding inline styles or verifying specific margins ensures at least 20px of padding is guaranteed.
2. 27 out of 36 exercises in `src/data/exercises.ts` (starting from `03-buffer` in Category 3 to the end of the list) are currently plain-text one-liners. They must be reformatted to structured Markdown using headings (`###`), bullet points, inline code formatting (`` `code` ``), and lists so they render cleanly in `react-markdown`.

### R3: Run & Test button clipping
1. At the minimum window width (1100px), with the sidebar open (220px), the content area is 880px wide.
2. The toolbar has `justify-between`, pushing the button group to the right-most edge of the editor container. If the outer window has rounded corners (e.g. 12px), any elements at the extreme right padding boundary (20px from screen edge) can clip against the window borders.
3. Adding right padding/margin specifically to the button group or increasing the parent container's right padding ensures they never clip against the window boundary.

### R4: CSS class system editor-btn
1. The base class `.editor-btn` has `border: none;` (representing a border height of 0px).
2. The modifiers `.editor-btn--ghost` (on hover), `.editor-btn--secondary`, and `.editor-btn--primary` all specify `border: 1px solid ...` (which adds 2px of total vertical height).
3. This discrepancy causes visual layout jumps and vertical misalignment (layout shift) between adjacent buttons in the toolbar. Setting `border: 1px solid transparent` on `.editor-btn` resolves this by keeping the box model size identical across all states.

---

## 3. Caveats

- **No runtime verification**: No compilation or execution of Tauri development builds was performed due to read-only constraints. The behavior of custom protocols and transparency has been inferred from standard Tauri v2 and React Router behaviors.
- **Window border rendering**: The exact visual clipping coordinates on the right edge may vary slightly depending on whether custom titlebars or operating system-specific window decorations are enabled.

---

## 4. Conclusion

The visual bugs and routing issues in the OOP Academy Tauri app can be solved with targeted, non-breaking modifications to the routing mode, CSS box models, and metadata formatting:
- **R1**: Convert from `BrowserRouter` to `HashRouter` and load the pop-out window using `index.html#/popout`. Set `html`/`body` CSS backgrounds to `transparent`. Use an absolute-positioned rotating gradient div inside `PopoutEditorPage.tsx` for the liquid-glass gradient effect.
- **R2**: Reformat 27 plain-text exercise descriptions in `src/data/exercises.ts` to markdown. Verify left padding in `ProblemCard.tsx` remains set.
- **R3**: Add padding/margin to the right of the button bar in `ExercisePage.tsx` to prevent clipping at small widths.
- **R4**: Normalize the border box sizing in `src/index.css` by changing `.editor-btn`'s border from `none` to `1px solid transparent`.

---

## 5. Verification Method

To verify these fixes after they are implemented:

1. **Verify routing and build safety**:
   ```bash
   # Type check the TypeScript codebase
   npx tsc --noEmit
   # Build the Vite frontend application
   npm run build
   ```
2. **Launch the development environment**:
   ```bash
   # Run the application in Tauri developer mode
   npm run tauri:dev
   ```
3. **Verify the pop-out editor**:
   - Click the "Pop Out" button on an exercise.
   - Confirm the new window loads correctly (no blank screen), renders the Monaco editor, has a translucent liquid-glass background, and can be dragged/closed independently.
4. **Verify layout and alignment**:
   - Check that buttons do not jump in height when hovered.
   - Resize the app to 1100px width and check that the "Run & Test" button does not clip.
