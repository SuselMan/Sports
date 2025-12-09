import { Muscles, PaginationRequestData, PaginationResponseData, ISODateString } from './Shared.model';

export type ExerciseType = 'REPS' | 'TIME';

export type Exercise = {
    id: string, // uuid
    userId: string, // owner user id
    name: string, // MAX 100 SYMBOLS 
    type: ExerciseType,
    muscles: Muscles[] // list of muscles codes
};

export type ExerciseResponse = Exercise;

export type ExerciseListResponse = {
    list: ExerciseResponse[],
    pagination: PaginationResponseData,
};

type ExerciseRecordBase = {
    id: string,
    userId: string,
    exerciseId: string, // Exercise Id
    date: ISODateString,
    note?: string, // MAX 300 symbols;
    weight?: number, // weight in kg; default value is current user weight;
    rpe?: number,
    restSec?: number,
    trainingId: string, // Training Id
};

export type RepsExerciseRecord = ExerciseRecordBase & {
    kind: 'REPS',
    repsAmount: number, // integer
    durationMs?: never,
};

export type TimeExerciseRecord = ExerciseRecordBase & {
    kind: 'TIME',
    durationMs: number, // duration in ms
    repsAmount?: never,
};

export type ExerciseRecord = RepsExerciseRecord | TimeExerciseRecord;

export type ExerciseRecordResponse = ExerciseRecord & {
    exercise: Exercise,
};

export type ExerciseRecordsListRequest = {
    filters?: {
        dateFrom?: ISODateString;
        dateTo?: ISODateString;
        timeFrom?: string // hh:mm:ss;
        timeTo?: string // hh:mm:ss;
        muscles?: Muscles[],
        exerciseIds?: string[], // Exercise IDs
    },
    pagination: PaginationRequestData,
};

export type ExerciseRecordsListResponse = {
    list: ExerciseRecordResponse[],
    pagination: PaginationResponseData
};


