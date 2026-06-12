import { motion } from "framer-motion";
import type { Concept } from "@/types";
import { staggerItem } from "@/lib/animations";

interface Props {
  concept: Concept;
  index: number;
  courseTitle: string;
}

export default function ConceptCard({ concept, index, courseTitle }: Props) {
  return (
    <motion.div
      variants={staggerItem}
      className="rounded-xl glass-panel"
      style={{ padding: "28px 32px" }}
    >
      <div className="flex items-start gap-5">
        <div
          className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center text-sm font-bold"
          style={{
            background: "rgba(99,102,241,0.15)",
            border: "1px solid rgba(129,140,248,0.3)",
            color: "#818cf8",
            boxShadow: "0 0 20px rgba(99,102,241,0.15)",
          }}
        >
          {index + 1}
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="text-[11px] uppercase tracking-widest mb-1.5"
            style={{ color: "rgba(255,255,255,0.32)" }}
          >
            {courseTitle}
          </p>
          <h2 className="text-xl font-semibold text-white mb-4 tracking-tight">
            {concept.name || `Concept ${index + 1}`}
          </h2>
          <p className="text-sm text-slate-300 leading-7 whitespace-pre-line">
            {concept.explanation ||
              "Study this concept using the code examples below, then complete the exercise."}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
