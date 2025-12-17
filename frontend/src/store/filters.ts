import create from 'zustand';
import dayjs from 'dayjs';

export type DateRangeValue = {
  from: string;
  to: string;
};

type FiltersState = {
  range: DateRangeValue;
  setRange: (range: DateRangeValue) => void;
};

export const useDateRangeStore = create<FiltersState>((set) => ({
  range: {
    from: dayjs().startOf('day').toISOString(),
    to: dayjs().endOf('day').toISOString(),
  },
  setRange: (range) => set({ range }),
}));
