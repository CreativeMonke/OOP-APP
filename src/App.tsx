import { useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import TopBar from "@/components/layout/TopBar";
import LandingPage from "@/pages/LandingPage";
import LearnPage from "@/pages/LearnPage";
import ExercisePage from "@/pages/ExercisePage";
import OverviewPage from "@/pages/OverviewPage";
import PopoutEditorPage from "@/pages/PopoutEditorPage";
import CommandPalette from "@/components/layout/CommandPalette";
import { useProgressStore } from "@/store/useProgressStore";
import { useAppStore } from "@/store/useAppStore";

export default function App() {
  const location = useLocation();
  const { init } = useProgressStore();
  const setMode = useAppStore((s) => s.setMode);

  useEffect(() => {
    init();
  }, [init]);

  // The route is the source of truth for the mode — keep the store in sync so
  // the sidebar (mode-driven) and the page content (route-driven) never diverge.
  useEffect(() => {
    if (location.pathname === "/learn") setMode("learn");
    else if (location.pathname === "/exercise") setMode("exercise");
    else if (location.pathname === "/overview") setMode("overview");
  }, [location.pathname, setMode]);

  // The popout window renders a completely bare page — no shell, no sidebar
  const isPopout = window.location.hash.startsWith("#/popout") || location.pathname === "/popout";

  if (isPopout) {
    return <PopoutEditorPage />;
  }

  const showTopBar = location.pathname !== "/";

  return (
    <div className="flex flex-col h-full w-full main-shell">
      {/* Background atmosphere: liquid gradients, orbs, dust, grid, specular */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="liquid-glass-bg" />
        <div className="bg-orb bg-orb--a" />
        <div className="bg-orb bg-orb--b" />
        <div className="bg-orb bg-orb--c" />
        <div className="bg-dust" />
        <div className="animated-grid" />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 60% 45% at 0% 0%, rgba(99,102,241,0.07) 0%, transparent 60%)," +
              "radial-gradient(ellipse 55% 40% at 100% 100%, rgba(139,92,246,0.06) 0%, transparent 60%)",
          }}
        />
        <div className="glass-specular" />
        <div className="glass-grain" />
      </div>

      <div className="relative z-10 flex flex-col h-full">
        {showTopBar && <TopBar />}

        <div className="flex-1 overflow-hidden">
          <AnimatePresence mode="wait" initial={false}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/learn" element={<LearnPage />} />
              <Route path="/exercise" element={<ExercisePage />} />
              <Route path="/overview" element={<OverviewPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </AnimatePresence>
          <CommandPalette />
        </div>
      </div>
    </div>
  );
}
