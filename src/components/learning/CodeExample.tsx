import { motion } from "framer-motion";
import Editor from "@monaco-editor/react";
import { staggerItem } from "@/lib/animations";
import { OOP_DARK_THEME } from "@/lib/monacoTheme";
import type * as Monaco from "monaco-editor";
import { defineOopDarkTheme } from "@/lib/monacoTheme";

interface Props {
  title: string;
  code: string;
  exampleNumber: number;
}

export default function CodeExample({ title, code, exampleNumber }: Props) {
  const lineCount = code.split("\n").length;
  const editorHeight = Math.min(Math.max(lineCount * 19 + 16, 100), 400);

  return (
    <motion.div variants={staggerItem} className="rounded-xl overflow-hidden glass-panel">
      <div
        className="flex items-center justify-between px-5 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.08)" }}
      >
        <div className="flex items-center gap-2.5">
          <span className="text-xs text-slate-500">Example {exampleNumber}</span>
          <span className="text-xs text-white font-medium">{title}</span>
        </div>
        <span className="text-xs text-slate-600 font-mono">C++17</span>
      </div>
      <div className="relative rounded-b-xl">
        <div className="rounded-b-xl overflow-hidden editor-glass">
          <Editor
            height={editorHeight}
            defaultLanguage="cpp"
            value={code}
            theme={OOP_DARK_THEME}
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "Geist Mono, Fira Code, monospace",
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              folding: false,
              lineDecorationsWidth: 0,
              overviewRulerLanes: 0,
              hideCursorInOverviewRuler: true,
              renderLineHighlight: "none",
              contextmenu: false,
              scrollbar: { vertical: "hidden", horizontal: "hidden" },
              automaticLayout: true,
              padding: { top: 8, bottom: 8 },
            }}
            beforeMount={(monaco: typeof Monaco) => {
              defineOopDarkTheme(monaco);
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
