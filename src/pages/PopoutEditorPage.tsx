import { Component, useEffect, useRef, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, RotateCcw, GripHorizontal } from "lucide-react";
import CodeEditor, { type CodeEditorRef } from "@/components/exercise/CodeEditor";
import { EXERCISES } from "@/data/exercises";

/**
 * The popout window is borderless + transparent. If React ever crashes here,
 * the window becomes a fully invisible click-stealing ghost — so any error
 * must render a visible panel instead of unmounting to nothing.
 */
class PopoutErrorBoundary extends Component<
  { children: ReactNode },
  { error: string | null; warning: string | null }
> {
  state = { error: null as string | null, warning: null as string | null };

  static getDerivedStateFromError(err: unknown) {
    return { error: String(err) };
  }

  componentDidMount() {
    window.addEventListener("error", this.onWindowError);
    window.addEventListener("unhandledrejection", this.onRejection);
  }
  componentWillUnmount() {
    window.removeEventListener("error", this.onWindowError);
    window.removeEventListener("unhandledrejection", this.onRejection);
  }
  onWindowError = (e: ErrorEvent) => this.setState({ error: String(e.message) });
  // Rejections are often transient (a denied window API call, a missed
  // event) — surface them without tearing down the editor.
  onRejection = (e: PromiseRejectionEvent) => {
    console.error("Popout unhandled rejection:", e.reason);
    this.setState({ warning: String(e.reason) });
  };

  closeSelf = async () => {
    const { getCurrentWindow } = await import("@tauri-apps/api/window");
    getCurrentWindow().close();
  };

  render() {
    if (this.state.error) {
      return (
        <div
          className="flex flex-col items-center justify-center gap-4 h-screen w-screen p-8"
          style={{ background: "#16161a", borderRadius: 14 }}
        >
          <p className="text-rose-400 text-sm font-semibold">
            Popout editor crashed
          </p>
          <pre className="text-slate-400 text-xs max-w-full overflow-auto whitespace-pre-wrap">
            {this.state.error}
          </pre>
          <button
            onClick={this.closeSelf}
            className="editor-btn editor-btn--secondary"
          >
            Close window
          </button>
        </div>
      );
    }
    return (
      <>
        {this.state.warning && (
          <div className="popout-warning-banner" role="alert">
            <span className="truncate">{this.state.warning}</span>
            <button onClick={() => this.setState({ warning: null })}>✕</button>
          </div>
        )}
        {this.props.children}
      </>
    );
  }
}

function PopoutEditorContent() {
  const [searchParams] = useSearchParams();
  const exerciseId = searchParams.get("id");
  const exercise = EXERCISES.find((e) => e.id === exerciseId);
  const editorRef = useRef<CodeEditorRef>(null);
  const [isRunning, setIsRunning] = useState(false);
  const initialCode = exercise
    ? localStorage.getItem(`code-${exercise.id}`) || exercise.starterCode
    : "";

  // Running state is driven purely by events from the main window — never
  // set optimistically, so a missed message can't leave the button stuck.
  useEffect(() => {
    if (!exercise) return;
    let cancelled = false;
    const cleanups: Array<() => void> = [];

    import("@tauri-apps/api/event").then(({ listen }) => {
      if (cancelled) return;

      listen("compile-start", () => setIsRunning(true)).then((u) =>
        cleanups.push(u)
      );
      listen("compile-end", () => setIsRunning(false)).then((u) =>
        cleanups.push(u)
      );
    });

    return () => {
      cancelled = true;
      cleanups.forEach((fn) => fn());
    };
  }, [exercise]);

  const handleRun = async () => {
    if (!editorRef.current || !exercise || isRunning) return;
    const code = editorRef.current.getValue();
    const { emit } = await import("@tauri-apps/api/event");
    await emit("run-code-from-popout", { exerciseId: exercise.id, code });
  };

  const handleReset = () => {
    if (editorRef.current && exercise) {
      editorRef.current.setValue(exercise.starterCode);
      localStorage.setItem(`code-${exercise.id}`, exercise.starterCode);
      import("@tauri-apps/api/event").then(({ emit }) => {
        emit("code-updated", { exerciseId: exercise.id, code: exercise.starterCode });
      });
    }
  };

  if (!exercise) {
    return (
      <div
        className="flex items-center justify-center h-screen w-screen popout-shell"
      >
        <p className="text-slate-400 text-sm">No exercise selected.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden relative popout-shell">
      {/* Specular top edge + liquid gradient atmosphere */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" style={{ borderRadius: "inherit" }}>
        <div className="liquid-glass-bg" />
        <div className="glass-specular" />
        <div className="glass-grain" />
      </div>

      {/* Title bar — draggable */}
      <div
        className="flex items-center justify-between px-4 h-12 shrink-0 relative z-10 popout-titlebar"
        data-tauri-drag-region
      >
        <div className="flex items-center gap-3" data-tauri-drag-region>
          {/* Native macOS traffic lights render over this area (titleBarStyle:
              overlay) — pad past them instead of drawing fake ones. */}
          <h1
            className="text-xs font-medium select-none popout-title"
            style={{ paddingLeft: 84 }}
            data-tauri-drag-region
          >
            {exercise.title}
            <span className="popout-title-dim"> — Editor</span>
          </h1>
        </div>

        <div className="flex items-center gap-2" style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}>
          <span className="popout-drag-hint" data-tauri-drag-region>
            <GripHorizontal size={12} />
          </span>
          <motion.button
            onClick={handleReset}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.95 }}
            className="editor-btn editor-btn--ghost text-[11px]"
          >
            <RotateCcw size={12} />
            Reset
          </motion.button>
          <motion.button
            onClick={handleRun}
            disabled={isRunning}
            whileHover={isRunning ? {} : { scale: 1.04 }}
            whileTap={isRunning ? {} : { scale: 0.95 }}
            className={`editor-btn editor-btn--primary text-[11px] ${isRunning ? "is-running" : ""}`}
          >
            <Play size={12} fill={isRunning ? "none" : "currentColor"} />
            {isRunning ? "Running…" : "Run in Main"}
          </motion.button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 flex flex-col overflow-hidden relative z-10">
        <CodeEditor
          key={`popout-${exercise.id}`}
          ref={editorRef}
          initialCode={initialCode}
          isCompiling={isRunning}
          isPoppedOut={true}
          onChange={(value) => {
            localStorage.setItem(`code-${exercise.id}`, value);
            import("@tauri-apps/api/event").then(({ emit }) => {
              emit("code-updated", { exerciseId: exercise.id, code: value });
            });
          }}
        />
      </div>
    </div>
  );
}

export default function PopoutEditorPage() {
  return (
    <PopoutErrorBoundary>
      <PopoutEditorContent />
    </PopoutErrorBoundary>
  );
}
