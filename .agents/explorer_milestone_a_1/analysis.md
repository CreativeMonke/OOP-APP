# Analysis Report: Pop-out Routing & Background Transparency (Milestone A - R1)

This analysis outlines the recommended code modifications to solve the blank window routing bug and implement the liquid-glass styled transparent background for the editor pop-out window.

---

## 1. Routing Conversion (BrowserRouter to HashRouter)

In production builds, Tauri loads static files directly via a custom protocol handler (e.g. `tauri://localhost` or `https://tauri.localhost`), mapping URL paths directly to physical files on the filesystem. Since the asset protocol cannot dynamically rewrite virtual paths like `/popout` to `index.html` (like an SPA web server would), direct navigation to `/popout?id=...` results in a blank 404 screen.

Converting to `HashRouter` solves this. The entry point remains `index.html` and routing is handled on the client-side via the hash fragment (e.g. `index.html#/popout?id=...`).

### Recommended Modifications:

#### File: `src/main.tsx`
Replace the `BrowserRouter` import and wrapper with `HashRouter`.

**Before**:
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

**After**:
```typescript
import React from "react";
import ReactDOM from "react-dom/client";
import { HashRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

#### File: `src/App.tsx`
No modifications are required in `src/App.tsx` for HashRouter itself, as React Router's `HashRouter` maps the hash-based subpath (excluding the `#` symbol) directly to `location.pathname` inside the React context. Therefore, the existing condition `const isPopout = location.pathname === "/popout";` at line 21 will resolve correctly to `true` when loading `index.html#/popout`.

---

## 2. Pop-out Window URL Construction

In `src/pages/ExercisePage.tsx`, the `WebviewWindow` must load the new route via the hash path: `index.html#/popout?id=${exercise.id}` instead of the virtual path `/popout?id=${exercise.id}`.

### Recommended Modifications:

#### File: `src/pages/ExercisePage.tsx`
Modify lines 117-128 to update the `url` property passed to the `WebviewWindow` constructor.

**Before**:
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

**After**:
```typescript
    const popout = new WebviewWindow("editor-popout", {
      url: `index.html#/popout?id=${exercise.id}`,
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

---

## 3. Background Transparency & Liquid-Glass Styling

For transparency to render correctly, the webview frame itself must have a transparent background. Currently, `src/index.css` forces `html`, `body`, and `#root` to have a solid background (`var(--color-base)` which resolves to `#111113`). Overriding these to `transparent` allows the operating system window transparency to function.
To keep the main window opaque, the root layout container in `src/App.tsx` is already configured with an inline style `style={{ background: "#111113" }}`, which remains fully opaque.

The liquid-glass effect on `PopoutEditorPage` is achieved by:
1. Configuring a semi-transparent container background using `rgba` colors, coupled with a CSS backdrop filter (`blur` + `saturate`).
2. Placing an absolute-positioned rotating colorful radial gradient div behind the content.

### Recommended Modifications:

#### File: `src/index.css`
1. Split the background color rule of `html, body, #root` to allow `background: transparent;` globally.
2. Append keyframe animations and styling for the liquid-glass background effect.

**Before (lines 33-46)**:
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--color-base);
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**After (lines 33-46)**:
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: transparent;
  color: rgba(255, 255, 255, 0.9);
  font-family: var(--font-sans);
  font-size: 13px;
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

**Add to bottom of file (`src/index.css`)**:
```css
/* ── Liquid Glass background for popout ── */
@keyframes liquid-glass-rotate {
  0% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(180deg) scale(1.15);
  }
  100% {
    transform: rotate(360deg) scale(1);
  }
}

.liquid-glass-bg {
  position: absolute;
  inset: -50%;
  background: radial-gradient(circle at 20% 35%, rgba(99, 102, 241, 0.15) 0%, transparent 45%),
              radial-gradient(circle at 75% 65%, rgba(103, 232, 249, 0.12) 0%, transparent 45%),
              radial-gradient(circle at 50% 80%, rgba(196, 181, 253, 0.1) 0%, transparent 40%),
              radial-gradient(circle at 80% 20%, rgba(139, 92, 246, 0.08) 0%, transparent 35%);
  filter: blur(60px);
  animation: liquid-glass-rotate 25s linear infinite;
  pointer-events: none;
  z-index: 0;
}
```

#### File: `src/pages/PopoutEditorPage.tsx`
Modify the return statement of `PopoutEditorPage` to structure a relative parent container with a lower `z-index` liquid-glass background, ensuring the title bar and editor render in a higher `z-index` context.

