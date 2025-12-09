import { PaginationRequestData, PaginationResponseData, ISODateString } from './Shared.model';

export type Unit =
  | 'kg'
  | 'lb'
  | 'cm'
  | 'mm'
  | 'percent'
  | 'bpm'
  | 'kcal'
  | 'count'
  | string; // allow custom units

export type Metric = {
    id: string, // uuid
    userId: string, // owner user id
    name: string, // MAX 100 SYMBOLS 
    unit: Unit, // suggest from list, allow custom
};

export type MetricResponse = Metric;

export type MetricListResponse = {
    list: MetricResponse[],
    pagination: PaginationResponseData,
};

export type MetricRecord = {
    id: string,
    userId: string,
    metricId: string // Metric id,
    value: number,
    date: ISODateString,
    note?: string,
};

export type MetricRecordsListRequest = {
    filters?: {
        dateFrom?: ISODateString;
        dateTo?: ISODateString;
        timeFrom?: string // hh:mm:ss;
        timeTo?: string // hh:mm:ss;
    },
    pagination: PaginationRequestData,
};

export type MetricRecordResponse = MetricRecord & {
    metric: Metric,
};

export type MetricRecordListResponse = {
    list: MetricRecordResponse[],
    pagination: PaginationResponseData,
};