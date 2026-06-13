import { CheckCircle2, Code2, BrainCircuit } from "lucide-react";
import type { RecentAction } from "@/store/useProgressStore";
import WidgetCard from "./WidgetCard";

const ICONS = {
  concept: CheckCircle2,
  exercise: Code2,
  quiz: BrainCircuit,
} as const;

const COLORS = {
  concept: "#34d399",
  exercise: "#818cf8",
  quiz: "#67e8f9",
} as const;

interface RecentActivityProps {
  actions: RecentAction[];
}

function formatTime(ts: number): string {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function RecentActivity({ actions }: RecentActivityProps) {
  if (actions.length === 0) {
    return (
      <WidgetCard title="Recent activity" icon={<Code2 size={14} />}>
        <span className="text-xs text-slate-600">No activity yet</span>
      </WidgetCard>
    );
  }

  return (
    <WidgetCard title="Recent activity" icon={<Code2 size={14} />} bodyClassName="items-stretch">
      <div className="flex flex-col gap-2 w-full">
        {actions.slice(0, 8).map((a, i) => {
          const Icon = ICONS[a.type];
          const color = COLORS[a.type];
          return (
            <div key={`${a.timestamp}-${i}`} className="flex items-center gap-3">
              <div
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                style={{ background: `${color}18`, color }}
              >
                <Icon size={12} />
              </div>
              <span className="text-xs text-slate-300 flex-1 truncate">{a.label}</span>
              <span className="text-[10px] text-slate-600 shrink-0 tabular-nums">{formatTime(a.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
