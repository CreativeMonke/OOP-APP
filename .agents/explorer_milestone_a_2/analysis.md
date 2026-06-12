# Analysis Report: Pop-out Routing & Background Transparency (Milestone A - R1)

This report details the exact required modifications to resolve the blank pop-out window issue, enable window transparency with a liquid-glass style, and configure capabilities for the OOP Academy desktop application.

---

## 1. BrowserRouter to HashRouter Conversion

### Background
In a production Tauri environment, static frontend files are loaded via a custom protocol (e.g. `tauri://localhost` or `https://tauri.localhost`). Traditional route paths like `/popout` cannot be resolved automatically to `index.html` by Tauri's asset handler, resulting in a blank 404 screen. Converting the routing to `HashRouter` ensures that route resolution goes through `index.html` first (e.g., `index.html#/popout`), letting React Router handle routing internally.

### Recommended Modifications

#### A. File: `src/main.tsx`
Change the imports and app wrapper to use `HashRouter` instead of `BrowserRouter`.

**Before:**
```typescript
import { BrowserRouter } from "react-router-dom";
...
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
import { HashRouter } from "react-router-dom";
...
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>
);
```

#### B. File: `src/App.tsx`
No changes are required in `src/App.tsx`. React Router's `useLocation()` hook automatically abstracts hash routing, so `location.pathname` will still return `"/popout"` when loading `index.html#/popout?id=...`. Thus, the matching logic:
```typescript
const isPopout = location.pathname === "/popout";
```
remains perfectly valid.

---

## 2. Pop-out Window URL Construction

### Background
To support `HashRouter`, the pop-out window's initialization URL must point to `index.html` followed by the hash path instead of a clean path `/popout`.

### Recommended Modifications

#### File: `src/pages/ExercisePage.tsx`
Change the initialization URL path on line 118.

**Before:**
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

## 3. Window Transparency & Liquid-Glass Design

### Background
1. **CSS Background Override**: The `html`, `body`, and `#root` elements have a solid background color `var(--color-base)` (`#111113`). This blocks the transparent window background. Changing it to `transparent` allows transparency. The main window maintains its solid background because the root container in `src/App.tsx` is inline-styled with `style={{ background: "#111113" }}`.
2. **Monaco Editor Theme Conflict**: Setting the global theme `"oop-dark"` to transparent inside the pop-out window will affect the main window's Monaco Editor theme due to global theme redefinition. Defining a separate theme `"oop-dark-transparent"` resolves this conflict.
3. **Liquid-Glass Style**: Introduce slowly rotating animated colored circles underneath the blur glass effect inside `PopoutEditorPage.tsx`.

### Recommended Modifications

#### A. File: `src/index.css`
Override the global background to `transparent` and add keyframes/classes for the liquid animation.

**Before (lines 33-39):**
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--color-base);
```

**After (lines 33-39):**
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: transparent;
```

**Add to the end of `src/index.css`:**
```css
/* ── Liquid Glass Backdrops ── */
@keyframes liquid-spin {
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

.animate-liquid {
  animation: liquid-spin 25s linear infinite;
}
```

*(Optional Layout Shift Fix from R4)*: In `src/index.css` line 268, change `.editor-btn`'s `border: none;` to `border: 1px solid transparent;` to prevent layout jumps when adjacent buttons are hovered.

#### B. File: `src/lib/monacoTheme.ts`
Define two separate themes to prevent global style pollution.

**Before:**
```typescript
export const OOP_DARK_THEME = "oop-dark";

export function defineOopDarkTheme(monaco: typeof Monaco, isTransparent: boolean = false) {
  monaco.editor.defineTheme(OOP_DARK_THEME, {
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "", foreground: "c9d1d9", background: isTransparent ? "transparent" : "08080f" },
      ...
```

**After:**
```typescript
export const OOP_DARK_THEME = "oop-dark";
export const OOP_DARK_TRANSPARENT_THEME = "oop-dark-transparent";

export function defineOopDarkTheme(monaco: typeof Monaco, isTransparent: boolean = false) {
  const themeName = isTransparent ? OOP_DARK_TRANSPARENT_THEME : OOP_DARK_THEME;
  monaco.editor.defineTheme(themeName, {
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "", foreground: "c9d1d9", background: isTransparent ? "transparent" : "08080f" },
      ...
```

#### C. File: `src/components/exercise/CodeEditor.tsx`
Use the transparent theme for the pop-out window.

**Before:**
```typescript
import { OOP_DARK_THEME, defineOopDarkTheme } from "@/lib/monacoTheme";
...
        <div
          className="absolute inset-[1px] overflow-hidden"
          style={{ 
            borderRadius: isPoppedOut ? "0 0 16px 16px" : "11px", 
            background: isPoppedOut ? "transparent" : "#08080f" 
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="cpp"
            defaultValue={initialCode}
            theme={OOP_DARK_THEME}
```

**After:**
```typescript
import { OOP_DARK_THEME, OOP_DARK_TRANSPARENT_THEME, defineOopDarkTheme } from "@/lib/monacoTheme";
...
        <div
          className="absolute inset-[1px] overflow-hidden"
          style={{ 
            borderRadius: isPoppedOut ? "0 0 16px 16px" : "11px", 
            background: isPoppedOut ? "transparent" : "#08080f" 
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="cpp"
            defaultValue={initialCode}
            theme={isPoppedOut ? OOP_DARK_TRANSPARENT_THEME : OOP_DARK_THEME}
```

#### D. File: `src/pages/PopoutEditorPage.tsx`
Inject the liquid glass background element and update z-indexes.

**Before:**
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
      ...
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
      {/* Liquid Glass Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <div 
          className="absolute -inset-[50%] opacity-25 animate-liquid"
          style={{
            background: "radial-gradient(circle at 40% 40%, rgba(99, 102, 241, 0.35) 0%, transparent 50%), radial-gradient(circle at 70% 60%, rgba(139, 92, 246, 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 30%, rgba(103, 232, 249, 0.2) 0%, transparent 40%)",
          }}
        />
      </div>

      {/* Title bar — draggable */}
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0 relative z-10"
        data-tauri-drag-region
        style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
      ...
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

## 4. Capability and Configuration Verification

### A. Capabilities: `src-tauri/capabilities/default.json`
The capability configuration explicitly defines the window permissions:
```json
  "windows": ["main", "editor-popout"],
  "permissions": [
    "core:default",
    "core:window:default",
    "core:window:allow-create",
    "core:window:allow-set-focus",
    "core:window:allow-close",
    "core:webview:default",
    "core:webview:allow-create-webview-window",
    "core:event:default",
    "core:event:allow-emit",
    "core:event:allow-listen"
  ]
```
- `"windows": ["main", "editor-popout"]` enables all permissions listed in `default.json` for the pop-out window container.
- `core:window:allow-create` and `core:webview:allow-create-webview-window` correctly allow spawning the webview window from the main window frontend.
- `core:event:allow-emit` and `core:event:allow-listen` allow IPC communications (`run-code-from-popout`, `code-updated`, `compile-start`, `compile-end`) between the main window and the pop-out window.
- `core:window:allow-close` allows the pop-out window to self-close when the close button is clicked.

**No configurations in `default.json` block the window rendering.**

### B. Configuration: `src-tauri/tauri.conf.json`
- `"macOSPrivateApi": true` is enabled under `"app"`. This is required for advanced window vibrancy and transparency operations on macOS.
- Dynamic webview creation parameters (`transparent: true`, `decorations: false`) passed via the frontend `WebviewWindow` constructor are fully supported by the Tauri app setup.

**No configurations in `tauri.conf.json` block the window rendering.**
