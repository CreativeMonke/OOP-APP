import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import type { RunResult } from "@/types";
import { slideUpVariants } from "@/lib/animations";

interface Props {
  result: RunResult | null;
  isRunning: boolean;
}

export default function TestResults({ result, isRunning }: Props) {
  if (isRunning) {
    return (
      <div className="flex items-center gap-2 px-4 py-3">
        <div
          className="w-3 h-3 rounded-full animate-pulse"
          style={{ background: "#818cf8" }}
        />
        <span className="text-sm text-slate-400">Compiling and running…</span>
      </div>
    );
  }

  if (!result) return null;

  const outputLines = result.stdout
    .split("\n")
    .filter((l) => l.trim())
    .map((line) => {
      const pass = line.startsWith("PASS");
      const fail = line.startsWith("FAIL");
      return { line, pass, fail };
    });

  const errorLines = result.stderr
    .split("\n")
    .filter((l) => l.trim());

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="flex flex-col gap-2 px-4 pb-4"
      >
        {/* Header */}
        <div className="flex items-center gap-2 py-1">
          {!result.compiled ? (
            <>
              <AlertCircle size={14} className="text-red-400" />
              <span className="text-sm font-medium text-red-400">
                Compilation failed
              </span>
            </>
          ) : result.passed ? (
            <>
              <CheckCircle2 size={14} className="text-emerald-400" />
              <span className="text-sm font-medium text-emerald-400">
                All tests passed!
              </span>
            </>
          ) : (
            <>
              <XCircle size={14} className="text-rose-400" />
              <span className="text-sm font-medium text-rose-400">
                Some tests failed
              </span>
            </>
          )}
        </div>

        {/* Compile error */}
        {!result.compiled && result.stderr && (
          <div className="flex flex-col gap-2">
            {result.stderr.includes("Undefined symbols") ? (
              <div
                className="text-xs p-3 rounded-lg"
                style={{
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  color: "#fca5a5",
                }}
              >
                <div className="font-bold mb-1 flex items-center gap-1">
                  <AlertCircle size={12} /> Linker Error: Missing Implementations
                </div>
                <p className="mb-2">
                  It looks like you declared some methods in the class but forgot to provide their function bodies! You need to implement the following:
                </p>
                <ul className="list-disc list-inside font-mono text-[11px] space-y-0.5">
                  {Array.from(new Set([...result.stderr.matchAll(/"([^"]+)"/g)].map((m) => m[1]))).map((sym, i) => (
                    <li key={i}>{sym}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <pre
                className="text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono"
                style={{
                  background: "rgba(239,68,68,0.06)",
                  border: "1px solid rgba(239,68,68,0.2)",
                  color: "#fca5a5",
                  maxHeight: "200px",
                }}
              >
                {result.stderr}
              </pre>
            )}
          </div>
        )}

        {/* Test rows */}
        {result.compiled && outputLines.length > 0 && (
          <div className="flex flex-col gap-1">
            {outputLines.map(({ line, pass, fail }, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={slideUpVariants}
                initial="initial"
                animate="animate"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-mono"
                style={{
                  background: pass
                    ? "rgba(52,211,153,0.07)"
                    : fail
                    ? "rgba(251,113,133,0.07)"
                    : "rgba(255,255,255,0.03)",
                  border: `1px solid ${
                    pass
                      ? "rgba(52,211,153,0.2)"
                      : fail
                      ? "rgba(251,113,133,0.2)"
                      : "rgba(255,255,255,0.06)"
                  }`,
                  color: pass ? "#34d399" : fail ? "#fb7185" : "#94a3b8",
                }}
              >
                {pass && <CheckCircle2 size={11} />}
                {fail && <XCircle size={11} />}
                <span>{line}</span>
              </motion.div>
            ))}
          </div>
        )}

        {/* Runtime stderr */}
        {result.compiled && errorLines.length > 0 && (
          <pre
            className="text-xs rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono mt-1"
            style={{
              background: "rgba(251,191,36,0.06)",
              border: "1px solid rgba(251,191,36,0.2)",
              color: "#fde68a",
            }}
          >
            {result.stderr}
          </pre>
        )}
      </motion.div>
    </AnimatePresence>
  );
}
