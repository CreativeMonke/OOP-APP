export interface CodeExample {
  title: string;
  code: string;
}

export interface Concept {
  name: string;
  explanation: string;
  code_examples: CodeExample[];
  /** Curated fill-in-the-blank exercise; falls back to a generic one if absent */
  fill_in?: {
    starter_code: string;
    test_harness: string;
  };
}

export interface Course {
  id: number;
  title: string;
  concepts: Concept[];
}

export interface RunResult {
  compiled: boolean;
  passed: boolean;
  stdout: string;
  stderr: string;
}

export interface ProgressData {
  completed_concepts: string[];
  passed_exercises: string[];
  quiz_scores: [string, number][];
}

export type AppMode = "learn" | "exercise" | "overview";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Exercise {
  id: string;
  categoryIndex: number;
  difficulty: Difficulty;
  title: string;
  description: string;
  starterCode: string;
  testHarness: string;
  hints: string[];
}
