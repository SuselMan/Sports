import {
  Muscles,
  PaginationRequestData,
  PaginationResponseData,
  ISODateString,
  SyncMetaData,
} from './Shared.model';

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

export type Metric = SyncMetaData & {
  _id: string;
  name: string; // MAX 100 SYMBOLS
  unit: Unit; // suggest from list, allow custom
  muscles?: Muscles[]; // optional, can be empty
};

export type MetricResponse = Metric;

export type MetricCreateRequest = {
  _id?: string; // optional client-generated id (ObjectId hex string)
  name: string;
  unit: Unit;
  muscles?: Muscles[];
};

export type MetricUpdateRequest = {
  name?: string;
  unit?: Unit;
  muscles?: Muscles[];
};

export type MetricListResponse = {
  list: MetricResponse[];
  pagination: PaginationResponseData;
};

export type MetricListRequest = {
  filters?: {
    archived?: boolean; // if true, include archived items in response
    updatedAfter?: ISODateString; // incremental sync
  };
  pagination: PaginationRequestData;
};

export type MetricRecord = SyncMetaData & {
  _id: string;
  metricId: string; // Metric id
  value: number;
  date: ISODateString;
  note?: string;
};

export type MetricRecordCreateRequest = {
  _id?: string; // optional client-generated id (ObjectId hex string)
  value: number;
  date: ISODateString;
  note?: string;
};

export type MetricRecordUpdateRequest = {
  metricId?: string;
  value?: number;
  date?: ISODateString;
  note?: string | null;
};

export type MetricRecordResponse = MetricRecord & {
  metric: Metric;
};

export type MetricRecordListResponse = {
  list: MetricRecordResponse[];
  pagination: PaginationResponseData;
};

export type MetricRecordsListRequest = {
  filters?: {
    dateFrom?: ISODateString;
    dateTo?: ISODateString;
    timeFrom?: string; // hh:mm:ss
    timeTo?: string; // hh:mm:ss
    archived?: boolean; // if true, include archived items in response
    updatedAfter?: ISODateString; // incremental sync
  };
  pagination: PaginationRequestData;
};