import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Lightbulb } from "lucide-react";
import { useState } from "react";
import type { Exercise } from "@/types";

import ReactMarkdown from "react-markdown";

const diffStyle: Record<string, { bg: string; border: string; color: string }> = {
  beginner: {
    bg: "rgba(52,211,153,0.08)",
    border: "rgba(52,211,153,0.25)",
    color: "#34d399",
  },
  intermediate: {
    bg: "rgba(251,191,36,0.08)",
    border: "rgba(251,191,36,0.25)",
    color: "#fbbf24",
  },
  advanced: {
    bg: "rgba(251,113,133,0.08)",
    border: "rgba(251,113,133,0.25)",
    color: "#fb7185",
  },
};

interface Props {
  exercise: Exercise;
}

export default function ProblemCard({ exercise }: Props) {
  const [hintsOpen, setHintsOpen] = useState(false);
  const d = diffStyle[exercise.difficulty];

  return (
    <div
      className="flex flex-col gap-4 px-8 py-6"
      style={{
        paddingLeft: "32px",
        paddingRight: "32px",
        paddingTop: "24px",
        paddingBottom: "24px",
      }}
    >
      <div className="flex items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-xl font-bold text-white">{exercise.title}</h2>
            <span
              className="text-sm px-3 py-1 rounded-full font-medium uppercase tracking-wider"
              style={{ background: d.bg, border: `1px solid ${d.border}`, color: d.color }}
            >
              {exercise.difficulty}
            </span>
          </div>
          <div className="prose prose-invert prose-sm max-w-none prose-pre:bg-slate-900/50 prose-pre:border prose-pre:border-slate-800">
            <ReactMarkdown>{exercise.description}</ReactMarkdown>
          </div>
        </div>
      </div>

      {exercise.hints.length > 0 && (
        <div className="rounded-xl glass-panel overflow-hidden">
          <button
            onClick={() => setHintsOpen(!hintsOpen)}
            className="flex items-center justify-between w-full"
            style={{
              padding: "14px 20px",
              borderBottom: hintsOpen ? "1px solid rgba(255,255,255,0.08)" : "none",
              background: "none",
              border: "none",
              color: "inherit",
              font: "inherit",
              cursor: "pointer",
              outline: "none",
            }}
          >
            <span className="text-sm font-medium text-white flex items-center gap-2">
              <Lightbulb size={14} />
              Hints ({exercise.hints.length})
            </span>
            <motion.span
              animate={{ rotate: hintsOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
              style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
            >
              <ChevronDown size={14} />
            </motion.span>
          </button>
          <AnimatePresence>
            {hintsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3" style={{ padding: "16px 20px 20px" }}>
                  {exercise.hints.map((hint, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ x: 4, borderLeftColor: "rgba(129,140,248,0.7)" }}
                      transition={{ type: "spring", stiffness: 300, damping: 22 }}
                      className="text-sm text-slate-300 leading-relaxed rounded-lg hint-gloss"
                      style={{
                        padding: "12px 16px",
                        background: "rgba(255,255,255,0.025)",
                        borderLeft: "2px solid rgba(129,140,248,0.3)",
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        borderRight: "1px solid rgba(255,255,255,0.06)",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      <span className="text-indigo-400 font-semibold mr-2">#{i + 1}</span>
                      {" "}{hint}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
