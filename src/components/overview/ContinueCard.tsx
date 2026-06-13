import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import WidgetCard from "./WidgetCard";

interface ContinueCardProps {
  nextConcept: { courseId: number; conceptIndex: number; courseTitle: string; conceptName: string } | null;
}

export default function ContinueCard({ nextConcept }: ContinueCardProps) {
  const navigate = useNavigate();
  const { setActiveCourse, setActiveConceptIndex } = useAppStore();

  if (!nextConcept) {
    return (
      <WidgetCard title="Continue where you left off" icon={<Sparkles size={14} />}>
        <Sparkles size={28} className="text-emerald-400" />
        <span className="text-sm font-medium text-white mt-2">All concepts complete!</span>
        <span className="text-xs text-slate-500">You've mastered the course</span>
      </WidgetCard>
    );
  }

  const handleContinue = () => {
    setActiveCourse(nextConcept.courseId);
    setActiveConceptIndex(nextConcept.conceptIndex);
    navigate("/learn");
  };

  return (
    <WidgetCard
      title="Continue where you left off"
      icon={<ArrowRight size={14} />}
      action={{ label: "Resume learning", onClick: handleContinue }}
    >
      <div className="flex items-center gap-3 w-full max-w-xs">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: "rgba(129,140,248,0.12)", color: "#818cf8" }}
        >
          <span className="text-xs font-bold">{nextConcept.courseId}</span>
        </div>
        <div className="flex-1 min-w-0 text-center">
          <div className="text-xs text-slate-300 truncate">{nextConcept.courseTitle}</div>
          <div className="text-[11px] text-slate-500 truncate">
            <span className="font-mono text-slate-600">{nextConcept.conceptIndex + 1}. </span>
            {nextConcept.conceptName}
          </div>
        </div>
      </div>
    </WidgetCard>
  );
}
