import { PaginationResponseData } from "./Shared.model";
import { ISODateString } from "./Shared.model";

export type Training = {
    id: string,
    userId: string,
    name?: string,
    note?: string,
    date: ISODateString,
};

export type TrainingResponse = Training;

export type TrainingListResponse = {
    list: TrainingResponse[],
    pagination: PaginationResponseData,
}

