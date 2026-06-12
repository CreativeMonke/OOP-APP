import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";
import { ArrowRight, Lock } from "lucide-react";

interface Props {
  current: number;
  total: number;
  onNext: () => void;
  canAdvance: boolean;
}

export default function ConceptProgress({ current, total, onNext, canAdvance }: Props) {
  const pct = total > 0 ? (current / total) * 100 : 0;
  const springPct = useSpring(0, { stiffness: 90, damping: 22 });

  useEffect(() => {
    springPct.set(pct);
  }, [pct, springPct]);

  const width = useTransform(springPct, (v) => `${v}%`);
  const headLeft = useTransform(springPct, (v) => `calc(${v}% - 5px)`);
  const pctText = useTransform(springPct, (v) => `${Math.round(v)}%`);

  return (
    <div className="rounded-xl glass-panel" style={{ padding: "20px 24px" }}>
      <div className="flex items-center gap-6">
        <div className="flex-1 flex flex-col gap-3">
          <div className="flex items-baseline justify-between">
            <span
              className="text-[11px] uppercase tracking-widest"
              style={{ color: "rgba(255,255,255,0.35)" }}
            >
              Course progress
            </span>
            <span className="flex items-baseline gap-2">
              <motion.span
                className="text-base font-bold"
                style={{ color: "#a5b4fc", fontVariantNumeric: "tabular-nums" }}
              >
                {pctText}
              </motion.span>
              <span className="text-xs text-slate-500" style={{ fontVariantNumeric: "tabular-nums" }}>
                {current} / {total} concepts
              </span>
            </span>
          </div>

          {/* Segmented track with a glowing head */}
          <div className="relative" style={{ height: 8 }}>
            <div
              className="absolute inset-0 rounded-full overflow-hidden"
              style={{
                background: "rgba(255,255,255,0.07)",
                boxShadow: "inset 0 1px 2px rgba(0,0,0,0.35)",
              }}
            >
              <motion.div
                className="h-full rounded-full relative overflow-hidden"
                style={{
                  width,
                  background: "linear-gradient(90deg, #6366f1 0%, #818cf8 55%, #67e8f9 100%)",
                  boxShadow: "0 0 14px rgba(129,140,248,0.55)",
                }}
              >
                <div className="progress-sheen" />
              </motion.div>
            </div>

            {/* Concept tick marks */}
            {total > 1 &&
              Array.from({ length: total - 1 }, (_, i) => (
                <div
                  key={i}
                  className="absolute top-1/2 -translate-y-1/2"
                  style={{
                    left: `${((i + 1) / total) * 100}%`,
                    width: 2,
                    height: 4,
                    borderRadius: 1,
                    background: "rgba(0,0,0,0.4)",
                  }}
                />
              ))}

            {/* Glowing head dot */}
            {pct > 0 && (
              <motion.div
                className="absolute top-1/2 -translate-y-1/2"
                style={{
                  left: headLeft,
                  width: 10,
                  height: 10,
                  borderRadius: "50%",
                  background: "#67e8f9",
                  boxShadow: "0 0 12px 3px rgba(103,232,249,0.55)",
                }}
              />
            )}
          </div>
        </div>

        <motion.button
          onClick={onNext}
          disabled={!canAdvance}
          whileHover={canAdvance ? { scale: 1.02 } : {}}
          whileTap={canAdvance ? { scale: 0.96 } : {}}
          className={`editor-btn shrink-0 ${canAdvance ? "editor-btn--primary" : "editor-btn--secondary"}`}
          style={canAdvance ? {} : { opacity: 0.55, cursor: "not-allowed" }}
        >
          {canAdvance ? (
            <>
              Next concept
              <ArrowRight size={14} />
            </>
          ) : (
            <>
              <Lock size={13} />
              Pass the quiz to advance
            </>
          )}
        </motion.button>
      </div>
    </div>
  );
}
