import { create } from "zustand";
import { loadProgress, saveProgress } from "@/lib/tauriCommands";

export interface RecentAction {
  type: "concept" | "exercise" | "quiz";
  label: string;
  timestamp: number;
}

const META_KEY = "opencode_meta";

interface MetaData {
  recentActions: RecentAction[];
  exerciseAttempts: [string, number][];
  lastActiveDate: string | null;
}

function defaultMeta(): MetaData {
  return { recentActions: [], exerciseAttempts: [], lastActiveDate: null };
}

function loadMeta(): MetaData {
  try {
    const raw = localStorage.getItem(META_KEY);
    if (!raw) return defaultMeta();
    return JSON.parse(raw) as MetaData;
  } catch {
    return defaultMeta();
  }
}

function saveMeta(m: MetaData) {
  localStorage.setItem(META_KEY, JSON.stringify(m));
}

interface ProgressState {
  completedConcepts: Set<string>;
  passedExercises: Set<string>;
  quizScores: Map<string, number>;
  recentActions: RecentAction[];
  exerciseAttempts: Map<string, number>;
  lastActiveDate: string | null;
  initialized: boolean;
  init: () => Promise<void>;
  markConceptComplete: (conceptKey: string, label?: string) => void;
  markExercisePassed: (exerciseId: string) => void;
  recordExerciseAttempt: (exerciseId: string) => void;
  setQuizScore: (conceptKey: string, score: number) => void;
  isConceptComplete: (conceptKey: string) => boolean;
  isExercisePassed: (exerciseId: string) => boolean;
  completedCount: () => number;
  passedCount: () => number;
}

function pushAction(actions: RecentAction[], action: RecentAction): RecentAction[] {
  return [action, ...actions].slice(0, 20);
}

function updateStreak(lastActiveDate: string | null): string | null {
  const today = new Date().toISOString().split("T")[0];
  if (lastActiveDate === today) return today;
  return today;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedConcepts: new Set(),
  passedExercises: new Set(),
  quizScores: new Map(),
  recentActions: [],
  exerciseAttempts: new Map(),
  lastActiveDate: null,
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    const data = await loadProgress();
    const meta = loadMeta();
    set({
      completedConcepts: new Set(data.completed_concepts),
      passedExercises: new Set(data.passed_exercises),
      quizScores: new Map(data.quiz_scores),
      recentActions: meta.recentActions,
      exerciseAttempts: new Map(meta.exerciseAttempts),
      lastActiveDate: meta.lastActiveDate,
      initialized: true,
    });
  },

  markConceptComplete: (key, label) => {
    const next = new Set(get().completedConcepts).add(key);
    const lastActiveDate = updateStreak(get().lastActiveDate);
    const recentActions = pushAction(get().recentActions, {
      type: "concept",
      label: label ?? `Concept ${key} completed`,
      timestamp: Date.now(),
    });
    set({ completedConcepts: next, recentActions, lastActiveDate });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
    saveMeta({
      recentActions,
      exerciseAttempts: [...state.exerciseAttempts.entries()],
      lastActiveDate,
    });
  },

  markExercisePassed: (id) => {
    const next = new Set(get().passedExercises).add(id);
    const lastActiveDate = updateStreak(get().lastActiveDate);
    const recentActions = pushAction(get().recentActions, {
      type: "exercise",
      label: `Exercise "${id}" passed`,
      timestamp: Date.now(),
    });
    const attempts = new Map(get().exerciseAttempts);
    attempts.set(id, (attempts.get(id) ?? 0) + 1);
    set({ passedExercises: next, recentActions, lastActiveDate, exerciseAttempts: attempts });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
    saveMeta({
      recentActions,
      exerciseAttempts: [...state.exerciseAttempts.entries()],
      lastActiveDate,
    });
  },

  recordExerciseAttempt: (id) => {
    const attempts = new Map(get().exerciseAttempts);
    attempts.set(id, (attempts.get(id) ?? 0) + 1);
    set({ exerciseAttempts: attempts });
    const state = get();
    saveMeta({
      recentActions: state.recentActions,
      exerciseAttempts: [...attempts.entries()],
      lastActiveDate: state.lastActiveDate,
    });
  },

  setQuizScore: (key, score) => {
    const next = new Map(get().quizScores).set(key, score);
    const lastActiveDate = updateStreak(get().lastActiveDate);
    const recentActions = pushAction(get().recentActions, {
      type: "quiz",
      label: score >= 80 ? `Quiz aced on concept ${key}` : `Quiz score: ${score}% on concept ${key}`,
      timestamp: Date.now(),
    });
    set({ quizScores: next, recentActions, lastActiveDate });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
    saveMeta({
      recentActions,
      exerciseAttempts: [...state.exerciseAttempts.entries()],
      lastActiveDate,
    });
  },

  isConceptComplete: (key) => get().completedConcepts.has(key),
  isExercisePassed: (id) => get().passedExercises.has(id),
  completedCount: () => get().completedConcepts.size,
  passedCount: () => get().passedExercises.size,
}));
