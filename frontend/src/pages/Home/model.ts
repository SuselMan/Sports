export type Exercise = { _id: string; name: string; type: 'REPS' | 'TIME'; muscles: string[] };

export type ExerciseRecord = {
  _id: string;
  kind: 'REPS' | 'TIME';
  exerciseId: string;
  exercise?: Exercise;
  repsAmount?: number;
  durationMs?: number;
  date: string;
  note?: string;
  weight?: number;
};

export type RecordGroup = {
  exercise?: Exercise;
  records: ExerciseRecord[];
};


