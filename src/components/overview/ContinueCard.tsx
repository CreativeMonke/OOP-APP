import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { useAppStore } from "@/store/useAppStore";

interface ContinueCardProps {
  nextConcept: { courseId: number; conceptIndex: number; courseTitle: string; conceptName: string } | null;
}

export default function ContinueCard({ nextConcept }: ContinueCardProps) {
  const navigate = useNavigate();
  const { setActiveCourse, setActiveConceptIndex } = useAppStore();

  if (!nextConcept) {
    return (
      <div className="glass-panel rounded-xl flex items-center justify-center flex-col gap-2" style={{ padding: 24 }}>
        <Sparkles size={28} className="text-emerald-400" />
        <span className="text-sm font-medium text-white">All concepts complete!</span>
        <span className="text-xs text-slate-500">You've mastered the course</span>
      </div>
    );
  }

  const handleContinue = () => {
    setActiveCourse(nextConcept.courseId);
    setActiveConceptIndex(nextConcept.conceptIndex);
    navigate("/learn");
  };

  return (
    <div className="glass-panel rounded-xl flex flex-col gap-3" style={{ padding: "20px 24px" }}>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg flex items-center justify-center"
          style={{ background: "rgba(129,140,248,0.15)", color: "#818cf8" }}
        >
          <ArrowRight size={14} />
        </div>
        <span className="text-xs font-semibold text-white">Continue where you left off</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[10px] font-mono text-slate-500 shrink-0">{nextConcept.courseId}.{nextConcept.conceptIndex + 1}</span>
        <div className="flex-1 min-w-0">
          <div className="text-xs text-slate-300 truncate">{nextConcept.courseTitle}</div>
          <div className="text-[11px] text-slate-500 truncate">{nextConcept.conceptName}</div>
        </div>
      </div>
      <button
        className="editor-btn editor-btn--primary text-xs self-start"
        onClick={handleContinue}
        style={{ padding: "7px 16px" }}
      >
        Resume learning
      </button>
    </div>
  );
}
