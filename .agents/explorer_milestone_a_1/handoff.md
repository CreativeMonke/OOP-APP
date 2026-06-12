# Handoff Report — Pop-out Routing & Background Transparency (Milestone A - R1)

## 1. Observation

Direct observations made on files inside the workspace:

### Routing Configuration in `src/main.tsx` (lines 7-13)
```typescript
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
```

### Route Check in `src/App.tsx` (lines 20-30)
```typescript
  // The popout window renders a completely bare page — no shell, no sidebar
  const isPopout = location.pathname === "/popout";

  if (isPopout) {
    return <PopoutEditorPage />;
  }

  const showTopBar = location.pathname !== "/";

  return (
    <div className="flex flex-col h-full w-full" style={{ background: "#111113" }}>
```

### Pop-out window URL construction in `src/pages/ExercisePage.tsx` (lines 117-128)
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

### HTML/Body background in `src/index.css` (lines 33-39)
```css
html,
body,
#root {
  height: 100%;
  width: 100%;
  overflow: hidden;
  background: var(--color-base);
```

### Pop-out editor styling in `src/pages/PopoutEditorPage.tsx` (lines 67-77)
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

### Tauri capabilities in `src-tauri/capabilities/default.json` (lines 5-17)
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

---

## 2. Logic Chain

1. **Routing Blank Window Issue**:
   - In production builds, Tauri serves static assets locally and maps URL paths to files directly. Without a server-side rewrite mechanism, loading `/popout` directly fails with a 404 (blank screen).
   - Using `HashRouter` instead of `BrowserRouter` in `src/main.tsx` ensures that routing resolves client-side via hash anchors (e.g. `index.html#/popout`), preventing 404s.
   - When using `HashRouter`, the pop-out window URL must be constructed using `index.html#/popout?id=${exercise.id}` inside `src/pages/ExercisePage.tsx` to launch the correct path.
   - React Router maps the hash subpath (minus `#`) to `location.pathname`, which means the existing routing check `location.pathname === "/popout"` in `src/App.tsx` and parameter parsing `searchParams.get("id")` in `src/pages/PopoutEditorPage.tsx` continue to work without changes.

2. **Window Transparency & Liquid Glass**:
   - Setting `transparent: true` on `WebviewWindow` in `src/pages/ExercisePage.tsx` makes the OS window border transparent, but the webview content remains opaque because `html, body, #root` has `background: var(--color-base)` (solid `#111113`) in `src/index.css`.
   - Changing `html, body, #root`'s background to `transparent` globally resolves this. The main window maintains its solid background because its outermost container in `src/App.tsx` explicitly sets `style={{ background: "#111113" }}`.
   - To build the liquid-glass style, the container in `src/pages/PopoutEditorPage.tsx` requires a semi-transparent `rgba` background, a backdrop blur, and a rotating gradient background.
   - Adding a custom `@keyframes liquid-glass-rotate` and class `.liquid-glass-bg` to `src/index.css` and inserting this background container inside `PopoutEditorPage.tsx` behind the code editor elements completes the liquid-glass visual style.

3. **Capabilities Verification**:
   - The capability file `src-tauri/capabilities/default.json` lists `"editor-popout"` as an allowed window and configures all required window management and event emission permissions. No adjustments in `src-tauri/` configurations are required.

---

## 3. Caveats

- **No runtime verification**: The analysis was completed in a read-only environment. No compilation or live testing was executed.
- **Platform differences**: The visual rendering of transparency and backdrop-filter is subject to the operating system's support for alpha blending and composition in the webview window framework (e.g., Tauri v2 WebKit/WebView2).

---

## 4. Conclusion

The visual blank window bug and transparency requirements can be resolved with localized frontend routing and styling adjustments:
- Convert to `HashRouter` in `src/main.tsx`.
- Update the spawned URL to `index.html#/popout?id=${exercise.id}` in `src/pages/ExercisePage.tsx`.
- Set the global background to `transparent` for `html, body, #root` in `src/index.css`.
- Add keyframes and a `.liquid-glass-bg` element under `PopoutEditorPage.tsx` to implement the liquid-glass effect.
- Tauri config and capabilities files are correct and do not block the window.

---

## 5. Verification Method

To verify these fixes after they are implemented by the implementer agent:

1. **Verify build safety**:
   ```bash
   npx tsc --noEmit
   npm run build
   ```
2. **Verify application behaviour**:
   - Run the application in Tauri dev mode: `npm run tauri:dev`
   - Open an exercise and click "Pop Out".
   - Confirm that the popout window loads the editor correctly (no longer blank).
   - Verify the background has a smooth, rotating translucent gradient with a glass blur effect.
   - Confirm you can run the code from the popout window and see tests compiling in the main window.
