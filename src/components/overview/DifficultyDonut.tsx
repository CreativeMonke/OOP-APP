import { motion } from "framer-motion";
import { Layers } from "lucide-react";
import WidgetCard from "./WidgetCard";

interface Props {
  data: Array<{ label: string; passed: number; total: number; color: string }>;
}

export default function DifficultyDonut({ data }: Props) {
  return (
    <WidgetCard title="Exercises by difficulty" icon={<Layers size={14} />}>
      <DifficultyChart data={data} />
    </WidgetCard>
  );
}

function DifficultyChart({ data }: Props) {
  const R = 58;
  const C = 2 * Math.PI * R;
  const totalPassed = data.reduce((s, d) => s + d.passed, 0);
  let acc = 0;
  return (
    <div className="flex items-center gap-5">
      <div className="relative" style={{ width: 150, height: 150 }}>
        <svg width={150} height={150} viewBox="0 0 150 150" style={{ transform: "rotate(-90deg)" }}>
          <circle cx={75} cy={75} r={R} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={14} />
          {data.map((d) => {
            const frac = totalPassed > 0 ? d.passed / totalPassed : 0;
            const seg = (
              <motion.circle
                key={d.label}
                cx={75}
                cy={75}
                r={R}
                fill="none"
                stroke={d.color}
                strokeWidth={14}
                strokeDasharray={`${C * frac} ${C}`}
                initial={{ strokeDashoffset: C * 0.25 - acc * C + C * frac }}
                animate={{ strokeDashoffset: -acc * C }}
                transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                opacity={frac === 0 ? 0 : 1}
              />
            );
            acc += frac;
            return seg;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-bold text-white">{totalPassed}</span>
          <span className="text-[10px] text-slate-500">passed</span>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {data.map((d) => (
          <div key={d.label} className="flex items-center gap-2.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ background: d.color, boxShadow: `0 0 8px ${d.color}66` }}
            />
            <span className="text-xs text-slate-300 capitalize w-20">{d.label}</span>
            <span className="text-xs font-semibold text-white tabular-nums">
              {d.passed}/{d.total}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
