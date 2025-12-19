import {
  Muscles,
  PaginationRequestData,
  PaginationResponseData,
  ISODateString,
  SyncMetaData,
} from './Shared.model';

export type ExerciseType = 'REPS' | 'TIME';

export type Exercise = SyncMetaData & {
    _id: string, // client-visible id (stored as ObjectId in Mongo)
    name: string, // MAX 100 SYMBOLS 
    type: ExerciseType,
    muscles: Muscles[] // list of muscles codes
};

export type ExerciseResponse = Exercise;

export type ExerciseCreateRequest = {
    _id?: string; // optional client-generated id (ObjectId hex string)
    name: string;
    type: ExerciseType;
    muscles: Muscles[];
};

export type ExerciseUpdateRequest = {
    name?: string;
    type?: ExerciseType;
    muscles?: Muscles[];
};

export type ExerciseListRequest = {
    filters?: {
        archived?: boolean; // if true, include archived items in response
        updatedAfter?: ISODateString; // incremental sync
    };
    pagination: PaginationRequestData;
};

export type ExerciseListResponse = {
    list: ExerciseResponse[],
    pagination: PaginationResponseData,
};

type ExerciseRecordBase = SyncMetaData & {
    _id: string;
    kind: ExerciseType,
    exerciseId: string,
    exercise?: Exercise,
    repsAmount?: number,
    durationMs?: number,
    date: string,
    note?: string,
    weight?: number,
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

export type ExerciseRecordGroup = {
    exercise: Exercise,
    records: ExerciseRecord[],
}

export type ExerciseRecordResponse = ExerciseRecord & {
    exercise: Exercise,
};

export type ExerciseRecordCreateRequest = {
    _id?: string; // optional client-generated id (ObjectId hex string)
    kind: ExerciseType;
    repsAmount?: number;
    durationMs?: number;
    date: ISODateString;
    note?: string;
    weight?: number;
    rpe?: number;
    restSec?: number;
};

export type ExerciseRecordUpdateRequest = {
    exerciseId?: string;
    kind: ExerciseType;
    repsAmount?: number;
    durationMs?: number;
    date: ISODateString;
    note?: string;
    weight?: number;
    rpe?: number;
    restSec?: number;
};

export type ExerciseRecordsListRequest = {
    filters?: {
        dateFrom?: ISODateString;
        dateTo?: ISODateString;
        timeFrom?: string // hh:mm:ss;
        timeTo?: string // hh:mm:ss;
        muscles?: Muscles[],
        exerciseIds?: string[], // Exercise IDs
        archived?: boolean; // if true, include archived items in response
        updatedAfter?: ISODateString; // incremental sync
    },
    pagination: PaginationRequestData,
};

export type ExerciseRecordsListResponse = {
    list: ExerciseRecordResponse[],
    pagination: PaginationResponseData
};


