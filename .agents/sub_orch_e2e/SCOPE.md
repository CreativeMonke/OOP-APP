# Scope: E2E Test Suite Development

## Architecture
- The test suite `run_e2e_tests.js` acts as an opaque-box and static analysis verifier.
- It parses CSS rules from `src/index.css` and component styling (e.g., `ProblemCard.tsx`, `ExercisePage.tsx`).
- It checks routing configuration in code (e.g., in React Router routing configurations to ensure HashRouter is used or similar).
- It verifies that all 36 exercises use structured Markdown in their data source files (no plain text).
- It checks compilation/build status via command execution of TypeScript (`tsc`) and Vite build (`npm run build`).

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| 1 | Exploration | Explore codebase structure, file formats, and check existing layout/styles to map features. | None | PLANNED |
| 2 | Design Test Cases & TEST_INFRA.md | Catalog 70+ test cases across 4 tiers covering all requirements and generate `TEST_INFRA.md`. | M1 | PLANNED |
| 3 | Implement run_e2e_tests.js | Program the Node.js test runner at project root. | M2 | PLANNED |
| 4 | Verification & Audit | Verify the runner runs, executes all tests, and check its compliance via the Forensic Auditor. | M3 | PLANNED |
| 5 | Publish TEST_READY.md | Create and publish `TEST_READY.md` summarizing tests. | M4 | PLANNED |

## Interface Contracts
### E2E Test Runner ↔ Workspace
- Input: Existing files in `/Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app` (CSS, source components, JSON/Markdown exercises, routing configurations).
- Executable command: `node run_e2e_tests.js`
- Output: Logs to console, exit code 0 if all tests pass, non-zero if any test fails.
