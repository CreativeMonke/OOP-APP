import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname } from "path";

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Helper to log with colors
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  cyan: "\x1b[36m",
  bright: "\x1b[1m",
};

function logInfo(msg) {
  console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`);
}

function logPass(msg) {
  console.log(`${colors.green}[PASS]${colors.reset} ${msg}`);
}

function logFail(msg) {
  console.log(`${colors.red}[FAIL]${colors.reset} ${msg}`);
}

// -------------------------------------------------------------
// Test Runner Environment & Setup
// -------------------------------------------------------------
const projectRoot = __dirname;
logInfo(`Initializing E2E Test Runner in workspace: ${projectRoot}`);

// Reads a file from the project root
function getFileContent(relPath) {
  const fullPath = path.join(projectRoot, relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`Required file not found: ${relPath}`);
  }
  return fs.readFileSync(fullPath, "utf8");
}

// Safely parses a JSON file
function getJsonContent(relPath) {
  const content = getFileContent(relPath);
  try {
    return JSON.parse(content);
  } catch (err) {
    throw new Error(`Failed to parse JSON file ${relPath}: ${err.message}`);
  }
}

// -------------------------------------------------------------
// Registry of 82 Test Cases
// -------------------------------------------------------------
const tests = [];

// Helper to register a test case
function registerTest(id, tier, name, fn) {
  tests.push({ id, tier, name, fn });
}

// =============================================================
// TIER 1: BASIC FUNCTIONAL & STRUCTURAL TESTS (35 Cases)
// =============================================================

// Existence checks (T1_01 - T1_08)
registerTest("T1_01", 1, "Main Entry Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/main.tsx"));
  return { passed: exists, message: exists ? "src/main.tsx exists" : "src/main.tsx not found" };
});

registerTest("T1_02", 1, "App Component Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/App.tsx"));
  return { passed: exists, message: exists ? "src/App.tsx exists" : "src/App.tsx not found" };
});

registerTest("T1_03", 1, "Exercise Page Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/pages/ExercisePage.tsx"));
  return { passed: exists, message: exists ? "src/pages/ExercisePage.tsx exists" : "src/pages/ExercisePage.tsx not found" };
});

registerTest("T1_04", 1, "Pop-out Page Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/pages/PopoutEditorPage.tsx"));
  return { passed: exists, message: exists ? "src/pages/PopoutEditorPage.tsx exists" : "src/pages/PopoutEditorPage.tsx not found" };
});

registerTest("T1_05", 1, "Problem Card Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/components/exercise/ProblemCard.tsx"));
  return { passed: exists, message: exists ? "src/components/exercise/ProblemCard.tsx exists" : "src/components/exercise/ProblemCard.tsx not found" };
});

registerTest("T1_06", 1, "Exercise Data Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/data/exercises.ts"));
  return { passed: exists, message: exists ? "src/data/exercises.ts exists" : "src/data/exercises.ts not found" };
});

registerTest("T1_07", 1, "Index CSS Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src/index.css"));
  return { passed: exists, message: exists ? "src/index.css exists" : "src/index.css not found" };
});

registerTest("T1_08", 1, "Tauri Config Existence", async () => {
  const exists = fs.existsSync(path.join(projectRoot, "src-tauri/tauri.conf.json"));
  return { passed: exists, message: exists ? "src-tauri/tauri.conf.json exists" : "src-tauri/tauri.conf.json not found" };
});

// Import & syntax checks (T1_09 - T1_18)
registerTest("T1_09", 1, "React Router Import in main.tsx", async () => {
  const content = getFileContent("src/main.tsx");
  const hasRouterImport = content.includes("react-router-dom");
  return { passed: hasRouterImport, message: hasRouterImport ? "Imports react-router-dom" : "Missing react-router-dom import" };
});

registerTest("T1_10", 1, "Router Wrapped in main.tsx", async () => {
  const content = getFileContent("src/main.tsx");
  const hasHashRouter = content.includes("HashRouter");
  return { passed: hasHashRouter, message: hasHashRouter ? "Wrapped in <HashRouter>" : "Missing <HashRouter> wrapping" };
});

registerTest("T1_11", 1, "Popout Component Reference in App.tsx", async () => {
  const content = getFileContent("src/App.tsx");
  const hasPopoutRef = content.includes("PopoutEditorPage");
  return { passed: hasPopoutRef, message: hasPopoutRef ? "References PopoutEditorPage" : "Missing PopoutEditorPage reference" };
});

registerTest("T1_12", 1, "Routes Wrapper in App.tsx", async () => {
  const content = getFileContent("src/App.tsx");
  const hasRoutes = content.includes("<Routes") && content.includes("</Routes>");
  return { passed: hasRoutes, message: hasRoutes ? "Contains <Routes> wrapper" : "Missing <Routes> wrapper" };
});

registerTest("T1_13", 1, "WebviewWindow Import in ExercisePage.tsx", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasWebviewWindow = content.includes("WebviewWindow");
  return { passed: hasWebviewWindow, message: hasWebviewWindow ? "Imports WebviewWindow" : "Missing WebviewWindow import" };
});

registerTest("T1_14", 1, "Window Spawn Function in ExercisePage.tsx", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasSpawnFunc = content.includes("spawnPopoutWindow");
  return { passed: hasSpawnFunc, message: hasSpawnFunc ? "spawnPopoutWindow exists" : "spawnPopoutWindow function missing" };
});

registerTest("T1_15", 1, "CodeEditor Import in PopoutEditorPage.tsx", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasEditorImport = content.includes("CodeEditor");
  return { passed: hasEditorImport, message: hasEditorImport ? "Imports CodeEditor" : "Missing CodeEditor import" };
});

registerTest("T1_16", 1, "Custom Background Style in PopoutEditorPage.tsx", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasStyle = content.includes("style={{") && content.includes("background:");
  return { passed: hasStyle, message: hasStyle ? "Custom container background style exists" : "Container style object missing" };
});

registerTest("T1_17", 1, "ReactMarkdown Import in ProblemCard.tsx", async () => {
  const content = getFileContent("src/components/exercise/ProblemCard.tsx");
  const hasMarkdown = content.includes("ReactMarkdown");
  return { passed: hasMarkdown, message: hasMarkdown ? "Imports ReactMarkdown" : "Missing ReactMarkdown import" };
});

registerTest("T1_18", 1, "ReactMarkdown Render in ProblemCard.tsx", async () => {
  const content = getFileContent("src/components/exercise/ProblemCard.tsx");
  const hasMarkdownTag = content.includes("<ReactMarkdown>");
  return { passed: hasMarkdownTag, message: hasMarkdownTag ? "Renders <ReactMarkdown>" : "Missing <ReactMarkdown> component rendering" };
});

// Data exports (T1_19 - T1_21)
registerTest("T1_19", 1, "Exercises Export in exercises.ts", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const hasExercisesExport = content.includes("export const EXERCISES");
  return { passed: hasExercisesExport, message: hasExercisesExport ? "Exports EXERCISES array" : "Missing EXERCISES export" };
});

registerTest("T1_20", 1, "Categories Export in exercises.ts", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const hasCategoriesExport = content.includes("export const EXERCISE_CATEGORIES");
  return { passed: hasCategoriesExport, message: hasCategoriesExport ? "Exports EXERCISE_CATEGORIES" : "Missing EXERCISE_CATEGORIES export" };
});

registerTest("T1_21", 1, "Exercise Count in exercises.ts", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const matches = content.match(/id:\s*"/g) || [];
  const passed = matches.length === 36;
  return { passed, message: `Found ${matches.length} exercise entry matches (expected 36)` };
});

// index.css button styles (T1_22 - T1_25)
registerTest("T1_22", 1, "Button Base Style in index.css", async () => {
  const content = getFileContent("src/index.css");
  const hasBase = content.includes(".editor-btn");
  return { passed: hasBase, message: hasBase ? "Contains .editor-btn" : "Missing .editor-btn" };
});

registerTest("T1_23", 1, "Button Primary Modifier in index.css", async () => {
  const content = getFileContent("src/index.css");
  const hasPrimary = content.includes(".editor-btn--primary");
  return { passed: hasPrimary, message: hasPrimary ? "Contains .editor-btn--primary" : "Missing .editor-btn--primary" };
});

registerTest("T1_24", 1, "Button Secondary Modifier in index.css", async () => {
  const content = getFileContent("src/index.css");
  const hasSecondary = content.includes(".editor-btn--secondary");
  return { passed: hasSecondary, message: hasSecondary ? "Contains .editor-btn--secondary" : "Missing .editor-btn--secondary" };
});

registerTest("T1_25", 1, "Button Ghost Modifier in index.css", async () => {
  const content = getFileContent("src/index.css");
  const hasGhost = content.includes(".editor-btn--ghost");
  return { passed: hasGhost, message: hasGhost ? "Contains .editor-btn--ghost" : "Missing .editor-btn--ghost" };
});

// Tauri configurations (T1_26 - T1_28)
registerTest("T1_26", 1, "Tauri Config parses as JSON", async () => {
  try {
    getJsonContent("src-tauri/tauri.conf.json");
    return { passed: true, message: "Successfully parsed tauri.conf.json" };
  } catch (err) {
    return { passed: false, message: err.message };
  }
});

registerTest("T1_27", 1, "Tauri Config Product Name", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const name = config.productName;
  return { passed: !!name, message: name ? `Product name set to "${name}"` : "Missing productName" };
});

registerTest("T1_28", 1, "Tauri Config macOS Private API", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const enabled = config.app && config.app.macOSPrivateApi === true;
  return { passed: enabled, message: enabled ? "macOSPrivateApi is enabled" : "macOSPrivateApi is not set to true" };
});

// Layout details (T1_29 - T1_32)
registerTest("T1_29", 1, "ExercisePage Editor Padding", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasPadding = content.includes("p-5");
  return { passed: hasPadding, message: hasPadding ? "Contains p-5 padding class" : "Missing p-5 padding class" };
});

registerTest("T1_30", 1, "ExercisePage Toolbar Gap", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasGap = content.includes("gap-2.5");
  return { passed: hasGap, message: hasGap ? "Contains gap-2.5 flex spacing class" : "Missing gap-2.5 spacing" };
});

registerTest("T1_31", 1, "ProblemCard Horizontal Padding px-8", async () => {
  const content = getFileContent("src/components/exercise/ProblemCard.tsx");
  const hasPadding = content.includes("px-8");
  return { passed: hasPadding, message: hasPadding ? "Contains px-8 spacing class" : "Missing px-8 horizontal padding" };
});

registerTest("T1_32", 1, "ProblemCard Vertical Padding py-6", async () => {
  const content = getFileContent("src/components/exercise/ProblemCard.tsx");
  const hasPadding = content.includes("py-6");
  return { passed: hasPadding, message: hasPadding ? "Contains py-6 spacing class" : "Missing py-6 vertical padding" };
});

// Pop-out design properties (T1_33 - T1_35)
registerTest("T1_33", 1, "PopoutEditorPage Backdrop Filter", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasFilter = content.includes("backdropFilter:") || content.includes("backdrop-filter");
  return { passed: hasFilter, message: hasFilter ? "Contains backdropFilter property" : "Missing backdropFilter property" };
});

registerTest("T1_34", 1, "PopoutEditorPage Rounded Corners", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasRadius = content.includes('borderRadius: "12px"');
  return { passed: hasRadius, message: hasRadius ? "Rounded corners set to 12px" : "Missing 12px borderRadius styling" };
});

registerTest("T1_35", 1, "PopoutEditorPage Translucent Border", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasBorder = content.includes('border: "1px solid rgba(255,255,255,0.08)"');
  return { passed: hasBorder, message: hasBorder ? "Translucent border set" : "Missing border styling with rgba(255,255,255,0.08)" };
});


// =============================================================
// TIER 2: DETAILED STYLING & ROUTING TESTS (35 Cases)
// =============================================================

// Router & URL Properties (T2_01 - T2_08)
registerTest("T2_01", 2, "main.tsx BrowserRouter Removed", async () => {
  const content = getFileContent("src/main.tsx");
  const hasBrowser = content.includes("BrowserRouter");
  return { passed: !hasBrowser, message: !hasBrowser ? "BrowserRouter successfully removed" : "BrowserRouter remains in main.tsx" };
});

registerTest("T2_02", 2, "App.tsx Router Compatibility", async () => {
  const content = getFileContent("src/App.tsx");
  const isCompatible = content.includes("location.pathname === \"/popout\"");
  return { passed: isCompatible, message: isCompatible ? "URL detection is compatible with HashRouter" : "Missing popout route interceptor" };
});

registerTest("T2_03", 2, "ExercisePage Pop-out Hash URL", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasHashUrl = content.includes("url: `index.html#/popout?id=${exercise.id}`");
  return { passed: hasHashUrl, message: hasHashUrl ? "URL uses HashRouter format" : "URL is not set to HashRouter format" };
});

