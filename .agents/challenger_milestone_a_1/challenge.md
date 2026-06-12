# Milestone A: R1 Verification & Challenge Report

## Challenge Summary

- **Overall Risk Assessment**: LOW
- **Verdict**: PASS

All specific requirements for Milestone A: R1 (Pop-out Routing & Background Transparency) have been verified and are implemented correctly. Both typescript checking and the production build are completely clean.

---

## Verified Requirements

### 1. HashRouter Setup
- **File**: `src/main.tsx`
- **Details**:
  - `HashRouter` is imported from `react-router-dom` (line 3).
  - Inside the root render call, `<HashRouter>` successfully wraps `<App />` (lines 9-11).
- **Observation**:
  ```tsx
  9:     <HashRouter>
  10:       <App />
  11:     </HashRouter>
  ```

### 2. Pop-out URL Setup & Event Emission
- **File**: `src/pages/ExercisePage.tsx`
- **Details**:
  - Pop-out window url is instantiated as `index.html#/popout?id=${exercise.id}` (line 121), which is correct for `HashRouter` routing in Tauri.
  - Compilation events are correctly emitted inside `doRun` (lines 38 and 41).
- **Observations**:
  - Pop-out window initialization url:
    ```typescript
    120:     const popout = new WebviewWindow("editor-popout", {
    121:       url: `index.html#/popout?id=${exercise.id}`,
    ```
  - Event emission in `doRun`:
    ```typescript
    37:     const { emit } = await import("@tauri-apps/api/event");
    38:     await emit("compile-start");
    ...
    41:     await emit("compile-end");
    ```

### 3. Background Transparency & Liquid-Glass Elements
- **Files**: `src/index.css` and `src/pages/PopoutEditorPage.tsx`
- **Details**:
  - `src/index.css` configures a transparent background for html, body, and root elements (line 39), which allows Tauri's window transparency to show behind the app.
  - `src/index.css` defines `.liquid-glass-bg` styling utilizing rotating multi-layered radial gradients with a 60px blur filter and a slow animation (lines 389-400).
  - `src/pages/PopoutEditorPage.tsx` implements a transparent glass container utilizing a semi-transparent base color (`rgba(17, 17, 19, 0.75)`), strong saturation/blur backdrop filters, a 12px border radius, and the `.liquid-glass-bg` class (lines 70-81).
- **Observations**:
  - CSS Body Background:
    ```css
    39:   background: transparent;
    ```
  - Pop-out Editor Styling:
    ```typescript
    70:       style={{
    71:         background: "rgba(17, 17, 19, 0.75)",
    72:         backdropFilter: "blur(60px) saturate(1.8)",
    73:         WebkitBackdropFilter: "blur(60px) saturate(1.8)",
    74:         borderRadius: "12px",
    75:         border: "1px solid rgba(255,255,255,0.08)",
    76:       }}
    ```
  - Liquid Glass Background Container:
    ```html
    79:       <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
    80:         <div className="liquid-glass-bg" />
    81:       </div>
    ```

### 4. Code Compilation & Build Verification
- **Typescript Check**: Run command `npx tsc --noEmit` executed with zero errors.
- **Production Build**: Run command `npm run build` executed and completed successfully, outputting compiled assets in the `dist` directory.

---

## Adversarial Review

### [Low] Challenge 1: Tauri IPC Event Race Condition / Window Lifecycle Leak
- **Assumption challenged**: Pop-out window will be closed clean before/after another page load, and events will not leak.
- **Attack scenario**: If the user has a popout editor open and navigates away or switches active exercises in the main window, multiple event listeners for `"compile-start"`, `"compile-end"`, `"code-updated"`, or `"run-code-from-popout"` could theoretically fire or persist across different exercises.
- **Blast radius**: Low. Pop-out editor tracks search params id (`exerciseId = searchParams.get("id")`), and `ExercisePage`'s `useEffect` for IPC listener has `[exercise?.id]` in its dependency array, cleaning up listeners. However, if the user leaves the window open, it could lead to multiple active webviews in background.
- **Mitigation**: A close-prevention hook or a manual sync could force-close the popout window if the exercise page in the main window is unmounted/destructed.

---

## Stress Test Results

- **Command**: `npx tsc --noEmit` -> Zero compilation warnings -> **PASS**
- **Command**: `npm run build` -> Clean bundle generation, assets mapped -> **PASS**

---

## Unchallenged Areas

- Tauri native config (`src-tauri/tauri.conf.json`) — Checked only source frontend files per review scope; did not inspect native rust configurations or compilation settings.

---

## Final Verdict
**PASS**
