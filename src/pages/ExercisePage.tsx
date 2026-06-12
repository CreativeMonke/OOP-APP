import { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, RotateCcw, ExternalLink } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { runCode } from "@/lib/tauriCommands";
import { pageVariants } from "@/lib/animations";
import Sidebar from "@/components/layout/Sidebar";
import ProblemCard from "@/components/exercise/ProblemCard";
import CodeEditor, { type CodeEditorRef } from "@/components/exercise/CodeEditor";
import TestResults from "@/components/exercise/TestResults";
import { getExerciseById, EXERCISE_CATEGORIES } from "@/data/exercises";
import type { RunResult } from "@/types";

export default function ExercisePage() {
  const { activeExerciseId } = useAppStore();
  const { isExercisePassed, markExercisePassed } = useProgressStore();
  const editorRef = useRef<CodeEditorRef>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isPoppedOut, setIsPoppedOut] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);

  const exercise = activeExerciseId ? getExerciseById(activeExerciseId) : null;
  const passed = exercise ? isExercisePassed(exercise.id) : false;

  // Reset state and close any existing popout when the selected exercise changes
  useEffect(() => {
    setResult(null);
    setIsPoppedOut(false);
    import("@tauri-apps/api/webviewWindow").then(({ WebviewWindow }) => {
      WebviewWindow.getByLabel("editor-popout").then((w) => w?.close());
    });
  }, [activeExerciseId]);

  const doRun = async (code: string) => {
    if (!exercise || isRunning) return;
    setIsRunning(true);
    setResult(null);
    const { emit } = await import("@tauri-apps/api/event");
    let res: RunResult;
    try {
      await emit("compile-start");
      res = await runCode(code, exercise.testHarness);
    } catch (err) {
      res = {
        compiled: false,
        passed: false,
        stdout: "",
        stderr: String(err),
      };
    } finally {
      setIsRunning(false);
      await emit("compile-end").catch(() => {});
    }
    setResult(res);
    if (res.passed && exercise) {
      if (!passed) {
        import("canvas-confetti").then((module) => {
          const confetti = module.default;
          confetti({
            particleCount: 150,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#818cf8", "#67e8f9", "#c4b5fd", "#34d399"],
          });
        });
      }
      markExercisePassed(exercise.id);
    }
  };

  const handleRun = () => {
    if (!exercise) return;
    const code = editorRef.current?.getValue() ?? exercise.starterCode;
    doRun(code);
  };

  // Listen for IPC from popout window
  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    import("@tauri-apps/api/event").then(({ listen }) => {
      if (cancelled) return;

      listen<{ exerciseId: string; code: string }>(
        "run-code-from-popout",
        (e) => {
          if (exercise && e.payload.exerciseId === exercise.id) {
            doRun(e.payload.code);
          }
        }
      ).then((unlisten) => cleanups.push(unlisten));

      listen<{ exerciseId: string; code: string }>("code-updated", (e) => {
        if (
          exercise &&
          e.payload.exerciseId === exercise.id &&
          editorRef.current
        ) {
          editorRef.current.setValue(e.payload.code);
        }
      }).then((unlisten) => cleanups.push(unlisten));
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [exercise?.id]);

  const handleReset = () => {
    if (exercise) {
      editorRef.current?.setValue(exercise.starterCode);
    }
    setResult(null);
  };

  const spawnPopoutWindow = async () => {
    if (!exercise) return;

    const { WebviewWindow } = await import("@tauri-apps/api/webviewWindow");
    const { Effect } = await import("@tauri-apps/api/window");
    const { LogicalPosition } = await import("@tauri-apps/api/dpi");

    // Check if window already exists
    const existing = await WebviewWindow.getByLabel("editor-popout");
    if (existing) {
      // Window already open, just focus it
      await existing.setFocus();
      setIsPoppedOut(true);
      return;
    }

    const popout = new WebviewWindow("editor-popout", {
      url: `index.html#/popout?id=${exercise.id}`,
      title: `${exercise.title} — Editor`,
      width: 820,
      height: 620,
      center: true,
      // Real native traffic lights overlaid on our custom HTML titlebar,
      // vertically centered in the 48px bar so they don't ride the title text
      decorations: true,
      titleBarStyle: "overlay",
      hiddenTitle: true,
      trafficLightPosition: new LogicalPosition(16, 18),
      transparent: true,
      shadow: true,
      skipTaskbar: false,
      alwaysOnTop: false,
      focus: true,
      // Native macOS vibrancy — genuinely blurs whatever sits behind the
      // window. CSS backdrop-filter can't do this on a transparent webview.
      windowEffects: {
        effects: [Effect.HudWindow],
      },
    });

    popout.once("tauri://created", () => {
      setIsPoppedOut(true);
      // Borderless transparent windows on macOS don't always become key —
      // raise it explicitly so it can't open behind the main window.
      popout.setFocus().catch(() => {});
    });
    popout.once("tauri://error", (e) => {
      console.error("Failed to create popout window:", e);
      setIsPoppedOut(false);
    });
    // Deliberately NOT using onCloseRequested here: registering a JS
    // close-requested listener makes the Tauri API take over the close flow
    // (it must call destroy() itself), which silently blocks the window from
    // ever closing if that call fails. tauri://destroyed is purely passive.
    popout.once("tauri://destroyed", () => {
      setIsPoppedOut(false);
    });
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex h-full w-full"
    >
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <AnimatePresence mode="wait" initial={false}>
        {!exercise ? (
          <motion.div
            key="empty"
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col items-center justify-center text-center p-8"
          >
            <p className="text-slate-500 text-sm mb-2">
              Select an exercise from the sidebar.
            </p>
            <p className="text-slate-600 text-xs">
              {EXERCISE_CATEGORIES.length} categories · 36 problems · Beginner
              to Advanced
            </p>
          </motion.div>
        ) : (
          <motion.div
            key={exercise.id}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="flex-1 flex flex-col overflow-hidden"
          >
            {/* Problem description */}
            <div
              style={{
                borderBottom: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <ProblemCard exercise={exercise} />
            </div>

            {/* Editor + results */}
            <div
              className="flex-1 flex flex-col overflow-hidden gap-4"
              style={{ padding: "16px 32px 32px" }}
            >
              {/* Toolbar */}
              <div className="flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className="w-2.5 h-2.5 rounded-full status-dot"
                    style={{ background: "#34d399" }}
                  />
                  <span className="text-xs text-slate-400 font-mono tracking-wide">
                    solution.cpp
                  </span>
                  {passed && (
                    <span className="exercise-badge-passed">✓ Passed</span>
                  )}
                </div>

                <div className="flex items-center gap-2.5">
                  {/* Pop Out Button */}
                  <motion.button
                    onClick={spawnPopoutWindow}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="editor-btn editor-btn--ghost"
                  >
                    <ExternalLink size={14} />
                    {isPoppedOut ? "Popped Out" : "Pop Out"}
                  </motion.button>

                  {/* Reset Button */}
                  <motion.button
                    onClick={handleReset}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.96 }}
                    className="editor-btn editor-btn--secondary"
                  >
                    <RotateCcw size={14} />
                    Reset
                  </motion.button>

                  {/* Run Button */}
                  <motion.button
                    onClick={handleRun}
                    disabled={isRunning}
                    whileHover={isRunning ? {} : { scale: 1.03 }}
                    whileTap={isRunning ? {} : { scale: 0.96 }}
                    className={`editor-btn editor-btn--primary ${isRunning ? "is-running" : ""}`}
                  >
                    <Play
                      size={14}
                      fill={isRunning ? "none" : "currentColor"}
                    />
                    {isRunning ? "Running…" : "Run & Test"}
                  </motion.button>
                </div>
              </div>

              {/* Editor Area */}
              {isPoppedOut ? (
                <div className="flex-1 flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 bg-white/[0.02]">
                  <ExternalLink
                    size={40}
                    className="text-indigo-400/40 mb-4"
                  />
                  <p className="text-sm font-medium text-slate-400">
                    Editor is in a separate window
                  </p>
                  <button
                    onClick={() => {
                      setIsPoppedOut(false);
                      import("@tauri-apps/api/webviewWindow").then(({ WebviewWindow }) => {
                        WebviewWindow.getByLabel("editor-popout").then((w) => w?.close());
                      });
                    }}
                    className="mt-4 text-xs text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
                  >
                    Restore editor here
                  </button>
                </div>
              ) : (
                <CodeEditor
                  key={exercise.id}
                  ref={editorRef}
                  initialCode={localStorage.getItem(`code-${exercise.id}`) || exercise.starterCode}
                  isCompiling={isRunning}
                  onChange={(value) => {
                    localStorage.setItem(`code-${exercise.id}`, value);
                  }}
                />
              )}

              {/* Results */}
              {(result || isRunning) && (
                <motion.div
                  initial={{ opacity: 0, y: 16, filter: "blur(6px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{ type: "spring", stiffness: 280, damping: 28 }}
                  className="shrink-0 rounded-xl overflow-hidden glass-panel"
                  style={{ maxHeight: "220px", overflowY: "auto" }}
                >
                  <TestResults result={result} isRunning={isRunning} />
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
