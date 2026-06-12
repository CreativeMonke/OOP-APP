import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface ConceptNodeData extends Record<string, unknown> {
  conceptIndex: number;
  name: string;
  completed: boolean;
  isNext: boolean;
  onClick: () => void;
}

type ConceptNodeType = Node<ConceptNodeData, "concept">;

function ConceptNodeComponent({ data }: NodeProps<ConceptNodeType>) {
  const { conceptIndex, name, completed, isNext, onClick } = data;

  return (
    <div
      className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg cursor-pointer transition-all duration-200 select-none"
      style={{
        width: 160,
        background: isNext
          ? "rgba(129,140,248,0.15)"
          : completed
            ? "rgba(52,211,153,0.08)"
            : "rgba(255,255,255,0.025)",
        border: `1px solid ${
          isNext
            ? "rgba(129,140,248,0.3)"
            : completed
              ? "rgba(52,211,153,0.15)"
              : "rgba(255,255,255,0.05)"
        }`,
        transition: "all 0.18s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={onClick}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = isNext
          ? "rgba(129,140,248,0.22)"
          : completed
            ? "rgba(52,211,153,0.14)"
            : "rgba(255,255,255,0.06)";
        e.currentTarget.style.transform = "translateX(3px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isNext
          ? "rgba(129,140,248,0.15)"
          : completed
            ? "rgba(52,211,153,0.08)"
            : "rgba(255,255,255,0.025)";
        e.currentTarget.style.transform = "translateX(0)";
      }}
    >
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <div
        className="w-4 h-4 rounded flex items-center justify-center text-[8px] font-bold shrink-0"
        style={{
          background: completed
            ? "rgba(52,211,153,0.2)"
            : isNext
              ? "rgba(129,140,248,0.25)"
              : "rgba(255,255,255,0.06)",
          color: completed ? "#34d399" : isNext ? "#a5b4fc" : "rgba(255,255,255,0.3)",
        }}
      >
        {conceptIndex + 1}
      </div>
      <span
        className="text-[10px] truncate font-medium"
        style={{
          color: completed
            ? "rgba(255,255,255,0.65)"
            : isNext
              ? "#a5b4fc"
              : "rgba(255,255,255,0.3)",
        }}
      >
        {name.split("\n")[0]}
      </span>
    </div>
  );
}

export default memo(ConceptNodeComponent);
