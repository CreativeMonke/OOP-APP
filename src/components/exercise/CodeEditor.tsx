import { forwardRef, useImperativeHandle, useRef } from "react";
import Editor, { type OnMount } from "@monaco-editor/react";
import type * as Monaco from "monaco-editor";
import { OOP_DARK_THEME, defineOopDarkTheme } from "@/lib/monacoTheme";

export interface CodeEditorRef {
  getValue: () => string;
  setValue: (v: string) => void;
}

interface Props {
  initialCode: string;
  isCompiling: boolean;
  isPoppedOut?: boolean;
  onChange?: (v: string) => void;
}

const CodeEditor = forwardRef<CodeEditorRef, Props>(
  ({ initialCode, isCompiling, isPoppedOut = false, onChange }, ref) => {
    const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null);

    useImperativeHandle(ref, () => ({
      getValue: () => editorRef.current?.getValue() ?? "",
      setValue: (v) => editorRef.current?.setValue(v),
    }));

    const handleMount: OnMount = (editor) => {
      editorRef.current = editor;
    };

    return (
      <div
        className={`relative flex-1 overflow-hidden transition-all duration-300 ${
          isCompiling ? "iridescent-border editor-compiling" : ""
        }`}
        style={{
          borderRadius: isPoppedOut ? "0 0 16px 16px" : "12px",
          border: isCompiling ? "1px solid transparent" : isPoppedOut ? "none" : "1px solid rgba(255,255,255,0.08)",
          boxShadow: isCompiling ? "0 0 20px rgba(99,102,241,0.2)" : "none",
        }}
      >
        <div
          className={`absolute inset-[1px] overflow-hidden ${isPoppedOut ? "" : "editor-glass"}`}
          style={{
            borderRadius: isPoppedOut ? "0 0 16px 16px" : "11px",
          }}
        >
          <Editor
            height="100%"
            defaultLanguage="cpp"
            defaultValue={initialCode}
            theme={OOP_DARK_THEME}
            onChange={(v) => onChange?.(v ?? "")}
            options={{
              minimap: { enabled: false },
              fontSize: 13,
              fontFamily: "Geist Mono, Fira Code, monospace",
              fontLigatures: true,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              wordWrap: "on",
              automaticLayout: true,
              tabSize: 4,
              insertSpaces: true,
              formatOnType: false,
              suggest: { showSnippets: true },
              padding: { top: isPoppedOut ? 16 : 12, bottom: 16 },
              scrollbar: {
                verticalScrollbarSize: 4,
                horizontalScrollbarSize: 4,
              },
            }}
            beforeMount={(monaco: typeof Monaco) => {
              defineOopDarkTheme(monaco, isPoppedOut);
            }}
            onMount={handleMount}
          />
        </div>
      </div>
    );
  }
);

CodeEditor.displayName = "CodeEditor";
export default CodeEditor;
