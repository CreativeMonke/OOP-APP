import { Flame, Award, Target, Zap, Star, TrendingUp, Trophy } from "lucide-react";
import WidgetCard from "./WidgetCard";

interface StreakBadgesProps {
  streak: number;
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

export default function StreakBadges({ streak, lastActiveDate, courseStats, passedExercises, quizScores }: StreakBadgesProps) {
  const badges = getBadges(courseStats, passedExercises, quizScores);

  return (
    <WidgetCard title="Streak & achievements" icon={<Flame size={14} />}>
      <div className="flex items-center gap-2 mb-3">
        <Flame
          size={18}
          className={lastActiveDate ? "text-amber-400" : "text-slate-600"}
        />
        <span className="text-sm font-semibold text-white">
          {streak > 0 ? `${streak} day streak` : lastActiveDate ? "Active today" : "No activity today"}
        </span>
      </div>
      <div className="flex flex-wrap gap-2 justify-center">
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
    </WidgetCard>
  );
}
