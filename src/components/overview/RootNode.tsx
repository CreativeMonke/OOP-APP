import { memo } from "react";
import { Handle, Position, type NodeProps, type Node } from "@xyflow/react";
import { Code2 } from "lucide-react";

interface RootNodeData extends Record<string, unknown> {}

type RootNodeType = Node<RootNodeData, "root">;

function RootNodeComponent(_props: NodeProps<RootNodeType>) {
  return (
    <div
      style={{
        width: 140,
        height: 44,
        background:
          "linear-gradient(135deg, rgba(129,140,248,0.25), rgba(103,232,249,0.12))",
        border: "1px solid rgba(129,140,248,0.3)",
        borderRadius: 14,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        color: "#e2e8f0",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.03em",
        boxShadow:
          "0 0 30px rgba(129,140,248,0.15), 0 0 0 0.5px rgba(129,140,248,0.15) inset",
        cursor: "default",
        userSelect: "none",
      }}
    >
      <Code2 size={16} className="text-indigo-400" />
      <span>C++ OOP</span>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Handle
          key={`s-${side}`}
          type="source"
          id={`s-${side}`}
          position={
            side === "top"
              ? Position.Top
              : side === "right"
                ? Position.Right
                : side === "bottom"
                  ? Position.Bottom
                  : Position.Left
          }
          style={{ width: 0, height: 0, background: "transparent", border: "none", minWidth: 0, minHeight: 0 }}
        />
      ))}
    </div>
  );
}

export default memo(RootNodeComponent);
