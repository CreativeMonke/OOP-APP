import type * as Monaco from "monaco-editor";

export const OOP_DARK_THEME = "oop-dark";

// The editor surface is transparent everywhere — each editor's container
// provides the glass underlay, so popout and main windows share one theme.
export function defineOopDarkTheme(monaco: typeof Monaco, _isTransparent: boolean = true) {
  const isTransparent = true;
  monaco.editor.defineTheme(OOP_DARK_THEME, {
    base: "vs-dark",
    inherit: false,
    rules: [
      // Token rules only accept hex colors — "transparent" here throws
      // "Illegal value for token color" and crashes the editor on mount.
      // Editor transparency is handled by the "editor.background" color below.
      { token: "", foreground: "c9d1d9" },
      { token: "comment", foreground: "64748b", fontStyle: "italic" },
      { token: "comment.line", foreground: "64748b", fontStyle: "italic" },
      { token: "comment.block", foreground: "64748b", fontStyle: "italic" },
      { token: "keyword", foreground: "818cf8", fontStyle: "bold" },
      { token: "keyword.control", foreground: "818cf8", fontStyle: "bold" },
      { token: "keyword.operator", foreground: "67e8f9" },
      { token: "storage", foreground: "818cf8" },
      { token: "storage.type", foreground: "67e8f9" },
      { token: "type", foreground: "67e8f9" },
      { token: "entity.name.type", foreground: "67e8f9" },
      { token: "entity.name.class", foreground: "67e8f9" },
      { token: "entity.name.function", foreground: "a5f3fc" },
      { token: "support.function", foreground: "a5f3fc" },
      { token: "string", foreground: "c4b5fd" },
      { token: "string.quoted", foreground: "c4b5fd" },
      { token: "constant.numeric", foreground: "fb923c" },
      { token: "constant.language", foreground: "f472b6" },
      { token: "variable", foreground: "c9d1d9" },
      { token: "variable.parameter", foreground: "e2e8f0" },
      { token: "punctuation", foreground: "94a3b8" },
      { token: "delimiter", foreground: "94a3b8" },
      { token: "tag", foreground: "818cf8" },
      { token: "operator", foreground: "67e8f9" },
      { token: "meta.preprocessor", foreground: "f472b6" },
      { token: "identifier", foreground: "c9d1d9" },
    ],
    colors: {
      // Main window editors are 85%-opaque so the window vibrancy reads
      // through them; the popout editor is fully transparent over its shell.
      "editor.background": isTransparent ? "#00000000" : "#08080fD9",
      "editor.foreground": "#c9d1d9",
      "editor.lineHighlightBackground": "#ffffff08",
      "editor.selectionBackground": "#818cf830",
      "editor.inactiveSelectionBackground": "#818cf818",
      "editorLineNumber.foreground": "#334155",
      "editorLineNumber.activeForeground": "#64748b",
      "editorCursor.foreground": "#818cf8",
      "editorWhitespace.foreground": "#1e293b",
      "editorIndentGuide.background1": "#1e293b",
      "editorIndentGuide.activeBackground1": "#334155",
      "editorBracketMatch.background": "#818cf820",
      "editorBracketMatch.border": "#818cf8",
      "editor.wordHighlightBackground": "#67e8f910",
      "editor.findMatchBackground": "#c4b5fd30",
      "editor.findMatchHighlightBackground": "#c4b5fd18",
      "editorGutter.background": isTransparent ? "#00000000" : "#08080fD9",
      "scrollbarSlider.background": "#ffffff10",
      "scrollbarSlider.hoverBackground": "#ffffff18",
      "scrollbarSlider.activeBackground": "#ffffff22",
      "minimap.background": isTransparent ? "#00000000" : "#08080fD9",
    },
  });
}
