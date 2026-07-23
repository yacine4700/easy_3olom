// Exercise Collection (exercise_collections table)
export interface ExerciseCollection {
  id: string;
  title: string;
  collectionType: string | null;
  year: number | null;
  unit: string | null;
  pdfFileId: string | null;
  createdAt: string | null;
}

// Exercise (exercises table)
export interface ExercisePart {
  part: number;
  context: string;
  documents: string[];
  questions: ExerciseQuestion[];
}

export interface ExerciseQuestion {
  id: string;
  question: string;
  answer: string;
  hint: string;
  rubric: string[];
}

export interface ExerciseJson {
  context: string;
  parts: ExercisePart[];
}

export interface Exercise {
  id: string;
  exerciseMode: string | null;
  exerciseJson: ExerciseJson | null;
  collectionId: string | null;
  exerciseNumber: number | null;
  mainConcept: string | null;
  difficulty: string | null;
  isBacBased: boolean | null;
  createdAt: string | null;
  updatedAt: string | null;
}