**Before (lines 67-140)**:
```typescript
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden"
      style={{
        background: "rgba(17, 17, 19, 0.75)",
        backdropFilter: "blur(60px) saturate(1.8)",
        WebkitBackdropFilter: "blur(60px) saturate(1.8)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Title bar — draggable */}
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0"
        data-tauri-drag-region
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3" data-tauri-drag-region>
          {/* macOS traffic lights */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition"
            />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <h1
            className="text-xs font-medium text-slate-400 select-none ml-2"
            data-tauri-drag-region
          >
            {exercise.title} — Editor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="editor-btn editor-btn--ghost text-[11px]"
          >
            <RotateCcw size={12} />
            Reset
          </motion.button>
          <motion.button
            onClick={handleRun}
            disabled={isRunning}
            whileHover={isRunning ? {} : { scale: 1.04 }}
            whileTap={isRunning ? {} : { scale: 0.95 }}
            className={`editor-btn editor-btn--primary text-[11px] ${isRunning ? "is-running" : ""}`}
          >
            <Play
              size={12}
              fill={isRunning ? "none" : "currentColor"}
            />
            {isRunning ? "Running…" : "Run in Main"}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <CodeEditor
          key={`popout-${exercise.id}`}
          ref={editorRef}
          initialCode={exercise.starterCode}
          isCompiling={isRunning}
          isPoppedOut={true}
        />
      </div>
    </div>
  );
```

**After (lines 67-140)**:
```typescript
  return (
    <div
      className="flex flex-col h-screen w-screen overflow-hidden relative"
      style={{
        background: "rgba(17, 17, 19, 0.65)",
        backdropFilter: "blur(40px) saturate(1.8)",
        WebkitBackdropFilter: "blur(40px) saturate(1.8)",
        borderRadius: "12px",
        border: "1px solid rgba(255,255,255,0.08)",
      }}
    >
      {/* Liquid-glass rotating gradient background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div className="liquid-glass-bg" />
      </div>

      {/* Title bar — draggable */}
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0 relative z-10"
        data-tauri-drag-region
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3" data-tauri-drag-region>
          {/* macOS traffic lights */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleClose}
              className="w-3 h-3 rounded-full bg-[#ff5f57] hover:brightness-90 transition"
            />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <h1
            className="text-xs font-medium text-slate-400 select-none ml-2"
            data-tauri-drag-region
          >
            {exercise.title} — Editor
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="editor-btn editor-btn--ghost text-[11px]"
          >
            <RotateCcw size={12} />
            Reset
          </motion.button>
          <motion.button
            onClick={handleRun}
            disabled={isRunning}
            whileHover={isRunning ? {} : { scale: 1.04 }}
            whileTap={isRunning ? {} : { scale: 0.95 }}
            className={`editor-btn editor-btn--primary text-[11px] ${isRunning ? "is-running" : ""}`}
          >
            <Play
              size={12}
              fill={isRunning ? "none" : "currentColor"}
            />
            {isRunning ? "Running…" : "Run in Main"}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <CodeEditor
          key={`popout-${exercise.id}`}
          ref={editorRef}
          initialCode={exercise.starterCode}
          isCompiling={isRunning}
          isPoppedOut={true}
        />
      </div>
    </div>
  );
```

---

## 4. Tauri Capabilities & Configurations Verification

A detailed check of the Tauri v2 configurations and capabilities shows:
1. **`src-tauri/capabilities/default.json`**:
   - The pop-out window label `"editor-popout"` is explicitly listed in `"windows": ["main", "editor-popout"]`.
   - The required permissions for window creation (`"core:webview:allow-create-webview-window"`, `"core:window:allow-create"`), focus setting (`"core:window:allow-set-focus"`), window closing (`"core:window:allow-close"`), and IPC events (`"core:event:allow-emit"`, `"core:event:allow-listen"`) are all enabled.
   - Since the pop-out window does not call custom Rust commands directly, it does not require command-specific permissions. All execution is handled asynchronously via frontend-to-frontend IPC events processed in the main window.
2. **`src-tauri/tauri.conf.json`**:
   - Configures the main window. Dynamically created windows inherit default security constraints. No configurations present inside `tauri.conf.json` block transparency or window creation.

**Conclusion**: The Tauri v2 capability configuration is fully sufficient and correct; no changes are required in the `src-tauri/` directory.
