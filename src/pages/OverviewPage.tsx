import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code2, BrainCircuit, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { pageVariants, staggerContainer, staggerItem } from "@/lib/animations";
import { EXERCISES, EXERCISE_CATEGORIES, getExercisesByCategory } from "@/data/exercises";
import type { Course } from "@/types";
import bundledCourses from "@/data/courses.json";

const DIFF_COLORS: Record<string, string> = {
  beginner: "#34d399",
  intermediate: "#fbbf24",
  advanced: "#fb7185",
};

function RadialGauge({ pct }: { pct: number }) {
  const R = 84;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative flex items-center justify-center" style={{ width: 220, height: 220 }}>
      <svg width={220} height={220} viewBox="0 0 220 220" style={{ transform: "rotate(-90deg)" }}>
        <defs>
          <linearGradient id="gauge-grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#67e8f9" />
          </linearGradient>
        </defs>
        <circle cx={110} cy={110} r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={12} />
        <motion.circle
          cx={110}
          cy={110}
          r={R}
          fill="none"
          stroke="url(#gauge-grad)"
          strokeWidth={12}
          strokeLinecap="round"
          strokeDasharray={C}
          initial={{ strokeDashoffset: C }}
          animate={{ strokeDashoffset: C * (1 - pct / 100) }}
          transition={{ duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
          style={{ filter: "drop-shadow(0 0 10px rgba(129,140,248,0.45))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, type: "spring", stiffness: 200, damping: 20 }}
          className="text-4xl font-bold title-shimmer"
        >
          {Math.round(pct)}%
        </motion.span>
        <span className="text-xs text-slate-500 mt-1">overall completion</span>
      </div>
    </div>
  );
}

function DifficultyDonut({ data }: { data: Array<{ label: string; passed: number; total: number; color: string }> }) {
  const R = 58;
  const C = 2 * Math.PI * R;
  const totalPassed = data.reduce((s, d) => s + d.passed, 0);
  let acc = 0;
  return (
    <div className="flex items-center gap-7">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={75} cy={75} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
          {data.map((d) => {
            const frac = totalPassed > 0 ? d.passed / totalPassed : 0;
            const seg = (
              <motion.circle
                key={d.label}
                cx={75}
                cy={75}
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth={14}
                strokeDasharray={`${C * frac} ${C}`}
                initial={{ strokeDashoffset: C * 0.25 - acc * C + C * frac }}
                animate={{ strokeDashoffset: -acc * C }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                opacity={frac === 0 ? 0 : 1}
              />
            );
            acc += frac;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{totalPassed}</span>
          <span className="text-[10px] text-slate-500">passed</span>
        </div>
      </div>
      <div className="flex flex-col gap-3">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: d.color, boxShadow: `0 0 8px ${d.color}66` }}
            />
            <span className="text-xs text-slate-300 capitalize w-24">{d.label}</span>
            <span className="text-xs font-semibold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
              {d.passed}/{d.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function OverviewPage() {
  const { courses, setCourses, setCoursesLoading } = useAppStore();
  const { completedConcepts, passedExercises, quizScores } = useProgressStore();

  useEffect(() => {
    if (courses.length > 0) return;
    const bundled = bundledCourses as Course[];
    if (bundled.some((c) => c.concepts.length > 0)) {
      setCourses(bundled);
      setCoursesLoading(false);
    }
  }, []);

  const courseStats = useMemo(
    () =>
      courses.map((c) => {
        const total = c.concepts.length;
        const done = c.concepts.filter((_, i) => completedConcepts.has(`${c.id}-${i}`)).length;
        return { id: c.id, title: c.title, done, total, pct: total ? (done / total) * 100 : 0 };
      }),
    [courses, completedConcepts]
  );

  const totalConcepts = courseStats.reduce((s, c) => s + c.total, 0);
  const doneConcepts = courseStats.reduce((s, c) => s + c.done, 0);
  const overallPct =
    totalConcepts + EXERCISES.length > 0
      ? ((doneConcepts + passedExercises.size) / (totalConcepts + EXERCISES.length)) * 100
      : 0;

  const difficultyData = useMemo(
    () =>
      (["beginner", "intermediate", "advanced"] as const).map((diff) => {
        const all = EXERCISES.filter((e) => e.difficulty === diff);
        return {
          label: diff,
          total: all.length,
          passed: all.filter((e) => passedExercises.has(e.id)).length,
          color: DIFF_COLORS[diff],
        };
      }),
    [passedExercises]
  );

  const categoryStats = useMemo(
    () =>
      EXERCISE_CATEGORIES.map((cat, ci) => {
        const exs = getExercisesByCategory(ci);
        return {
          label: cat,
          total: exs.length,
          passed: exs.filter((e) => passedExercises.has(e.id)).length,
        };
      }),
    [passedExercises]
  );

  const tiles = [
    { icon: BookOpen, label: "Concepts completed", value: doneConcepts, sub: `of ${totalConcepts}`, color: "#818cf8" },
    { icon: Code2, label: "Exercises passed", value: passedExercises.size, sub: `of ${EXERCISES.length}`, color: "#34d399" },
    { icon: BrainCircuit, label: "Quizzes aced", value: quizScores.size, sub: "concept quizzes", color: "#67e8f9" },
    { icon: Trophy, label: "Courses finished", value: courseStats.filter((c) => c.total > 0 && c.done === c.total).length, sub: "of 12", color: "#c4b5fd" },
  ];

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="h-full w-full overflow-y-auto"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="mx-auto w-full flex flex-col gap-7"
        style={{ maxWidth: 1080, padding: "36px 40px 64px" }}
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Your journey through C++ OOP, at a glance.</p>
        </motion.div>

        {/* Stat tiles */}
        <motion.div variants={staggerItem} className="grid grid-cols-4 gap-4">
          {tiles.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="glass-panel rounded-xl flex flex-col gap-3" style={{ padding: "18px 20px" }}>
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: `${color}1f`, border: `1px solid ${color}40`, color }}
              >
                <Icon size={16} />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-white" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {value}
                  </span>
                  <span className="text-xs text-slate-500">{sub}</span>
                </div>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Gauge + course bars */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "320px 1fr" }}>
          <motion.div
            variants={staggerItem}
            className="glass-panel rounded-xl flex flex-col items-center justify-center"
            style={{ padding: 24 }}
          >
            <RadialGauge pct={overallPct} />
          </motion.div>

          <motion.div variants={staggerItem} className="glass-panel rounded-xl" style={{ padding: "22px 26px" }}>
            <h3 className="text-sm font-semibold text-white mb-4">Course completion</h3>
            <div className="flex flex-col gap-2.5">
              {courseStats.map((c, i) => (
                <div key={c.id} className="flex items-center gap-3">
                  <span className="text-[11px] text-slate-500 w-4 text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {c.id}
                  </span>
                  <span className="text-xs text-slate-300 truncate" style={{ width: 190 }}>
                    {c.title}
                  </span>
                  <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background:
                          c.pct === 100
                            ? "linear-gradient(90deg, #34d399, #67e8f9)"
                            : "linear-gradient(90deg, #6366f1, #818cf8)",
                        boxShadow: c.pct > 0 ? "0 0 8px rgba(129,140,248,0.4)" : "none",
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${c.pct}%` }}
                      transition={{ duration: 0.9, delay: 0.15 + i * 0.05, ease: [0.22, 1, 0.36, 1] }}
                    />
                  </div>
                  <span className="text-[11px] text-slate-500 w-10" style={{ fontVariantNumeric: "tabular-nums" }}>
                    {c.done}/{c.total}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Difficulty donut + category columns */}
        <div className="grid gap-4" style={{ gridTemplateColumns: "380px 1fr" }}>
          <motion.div variants={staggerItem} className="glass-panel rounded-xl" style={{ padding: "22px 26px" }}>
            <h3 className="text-sm font-semibold text-white mb-5">Exercises by difficulty</h3>
            <DifficultyDonut data={difficultyData} />
          </motion.div>

          <motion.div variants={staggerItem} className="glass-panel rounded-xl" style={{ padding: "22px 26px" }}>
            <h3 className="text-sm font-semibold text-white mb-5">Exercise categories</h3>
            <div className="flex items-end justify-between gap-4" style={{ height: 130 }}>
              {categoryStats.map((c, i) => {
                const pct = c.total ? (c.passed / c.total) * 100 : 0;
                return (
                  <div key={c.label} className="flex-1 flex flex-col items-center gap-2 h-full">
                    <div className="flex-1 w-full max-w-[44px] flex flex-col justify-end rounded-lg overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <motion.div
                        className="w-full rounded-lg"
                        style={{
                          background: "linear-gradient(180deg, #67e8f9, #6366f1)",
                          boxShadow: "0 0 12px rgba(103,232,249,0.3)",
                        }}
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(pct, c.passed > 0 ? 8 : 0)}%` }}
                        transition={{ duration: 0.9, delay: 0.25 + i * 0.07, ease: [0.22, 1, 0.36, 1] }}
                      />
                    </div>
                    <span className="text-[10px] text-slate-500 text-center leading-tight" style={{ maxWidth: 90 }}>
                      {c.label}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-300" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {c.passed}/{c.total}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
