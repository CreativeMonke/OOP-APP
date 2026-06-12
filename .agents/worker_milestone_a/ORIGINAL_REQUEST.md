## 2026-06-12T18:37:07Z
You are worker_milestone_a, a teamwork_preview_worker agent.
Your working directory is /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app/.agents/worker_milestone_a/.
Your parent is 1c872de0-0fda-40fc-91e4-fe536e213b5e (this conversation).

Task:
Implement the fixes for Milestone A: R1 (Pop-out Routing & Background Transparency) in the codebase.
The recommended changes are detailed in /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app/.agents/sub_orch_impl/analysis_milestone_a.md.
Specifically:
1. Modify `src/main.tsx` to replace `BrowserRouter` with `HashRouter`.
2. Modify `src/pages/ExercisePage.tsx` to construct the pop-out window URL using hash routing: `index.html#/popout?id=${exercise.id}`.
3. Modify `src/index.css` to make the global html, body, #root backgrounds transparent, and append the `@keyframes liquid-glass-rotate` / `.liquid-glass-bg` styling definitions.
4. Modify `src/pages/PopoutEditorPage.tsx` to wrap content in a relative div containing the liquid-glass background, and set proper z-indexes on the background and title bar/editor contents.
Do NOT modify monacoTheme.ts since it already defines themes dynamically based on the isPoppedOut boolean flag.

After implementing:
1. Run the TypeScript compiler check: `npx tsc --noEmit`
2. Run the Vite build check: `npm run build`
Ensure both commands run successfully and exit with code 0.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A Forensic Auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

When finished, write your handoff.md detailing what you modified and the build output logs, and send a message back to parent.
