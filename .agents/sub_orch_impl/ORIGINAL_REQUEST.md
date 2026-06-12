# Original User Request

## Initial Request — 2026-06-12T21:35:08Z

Coordinate the implementation of the fixes for requirements R1, R2, R3, and R4 as defined in ORIGINAL_REQUEST.md in the workspace /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app.
Once all fixes are implemented, you must ensure 100% of the E2E test suite passes (after TEST_READY.md is published by the E2E Testing Track), and then perform adversarial coverage hardening (Tier 5).

Scope Boundaries:
- Do NOT start verifying against the E2E test suite until the E2E Testing Track has published `TEST_READY.md`.
- Coordinate the implementation details through subagents (Workers, Reviewers, Challengers, Forensic Auditor). Do NOT write or modify code yourself.

Instructions:
1. Initialize SCOPE.md and progress.md in your working directory. Set up a heartbeat cron.
2. Decompose the implementation into milestones. We suggest:
   - Milestone A: R1 (Pop-out Routing & Background Transparency)
   - Milestone B: R2 (Reformat 36 Exercise Descriptions to Markdown & Check Padding)
   - Milestone C: R3 (Button Clipping Toolbar Padding)
   - Milestone D: R4 (CSS Normalization for .editor-btn Box Model)
   - Milestone E: Final Milestone: E2E Test Suite Pass (Tiers 1-4) & Adversarial Hardening (Tier 5)
3. For each milestone A-D, run the iteration loop:
   - Spawn Explorer to recommend exact changes (you can feed them findings from /Users/rares-cristiandarabana/Uni/Sem 2/OOP/OOP_app/.agents/teamwork_preview_explorer_init/handoff.md)
   - Spawn Worker to implement the changes and run TypeScript check (`npx tsc --noEmit`) and Vite build (`npm run build`). Remember the MANDATORY INTEGRITY WARNING in Worker's prompt.
   - Spawn Reviewer(s) to verify correctness and conformance
   - Spawn Challenger(s) to verify
   - Spawn Forensic Auditor to run integrity checks. Wait for a CLEAN verdict.
4. When E2E Testing Track publishes `TEST_READY.md`, start Milestone E. Phase 1 is running the full test suite and fixing any failures. Phase 2 is white-box adversarial coverage hardening (Tier 5) where Challengers search for untested paths and write adversarial cases, Worker fixes code, and Reviewers review.
5. Report completion to your parent with a detailed handoff when done.