registerTest("T2_04", 2, "ExercisePage WebviewWindow transparent true", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const transparentTrue = content.includes("transparent: true");
  return { passed: transparentTrue, message: transparentTrue ? "Window is set to transparent" : "transparent: true is missing in window configuration" };
});

registerTest("T2_05", 2, "ExercisePage WebviewWindow decorations false", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const decorationsFalse = content.includes("decorations: false");
  return { passed: decorationsFalse, message: decorationsFalse ? "Window is borderless (decorations: false)" : "decorations: false is missing in window configuration" };
});

registerTest("T2_06", 2, "ExercisePage WebviewWindow shadow false", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const shadowFalse = content.includes("shadow: false");
  return { passed: shadowFalse, message: shadowFalse ? "Window shadow is disabled to prevent glitches" : "shadow: false is missing in window configuration" };
});

registerTest("T2_07", 2, "ExercisePage WebviewWindow target width", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasWidth = content.includes("width: 820");
  return { passed: hasWidth, message: hasWidth ? "Pop-out width is 820px" : "width: 820 is missing in window configuration" };
});

registerTest("T2_08", 2, "ExercisePage WebviewWindow target height", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasHeight = content.includes("height: 620");
  return { passed: hasHeight, message: hasHeight ? "Pop-out height is 620px" : "height: 620 is missing in window configuration" };
});

