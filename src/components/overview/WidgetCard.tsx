import type { ReactNode } from "react";

interface WidgetCardProps {
  title: string;
  icon?: ReactNode;
  children: ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
  bodyClassName?: string;
  noBodyPadding?: boolean;
}

export default function WidgetCard({
  title,
  icon,
  children,
  action,
  className = "",
  bodyClassName = "",
  noBodyPadding = false,
}: WidgetCardProps) {
  return (
    <div
      className={`glass-panel rounded-xl h-full flex flex-col ${className}`}
      style={{ overflow: "hidden" }}
    >
      <div
        className="flex items-center justify-between shrink-0"
        style={{
          padding: "12px 18px 10px",
          borderBottom: "1px solid rgba(255,255,255,0.05)",
        }}
      >
        <div className="flex items-center gap-2">
          {icon && <span className="flex items-center text-indigo-400">{icon}</span>}
          <h3 className="text-sm font-semibold text-white">{title}</h3>
        </div>
      </div>

      <div
        className={`flex-1 flex flex-col items-center justify-center min-h-0 ${
          !noBodyPadding ? "p-4" : ""
        } ${bodyClassName}`}
      >
        {children}
      </div>

      {action && (
        <div className="flex justify-end shrink-0" style={{ padding: "8px 14px 12px" }}>
          <button
            className="editor-btn editor-btn--primary text-xs"
            onClick={action.onClick}
            style={{ padding: "6px 14px" }}
          >
            {action.label}
          </button>
        </div>
      )}
    </div>
  );
}
