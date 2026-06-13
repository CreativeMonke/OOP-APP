import { motion } from "framer-motion";
import { BarChart3 } from "lucide-react";
import WidgetCard from "./WidgetCard";

interface Props {
  data: Array<{ label: string; passed: number; total: number }>;
}

export default function CategoryBars({ data }: Props) {
  return (
    <WidgetCard title="Exercise categories" icon={<BarChart3 size={14} />} bodyClassName="items-end">
      <div className="flex items-end justify-between gap-3 w-full" style={{ height: 135 }}>
        {data.map((c, i) => {
          const pct = c.total ? (c.passed / c.total) * 100 : 0;
          return (
            <div key={c.label} className="flex-1 flex flex-col items-center gap-1.5 h-full">
              <div className="flex-1 w-full max-w-[36px] flex flex-col justify-end rounded-md overflow-hidden"
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                <motion.div
                  className="w-full rounded-md"
                  style={{
                    background: "linear-gradient(180deg, #67e8f9, #6366f1)",
                    boxShadow: "0 0 10px rgba(103,232,249,0.25)",
                  }}
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(pct, c.passed > 0 ? 8 : 0)}%` }}
                  transition={{ duration: 0.9, delay: 0.25 + i * 0.06, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <span className="text-[9px] text-slate-500 text-center leading-tight">
                {c.label}
              </span>
              <span className="text-[9px] font-semibold text-slate-300 tabular-nums">
                {c.passed}/{c.total}
              </span>
            </div>
          );
        })}
      </div>
    </WidgetCard>
  );
}