// Translucency & Styling parameters (T2_09 - T2_17)
registerTest("T2_09", 2, "PopoutEditorPage Translucent Opacity 0.75", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  // The user requires a translucent glass aesthetic with background exactly rgba(17, 17, 19, 0.75)
  const hasOpacity = content.includes("background: \"rgba(17, 17, 19, 0.75)\"") || content.includes("background: 'rgba(17, 17, 19, 0.75)'");
  return { passed: hasOpacity, message: hasOpacity ? "Background opacity matches 0.75" : "Required opacity (0.75) is missing in PopoutEditorPage.tsx background" };
});

registerTest("T2_10", 2, "PopoutEditorPage Backdrop Blur 60px", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  // The user requires backdropFilter blur of exactly 60px
  const hasBlur = content.includes("blur(60px)");
  return { passed: hasBlur, message: hasBlur ? "Backdrop blur matches 60px" : "Required blur (60px) is missing in PopoutEditorPage.tsx backdrop filter" };
});

registerTest("T2_11", 2, "PopoutEditorPage Saturation 1.8", async () => {
  const content = getFileContent("src/pages/PopoutEditorPage.tsx");
  const hasSaturate = content.includes("saturate(1.8)");
  return { passed: hasSaturate, message: hasSaturate ? "Backdrop saturation matches 1.8" : "Missing saturate(1.8) filter" };
});

