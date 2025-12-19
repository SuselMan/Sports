import create from 'zustand';
import dayjs from 'dayjs';
import { storage } from '../utils/storage';

export type DateRangeValue = {
  from: string;
  to: string;
};

type DateRangeState = {
  range: DateRangeValue;
  setRange: (range: DateRangeValue) => void;
};

function createDateRangeStore(storageKey: string, defaultRange: DateRangeValue) {
  const initial = storage.get<DateRangeValue>(storageKey, defaultRange);
  return create<DateRangeState>((set) => ({
    range: initial,
    setRange: (range) => {
      storage.set(storageKey, range);
      set({ range });
    },
  }));
}

export const useHomeDateRangeStore = createDateRangeStore('homeDateRange', {
  from: dayjs().startOf('day').toISOString(),
  to: dayjs().endOf('day').toISOString(),
});

export const useStatisticsDateRangeStore = createDateRangeStore('statisticsDateRange', {
  from: dayjs().subtract(30, 'day').startOf('day').toISOString(),
  to: dayjs().endOf('day').toISOString(),
});

// Backward compat: existing imports in older code should keep working.
export const useDateRangeStore = useHomeDateRangeStore;
