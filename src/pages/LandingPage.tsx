import { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  animate,
  useInView,
} from "framer-motion";
import { BookOpen, Code2, Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store/useAppStore";
import { useProgressStore } from "@/store/useProgressStore";
import { staggerContainer, staggerItem, pageVariants } from "@/lib/animations";

const GLYPHS: Array<{
  g: string;
  x: string;
  y: string;
  size: number;
  dur: string;
  delay: string;
  o: number;
  tilt: string;
}> = [
  { g: "{ }", x: "12%", y: "22%", size: 22, dur: "9s", delay: "0s", o: 0.1, tilt: "-8deg" },
  { g: "::", x: "84%", y: "18%", size: 26, dur: "11s", delay: "1.2s", o: 0.12, tilt: "6deg" },
  { g: "virtual", x: "8%", y: "64%", size: 13, dur: "10s", delay: "0.6s", o: 0.09, tilt: "-4deg" },
  { g: "</>", x: "88%", y: "58%", size: 18, dur: "8.5s", delay: "2s", o: 0.11, tilt: "10deg" },
  { g: "new", x: "20%", y: "82%", size: 14, dur: "12s", delay: "0.3s", o: 0.08, tilt: "5deg" },
  { g: "~()", x: "76%", y: "80%", size: 16, dur: "9.5s", delay: "1.6s", o: 0.1, tilt: "-6deg" },
  { g: "class", x: "30%", y: "12%", size: 13, dur: "10.5s", delay: "2.4s", o: 0.08, tilt: "3deg" },
  { g: "&&", x: "68%", y: "30%", size: 15, dur: "8s", delay: "0.9s", o: 0.09, tilt: "-10deg" },
];

function CountUp({ value, color }: { value: number; color: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => Math.round(v).toString());

  useEffect(() => {
    if (inView) {
      const controls = animate(mv, value, { duration: 1.2, ease: [0.22, 1, 0.36, 1] });
      return controls.stop;
    }
  }, [inView, value, mv]);

  return (
    <motion.span ref={ref} className="text-2xl font-bold" style={{ color }}>
      {rounded}
    </motion.span>
  );
}

export default function LandingPage() {
  const navigate = useNavigate();
  const { setMode } = useAppStore();
  const { completedCount, passedCount } = useProgressStore();

  // Mouse parallax — background layers drift slightly against the cursor
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const px = useSpring(mx, { stiffness: 50, damping: 20 });
  const py = useSpring(my, { stiffness: 50, damping: 20 });
  const layerBack = {
    x: useTransform(px, (v) => v * -18),
    y: useTransform(py, (v) => v * -12),
  };
  const layerFront = {
    x: useTransform(px, (v) => v * 10),
    y: useTransform(py, (v) => v * 7),
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const goLearn = () => {
    setMode("learn");
    navigate("/learn");
  };
  const goExercise = () => {
    setMode("exercise");
    navigate("/exercise");
  };

  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      onMouseMove={onMouseMove}
      className="relative h-full w-full flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Layer 0 — aurora sweep + radial atmosphere (parallax: away from cursor) */}
      <motion.div className="pointer-events-none absolute inset-0" style={layerBack}>
        <div className="aurora-beam" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 70% 60% at 0% 0%, rgba(99,102,241,0.12) 0%, transparent 60%)," +
              "radial-gradient(ellipse 60% 50% at 100% 100%, rgba(139,92,246,0.1) 0%, transparent 60%)," +
              "radial-gradient(ellipse 50% 40% at 50% 50%, rgba(103,232,249,0.04) 0%, transparent 70%)",
          }}
        />
      </motion.div>

      {/* Layer 1 — orbital rings centered behind the hero */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="orbit-ring orbit-ring--outer">
          <div className="orbit-dot" />
        </div>
        <div className="orbit-ring orbit-ring--inner">
          <div className="orbit-dot" />
        </div>
      </div>

      {/* Layer 2 — drifting code glyphs (parallax: with cursor) */}
      <motion.div className="pointer-events-none absolute inset-0" style={layerFront}>
        {GLYPHS.map((g, i) => (
          <span
            key={i}
            className="glyph-float"
            style={
              {
                left: g.x,
                top: g.y,
                fontSize: g.size,
                "--dur": g.dur,
                "--delay": g.delay,
                "--o": g.o,
                "--tilt": g.tilt,
              } as React.CSSProperties
            }
          >
            {g.g}
          </span>
        ))}
      </motion.div>

      {/* Window drag handle — invisible strip at the top */}
      <div data-tauri-drag-region className="absolute top-0 left-0 right-0 z-30" style={{ height: 36 }} />

      {/* Occasional scanline pass over everything */}
      <div className="hero-scanline" />

      <motion.div
        variants={staggerContainer}
        initial="initial"
        animate="animate"
        className="relative z-10 flex flex-col items-center text-center px-8 max-w-2xl"
      >
        {/* Badge */}
        <motion.div variants={staggerItem} className="mb-7">
          <span
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: "rgba(99,102,241,0.12)",
              border: "1px solid rgba(129,140,248,0.25)",
              color: "#818cf8",
              boxShadow: "0 0 24px rgba(99,102,241,0.18)",
            }}
          >
            <Zap size={11} />
            FII UAIC · C++ OOP Platform
          </span>
        </motion.div>

        {/* Headline */}
        <div className="relative">
          <div
            className="absolute inset-0 blur-3xl opacity-25"
            style={{ background: "radial-gradient(circle, #818cf8 0%, transparent 70%)" }}
          />
          <motion.h1
            variants={staggerItem}
            className="relative font-bold leading-tight mb-5 title-shimmer"
            style={{ fontSize: 64, letterSpacing: "-0.02em" }}
          >
            Master C++ OOP
          </motion.h1>
        </div>

        <motion.p
          variants={staggerItem}
          className="text-base text-slate-400 leading-relaxed mb-9 max-w-md"
        >
          Interactive lessons, annotated code examples, fill-in-the-blank exercises,
          and 36 lab-quality problems — all running natively on your Mac.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={staggerItem} className="flex gap-3.5 mb-12">
          <motion.button
            onClick={goLearn}
            whileHover={{ y: -2, boxShadow: "0 14px 36px rgba(99,102,241,0.35)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="landing-cta flex items-center rounded-2xl font-semibold"
            style={{
              gap: 10,
              padding: "16px 32px",
              fontSize: 14.5,
              letterSpacing: "0.01em",
              background: "linear-gradient(135deg, rgba(99,102,241,0.4) 0%, rgba(124,58,237,0.35) 100%)",
              border: "1px solid rgba(129,140,248,0.45)",
              color: "white",
              boxShadow: "0 4px 20px rgba(99,102,241,0.25), inset 0 1px 0 rgba(255,255,255,0.15)",
            }}
          >
            <BookOpen size={17} />
            Start Learning
            <ArrowRight size={15} style={{ marginLeft: 2 }} />
          </motion.button>

          <motion.button
            onClick={goExercise}
            whileHover={{ y: -2, boxShadow: "0 12px 32px rgba(103,232,249,0.18)" }}
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            className="landing-cta flex items-center rounded-2xl font-semibold"
            style={{
              gap: 10,
              padding: "16px 32px",
              fontSize: 14.5,
              letterSpacing: "0.01em",
              background: "rgba(103,232,249,0.08)",
              border: "1px solid rgba(103,232,249,0.22)",
              color: "#67e8f9",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06)",
            }}
          >
            <Code2 size={17} />
            Practice
          </motion.button>
        </motion.div>

        {/* Stats — glass chips with count-up */}
        <motion.div variants={staggerItem} className="flex items-stretch gap-4 text-sm">
          {[
            { label: "Concepts completed", value: completedCount(), color: "#818cf8" },
            { label: "Exercises passed", value: passedCount(), color: "#34d399" },
            { label: "Lab problems", value: 36, color: "#67e8f9" },
          ].map(({ label, value, color }) => (
            <div key={label} className="stat-chip">
              <CountUp value={value} color={color} />
              <span className="text-xs text-slate-500">{label}</span>
            </div>
          ))}
        </motion.div>
      </motion.div>

      {/* Bottom gradient fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(transparent, rgba(8,8,15,0.55))" }}
      />
    </motion.div>
  );
}
