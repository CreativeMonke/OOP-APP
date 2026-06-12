import { create } from "zustand";
import { loadProgress, saveProgress } from "@/lib/tauriCommands";

interface ProgressState {
  completedConcepts: Set<string>;
  passedExercises: Set<string>;
  quizScores: Map<string, number>;
  initialized: boolean;
  init: () => Promise<void>;
  markConceptComplete: (conceptKey: string) => void;
  markExercisePassed: (exerciseId: string) => void;
  setQuizScore: (conceptKey: string, score: number) => void;
  isConceptComplete: (conceptKey: string) => boolean;
  isExercisePassed: (exerciseId: string) => boolean;
  completedCount: () => number;
  passedCount: () => number;
}

export const useProgressStore = create<ProgressState>((set, get) => ({
  completedConcepts: new Set(),
  passedExercises: new Set(),
  quizScores: new Map(),
  initialized: false,

  init: async () => {
    if (get().initialized) return;
    const data = await loadProgress();
    set({
      completedConcepts: new Set(data.completed_concepts),
      passedExercises: new Set(data.passed_exercises),
      quizScores: new Map(data.quiz_scores),
      initialized: true,
    });
  },

  markConceptComplete: (key) => {
    const next = new Set(get().completedConcepts).add(key);
    set({ completedConcepts: next });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
  },

  markExercisePassed: (id) => {
    const next = new Set(get().passedExercises).add(id);
    set({ passedExercises: next });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
  },

  setQuizScore: (key, score) => {
    const next = new Map(get().quizScores).set(key, score);
    set({ quizScores: next });
    const state = get();
    saveProgress({
      completed_concepts: [...state.completedConcepts],
      passed_exercises: [...state.passedExercises],
      quiz_scores: [...state.quizScores.entries()],
    });
  },

  isConceptComplete: (key) => get().completedConcepts.has(key),
  isExercisePassed: (id) => get().passedExercises.has(id),
  completedCount: () => get().completedConcepts.size,
  passedCount: () => get().passedExercises.size,
}));
