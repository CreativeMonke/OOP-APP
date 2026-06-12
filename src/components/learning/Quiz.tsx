import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, XCircle, ChevronRight, RotateCcw } from "lucide-react";
import type { QuizQuestion } from "@/types";
import { quizShakeVariants, quizCorrectVariants } from "@/lib/animations";

interface Props {
  questions: QuizQuestion[];
  onAllPassed: () => void;
  /** When set, quiz progress is persisted to localStorage under this key */
  storageKey?: string;
}

interface SavedQuiz {
  answered: boolean[];
  passed: boolean[];
  done: boolean;
}

function loadSaved(key: string | undefined, len: number): SavedQuiz | null {
  if (!key) return null;
  try {
    const raw = localStorage.getItem(`quiz-${key}`);
    if (!raw) return null;
    const saved = JSON.parse(raw) as SavedQuiz;
    return saved.answered?.length === len ? saved : null;
  } catch {
    return null;
  }
}

export default function Quiz({ questions, onAllPassed, storageKey }: Props) {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState<boolean[]>(
    () => loadSaved(storageKey, questions.length)?.answered ?? new Array(questions.length).fill(false)
  );
  const [passed, setPassed] = useState<boolean[]>(
    () => loadSaved(storageKey, questions.length)?.passed ?? new Array(questions.length).fill(false)
  );
  const [shake, setShake] = useState<number | null>(null);
  const [allDone, setAllDone] = useState<boolean>(
    () => loadSaved(storageKey, questions.length)?.done ?? false
  );

  const persist = (a: boolean[], p: boolean[], done: boolean) => {
    if (!storageKey) return;
    localStorage.setItem(`quiz-${storageKey}`, JSON.stringify({ answered: a, passed: p, done }));
  };

  // A quiz restored as completed still unlocks the concept
  useEffect(() => {
    if (allDone) onAllPassed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const q = questions[current];

  const handleAnswer = (idx: number) => {
    if (answered[current]) return;
    setSelected(idx);
    const correct = idx === q.correctIndex;
    const newAnswered = [...answered];
    newAnswered[current] = true;
    setAnswered(newAnswered);

    const newPassed = [...passed];
    newPassed[current] = correct;
    setPassed(newPassed);
    persist(newAnswered, newPassed, false);

    if (!correct) {
      setShake(idx);
      setTimeout(() => setShake(null), 500);
    }
  };

  const handleNext = () => {
    if (current < questions.length - 1) {
      setCurrent(current + 1);
      setSelected(null);
    } else {
      const allPassed = passed.every(Boolean);
      if (allPassed) {
        setAllDone(true);
        persist(answered, passed, true);
        onAllPassed();
      } else {
        // Reset failed questions
        const newAnswered = [...answered];
        const newPassed = [...passed];
        passed.forEach((p, i) => {
          if (!p) {
            newAnswered[i] = false;
            newPassed[i] = false;
          }
        });
        setAnswered(newAnswered);
        setPassed(newPassed);
        persist(newAnswered, newPassed, false);
        const firstFail = newPassed.findIndex((p) => !p);
        setCurrent(firstFail >= 0 ? firstFail : 0);
        setSelected(null);
      }
    }
  };

  if (allDone) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-xl p-6 text-center glass-panel"
      >
        <CheckCircle2 size={32} className="mx-auto mb-3" style={{ color: "#34d399" }} />
        <h3 className="text-base font-semibold text-white mb-1">Quiz complete!</h3>
        <p className="text-sm text-slate-400">You passed all questions. Concept unlocked.</p>
      </motion.div>
    );
  }

  return (
    <div className="rounded-xl glass-panel overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        style={{ padding: "16px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <span className="text-sm font-medium text-white">
          Quiz — Question {current + 1}/{questions.length}
        </span>
        <div className="flex gap-1.5">
          {questions.map((_, i) => (
            <span
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background:
                  i < current
                    ? passed[i]
                      ? "#34d399"
                      : "#fb7185"
                    : i === current
                    ? "#818cf8"
                    : "rgba(255,255,255,0.15)",
              }}
            />
          ))}
        </div>
      </div>

      {/* Question */}
      <div style={{ padding: "22px 24px 24px" }}>
        <p className="text-sm text-white leading-relaxed" style={{ marginBottom: 18, fontSize: 14 }}>
          {q.question}
        </p>
        <div className="flex flex-col gap-2.5">
          {q.options.map((opt, i) => {
            const isCorrect = i === q.correctIndex;
            const isSelected = selected === i;
            const isAnswered = answered[current];
            let borderColor = "rgba(255,255,255,0.1)";
            let bg = "rgba(255,255,255,0.03)";
            let color = "rgba(255,255,255,0.7)";

            if (isAnswered) {
              if (isCorrect) {
                borderColor = "rgba(52,211,153,0.4)";
                bg = "rgba(52,211,153,0.08)";
                color = "#34d399";
              } else if (isSelected) {
                borderColor = "rgba(251,113,133,0.4)";
                bg = "rgba(251,113,133,0.08)";
                color = "#fb7185";
              }
            }

            return (
              <motion.button
                key={i}
                variants={
                  isSelected && !passed[current] && isAnswered
                    ? quizShakeVariants
                    : isSelected && passed[current]
                    ? quizCorrectVariants
                    : {}
                }
                animate={
                  shake === i && !isCorrect
                    ? "shake"
                    : isAnswered && isCorrect
                    ? "correct"
                    : "idle"
                }
                onClick={() => handleAnswer(i)}
                disabled={isAnswered}
                className="w-full text-left rounded-xl text-sm transition-colors"
                style={{
                  padding: "13px 18px",
                  background: bg,
                  border: `1px solid ${borderColor}`,
                  color,
                  cursor: isAnswered ? "default" : "pointer",
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold"
                    style={{
                      background: isAnswered && isCorrect ? "rgba(52,211,153,0.2)" : "rgba(255,255,255,0.08)",
                    }}
                  >
                    {isAnswered ? (
                      isCorrect ? <CheckCircle2 size={12} /> : isSelected ? <XCircle size={12} /> : String.fromCharCode(65 + i)
                    ) : (
                      String.fromCharCode(65 + i)
                    )}
                  </span>
                  {opt}
                </div>
              </motion.button>
            );
          })}
        </div>

        {/* Explanation */}
        <AnimatePresence>
          {answered[current] && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 overflow-hidden"
            >
              <div
                className="text-xs rounded-xl"
                style={{
                  padding: "14px 18px",
                  background: passed[current]
                    ? "rgba(52,211,153,0.06)"
                    : "rgba(251,113,133,0.06)",
                  border: `1px solid ${passed[current] ? "rgba(52,211,153,0.2)" : "rgba(251,113,133,0.2)"}`,
                  color: "#94a3b8",
                }}
              >
                <span className="font-semibold" style={{ color: passed[current] ? "#34d399" : "#fb7185" }}>
                  {passed[current] ? "Correct! " : "Not quite. "}
                </span>
                {q.explanation}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Next / Finish / Retry */}
        {answered[current] && (() => {
          const isLast = current === questions.length - 1;
          const isRetry = isLast && !passed.every(Boolean);
          const label = !isLast ? "Next question" : isRetry ? "Retry failed questions" : "Finish quiz";
          return (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex justify-end"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.96 }}
                onClick={handleNext}
                className={`editor-btn ${isRetry ? "editor-btn--retry" : "editor-btn--primary"}`}
              >
                {isRetry && <RotateCcw size={14} />}
                {label}
                {!isRetry && <ChevronRight size={14} />}
              </motion.button>
            </motion.div>
          );
        })()}
      </div>
    </div>
  );
}
