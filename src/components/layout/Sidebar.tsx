import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { EXERCISE_CATEGORIES, getExercisesByCategory } from "@/data/exercises";

export default function Sidebar() {
  const {
    mode,
    sidebarOpen,
    courses,
    activeCourseId,
    activeConceptIndex,
    activeExerciseId,
    setActiveCourse,
    setActiveConceptIndex,
    setActiveExerciseId,
  } = useAppStore();
  const { isConceptComplete, isExercisePassed } = useProgressStore();
  const [expandedCourse, setExpandedCourse] = useState<number>(activeCourseId);
  const [expandedCategory, setExpandedCategory] = useState<number>(0);

  return (
    <motion.div
      animate={sidebarOpen ? "open" : "closed"}
      variants={{
        open: { width: 248 },
        closed: { width: 0 },
      }}
      transition={{ type: "spring", stiffness: 320, damping: 32 }}
      className="shrink-0 overflow-hidden flex flex-col relative z-10"
      style={{
        background: "linear-gradient(180deg, rgba(255,255,255,0.035) 0%, rgba(255,255,255,0.015) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
        boxShadow: "inset -1px 0 0 rgba(0,0,0,0.18), 1px 0 0 rgba(255,255,255,0.03)",
      }}
    >
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="flex flex-col h-full overflow-y-auto w-[248px]"
            style={{ overscrollBehavior: "contain" }}
          >
            {mode === "learn" ? (
              <LearnSidebar
                courses={courses}
                expandedCourse={expandedCourse}
                setExpandedCourse={setExpandedCourse}
                activeCourseId={activeCourseId}
                activeConceptIndex={activeConceptIndex}
                setActiveCourse={setActiveCourse}
                setActiveConceptIndex={setActiveConceptIndex}
                isConceptComplete={isConceptComplete}
              />
            ) : (
              <ExerciseSidebar
                expandedCategory={expandedCategory}
                setExpandedCategory={setExpandedCategory}
                activeExerciseId={activeExerciseId}
                setActiveExerciseId={setActiveExerciseId}
                isExercisePassed={isExercisePassed}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function LearnSidebar({
  courses,
  expandedCourse,
  setExpandedCourse,
  activeCourseId,
  activeConceptIndex,
  setActiveCourse,
  setActiveConceptIndex,
  isConceptComplete,
}: {
  courses: { id: number; title: string; concepts: { name: string }[] }[];
  expandedCourse: number;
  setExpandedCourse: (id: number) => void;
  activeCourseId: number;
  activeConceptIndex: number;
  setActiveCourse: (id: number) => void;
  setActiveConceptIndex: (i: number) => void;
  isConceptComplete: (key: string) => boolean;
}) {
  return (
    <div className="flex flex-col flex-1 pt-2 pb-8 relative">
      <span className="sidebar-label">Courses</span>
      <div className="absolute left-[35px] top-12 bottom-6 w-0.5 bg-slate-800/60 z-0"></div>

      <div className="px-3 flex flex-col gap-2.5 relative z-10">
        {courses.length === 0 && (
          <div className="px-2 py-6 flex flex-col items-center gap-2">
            <div className="w-4 h-4 rounded-full border-2 border-indigo-400/40 border-t-indigo-400 animate-spin" />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>
              Loading courses…
            </span>
          </div>
        )}

        {courses.map((course, idx) => {
          const isExpanded = expandedCourse === course.id;
          const isActive = activeCourseId === course.id;
          const doneCount = course.concepts.filter((_, i) =>
            isConceptComplete(`${course.id}-${i}`)
          ).length;
          const isCourseDone = doneCount === course.concepts.length && course.concepts.length > 0;

          return (
            <div key={course.id} className="relative">
              <button
                onClick={() => {
                  setExpandedCourse(isExpanded ? -1 : course.id);
                  setActiveCourse(course.id);
                }}
                className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-xl transition-all ${
                  isActive ? "bg-indigo-500/10 border border-indigo-500/20" : "hover:bg-white/5 border border-transparent"
                }`}
              >
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs shrink-0 transition-colors ${
                    isCourseDone 
                      ? "bg-emerald-500 text-white shadow-[0_0_12px_rgba(52,211,153,0.4)]" 
                      : isActive 
                        ? "bg-indigo-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]" 
                        : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {isCourseDone ? "✓" : idx + 1}
                </div>
                <div className="flex flex-col items-start flex-1 overflow-hidden">
                  <span className={`truncate text-sm font-semibold ${isActive ? "text-indigo-200" : "text-slate-300"}`}>
                    {course.title}
                  </span>
                  {course.concepts.length > 0 && (
                    <span className="text-[10px] text-slate-500 font-mono">
                      {doneCount}/{course.concepts.length} completed
                    </span>
                  )}
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="overflow-hidden pl-5 pr-2"
                  >
                    <div className="flex flex-col gap-1 py-2">
                      {course.concepts.length === 0 && (
                        <span className="text-xs text-slate-500 pl-6 py-2">Content coming soon</span>
                      )}
                      {course.concepts.map((c, i) => {
                        const key = `${course.id}-${i}`;
                        const done = isConceptComplete(key);
                        const active = activeCourseId === course.id && activeConceptIndex === i;
                        
                        return (
                          <button
                            key={i}
                            onClick={() => {
                              setActiveCourse(course.id);
                              setActiveConceptIndex(i);
                            }}
                            className={`flex items-center gap-3 w-full px-2.5 py-2 rounded-lg transition-all text-left ${
                              active ? "bg-white/5" : "hover:bg-white/5"
                            }`}
                          >
                            <div className="w-5 h-5 shrink-0 flex items-center justify-center relative">
                              <div className="absolute left-[-15px] top-1/2 w-4 h-[1px] bg-slate-700"></div>
                              {done ? (
                                <div className="w-4 h-4 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center">
                                  <svg viewBox="0 0 14 14" fill="none" stroke="#34d399" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" width={8} height={8}>
                                    <path d="M2.5 7l3 3 6-6" />
                                  </svg>
                                </div>
                              ) : (
                                <div className={`w-3 h-3 rounded-full ${active ? "bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]" : "border-2 border-slate-600 bg-slate-900"}`} />
                              )}
                            </div>
                            <span className={`truncate text-xs ${active ? "text-indigo-200 font-medium" : "text-slate-400"}`}>
                              {c.name || `Concept ${i + 1}`}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExerciseSidebar({
  expandedCategory,
  setExpandedCategory,
  activeExerciseId,
  setActiveExerciseId,
  isExercisePassed,
}: {
  expandedCategory: number;
  setExpandedCategory: (i: number) => void;
  activeExerciseId: string | null;
  setActiveExerciseId: (id: string | null) => void;
  isExercisePassed: (id: string) => boolean;
}) {
  const diffDot: Record<string, string> = {
    beginner: "#34d399",
    intermediate: "#fbbf24",
    advanced: "#fb7185",
  };

  return (
    <div className="flex flex-col flex-1 pt-1 pb-3">
      <span className="sidebar-label">Exercises</span>

      <div className="px-2 flex flex-col gap-0.5">
        {EXERCISE_CATEGORIES.map((cat, ci) => {
          const exercises = getExercisesByCategory(ci);
          const passedCount = exercises.filter((e) => isExercisePassed(e.id)).length;
          const isExpanded = expandedCategory === ci;

          return (
            <div key={ci}>
              <button
                onClick={() => setExpandedCategory(isExpanded ? -1 : ci)}
                className={`sidebar-item ${isExpanded ? "active" : ""}`}
              >
                <motion.span
                  animate={{ rotate: isExpanded ? 90 : 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }}
                >
                  <ChevronRight size={13} />
                </motion.span>
                <span className="truncate flex-1" style={{ fontSize: 12.5 }}>
                  {cat}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    color: isExpanded
                      ? "rgba(165,180,252,0.65)"
                      : "rgba(255,255,255,0.22)",
                    fontVariantNumeric: "tabular-nums",
                    flexShrink: 0,
                  }}
                >
                  {passedCount}/{exercises.length}
                </span>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-col gap-0.5 pb-1 pt-0.5">
                      {exercises.map((ex) => {
                        const passed = isExercisePassed(ex.id);
                        const active = activeExerciseId === ex.id;
                        return (
                          <button
                            key={ex.id}
                            onClick={() => setActiveExerciseId(ex.id)}
                            className={`sidebar-subitem ${active ? "active" : ""}`}
                          >
                            <span
                              style={{
                                width: 6,
                                height: 6,
                                borderRadius: "50%",
                                background: passed
                                  ? "#34d399"
                                  : diffDot[ex.difficulty] + "55",
                                border: passed
                                  ? "none"
                                  : `1px solid ${diffDot[ex.difficulty]}88`,
                                flexShrink: 0,
                                display: "block",
                              }}
                            />
                            <span className="truncate flex-1">{ex.title}</span>
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );
}
