import React, { useMemo, useRef, useEffect } from 'react';
import dayjs from 'dayjs';
import isoWeek from 'dayjs/plugin/isoWeek';
import type { ExerciseRecordResponse } from '@shared/Exercise.model';
import type { DateRangeValue } from '../../store/filters';
import styles from './styles.module.css';

dayjs.extend(isoWeek);

type Granularity = 'day' | 'week' | 'month' | 'year';

function getGranularity(range: DateRangeValue): Granularity {
  const days = dayjs(range.to).startOf('day').diff(dayjs(range.from).startOf('day'), 'day') + 1;
  if (days <= 1) return 'day';
  if (days <= 14) return 'week';
  if (days <= 90) return 'month';
  return 'year';
}

type ChipData = {
  key: string;
  label: string;
  from: string;
  to: string;
  selected: boolean;
  active: boolean;
};

function buildChips(
  granularity: Granularity,
  range: DateRangeValue,
  records: ExerciseRecordResponse[],
): ChipData[] {
  const daySet = new Set<string>();
  const monthSet = new Set<string>();
  const yearSet = new Set<string>();
  for (const r of records) {
    if (r.archived) continue;
    const d = dayjs(r.date);
    daySet.add(d.format('YYYY-MM-DD'));
    monthSet.add(d.format('YYYY-MM'));
    yearSet.add(d.format('YYYY'));
  }

  const anchor = dayjs(range.from);
  const chips: ChipData[] = [];

  switch (granularity) {
    case 'day': {
      const center = anchor.startOf('day');
      for (let i = -7; i <= 6; i++) {
        const d = center.add(i, 'day');
        chips.push({
          key: d.format('YYYY-MM-DD'),
          label: d.format('dd D'),
          from: d.startOf('day').toISOString(),
          to: d.endOf('day').toISOString(),
          selected: i === 0,
          active: daySet.has(d.format('YYYY-MM-DD')),
        });
      }
      break;
    }
    case 'week': {
      const center = anchor.startOf('isoWeek');
      for (let i = -6; i <= 5; i++) {
        const ws = center.add(i, 'week');
        let active = false;
        for (let d = 0; d < 7; d++) {
          if (daySet.has(ws.add(d, 'day').format('YYYY-MM-DD'))) {
            active = true;
            break;
          }
        }
        chips.push({
          key: ws.format('YYYY-MM-DD'),
          label: `W${ws.isoWeek()}`,
          from: ws.toISOString(),
          to: ws.endOf('isoWeek').toISOString(),
          selected: i === 0,
          active,
        });
      }
      break;
    }
    case 'month': {
      const center = anchor.startOf('month');
      for (let i = -6; i <= 5; i++) {
        const ms = center.add(i, 'month');
        chips.push({
          key: ms.format('YYYY-MM'),
          label: ms.format('MMM'),
          from: ms.toISOString(),
          to: ms.endOf('month').toISOString(),
          selected: i === 0,
          active: monthSet.has(ms.format('YYYY-MM')),
        });
      }
      break;
    }
    case 'year': {
      const center = anchor.startOf('year');
      for (let i = -3; i <= 2; i++) {
        const ys = center.add(i, 'year');
        chips.push({
          key: ys.format('YYYY'),
          label: ys.format('YYYY'),
          from: ys.toISOString(),
          to: ys.endOf('year').toISOString(),
          selected: i === 0,
          active: yearSet.has(ys.format('YYYY')),
        });
      }
      break;
    }
  }

  return chips;
}

export function PeriodChips({
  range,
  onChange,
  records,
}: {
  range: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  records: ExerciseRecordResponse[];
}) {
  const granularity = useMemo(() => getGranularity(range), [range]);
  const chips = useMemo(
    () => buildChips(granularity, range, records),
    [granularity, range, records],
  );
  const selectedRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    selectedRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [range.from]);

  return (
    <div className={styles.root}>
      {chips.map((chip) => (
        <button
          key={chip.key}
          ref={chip.selected ? selectedRef : undefined}
          className={[
            styles.chip,
            chip.active && styles.active,
            chip.selected && styles.selected,
          ].filter(Boolean).join(' ')}
          onClick={() => onChange({ from: chip.from, to: chip.to })}
        >
          {chip.label}
        </button>
      ))}
    </div>
  );
}
