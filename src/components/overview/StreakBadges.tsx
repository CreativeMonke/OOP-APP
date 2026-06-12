import { Flame, Award, Target, Zap, Star, TrendingUp, Trophy } from "lucide-react";

interface StreakBadgesProps {
  lastActiveDate: string | null;
  courseStats: { id: number; done: number; total: number }[];
  passedExercises: Set<string>;
  quizScores: Map<string, number>;
}

interface Badge {
  icon: typeof Award;
  label: string;
  earned: boolean;
  color: string;
}

function computeStreak(lastActiveDate: string | null): number {
  if (!lastActiveDate) return 0;
  const today = new Date().toISOString().split("T")[0];
  if (lastActiveDate !== today) return 0;
  // Simple: count backwards from today
  let count = 1;
  const d = new Date();
  for (let i = 1; i < 30; i++) {
    d.setDate(d.getDate() - 1);
    // We only know the last active date, so we can't verify past days
    // Just return 1 for now - a real streak tracker would store daily check-ins
  }
  return count;
}

function getBadges(
  courseStats: { id: number; done: number; total: number }[],
  passedExercises: Set<string>,
  quizScores: Map<string, number>
): Badge[] {
  const totalCourses = courseStats.length;
  const finishedCourses = courseStats.filter((c) => c.total > 0 && c.done === c.total).length;
  const perfectQuizzes = [...quizScores.values()].filter((s) => s >= 90).length;
  const totalPassed = passedExercises.size;

  return [
    { icon: Award, label: "First steps", earned: courseStats.some((c) => c.done > 0), color: "#818cf8" },
    { icon: Star, label: "Course complete", earned: finishedCourses >= 1, color: "#fbbf24" },
    { icon: Trophy, label: "Halfway there", earned: finishedCourses >= 6, color: "#c4b5fd" },
    { icon: Target, label: "All courses", earned: finishedCourses >= totalCourses, color: "#34d399" },
    { icon: TrendingUp, label: "10 exercises", earned: totalPassed >= 10, color: "#67e8f9" },
    { icon: Zap, label: "Perfect quiz", earned: perfectQuizzes >= 1, color: "#fb7185" },
  ];
}

export default function StreakBadges({ lastActiveDate, courseStats, passedExercises, quizScores }: StreakBadgesProps) {
  const streak = computeStreak(lastActiveDate);
  const badges = getBadges(courseStats, passedExercises, quizScores);

  return (
    <div className="glass-panel rounded-xl h-full" style={{ padding: "22px 26px" }}>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Flame size={16} className={streak > 0 ? "text-amber-400" : "text-slate-600"} />
          <span className="text-sm font-semibold text-white">
            {streak > 0 ? `${streak} day streak` : "No streak"}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {badges.map((b) => {
          const Icon = b.icon;
          return (
            <div
              key={b.label}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg transition-all duration-200"
              style={{
                background: b.earned ? `${b.color}14` : "rgba(255,255,255,0.03)",
                border: `1px solid ${b.earned ? `${b.color}30` : "rgba(255,255,255,0.05)"}`,
                opacity: b.earned ? 1 : 0.35,
              }}
              title={b.earned ? b.label : `${b.label} — not yet`}
            >
              <Icon size={12} style={{ color: b.earned ? b.color : "rgba(255,255,255,0.25)" }} />
              <span
                className="text-[10px] font-medium whitespace-nowrap"
                style={{ color: b.earned ? b.color : "rgba(255,255,255,0.25)" }}
              >
                {b.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