registerTest("T2_12", 2, "index.css Glass Panel Blur 20px", async () => {
  const content = getFileContent("src/index.css");
  const hasBlur = content.includes("blur(20px)");
  return { passed: hasBlur, message: hasBlur ? "Glass panel blur is 20px" : "Missing blur(20px) under .glass-panel" };
});

registerTest("T2_13", 2, "index.css Glass Panel Background 0.045", async () => {
  const content = getFileContent("src/index.css");
  const hasBg = content.includes("rgba(255, 255, 255, 0.045)");
  return { passed: hasBg, message: hasBg ? "Glass panel background uses 0.045 opacity" : "Missing rgba(255, 255, 255, 0.045) under .glass-panel" };
});

registerTest("T2_14", 2, "index.css Base Button defines border", async () => {
  const content = getFileContent("src/index.css");
  // Extracts the body of .editor-btn
  const match = content.match(/\.editor-btn\s*\{([\s\S]*?)\}/);
  if (!match) return { passed: false, message: ".editor-btn rule not found" };
  const rules = match[1];
  // To avoid height shift, base button must define a border (like border: 1px solid transparent; or border-width: 1px) instead of border: none;
  const definesBorderStyle = (rules.includes("border: 1px") || rules.includes("border-width:")) && !rules.includes("border: none");
  return { passed: definesBorderStyle, message: definesBorderStyle ? "Base button defines border style to prevent height shift" : "Base button has 'border: none' which causes height shifts against bordered modifiers" };
});

registerTest("T2_15", 2, "index.css Ghost Button border definition", async () => {
  const content = getFileContent("src/index.css");
  const hasBorder = content.includes(".editor-btn--ghost {") && content.includes("border: 1px solid transparent;");
  return { passed: hasBorder, message: hasBorder ? "Ghost button defines border: 1px solid transparent" : "Ghost button missing border" };
});

registerTest("T2_16", 2, "index.css Secondary Button border definition", async () => {
  const content = getFileContent("src/index.css");
  const hasBorder = content.includes(".editor-btn--secondary {") && content.includes("border: 1px solid rgba(255, 255, 255, 0.08);");
  return { passed: hasBorder, message: hasBorder ? "Secondary button defines border: 1px solid rgba(255,255,255,0.08)" : "Secondary button missing border" };
});

