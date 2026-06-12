import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { CheckCircle2, Circle, AlertTriangle } from "lucide-react";

interface ConceptNodeData extends Record<string, unknown> {
  conceptIndex: number;
  name: string;
  completed: boolean;
  isNext: boolean;
  isWeak: boolean;
  onClick: () => void;
}

type ConceptNodeType = Node<ConceptNodeData, "concept">;

function ConceptNodeComponent({ data }: NodeProps<ConceptNodeType>) {
  const { conceptIndex, name, completed, isNext, isWeak, onClick } = data;

  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all duration-200 select-none"
      style={{
        width: 230,
        background: isNext
          ? "rgba(129,140,248,0.15)"
          : completed
            ? "rgba(52,211,153,0.08)"
            : "rgba(255,255,255,0.03)",
        border: `1px solid ${
          isNext
            ? "rgba(129,140,248,0.3)"
            : completed
              ? "rgba(52,211,153,0.15)"
              : isWeak
                ? "rgba(251,113,133,0.2)"
                : "rgba(255,255,255,0.06)"
        }`,
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateX(4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <span className="text-[10px] font-mono text-slate-600 w-5 text-right shrink-0">
        {conceptIndex + 1}
      </span>
      {completed ? (
        <CheckCircle2 size={12} className="text-emerald-400 shrink-0" />
      ) : isWeak ? (
        <AlertTriangle size={12} className="text-rose-400 shrink-0" />
      ) : (
        <Circle size={12} className="text-slate-600 shrink-0" />
      )}
      <span
        className="text-[11px] truncate"
        style={{
          color: completed
            ? "rgba(255,255,255,0.7)"
            : isNext
              ? "#a5b4fc"
              : "rgba(255,255,255,0.35)",
        }}
      >
        {name.split("\n")[0]}
      </span>
    </div>
  );
}

export default memo(ConceptNodeComponent);
