# Test Infrastructure — OOP Academy E2E Test Suite

## Overview

This document defines the End-to-End (E2E) testing framework, test strategy, and test case catalog for the **OOP Academy** Tauri desktop application. The test suite is implemented in `run_e2e_tests.js` as an opaque-box static and integration testing tool that runs in the Node.js environment.

The runner checks and validates code formatting, router configurations, visual styles (backdrop blur, padding, border alignment), and compilation integrity without modifying the production files.

---

## Test Strategy & Methodology

We adopt a multi-tiered testing strategy using **Category-Partition**, **Boundary Value Analysis (BVA)**, and **Pairwise Combinatorial Testing** to verify all application states, interface contracts, and layout details.

### Test Tiers
1. **Tier 1: Basic Functional and Structural Tests (35 cases)**
   - Checks presence of required files.
   - Verifies basic syntax structure, imports, and element tags in React and Tauri files.
2. **Tier 2: Detailed Styling and Routing Tests (35 cases)**
   - Verifies exact property configurations in code.
   - Asserts specific Tailwind classes, CSS border/padding attributes, window dimensions, and URL structures.
3. **Tier 3: Pairwise Combinatorial Configuration Tests (7 cases)**
   - Verifies cross-file configurations and consistency.
   - Ensures layout specifications, routing types, and style definitions fit together coherently.
4. **Tier 4: End-to-End App Integration & Compilation (5 cases)**
   - Spawns compiler sub-processes to verify build integrity.
   - Runs TypeScript validation (`tsc`) and Vite bundling (`vite build`).

---

## Test Case Catalog (82 Cases)

### Tier 1: Basic Functional & Structural Tests (35 cases)

| Test ID | File Under Test | Test Name | Description |
|---|---|---|---|
| **T1_01** | `src/main.tsx` | Main Entry Existence | Verify that the frontend entry file `src/main.tsx` exists. |
| **T1_02** | `src/App.tsx` | App Component Existence | Verify that the root app shell `src/App.tsx` exists. |
| **T1_03** | `src/pages/ExercisePage.tsx` | Exercise Page Existence | Verify that the exercise workspace `src/pages/ExercisePage.tsx` exists. |
| **T1_04** | `src/pages/PopoutEditorPage.tsx` | Pop-out Page Existence | Verify that the pop-out editor page `src/pages/PopoutEditorPage.tsx` exists. |
| **T1_05** | `src/components/exercise/ProblemCard.tsx` | Problem Card Existence | Verify that the problem description component exists. |
| **T1_06** | `src/data/exercises.ts` | Exercise Data Existence | Verify that the exercise database file `src/data/exercises.ts` exists. |
| **T1_07** | `src/index.css` | Index CSS Existence | Verify that the global CSS file `src/index.css` exists. |
| **T1_08** | `src-tauri/tauri.conf.json` | Tauri Config Existence | Verify that the Tauri configuration file exists. |
| **T1_09** | `src/main.tsx` | React Router Import | Check if React Router components are imported in the main entry. |
| **T1_10** | `src/main.tsx` | Router Wrapped | Check if `<HashRouter>` is present wrapping the root application. |
| **T1_11** | `src/App.tsx` | Popout Component Reference | Check if `PopoutEditorPage` is referenced in `src/App.tsx`. |
| **T1_12** | `src/App.tsx` | Routes Wrapper | Check if `<Routes>` wrapper is used to manage page navigation. |
| **T1_13** | `src/pages/ExercisePage.tsx` | WebviewWindow Import | Verify that `WebviewWindow` is imported in `ExercisePage.tsx`. |
| **T1_14** | `src/pages/ExercisePage.tsx` | Window Spawn Function | Check for `spawnPopoutWindow` function in `ExercisePage.tsx`. |
| **T1_15** | `src/pages/PopoutEditorPage.tsx` | CodeEditor Import | Verify that the code editor component is imported. |
| **T1_16** | `src/pages/PopoutEditorPage.tsx` | Custom Background Style | Check if custom styling is applied on the outer container. |
| **T1_17** | `src/components/exercise/ProblemCard.tsx` | ReactMarkdown Import | Check if `ReactMarkdown` is imported. |
| **T1_18** | `src/components/exercise/ProblemCard.tsx` | ReactMarkdown Render | Check if `<ReactMarkdown>` tag is rendered in JSX. |
| **T1_19** | `src/data/exercises.ts` | Exercises Export | Verify that the catalog array `EXERCISES` is exported. |
| **T1_20** | `src/data/exercises.ts` | Categories Export | Verify that `EXERCISE_CATEGORIES` is exported. |
| **T1_21** | `src/data/exercises.ts` | Exercise Count Check | Ensure the database contains exactly 36 exercises. |
| **T1_22** | `src/index.css` | Button Base Style | Check for presence of `.editor-btn` class definition in CSS. |
| **T1_23** | `src/index.css` | Button Primary Modifier | Check for `.editor-btn--primary` styling definition. |
| **T1_24** | `src/index.css` | Button Secondary Modifier | Check for `.editor-btn--secondary` styling definition. |
| **T1_25** | `src/index.css` | Button Ghost Modifier | Check for `.editor-btn--ghost` styling definition. |
| **T1_26** | `src-tauri/tauri.conf.json` | JSON Format Check | Ensure Tauri configuration parses as a valid JSON object. |
| **T1_27** | `src-tauri/tauri.conf.json` | Product Name Check | Ensure the product name is set in the configuration. |
| **T1_28** | `src-tauri/tauri.conf.json` | macOS Private API Check | Verify that macOS private APIs are enabled. |
| **T1_29** | `src/pages/ExercisePage.tsx` | Layout Padding Check | Verify that `p-5` layout padding is present on workspace container. |
| **T1_30** | `src/pages/ExercisePage.tsx` | Button Gap Check | Verify that toolbar buttons are separated with `gap-2.5`. |
| **T1_31** | `src/components/exercise/ProblemCard.tsx` | card Horizontal Padding | Check if `px-8` is present on the outermost card wrapper. |
| **T1_32** | `src/components/exercise/ProblemCard.tsx` | card Vertical Padding | Check if `py-6` is present on the outermost card wrapper. |
| **T1_33** | `src/pages/PopoutEditorPage.tsx` | Backdrop Filter Presence | Verify that `backdropFilter` style is declared. |
| **T1_34** | `src/pages/PopoutEditorPage.tsx` | Rounded Corner Style | Check if border radius is set to `12px` on the window container. |
| **T1_35** | `src/pages/PopoutEditorPage.tsx` | Transparent Border Style | Check for translucent border configuration `rgba(255,255,255,0.08)`. |

