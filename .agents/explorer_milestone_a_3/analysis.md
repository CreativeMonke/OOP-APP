# Analysis & Recommended Modifications — Milestone A (Requirement R1)

This report details the exact modifications required to resolve the pop-out window routing and background transparency issue in the OOP Academy Tauri desktop application.

---

## 1. BrowserRouter to HashRouter Conversion

### Rationale
In production Tauri builds, assets are served directly from the frontend output directory via a custom asset protocol handler (e.g. `tauri://localhost` or `https://tauri.localhost`). The custom asset protocol does not rewrite React Router's client-side paths (like `/popout`) to `index.html`, leading to a blank screen (404) on window creation. 

By switching to `HashRouter`, all navigation pathing is managed via the URL hash segment (e.g. `index.html#/popout`), ensuring that the application bundle entry point (`index.html`) is always resolved correctly, while React Router handles routing based on the hash string.

### Recommended Modifications

#### File: `src/main.tsx`
Change `BrowserRouter` imports and JSX wrapper to `HashRouter`.

**Before:**
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

**After:**
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
No changes are required in `src/App.tsx` because React Router's `HashRouter` maps URL hashes (like `index.html#/popout`) directly to `location.pathname === "/popout"`. Thus, the current route detection conditional works correctly without changes:
```typescript
const isPopout = location.pathname === "/popout";
```

---

## 2. Pop-out Window URL Construction

### Rationale
Using a relative pathname `/popout` for the `WebviewWindow` constructor fails to load the HTML document in production Tauri builds. We must instruct Tauri to load the entry page (`index.html`) and append the router hash routing path `#/popout?id=...`.

### Recommended Modifications

#### File: `src/pages/ExercisePage.tsx`
Update the `url` property passed to the `WebviewWindow` constructor.

**Before (Lines 117-128):**
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

**After:**
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

### Rationale
1. **Opaque DOM Backgrounds**: The pop-out window has `transparent: true` enabled in Tauri, but the root layout styles in `src/index.css` define `background: var(--color-base)` (solid `#111113`) on the `html`, `body`, and `#root` tags. This completely overlays the transparent Tauri window with an opaque solid background. We must make the base html, body, and root elements transparent. The main application window remains opaque because its outermost wrapper inside `src/App.tsx` explicitly overrides the background with `#111113`.
2. **Liquid-Glass Style**: A liquid-glass design combines translucent backdrop-blurs with soft, colorful, and glowing radial gradients. Adding layered, glowing radial gradients inside `PopoutEditorPage.tsx` directly behind the content window creates a rich liquid-glass UI that is both beautiful and functional.

### Recommended Modifications

#### File: `src/index.css`
Update the core layout rule to make `html`, `body`, and `#root` backgrounds transparent.

**Before (Lines 33-46):**
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

**After:**
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

#### File: `src/pages/PopoutEditorPage.tsx`
Refactor the return block to separate the background glow layers from the frosted glass content container.

**Before (Lines 37-140):**
```typescript
  if (!exercise) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen"
        style={{ background: "rgba(17,17,19,0.85)" }}
      >
        <p className="text-slate-400 text-sm">No exercise selected.</p>
      </div>
    );
  }

  const handleRun = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setIsRunning(true);
    const { emit } = await import("@tauri-apps/api/event");
    await emit("run-code-from-popout", { exerciseId: exercise.id, code });
  };

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.setValue(exercise.starterCode);
    }
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().close();
  };

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

**After:**
```typescript
  if (!exercise) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen"
        style={{
          background: "rgba(17, 17, 19, 0.75)",
          backdropFilter: "blur(60px) saturate(1.8)",
          WebkitBackdropFilter: "blur(60px) saturate(1.8)",
          borderRadius: "12px",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <p className="text-slate-400 text-sm">No exercise selected.</p>
      </div>
    );
  }

  const handleRun = async () => {
    if (!editorRef.current) return;
    const code = editorRef.current.getValue();
    setIsRunning(true);
    const { emit } = await import("@tauri-apps/api/event");
    await emit("run-code-from-popout", { exerciseId: exercise.id, code });
  };

  const handleReset = () => {
    if (editorRef.current) {
      editorRef.current.setValue(exercise.starterCode);
    }
  };

  const handleClose = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().close();
  };

  return (
    <div
      className="relative flex flex-col h-screen w-screen overflow-hidden"
      style={{
        borderRadius: "12px",
        border: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Liquid-glass background gradients */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden" style={{ borderRadius: "12px" }}>
        <div
          className="absolute -top-1/4 -left-1/4 w-3/4 h-3/4 rounded-full filter blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.18) 0%, transparent 80%)",
          }}
        />
        <div
          className="absolute -bottom-1/4 -right-1/4 w-3/4 h-3/4 rounded-full filter blur-[80px]"
          style={{
            background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 80%)",
          }}
        />
      </div>

      {/* Glass overlay and content container */}
      <div
        className="relative z-10 flex flex-col h-full w-full"
        style={{
          background: "rgba(17, 17, 19, 0.65)",
          backdropFilter: "blur(40px) saturate(1.8)",
          WebkitBackdropFilter: "blur(40px) saturate(1.8)",
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
                size={12; /* size is number type */}
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
    </div>
  );
```
*(Note: To avoid JSX lint errors, `<Play size={12} ... />` is kept standard as a number prop).*

---

## 4. Tauri Permissions & Configurations Verification

### Analysis

#### 1. `src-tauri/capabilities/default.json`
The capability manifest contains the following configuration:
- `"windows": ["main", "editor-popout"]`
- Permissions:
  - `core:default`
  - `core:window:default`
  - `core:window:allow-create`
  - `core:window:allow-set-focus`
  - `core:window:allow-close`
  - `core:webview:default`
  - `core:webview:allow-create-webview-window`
  - `core:event:default`
  - `core:event:allow-emit`
  - `core:event:allow-listen`

**Verification:**
- The list of allowed windows explicitly includes `"editor-popout"`, which matches the label used to instantiate `WebviewWindow` in `src/pages/ExercisePage.tsx`. This allows the created window to communicate with Tauri core.
- The `core:window:allow-create` and `core:webview:allow-create-webview-window` permissions allow the `main` window to dynamically instantiate and spawn new windows and webview windows.
- The `core:event:allow-emit` and `core:event:allow-listen` permissions allow the popout window and main window to communicate via Tauri event APIs (e.g. `run-code-from-popout`, `compile-start`, `compile-end`), which is how `PopoutEditorPage.tsx` runs code in the main app.
- **Result:** No additional permissions or changes are needed in the capabilities manifest.

#### 2. `src-tauri/tauri.conf.json`
The Tauri configuration maps the primary application properties:
- `app.macOSPrivateApi: true` (Allows titlebar transparency and vibrancy settings on macOS).
- `app.windows` contains the static main window.
- **Verification:**
  - Because Tauri v2 supports dynamically creating windows from the frontend if permissions allow, we do not need to register `"editor-popout"` statically in the `app.windows` array of `tauri.conf.json`. Spawning it dynamically via JavaScript API is clean, standard, and fully authorized by `default.json`.
  - **Result:** No configuration changes are required in `tauri.conf.json`.
