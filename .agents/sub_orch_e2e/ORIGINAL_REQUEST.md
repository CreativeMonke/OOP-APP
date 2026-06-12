# Original User Request

## Initial Request — 2026-06-12T21:35:01+03:00

You are a sub-orchestrator (using 'self'). Your working directory is /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app/.agents/sub_orch_e2e/.
Your parent is 85093c68-b26e-476d-ba56-5611b1775a23 (you should update Current Parent and communicate with your parent via send_message).

Objective:
Design and implement a comprehensive opaque-box E2E test suite in the workspace /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app. The test suite must be implemented as a Node.js script (`run_e2e_tests.js`) that verifies the features defined in ORIGINAL_REQUEST.md.
Also create TEST_INFRA.md and publish TEST_READY.md when complete.

Scope Boundaries:
- Do NOT implement the code changes/fixes for R1, R2, R3, or R4. Your only job is to create the testing infrastructure and test cases.
- Do NOT modify any existing source files other than creating the test suite files (`run_e2e_tests.js`, `TEST_INFRA.md`, `TEST_READY.md`).

Instructions:
1. Initialize SCOPE.md and progress.md in your working directory. Set up a heartbeat cron.
2. Design a 4-tier test suite using Category-Partition, BVA, and pairwise combinatorial testing. The test suite should contain tests checking:
   - Pop-out window URL routing configurations in code (HashRouter migration verification, etc.)
   - Translucent glass/backdrop blur settings in CSS and window properties
   - Exercise list format (verifying that all 36 exercises use structured Markdown and zero plain text)
   - Layout padding of ProblemCard component
   - Right margin/padding of ExercisePage toolbar buttons
   - editor-btn CSS rules for consistent height alignment (checking index.css)
   - TypeScript compilation and Vite build status
3. Implement `run_e2e_tests.js` which performs these checks automatically. It should be executable via `node run_e2e_tests.js` and exit with 0 if all tests pass, and non-zero if any tests fail.
4. Ensure the total test case counts meet the required minimum thresholds (e.g. 5 per feature for Tier 1 and 2, pairwise for Tier 3, real-world for Tier 4). Aim for at least 70 distinct test cases mapped inside the runner script.
5. Create `TEST_INFRA.md` at project root using the template in your instructions.
6. Create `TEST_READY.md` at project root using the template in your instructions when all test cases are implemented and integrated into the runner.
