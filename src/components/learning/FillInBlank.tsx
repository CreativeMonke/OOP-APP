import { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Play, Edit3 } from "lucide-react";
import Editor from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { OOP_DARK_THEME, defineOopDarkTheme } from "@/lib/monacoTheme";
import { runCode } from "@/lib/tauriCommands";
import TestResults from "@/components/exercise/TestResults";
import type { RunResult } from "@/types";

interface Props {
  starterCode: string;
  testHarness: string;
  onPassed?: () => void;
  /** When set, the user's code and pass state persist to localStorage */
  storageKey?: string;
}

export default function FillInBlank({ starterCode, testHarness, onPassed, storageKey }: Props) {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<RunResult | null>(null);
  const [hasPassed, setHasPassed] = useState<boolean>(
    () => !!storageKey && localStorage.getItem(`fillin-passed-${storageKey}`) === "1"
  );

  const initialCode = storageKey
    ? localStorage.getItem(`fillin-code-${storageKey}`) ?? starterCode
    : starterCode;

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setResult(null);
    const code = editorRef.current?.getValue() ?? starterCode;
    let res: RunResult;
    try {
      res = await runCode(code, testHarness);
    } catch (err) {
      res = { compiled: false, passed: false, stdout: "", stderr: String(err) };
    } finally {
      setIsRunning(false);
    }
    setResult(res);
    if (res.passed) {
      setHasPassed(true);
      if (storageKey) localStorage.setItem(`fillin-passed-${storageKey}`, "1");
      onPassed?.();
    }
  };

  return (
    <div className="rounded-xl glass-panel overflow-hidden">
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: "rgba(99,102,241,0.15)",
              border: "1px solid rgba(129,140,248,0.3)",
              boxShadow: "0 0 12px rgba(99,102,241,0.12)",
            }}
          >
            <Edit3 size={13} style={{ color: "#818cf8" }} />
          </div>
          <span className="text-sm font-medium text-white">Fill in the blank</span>
        </div>
        <div className="flex items-center gap-2">
          {hasPassed && <span className="exercise-badge-passed">✓ Passed</span>}
          <motion.button
            onClick={handleRun}
            disabled={isRunning}
            whileHover={isRunning ? {} : { scale: 1.03 }}
            whileTap={isRunning ? {} : { scale: 0.95 }}
            className={`editor-btn editor-btn--primary text-[11px] ${isRunning ? "is-running" : ""}`}
          >
            <Play size={12} fill={isRunning ? "none" : "currentColor"} />
            {isRunning ? "Running…" : "Run & Check"}
          </motion.button>
        </div>
      </div>

      <div
        className={`relative ${isRunning ? "iridescent-border editor-compiling" : ""}`}
        style={{
          margin: "1px",
          borderRadius: "8px",
          border: isRunning ? "1px solid transparent" : "1px solid rgba(255,255,255,0.07)",
        }}
      >
        <div className="editor-glass" style={{ borderRadius: "7px", overflow: "hidden" }}>
          <Editor
            height={280}
            defaultLanguage="cpp"
            defaultValue={initialCode}
            theme={OOP_DARK_THEME}
            onChange={(v) => {
              if (storageKey) localStorage.setItem(`fillin-code-${storageKey}`, v ?? "");
            }}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "Geist Mono, Fira Code, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 4,
              padding: { top: 8, bottom: 8 },
              scrollbar: { verticalScrollbarSize: 4 },
            }}
            beforeMount={(monaco: typeof Monaco) => defineOopDarkTheme(monaco)}
            onMount={(editor) => { editorRef.current = editor; }}
          />
        </div>
      </div>

      <TestResults result={result} isRunning={isRunning} />
    </div>
  );
}
