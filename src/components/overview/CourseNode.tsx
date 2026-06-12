import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { ChevronDown } from "lucide-react";

interface CourseNodeData extends Record<string, unknown> {
  courseId: number;
  title: string;
  done: number;
  total: number;
  pct: number;
  conceptCompletions: boolean[];
  isExpanded: boolean;
  hasNext: number | null;
  onToggle: () => void;
}

type CourseNodeType = Node<CourseNodeData, "course">;

function CourseNodeComponent({ data }: NodeProps<CourseNodeType>) {
  const { courseId, title, pct, conceptCompletions, isExpanded, hasNext, onToggle } = data;

  return (
    <div
      className="rounded-xl cursor-pointer select-none"
      style={{
        padding: "12px 16px",
        width: 200,
        background: isExpanded
          ? "linear-gradient(180deg, rgba(129,140,248,0.12), rgba(129,140,248,0.04))"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          hasNext !== null
            ? "rgba(129,140,248,0.35)"
            : pct === 100
              ? "rgba(52,211,153,0.25)"
              : "rgba(255,255,255,0.07)"
        }`,
        boxShadow:
          hasNext !== null
            ? "0 0 16px rgba(129,140,248,0.12), inset 0 0 0 0.5px rgba(129,140,248,0.15)"
            : pct === 100
              ? "0 0 12px rgba(52,211,153,0.08)"
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={onToggle}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div className="flex items-center gap-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0"
          style={{
            background:
              pct === 100 ? "rgba(52,211,153,0.2)" : "rgba(129,140,248,0.18)",
            color: pct === 100 ? "#34d399" : "#818cf8",
          }}
        >
          {courseId}
        </div>
        <span className="text-[11px] font-medium text-slate-200 truncate flex-1 min-w-0">
          {title}
        </span>
        {isExpanded ? (
          <ChevronDown size={12} className="text-slate-500 shrink-0" />
        ) : (
          <div className="w-3 h-3 rounded-full flex items-center justify-center shrink-0"
            style={{
              background: "rgba(255,255,255,0.05)",
            }}
          >
            <div style={{ width: 0, height: 0, borderLeft: "4px solid rgba(255,255,255,0.25)", borderTop: "3px solid transparent", borderBottom: "3px solid transparent" }} />
          </div>
        )}
      </div>

      {/* Mini concept progress dots */}
      <div className="flex items-center gap-[3px] mt-2.5">
        {conceptCompletions.map((comp, i) => (
          <div
            key={i}
            style={{
              width: 14,
              height: 14,
              borderRadius: 3,
              background: comp
                ? "linear-gradient(135deg, #34d399, #6ee7b7)"
                : hasNext === i
                  ? "rgba(129,140,248,0.35)"
                  : "rgba(255,255,255,0.08)",
              border: `1px solid ${
                comp
                  ? "rgba(52,211,153,0.3)"
                  : hasNext === i
                    ? "rgba(129,140,248,0.4)"
                    : "rgba(255,255,255,0.04)"
              }`,
              boxShadow:
                hasNext === i
                  ? "0 0 8px rgba(129,140,248,0.25)"
                  : comp
                    ? "0 0 4px rgba(52,211,153,0.15)"
                    : "none",
            }}
            title={`Concept ${i + 1}: ${comp ? "completed" : hasNext === i ? "next up" : "not started"}`}
          />
        ))}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

export default memo(CourseNodeComponent);