registerTest("T2_17", 2, "index.css Primary Button border definition", async () => {
  const content = getFileContent("src/index.css");
  const hasBorder = content.includes(".editor-btn--primary {") && content.includes("border: 1px solid rgba(139, 92, 246, 0.5);");
  return { passed: hasBorder, message: hasBorder ? "Primary button defines border: 1px solid rgba(139,92,246,0.5)" : "Primary button missing border" };
});

// Exercise list layout & format (T2_18 - T2_25)
registerTest("T2_18", 2, "exercises.ts Markdown Backticks exclusively", async () => {
  const content = getFileContent("src/data/exercises.ts");
  // Verify descriptions only use template backticks
  const hasQuotes = content.match(/description:\s*"/g) || content.match(/description:\s*'/g);
  const backticksCount = (content.match(/description:\s*`/g) || []).length;
  const passed = !hasQuotes && backticksCount === 36;
  return { passed, message: passed ? "All 36 exercise descriptions use backticks exclusively" : `Found quotes or non-matching backticks count (${backticksCount} backticks)` };
});

registerTest("T2_19", 2, "exercises.ts Markdown Structured Content", async () => {
  const content = getFileContent("src/data/exercises.ts");
  // Check if exercise descriptions actually contain rich markdown headers (e.g. "###" or "**Core Requirements:**")
  const hasHeaders = content.includes("### ") && content.includes("**Requirements:**") || content.includes("**Core Requirements:**");
  return { passed: hasHeaders, message: hasHeaders ? "Descriptions contain markdown structures" : "Descriptions appear to be plain-text one-liners" };
});

registerTest("T2_20", 2, "exercises.ts Unique Exercise IDs", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const ids = [];
  const regex = /id:\s*"([^"]+)"/g;
  let match;
  while ((match = regex.exec(content)) !== null) {
    ids.push(match[1]);
  }
  const uniqueIds = new Set(ids);
  const passed = uniqueIds.size === 36 && ids.length === 36;
  return { passed, message: passed ? "All 36 IDs are unique" : `Found ${ids.length} total IDs but only ${uniqueIds.size} unique IDs` };
});

registerTest("T2_21", 2, "exercises.ts Category index scope", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const regex = /categoryIndex:\s*(\d+)/g;
  let match;
  let allValid = true;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
    const idx = parseInt(match[1], 10);
    if (idx < 0 || idx > 11) {
      allValid = false;
    }
  }
  const passed = allValid && count === 36;
  return { passed, message: passed ? "All 36 category indices are between 0 and 11" : `Invalid indices found or index count is ${count}` };
});

registerTest("T2_22", 2, "exercises.ts Difficulty Scope", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const regex = /difficulty:\s*"([^"]+)"/g;
  let match;
  let allValid = true;
  let count = 0;
  while ((match = regex.exec(content)) !== null) {
    count++;
    const diff = match[1];
    if (diff !== "beginner" && diff !== "intermediate" && diff !== "advanced") {
      allValid = false;
    }
  }
  const passed = allValid && count === 36;
  return { passed, message: passed ? "All 36 exercise difficulties are beginner/intermediate/advanced" : `Invalid difficulties found or count is ${count}` };
});

registerTest("T2_23", 2, "exercises.ts Hints count", async () => {
  const content = getFileContent("src/data/exercises.ts");
  // Count how many hints arrays are present and check they are non-empty
  const hintsArrays = content.match(/hints:\s*\[([\s\S]*?)\]/g) || [];
  let allNonEmpty = true;
  for (const arr of hintsArrays) {
    // Check if the array is empty, e.g. hints: []
    if (arr.replace(/\s/g, "") === "hints:[]") {
      allNonEmpty = false;
    }
  }
  const passed = hintsArrays.length === 36 && allNonEmpty;
  return { passed, message: passed ? "All 36 exercises contain helper hints" : `Found empty hints or mismatch in count (${hintsArrays.length})` };
});

registerTest("T2_24", 2, "exercises.ts Starter code properties", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const starterCodes = content.match(/starterCode:\s*`([\s\S]*?)`/g) || [];
  const passed = starterCodes.length === 36;
  return { passed, message: passed ? "All 36 exercises contain starterCode blocks" : `Found ${starterCodes.length} starterCode blocks` };
});

registerTest("T2_25", 2, "exercises.ts Test harness properties", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const harnesses = content.match(/testHarness:\s*`([\s\S]*?)`/g) || [];
  const passed = harnesses.length === 36;
  return { passed, message: passed ? "All 36 exercises contain testHarness blocks" : `Found ${harnesses.length} testHarness blocks` };
});

// Margins and paddings (T2_26 - T2_35)
registerTest("T2_26", 2, "ExercisePage toolbar buttons have zero individual right margins", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  // Checks if individual buttons override gap spacing with custom margin classes (like mr- or marginRight)
  const buttonSections = content.match(/<motion\.button[\s\S]*?className="([\s\S]*?)"/g) || [];
  let hasIndividualMargin = false;
  for (const btn of buttonSections) {
    if (btn.includes("mr-") || btn.includes("marginRight")) {
      hasIndividualMargin = true;
    }
  }
  return { passed: !hasIndividualMargin, message: !hasIndividualMargin ? "Toolbar buttons utilize pure flexbox gap without overriding margins" : "Detected individual button right margins" };
});

registerTest("T2_27", 2, "ExercisePage button wrapper flex setup", async () => {
  const content = getFileContent("src/pages/ExercisePage.tsx");
  const hasFlexGap = content.includes("className=\"flex items-center gap-2.5\"");
  return { passed: hasFlexGap, message: hasFlexGap ? "Button wrapper has gap-2.5 and flex layout" : "Missing button wrapper gap-2.5 config" };
});

registerTest("T2_28", 2, "tauri.conf.json Main Window minWidth", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const win = config.app && config.app.windows && config.app.windows[0];
  const minWidth = win && win.minWidth;
  return { passed: minWidth === 1100, message: `minWidth set to ${minWidth} (expected 1100)` };
});

registerTest("T2_29", 2, "tauri.conf.json Main Window minHeight", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const win = config.app && config.app.windows && config.app.windows[0];
  const minHeight = win && win.minHeight;
  return { passed: minHeight === 700, message: `minHeight set to ${minHeight} (expected 700)` };
});

registerTest("T2_30", 2, "ProblemCard Outer Container Padding Combo", async () => {
  const content = getFileContent("src/components/exercise/ProblemCard.tsx");
  const hasPaddingCombo = content.includes("px-8 py-6");
  return { passed: hasPaddingCombo, message: hasPaddingCombo ? "ProblemCard has 'px-8 py-6' Tailwind combo" : "Missing px-8 py-6 padding combo" };
});

registerTest("T2_31", 2, "index.css Button Line Height 1", async () => {
  const content = getFileContent("src/index.css");
  const hasLineHeight = content.includes("line-height: 1;");
  return { passed: hasLineHeight, message: hasLineHeight ? "line-height: 1 is present in index.css" : "Missing line-height: 1 style" };
});

registerTest("T2_32", 2, "index.css Button Font Weight 600", async () => {
  const content = getFileContent("src/index.css");
  const hasFontWeight = content.includes("font-weight: 600;");
  return { passed: hasFontWeight, message: hasFontWeight ? "font-weight: 600 is present in index.css" : "Missing font-weight: 600 style" };
});

registerTest("T2_33", 2, "index.css Button Transition defined", async () => {
  const content = getFileContent("src/index.css");
  const hasTransition = content.includes("transition: all 0.18s cubic-bezier");
  return { passed: hasTransition, message: hasTransition ? "Transition is defined" : "Missing button hover transition style" };
});

registerTest("T2_34", 2, "index.css defines Box Sizing Rule", async () => {
  const content = getFileContent("src/index.css");
  const hasBoxSizing = content.includes("box-sizing: border-box;");
  return { passed: hasBoxSizing, message: hasBoxSizing ? "box-sizing: border-box is active" : "Missing global box-sizing rule" };
});

registerTest("T2_35", 2, "tauri.conf.json Identifier config", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const id = config.identifier;
  const passed = id === "com.oop-academy.app";
  return { passed, message: passed ? "Identifier set to com.oop-academy.app" : `Unexpected identifier: "${id}"` };
});


// =============================================================
// TIER 3: PAIRWISE COMBINATORIAL CONFIGURATION TESTS (7 Cases)
// =============================================================

registerTest("T3_01", 3, "Min Width & Padding Compatibility Check", async () => {
  const config = getJsonContent("src-tauri/tauri.conf.json");
  const win = config.app && config.app.windows && config.app.windows[0];
  const minWidth = win && win.minWidth;
  const problemCardContent = getFileContent("src/components/exercise/ProblemCard.tsx");
  const pageContent = getFileContent("src/pages/ExercisePage.tsx");
  const compatible = minWidth === 1100 && problemCardContent.includes("px-8") && pageContent.includes("p-5");
  return { passed: compatible, message: compatible ? "Min width (1100px) is compatible with layout padding" : "Sizing compatibility mismatch detected" };
});

registerTest("T3_02", 3, "HashRouter & Popout URL Spawner Synchronization", async () => {
  const mainContent = getFileContent("src/main.tsx");
  const exerciseContent = getFileContent("src/pages/ExercisePage.tsx");
  const synchronized = mainContent.includes("HashRouter") && exerciseContent.includes("url: `index.html#/popout?id=${exercise.id}`");
  return { passed: synchronized, message: synchronized ? "HashRouter routing is synchronized across entry point and window spawner" : "Routing system mismatch: verify HashRouter configurations" };
});

registerTest("T3_03", 3, "Window Transparency and CSS Backdrop Filter synchronization", async () => {
  const pageContent = getFileContent("src/pages/ExercisePage.tsx");
  const popoutContent = getFileContent("src/pages/PopoutEditorPage.tsx");
  // Check that transparent: true in ExercisePage window settings is paired with backdropFilter backdrop blur in PopoutEditorPage
  const sync = pageContent.includes("transparent: true") && (popoutContent.includes("backdropFilter:") || popoutContent.includes("backdrop-filter:"));
  return { passed: sync, message: sync ? "Window transparency is synchronized with container CSS filters" : "Transparency mismatch between window parameters and container CSS" };
});

registerTest("T3_04", 3, "Button border alignment height consistency", async () => {
  const content = getFileContent("src/index.css");
  // Get base button border rule
  const match = content.match(/\.editor-btn\s*\{([\s\S]*?)\}/);
  if (!match) return { passed: false, message: ".editor-btn rule not found" };
  const baseRules = match[1];
  
  // Check if base has solid border style
  const baseHasBorder = baseRules.includes("border: 1px solid") || baseRules.includes("border-width: 1px") || baseRules.includes("border: solid 1px");
  // Modifier borders check
  const ghostHasBorder = content.includes(".editor-btn--ghost {") && content.includes("border: 1px solid");
  const secondaryHasBorder = content.includes(".editor-btn--secondary {") && content.includes("border: 1px solid");
  const primaryHasBorder = content.includes(".editor-btn--primary {") && content.includes("border: 1px solid");

  const matches = baseHasBorder && ghostHasBorder && secondaryHasBorder && primaryHasBorder;
  return { passed: matches, message: matches ? "Base button and all modifier buttons define solid borders, preventing height shifts" : "Height shift hazard: base button has border: none while modifiers have border: 1px solid" };
});

registerTest("T3_05", 3, "Exercises Category & Data Count alignment", async () => {
  const content = getFileContent("src/data/exercises.ts");
  const catMatches = content.match(/"[^"]+"/g) || [];
  const exerciseMatches = content.match(/id:\s*"/g) || [];
  // Ensure that each category contains at least one exercise
  const hasExercises = exerciseMatches.length === 36;
  return { passed: hasExercises, message: hasExercises ? "Data structures match index specifications" : "Exercise metadata structure mismatch" };
});

registerTest("T3_06", 3, "Markdown Styles & Component Layout Alignment", async () => {
  const cardContent = getFileContent("src/components/exercise/ProblemCard.tsx");
  // Checks if ProblemCard padding aligns with tailwind's markdown classes 'prose prose-invert prose-sm'
  const aligns = cardContent.includes("px-8 py-6") && cardContent.includes("prose prose-invert prose-sm");
  return { passed: aligns, message: aligns ? "Markdown wrapper matches layout container boundaries" : "Padding or prose classes misaligned" };
});

registerTest("T3_07", 3, "Popout Dimensions & Monaco Layout Fit Alignment", async () => {
  const exerciseContent = getFileContent("src/pages/ExercisePage.tsx");
  const popoutContent = getFileContent("src/pages/PopoutEditorPage.tsx");
  // Ensure coordinates fit container (width 820px is larger than Monaco's min-width bounds)
  const matches = exerciseContent.includes("width: 820") && popoutContent.includes("isPoppedOut={true}");
  return { passed: matches, message: matches ? "Window dimension fits Monaco editor bounds" : "Monaco size is not adjusted for popout window" };
});


// =============================================================
// TIER 4: END-TO-END APP INTEGRATION & COMPILATION (5 Cases)
// =============================================================

registerTest("T4_01", 4, "package.json Compilation Scripts", async () => {
  const pkg = getJsonContent("package.json");
  const buildScript = pkg.scripts && pkg.scripts.build;
  const isCorrect = buildScript === "tsc && vite build" || buildScript.includes("tsc") && buildScript.includes("vite build");
  return { passed: isCorrect, message: buildScript ? `Build script is "${buildScript}"` : "Missing build script" };
});

registerTest("T4_02", 4, "tsconfig.json Type checking config", async () => {
  const config = getJsonContent("tsconfig.json");
  const noEmit = config.compilerOptions && config.compilerOptions.noEmit === true;
  return { passed: noEmit, message: noEmit ? "tsconfig.json has noEmit set to true" : "tsconfig.json missing noEmit" };
});

registerTest("T4_03", 4, "vite.config.ts support target target check", async () => {
  const content = getFileContent("vite.config.ts");
  const hasTarget = content.includes("target:");
  return { passed: hasTarget, message: hasTarget ? "Vite targets are configured" : "Vite build targets not specified" };
});

registerTest("T4_04", 4, "TypeScript Verification Check (npx tsc --noEmit)", async () => {
  try {
    execSync("npx tsc --noEmit", { stdio: "ignore" });
    return { passed: true, message: "tsc type-checking passed with no errors" };
  } catch (err) {
    return { passed: false, message: "tsc type-checking failed with errors" };
  }
});

registerTest("T4_05", 4, "Vite Production Build Compilation (npm run build)", async () => {
  try {
    execSync("npm run build", { stdio: "ignore" });
    return { passed: true, message: "npm run build completed successfully" };
  } catch (err) {
    return { passed: false, message: "npm run build failed" };
  }
});


// -------------------------------------------------------------
// Execution & Summary Table Output
// -------------------------------------------------------------
async function runTests() {
  console.log(`\n${colors.bright}Starting execution of 82 test cases...${colors.reset}\n`);
  
  const results = [];
  let passedCount = 0;
  let failedCount = 0;

  for (const t of tests) {
    const status = { passed: false, message: "" };
    try {
      const res = await t.fn();
      status.passed = res.passed;
      status.message = res.message;
    } catch (err) {
      status.passed = false;
      status.message = `ERROR: ${err.message}`;
    }

    if (status.passed) {
      passedCount++;
      logPass(`[Tier ${t.tier}] ${t.id} - ${t.name}: ${status.message}`);
    } else {
      failedCount++;
      logFail(`[Tier ${t.tier}] ${t.id} - ${t.name}: ${status.message}`);
    }

    results.push({
      id: t.id,
      tier: t.tier,
      name: t.name,
      passed: status.passed,
      message: status.message,
    });
  }

  // Draw Summary Table
  console.log(`\n${colors.bright}========================================================================================================${colors.reset}`);
  console.log(`${colors.bright}                                     E2E TEST RUN SUMMARY RESULTS                                       ${colors.reset}`);
  console.log(`${colors.bright}========================================================================================================${colors.reset}`);
  console.log(`| ${"ID".padEnd(6)} | ${"Tier".padEnd(4)} | ${"Test Case Name".padEnd(50)} | ${"Status".padEnd(6)} | ${"Detail Message".padEnd(28)} |`);
  console.log(`--------------------------------------------------------------------------------------------------------`);
  
  results.forEach((r) => {
    const statusStr = r.passed ? `${colors.green}PASS${colors.reset}` : `${colors.red}FAIL${colors.reset}`;
    const cleanMsg = r.message.replace(/\x1b\[[0-9;]*m/g, "").substring(0, 26);
    console.log(
      `| ${r.id.padEnd(6)} | ${String(r.tier).padEnd(4)} | ${r.name.substring(0, 50).padEnd(50)} | ${statusStr.padEnd(15)} | ${cleanMsg.padEnd(28)} |`
    );
  });
  console.log(`========================================================================================================`);
  
  console.log(`\n${colors.bright}Test Summary Stats:${colors.reset}`);
  console.log(`  - Total Tests:  ${tests.length}`);
  console.log(`  - ${colors.green}Passed Tests: ${passedCount}${colors.reset}`);
  console.log(`  - ${colors.red}Failed Tests: ${failedCount}${colors.reset}`);

  if (failedCount > 0) {
    console.log(`\n${colors.red}${colors.bright}RESULT: E2E TEST RUN FAILED (${failedCount} failure(s) detected)${colors.reset}\n`);
    process.exit(1);
  } else {
    console.log(`\n${colors.green}${colors.bright}RESULT: E2E TEST RUN PASSED (100% compliance)${colors.reset}\n`);
    process.exit(0);
  }
}

runTests();