### Tier 2: Detailed Styling and Routing Tests (35 cases)

| Test ID | File Under Test | Test Name | Description |
|---|---|---|---|
| **T2_01** | `src/main.tsx` | No BrowserRouter | Verify that `BrowserRouter` has been replaced by `HashRouter`. |
| **T2_02** | `src/App.tsx` | Hash Router Compatibility | Verify that URL path parsing in `App.tsx` is compatible with `HashRouter`. |
| **T2_03** | `src/pages/ExercisePage.tsx` | Pop-out Hash URL | Verify that the URL configuration uses `index.html#/popout?id=`. |
| **T2_04** | `src/pages/ExercisePage.tsx` | Translucency Property | Verify that `transparent: true` is configured in `WebviewWindow` config. |
| **T2_05** | `src/pages/ExercisePage.tsx` | Frameless Window Property | Verify that `decorations: false` is configured in `WebviewWindow` config. |
| **T2_06** | `src/pages/ExercisePage.tsx` | Window Shadow Property | Verify that `shadow: false` is configured in `WebviewWindow` config. |
| **T2_07** | `src/pages/ExercisePage.tsx` | Pop-out Window Width | Verify that target width of the spawned window is exactly `820`. |
| **T2_08** | `src/pages/ExercisePage.tsx` | Pop-out Window Height | Verify that target height of the spawned window is exactly `620`. |
| **T2_09** | `src/pages/PopoutEditorPage.tsx` | Background Opacity 0.75 | Verify container translucent background opacity is exactly `0.75` (rgba 17, 17, 19, 0.75). |
| **T2_10** | `src/pages/PopoutEditorPage.tsx` | Backdrop Blur 60px | Verify that the container backdrop filter uses `blur(60px)`. |
| **T2_11** | `src/pages/PopoutEditorPage.tsx` | Saturation Value | Verify saturate parameter in the backdrop filter is exactly `1.8`. |
| **T2_12** | `src/index.css` | Glass Panel Blur | Verify global `.glass-panel` backdrop-filter blur is exactly `20px`. |
| **T2_13** | `src/index.css` | Glass Panel Background | Verify global `.glass-panel` background color uses `rgba(255, 255, 255, 0.045)`. |
| **T2_14** | `src/index.css` | Base Button Border | Verify base class `.editor-btn` defines a border style/width to prevent height shifts. |
| **T2_15** | `src/index.css` | Ghost Button Border | Verify `.editor-btn--ghost` border is `1px solid transparent`. |
| **T2_16** | `src/index.css` | Secondary Button Border | Verify `.editor-btn--secondary` border is `1px solid rgba(255, 255, 255, 0.08)`. |
| **T2_17** | `src/index.css` | Primary Button Border | Verify `.editor-btn--primary` border is `1px solid rgba(139, 92, 246, 0.5)`. |
| **T2_18** | `src/data/exercises.ts` | Markdown Backticks | Verify all 36 exercise descriptions use backticks template strings. |
| **T2_19** | `src/data/exercises.ts` | Markdown Structure | Verify that every description contains rich markdown constructs and no raw one-liners. |
| **T2_20** | `src/data/exercises.ts` | Exercise ID Uniqueness | Verify that all 36 exercises have unique IDs. |
| **T2_21** | `src/data/exercises.ts` | Category Index Scope | Verify that category indices map correctly (between 0 and 11). |
| **T2_22** | `src/data/exercises.ts` | Difficulty Scope | Verify difficulty parameters are beginner, intermediate, or advanced. |
| **T2_23** | `src/data/exercises.ts` | Hints Count Check | Verify that every exercise has at least one helper hint. |
| **T2_24** | `src/data/exercises.ts` | Starter Code Scope | Verify that every exercise provides a non-empty C++ starter template. |
| **T2_25** | `src/data/exercises.ts` | Test Harness Scope | Verify that every exercise has a validation `testHarness` string. |
| **T2_26** | `src/pages/ExercisePage.tsx` | Buttons No Right Margin | Verify toolbar buttons have zero individual right margins to protect flex layout. |
| **T2_27** | `src/pages/ExercisePage.tsx` | Toolbar Flex Layout | Verify buttons container handles spacing exclusively via flex `gap-2.5`. |
| **T2_28** | `src-tauri/tauri.conf.json` | Main Window minWidth | Verify that the main window minimum width is configured to `1100`. |
| **T2_29** | `src-tauri/tauri.conf.json` | Main Window minHeight | Verify that the main window minimum height is configured to `700`. |
| **T2_30** | `src/components/exercise/ProblemCard.tsx` | Padding Class Combo | Verify card outer container combines `px-8` and `py-6`. |
| **T2_31** | `src/index.css` | Button Line Height | Verify base `.editor-btn` class has `line-height: 1`. |
| **T2_32** | `src/index.css` | Button Font Weight | Verify base `.editor-btn` class has `font-weight: 600`. |
| **T2_33** | `src/index.css` | Button Transition | Verify `.editor-btn` includes transition ease timing. |
| **T2_34** | `src/index.css` | Box Sizing Rule | Ensure global `box-sizing: border-box` is active to include borders in height. |
| **T2_35** | `src-tauri/tauri.conf.json` | App Identifier | Verify that the bundle identifier is configured to `com.oop-academy.app`. |

