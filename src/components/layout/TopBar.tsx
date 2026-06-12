import { motion } from "framer-motion";
import { BookOpen, Code2, LayoutDashboard, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import type { AppMode } from "@/types";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { useNavigate } from "react-router-dom";

export default function TopBar() {
  const { mode, setMode, toggleSidebar, sidebarOpen } = useAppStore();
  const { completedCount, passedCount } = useProgressStore();
  const navigate = useNavigate();

  const MODE_META: Record<AppMode, { path: string; label: string; icon: typeof BookOpen }> = {
    learn: { path: "/learn", label: "Learn", icon: BookOpen },
    exercise: { path: "/exercise", label: "Exercise", icon: Code2 },
    overview: { path: "/overview", label: "Overview", icon: LayoutDashboard },
  };

  const handleMode = (m: AppMode) => {
    setMode(m);
    navigate(MODE_META[m].path);
  };

  return (
    <div
      className="flex items-center justify-between shrink-0 relative z-20 popout-titlebar"
      style={{
        height: 44,
        // Native traffic lights (overlay title bar) occupy the left edge
        paddingLeft: 84,
        paddingRight: 16,
      }}
      data-tauri-drag-region
    >
      {/* Left — sidebar toggle + app name */}
      <div className="flex items-center gap-2" style={{ minWidth: 140 }}>
        <button
          onClick={toggleSidebar}
          className="toolbar-btn"
          style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
          title="Toggle sidebar"
        >
          {sidebarOpen ? (
            <PanelLeftClose size={15} strokeWidth={1.6} />
          ) : (
            <PanelLeftOpen size={15} strokeWidth={1.6} />
          )}
        </button>
        <span
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: "rgba(255,255,255,0.7)",
            letterSpacing: "-0.01em",
          }}
        >
          OOP Academy
        </span>
      </div>

      {/* Center — mode toggle */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center"
        style={{ WebkitAppRegion: "no-drag" } as React.CSSProperties}
      >
        <div
          className="flex items-center rounded-lg p-0.5"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["learn", "exercise", "overview"] as AppMode[]).map((m) => (
            <button
              key={m}
              onClick={() => handleMode(m)}
              className="relative flex items-center gap-1.5 rounded-md transition-colors duration-150"
              style={{
                padding: "4px 10px",
                fontSize: 12.5,
                fontWeight: mode === m ? 500 : 400,
                color:
                  mode === m
                    ? "rgba(255,255,255,0.92)"
                    : "rgba(255,255,255,0.38)",
                cursor: "pointer",
                border: "none",
                background: "transparent",
                fontFamily: "var(--font-sans)",
              }}
            >
              {mode === m && (
                <motion.div
                  layoutId="mode-pill"
                  className="absolute inset-0 rounded-md"
                  style={{
                    background: "rgba(99,102,241,0.28)",
                    border: "1px solid rgba(129,140,248,0.2)",
                  }}
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                {(() => {
                  const Icon = MODE_META[m].icon;
                  return <Icon size={12} strokeWidth={1.8} />;
                })()}
                {MODE_META[m].label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Right — progress summary */}
      <div
        className="flex items-center gap-3"
        style={{
          minWidth: 140,
          justifyContent: "flex-end",
          WebkitAppRegion: "no-drag",
        } as React.CSSProperties}
      >
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <span style={{ color: "#818cf8", fontWeight: 500 }}>
            {completedCount()}
          </span>{" "}
          concepts
        </span>
        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>
          <span style={{ color: "#34d399", fontWeight: 500 }}>
            {passedCount()}
          </span>{" "}
          passed
        </span>
      </div>
    </div>
  );
}
