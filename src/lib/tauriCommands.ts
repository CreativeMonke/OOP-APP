import { invoke } from "@tauri-apps/api/core";
import type { Course, ProgressData, RunResult } from "@/types";

export async function parseCourses(): Promise<Course[]> {
  try {
    return await invoke<Course[]>("parse_courses");
  } catch {
    return [];
  }
}

export async function runCode(
  userCode: string,
  testHarness: string
): Promise<RunResult> {
  return await invoke<RunResult>("run_code", {
    userCode,
    testHarness,
  });
}

export async function saveProgress(progress: ProgressData): Promise<void> {
  try {
    await invoke("save_progress", { progress });
  } catch {
    // best-effort persistence
  }
}

export async function loadProgress(): Promise<ProgressData> {
  try {
    return await invoke<ProgressData>("load_progress");
  } catch {
    return { completed_concepts: [], passed_exercises: [], quiz_scores: [] };
  }
}