### Tier 3: Pairwise Combinatorial Configuration Tests (7 cases)

| Test ID | File Under Test | Test Name | Description |
|---|---|---|---|
| **T3_01** | `tauri.conf.json` & others | Padding & Min Width | Combinatorial check: Verify that main window minWidth (`1100`) accommodates `ProblemCard` padding (`px-8`) and page layout padding (`p-5`) without text overflow. |
| **T3_02** | `main.tsx` & `ExercisePage.tsx` | HashRouter & Popout URL | Combinatorial check: Verify router uses `HashRouter` and the spawner URL uses a matching `#` hash fragment. |
| **T3_03** | `ExercisePage.tsx` & `PopoutEditorPage.tsx` | Window Transparency & CSS Blur | Combinatorial check: Verify Tauri window transparency matches container backdrop filter configurations. |
| **T3_04** | `src/index.css` | Button Height Shift | Combinatorial check: Verify that base and modifier buttons share identical border widths to prevent 2px height shifts. |
| **T3_05** | `src/data/exercises.ts` | Category & Data Alignment | Combinatorial check: Verify metadata alignment between exercise catalog count (36) and category index list. |
| **T3_06** | `ProblemCard.tsx` & Markdown | Markdown Layout Alignment | Combinatorial check: Verify that Tailwind padding classes (`px-8`, `py-6`) align with the ReactMarkdown `prose` styles. |
| **T3_07** | `ExercisePage.tsx` & Monaco | Editor Fit Alignment | Combinatorial check: Verify popout window coordinates (`820x620`) match Monaco editor dimensions to avoid rendering empty scrollbars. |

### Tier 4: End-to-End App Integration & Compilation (5 cases)

| Test ID | File Under Test | Test Name | Description |
|---|---|---|---|
| **T4_01** | `package.json` | Compilation Command | Verify the build script compiles TypeScript followed by the Vite bundler. |
| **T4_02** | `tsconfig.json` | TypeScript No Emit | Verify typescript compiler type checking is enabled with `noEmit: true`. |
| **T4_03** | `vite.config.ts` | Target Configuration | Verify Vite build targets support standard target requirements (e.g. `es2021`). |
| **T4_04** | Full Project | TypeScript Verify | Execute `npx tsc --noEmit` and check that type checking succeeds without errors. |
| **T4_05** | Full Project | Vite Production Build | Run production compile (`npm run build`) to ensure React bundle completes successfully. |

---

## Execution Guide

To run the full E2E test suite, execute the following command at the project root:

```bash
node run_e2e_tests.js
```

### Expected Output & Exit Codes
- **Exit Code: 0** — If all 82 tests pass.
- **Exit Code: Non-zero** — If any test case fails. A detailed summary table will be displayed showing exactly which tests passed and which failed.
