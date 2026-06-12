import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Code2, BookOpen } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { EXERCISE_CATEGORIES, getExercisesByCategory } from "@/data/exercises";

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const {
    courses,
    setMode,
    setActiveCourse,
    setActiveConceptIndex,
    setActiveExerciseId
  } = useAppStore();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (!open) return null;

  const q = query.toLowerCase();
  
  // Filter courses
  const filteredCourses = courses.flatMap(c => 
    c.concepts.map((concept, i) => ({
      type: "learn" as const,
      id: `${c.id}-${i}`,
      courseId: c.id,
      conceptIndex: i,
      title: `${c.title} > ${concept.name}`,
    }))
  ).filter(item => item.title.toLowerCase().includes(q));

  // Filter exercises
  const allExercises = EXERCISE_CATEGORIES.flatMap((_, ci) => getExercisesByCategory(ci));
  const filteredExercises = allExercises.filter(ex => 
    ex.title.toLowerCase().includes(q) || ex.difficulty.includes(q)
  ).map(ex => ({
    type: "exercise" as const,
    id: ex.id,
    title: ex.title,
    difficulty: ex.difficulty
  }));

  const results = [...filteredCourses, ...filteredExercises].slice(0, 8);

  const handleSelect = (item: typeof results[0]) => {
    if (item.type === "learn") {
      setMode("learn");
      setActiveCourse(item.courseId);
      setActiveConceptIndex(item.conceptIndex);
      navigate("/learn");
    } else {
      setMode("exercise");
      setActiveExerciseId(item.id);
      navigate("/exercise");
    }
    setOpen(false);
    setQuery("");
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]">
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          className="relative w-full max-w-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="flex items-center px-4 py-4 border-b border-white/5">
            <Search className="text-indigo-400 mr-3" size={20} />
            <input
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-white text-lg placeholder-slate-500 font-sans"
              placeholder="Search concepts, exercises, or difficulty..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="text-xs text-slate-500 border border-slate-700 rounded px-2 py-1">ESC</span>
          </div>

          <div className="max-h-[60vh] overflow-y-auto p-2">
            {results.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No results found for "{query}"
              </div>
            ) : (
              results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  onClick={() => handleSelect(item)}
                  className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/5 rounded-xl transition-colors text-left group"
                >
                  <div className="flex items-center gap-3">
                    {item.type === "learn" ? (
                      <BookOpen size={16} className="text-emerald-400" />
                    ) : (
                      <Code2 size={16} className="text-indigo-400" />
                    )}
                    <span className="text-slate-200 group-hover:text-white transition-colors">{item.title}</span>
                  </div>
                  {item.type === "exercise" && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full ${
                      item.difficulty === 'beginner' ? 'bg-emerald-500/10 text-emerald-400' :
                      item.difficulty === 'intermediate' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {item.difficulty}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
