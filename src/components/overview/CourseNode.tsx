import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";

interface CourseNodeData extends Record<string, unknown> {
  courseId: number;
  title: string;
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
        padding: "10px 14px",
        width: 170,
        background: isExpanded
          ? "linear-gradient(180deg, rgba(129,140,248,0.13), rgba(129,140,248,0.05))"
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
            ? "0 0 16px rgba(129,140,248,0.12), inset 0 1px 0 rgba(129,140,248,0.12)"
            : pct === 100
              ? "0 0 12px rgba(52,211,153,0.08)"
              : "inset 0 1px 0 rgba(255,255,255,0.04)",
        transition: "all 0.25s cubic-bezier(0.22, 1, 0.36, 1)",
      }}
      onClick={onToggle}
    >
      {(["top", "right", "bottom", "left"] as const).map((side) => {
        const pos =
          side === "top"
            ? Position.Top
            : side === "right"
              ? Position.Right
              : side === "bottom"
                ? Position.Bottom
                : Position.Left;
        const hidden = { width: 0, height: 0, background: "transparent", border: "none", minWidth: 0, minHeight: 0 } as const;
        return (
          <span key={side}>
            <Handle type="target" id={`t-${side}`} position={pos} style={hidden} />
            <Handle type="source" id={`s-${side}`} position={pos} style={hidden} />
          </span>
        );
      })}
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
        <div
          className="w-3 h-3 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(255,255,255,0.05)", transition: "transform 0.2s" }}
        >
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "4px solid rgba(255,255,255,0.25)",
              borderTop: "3px solid transparent",
              borderBottom: "3px solid transparent",
              transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-[3px] mt-2">
        {conceptCompletions.map((comp, i) => (
          <div
            key={i}
            style={{
              width: 13,
              height: 13,
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
              transition: "all 0.15s",
            }}
          />
        ))}
      </div>

    </div>
  );
}

export default memo(CourseNodeComponent);
