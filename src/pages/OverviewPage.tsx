import { useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { BookOpen, Code2, BrainCircuit, Trophy } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { pageVariants, staggerContainer, staggerItem } from "@/lib/animations";
import { EXERCISES, EXERCISE_CATEGORIES, getExercisesByCategory } from "@/data/exercises";
import type { Course } from "@/types";
import bundledCourses from "@/data/courses.json";
import ConceptTree from "@/components/overview/ConceptTree";
import ContinueCard from "@/components/overview/ContinueCard";
import RecentActivity from "@/components/overview/RecentActivity";
import StreakBadges from "@/components/overview/StreakBadges";
import DifficultyDonut from "@/components/overview/DifficultyDonut";
import CategoryBars from "@/components/overview/CategoryBars";

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

export default function OverviewPage() {
  const { courses, setCourses, setCoursesLoading } = useAppStore();
  const { completedConcepts, passedExercises, quizScores, recentActions, streak, lastActiveDate } = useProgressStore();

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

  const nextConcept = useMemo(() => {
    for (const c of courses) {
      for (let i = 0; i < c.concepts.length; i++) {
        if (!completedConcepts.has(`${c.id}-${i}`)) {
          return {
            courseId: c.id,
            conceptIndex: i,
            courseTitle: c.title,
            conceptName: c.concepts[i].name.split("\n")[0],
          };
        }
      }
    }
    return null;
  }, [courses, completedConcepts]);

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
      className="h-full w-full overflow-y-auto flex flex-col items-center"
    >
      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="w-full flex flex-col gap-5"
        style={{ maxWidth: 1080, padding: "32px 40px 64px" }}
      >
        {/* Header */}
        <motion.div variants={staggerItem}>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Overview</h1>
          <p className="text-sm text-slate-500">Your journey through C++ OOP, at a glance.</p>
        </motion.div>

        {/* Stat tiles */}
        <motion.div variants={staggerItem} className="grid grid-cols-4 gap-4">
          {tiles.map(({ icon: Icon, label, value, sub, color }) => (
            <div key={label} className="glass-panel rounded-xl flex flex-col gap-3" style={{ padding: "16px 18px" }}>
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: `${color}1f`, border: `1px solid ${color}40`, color }}
              >
                <Icon size={15} />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-xl font-bold text-white tabular-nums">{value}</span>
                  <span className="text-xs text-slate-500">{sub}</span>
                </div>
                <span className="text-xs text-slate-400">{label}</span>
              </div>
            </div>
          ))}
        </motion.div>

        {/* Gauge + Continue card */}
        <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: "280px 1fr" }}>
          <motion.div
            variants={staggerItem}
            className="glass-panel rounded-xl flex flex-col items-center justify-center"
            style={{ padding: 20 }}
          >
            <RadialGauge pct={overallPct} />
          </motion.div>
          <motion.div variants={staggerItem} className="h-full">
            <ContinueCard nextConcept={nextConcept} />
          </motion.div>
        </div>

        {/* ReactFlow Concept Tree */}
        <motion.div variants={staggerItem}>
          <ConceptTree
            courses={courses}
            courseStats={courseStats}
            nextConcept={nextConcept ? { courseId: nextConcept.courseId, conceptIndex: nextConcept.conceptIndex } : null}
            weakConcepts={new Set()}
          />
        </motion.div>

        {/* Recent activity + Difficulty donut */}
        <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: "1fr 380px" }}>
          <motion.div variants={staggerItem} className="h-full">
            <RecentActivity actions={recentActions} />
          </motion.div>
          <motion.div variants={staggerItem} className="h-full">
            <DifficultyDonut data={difficultyData} />
          </motion.div>
        </div>

        {/* Streak + badges + Category bars */}
        <div className="grid gap-4 items-stretch" style={{ gridTemplateColumns: "1fr 1fr" }}>
          <motion.div variants={staggerItem} className="h-full">
            <StreakBadges
              streak={streak}
              lastActiveDate={lastActiveDate}
              courseStats={courseStats}
              passedExercises={passedExercises}
              quizScores={quizScores}
            />
          </motion.div>
          <motion.div variants={staggerItem} className="h-full">
            <CategoryBars data={categoryStats} />
          </motion.div>
        </div>
      </motion.div>
    </motion.div>
  );
}
