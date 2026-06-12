# Handoff Report — Pop-out Routing & Background Transparency (Milestone A - R1)

## 1. Observation

Direct observations made on the codebase:

### A. BrowserRouter usage in `src/main.tsx` (lines 7-13)
```typescript
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### B. Pop-out window URL construction in `src/pages/ExercisePage.tsx` (lines 117-128)
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

### C. Background override in `src/index.css` (lines 33-39)
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--color-base);
```

### D. Main Window background wrapper in `src/App.tsx` (line 30)
```typescript
  return (
    <div className="flex flex-col h-full w-full" style={{ background: "#111113" }}>
```

### E. Monaco theme registry definition in `src/lib/monacoTheme.ts` (lines 3-10)
```typescript
export const OOP_DARK_THEME = "oop-dark";

export function defineOopDarkTheme(monaco: typeof Monaco, isTransparent: boolean = false) {
  monaco.editor.defineTheme(OOP_DARK_THEME, {
    base: "vs-dark",
    inherit: false,
    rules: [
      { token: "", foreground: "c9d1d9", background: isTransparent ? "transparent" : "08080f" },
```

### F. Pop-out Editor styling in `src/pages/PopoutEditorPage.tsx` (lines 68-76)
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
```

### G. Tauri capabilities configuration in `src-tauri/capabilities/default.json` (lines 5-17)
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

### H. Tauri Private APIs in `src-tauri/tauri.conf.json` (line 13)
```json
    "macOSPrivateApi": true,
```

---

## 2. Logic Chain

1. **Routing and Pop-out Blank Issue**:
   - In production builds, Tauri serves local files directly via `tauri://localhost` or `https://tauri.localhost`.
   - Because Tauri's custom asset handler does not rewrite paths like `/popout` to `index.html` (SPA fallback), loading `/popout` directly yields a blank page or 404.
   - Using `HashRouter` instead of `BrowserRouter` resolves this since route resolution goes through `index.html` first (e.g. `index.html#/popout`).
   - Hence, `src/main.tsx` must wrap the app in `<HashRouter>` and the URL constructed in `src/pages/ExercisePage.tsx` must point to `index.html#/popout?id=${exercise.id}`.

2. **Background Transparency**:
   - Setting `transparent: true` on `WebviewWindow` makes the OS window frame support transparency, but the HTML page elements must also be transparent.
   - `src/index.css` sets `background: var(--color-base)` (`#111113`) on `html`, `body`, and `#root`, overriding any transparency.
   - Overriding the CSS background to `transparent` on these elements enables transparent rendering.
   - The main window remains opaque because its root container in `src/App.tsx` has an inline style of `background: "#111113"`.
   - To make the pop-out editor transparent without affecting the main window editor, a separate Monaco theme `"oop-dark-transparent"` is required. Otherwise, since Monaco themes are globally registered under a single label `"oop-dark"`, either window mounting will overwrite the theme for both editors (causing a race condition).

3. **Liquid-Glass Style**:
   - The glassmorphism container styling is set via `backdropFilter` and a semi-transparent `background: rgba(17, 17, 19, 0.75)` in `PopoutEditorPage.tsx`.
   - Adding a slowly rotating, absolute-positioned gradient element behind the editor (z-index 0) and setting children containers to `relative z-10` produces a premium, animated "liquid-glass" background.

4. **Capabilities and Configurations Verification**:
   - In `default.json`, `editor-popout` is listed in the `windows` field and possesses all window creation, event emit/listen, and self-closing permissions.
   - In `tauri.conf.json`, `"macOSPrivateApi": true` is enabled, which is necessary for window vibrancy/transparency.
   - Thus, there are no capabilities or configurations blocking correct rendering.

---

## 3. Caveats

- **OS Specific Vibrancy**: Window transparency/vibrancy behaves slightly differently on Windows and macOS. While `"macOSPrivateApi": true` is enabled, on Windows, transparency might require additional native styles or settings depending on the target OS version.

---

## 4. Conclusion

The pop-out routing and background transparency bugs can be resolved cleanly without breaking changes:
1. **Convert to HashRouter**: Change `BrowserRouter` to `HashRouter` in `src/main.tsx`.
2. **Update WebviewWindow URL**: Update the url option in `ExercisePage.tsx` to `index.html#/popout?id=${exercise.id}`.
3. **Fix CSS Backgrounds**: Change `html, body, #root` background to `transparent` in `src/index.css`.
4. **Prevent Monaco Theme Conflict**: Define a separate theme `"oop-dark-transparent"` in `src/lib/monacoTheme.ts` and apply it to `<Editor>` when `isPoppedOut` is true.
5. **Implement Liquid-Glass**: Add an absolute-positioned rotating gradient blob inside `PopoutEditorPage.tsx` and the corresponding keyframe animation in `src/index.css`.
6. **Configurations**: Verify that no capabilities block window rendering.

---

## 5. Verification Method

To verify these recommendations:
1. Apply the recommended modifications to `src/main.tsx`, `src/pages/ExercisePage.tsx`, `src/index.css`, `src/lib/monacoTheme.ts`, `src/components/exercise/CodeEditor.tsx`, and `src/pages/PopoutEditorPage.tsx`.
2. Run `npm run build` and ensure Vite compiles without errors (TypeScript validation).
3. Run `npm run tauri:dev` to launch the application.
4. Click the "Pop Out" button on an exercise and verify that:
   - The pop-out window loads the editor correctly (no blank screen).
   - The pop-out window background is semi-transparent with a rotating gradient liquid effect and blur.
   - The main window editor retains its solid `#08080f` background and does not become transparent.
