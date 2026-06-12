# Review Report — Milestone A: R1 Review

**Verdict**: FAIL (REQUEST_CHANGES)

---

## 1. Quality Review Summary

### Verdict Details
While the routing updates, global transparent styles, and liquid-glass elements are correctly set up and the codebase builds successfully, there is a **Critical functional bug** that prevents approval. Specifically, running code from the pop-out window causes it to enter an infinite "Running..." state because the necessary IPC events are never emitted from the main window.

### Findings

#### [Critical] Finding 1: Pop-out Window compile state hangs permanently (Blocker)
- **What**: The popout editor page implements listeners for `"compile-start"` and `"compile-end"` to set `isRunning` to `true` and `false` respectively. When the "Run in Main" button is clicked in the pop-out window, `setIsRunning(true)` is executed immediately before emitting `"run-code-from-popout"`. However, the main window (`src/pages/ExercisePage.tsx`) executes `doRun` but never emits `"compile-start"` or `"compile-end"` back to the pop-out window.
- **Where**: `src/pages/ExercisePage.tsx` inside the `doRun` method.
- **Why**: As a result, once the code execution finishes in the main window, the pop-out window remains permanently in the `isRunning = true` state. The "Run in Main" button remains disabled, preventing the user from running code ever again unless they close and reopen the pop-out window.
- **Suggestion**: In `src/pages/ExercisePage.tsx`, import `emit` from `@tauri-apps/api/event` and emit `"compile-start"` at the beginning of `doRun` and `"compile-end"` at the end of `doRun`:
  ```typescript
  const doRun = async (code: string) => {
    if (!exercise || isRunning) return;
    setIsRunning(true);
    setResult(null);
    const { emit } = await import("@tauri-apps/api/event");
    await emit("compile-start");
    const res = await runCode(code, exercise.testHarness);
    setIsRunning(false);
    await emit("compile-end");
    setResult(res);
    ...
  ```

---

## 2. Verification of Requirements

### 1. Routing
- **HashRouter Implementation**: `src/main.tsx` correctly imports and wraps `<App />` with `<HashRouter>` instead of `<BrowserRouter>`. (PASSED)
- **Pop-out Path**: `src/pages/ExercisePage.tsx` correctly spawns the webview window using the URL `index.html#/popout?id=${exercise.id}`. `src/App.tsx` correctly intercepts this path and bypasses the main shell. (PASSED)

### 2. Styling
- **Global Transparency**: `src/index.css` correctly sets `background: transparent;` for `html, body, #root`. (PASSED)
- **Liquid Glass CSS**: `@keyframes liquid-glass-rotate` and `.liquid-glass-bg` are defined at the end of `src/index.css`. (PASSED)
- **Popout Layout**: `src/pages/PopoutEditorPage.tsx` wraps the editor in a relative parent container with glassmorphic styles, contains an absolute-positioned `z-0` liquid glass backdrop, and marks title/editor with `relative z-10`. (PASSED)

### 3. Compilation
- **Typecheck**: Running `npx tsc --noEmit` completes with exit code 0. (PASSED)
- **Build**: Running `npm run build` compiles Vite assets and exits with code 0. (PASSED)

---

## 3. Adversarial Review & Stress Testing

**Overall Risk Assessment**: HIGH (due to the functional blocker)

### Stress Test Scenario 1: Multiple compilations from pop-out window
- **Scenario**: Click "Run in Main" in the pop-out window. Wait for compilation to finish in main window. Attempt to run code again.
- **Expected Behavior**: Button becomes active again once run finishes.
- **Actual Behavior**: Button remains disabled and displays "Running…", locking the UI.
- **Verdict**: FAIL

### Stress Test Scenario 2: Exercise details fallback
- **Scenario**: Accessing the route with an invalid or missing `id` query parameter (e.g. `#/popout?id=invalid`).
- **Expected Behavior**: Fallback page displaying "No exercise selected." with custom background.
- **Actual Behavior**: Handled correctly in `src/pages/PopoutEditorPage.tsx` line 37.
- **Verdict**: PASS
