import { create } from "zustand";
import type { AppMode, Course } from "@/types";

interface AppState {
  mode: AppMode;
  sidebarOpen: boolean;
  courses: Course[];
  coursesLoading: boolean;
  activeCourseId: number;
  activeConceptIndex: number;
  activeExerciseId: string | null;
  setMode: (mode: AppMode) => void;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  setCourses: (courses: Course[]) => void;
  setCoursesLoading: (loading: boolean) => void;
  setActiveCourse: (id: number) => void;
  setActiveConceptIndex: (index: number) => void;
  setActiveExerciseId: (id: string | null) => void;
}

export const useAppStore = create<AppState>((set) => ({
  mode: "learn",
  sidebarOpen: true,
  courses: [],
  coursesLoading: true,
  activeCourseId: 1,
  activeConceptIndex: 0,
  activeExerciseId: null,

  setMode: (mode) => set({ mode }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setCourses: (courses) => set({ courses }),
  setCoursesLoading: (loading) => set({ coursesLoading: loading }),
  setActiveCourse: (id) => set({ activeCourseId: id, activeConceptIndex: 0 }),
  setActiveConceptIndex: (index) => set({ activeConceptIndex: index }),
  setActiveExerciseId: (id) => set({ activeExerciseId: id }),
}));
