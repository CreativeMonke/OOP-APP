## 2026-06-12T18:41:48Z
Fix a critical bug in `src/pages/ExercisePage.tsx` where compilation events are not sent to the pop-out window, causing the pop-out editor to hang in a "Running..." state forever.

Specifically:
Modify `src/pages/ExercisePage.tsx` inside the `doRun` function (line 33) to dynamically import `emit` from `@tauri-apps/api/event` and emit `"compile-start"` at the start of compilation and `"compile-end"` immediately after `setIsRunning(false)`.
For example:
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

After modifying:
1. Run `npx tsc --noEmit`
2. Run `npm run build`
Ensure both exit with code 0.
