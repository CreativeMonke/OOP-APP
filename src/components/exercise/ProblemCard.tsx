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
              className="text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide"
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
        <div>
          <motion.button
            onClick={() => setHintsOpen(!hintsOpen)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="editor-btn editor-btn--ghost"
          >
            <Lightbulb size={12} />
            <span>Hints ({exercise.hints.length})</span>
            <motion.span
              animate={{ rotate: hintsOpen ? 180 : 0 }}
              transition={{ duration: 0.15 }}
            >
              <ChevronDown size={12} />
            </motion.span>
          </motion.button>
          <AnimatePresence>
            {hintsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="mt-2 flex flex-col gap-2">
                  {exercise.hints.map((hint, i) => (
                    <div
                      key={i}
                      className="text-xs text-indigo-200/70 px-4 py-2 rounded-lg glass-panel"
                    >
                      <span className="text-indigo-400 mr-2 font-semibold">#{i + 1}</span>
                      {hint}
                    </div>
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
