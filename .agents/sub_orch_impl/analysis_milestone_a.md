# Synthesis Report — Milestone A (Pop-out Routing & Background Transparency)

## Consensus Findings
1. **Routing Conversion**: Switches `BrowserRouter` to `HashRouter` in `src/main.tsx`.
2. **Pop-out Window URL**: Sets `url: 'index.html#/popout?id=${exercise.id}'` in `src/pages/ExercisePage.tsx`.
3. **Background Transparency**: Changes `background: var(--color-base)` to `background: transparent` for `html, body, #root` in `src/index.css`.
4. **Liquid-Glass Style**: Implements backdrop blobs with animating gradient in `src/pages/PopoutEditorPage.tsx` and classes/animations in `src/index.css`.
5. **No Tauri configuration changes**: Capability definitions in `default.json` and configurations in `tauri.conf.json` already fully permit dynamic transparent window creation and IPC communications.

## Action Plan
- Modify `src/main.tsx` to use `HashRouter`.
- Modify `src/pages/ExercisePage.tsx` to load `index.html#/popout?id=${exercise.id}`.
- Modify `src/index.css` to make global backgrounds transparent and add liquid glass styling classes.
- Modify `src/pages/PopoutEditorPage.tsx` to add liquid glass elements and adjust z-indexes.
