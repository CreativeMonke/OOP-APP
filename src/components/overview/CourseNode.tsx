import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { ChevronRight, ChevronDown } from "lucide-react";

interface CourseNodeData extends Record<string, unknown> {
  courseId: number;
  title: string;
  done: number;
  total: number;
  pct: number;
  isExpanded: boolean;
  hasNext: boolean;
  onToggle: () => void;
}

type CourseNodeType = Node<CourseNodeData, "course">;

function CourseNodeComponent({ data }: NodeProps<CourseNodeType>) {
  const { courseId, title, done, total, pct, isExpanded, hasNext, onToggle } = data;

  return (
    <div
      className="glass-panel rounded-xl cursor-pointer select-none"
      style={{
        padding: "14px 18px",
        width: 280,
        borderColor: hasNext ? "rgba(129,140,248,0.4)" : undefined,
        boxShadow: hasNext
          ? "0 0 20px rgba(129,140,248,0.15), inset 0 0 0 0.5px rgba(129,140,248,0.2)"
          : undefined,
        transition: "border-color 0.2s, box-shadow 0.2s",
      }}
      onClick={onToggle}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-2">
        <span
          className="w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0"
          style={{
            background: pct === 100 ? "rgba(52,211,153,0.15)" : "rgba(129,140,248,0.12)",
            color: pct === 100 ? "#34d399" : "#818cf8",
          }}
        >
          {courseId}
        </span>
        <span className="text-xs text-slate-300 truncate flex-1 min-w-0">{title}</span>
        {isExpanded ? (
          <ChevronDown size={14} className="text-slate-500 shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-slate-500 shrink-0" />
        )}
      </div>
      <div className="flex items-center gap-2.5 mt-2">
        <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.06)" }}>
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background:
                pct === 100
                  ? "linear-gradient(90deg, #34d399, #67e8f9)"
                  : "linear-gradient(90deg, #6366f1, #818cf8)",
              boxShadow: pct > 0 ? "0 0 6px rgba(129,140,248,0.35)" : "none",
            }}
          />
        </div>
        <span className="text-[10px] font-mono text-slate-500 shrink-0 tabular-nums">
          {done}/{total}
        </span>
      </div>
      {hasNext && (
        <div className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center shadow-lg"
          style={{ background: "linear-gradient(135deg, #818cf8, #67e8f9)" }}
        >
          <div className="w-1.5 h-1.5 rounded-full bg-white" />
        </div>
      )}
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(CourseNodeComponent);
