import React from 'react';
import Button from '@uikit/components/Button/Button';
import Input from '@uikit/components/Input/Input';
import DatePicker from '@uikit/components/DatePicker/DatePicker';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';
import CalendarIcon from '@uikit/icons/calendar.svg?react';
import ChevronLeftIcon from '@uikit/icons/chevron-left.svg?react';
import ChevronRightIcon from '@uikit/icons/chevron-right.svg?react';

export type DateRangeValue = {
  from: string;
  to: string;
};

export function DateRange({ value, onChange }: { value: DateRangeValue; onChange: (v: DateRangeValue) => void }) {
  const from = dayjs(value.from);
  const to = dayjs(value.to);
  const today = dayjs();
  const { t } = useTranslation();
  const periodDays = Math.max(1, to.startOf('day').diff(from.startOf('day'), 'day') + 1);
  const nextFrom = from.add(periodDays, 'day').startOf('day');
  const rightDisabled = nextFrom.isAfter(today.startOf('day'));
  const maxFromDate = to.isBefore(today) ? to : today;
  const fromMaxMobile = maxFromDate.format('YYYY-MM-DD');
  const toMinMobile = from.format('YYYY-MM-DD');

  const shift = (direction: number) => {
    if (direction > 0 && rightDisabled) return;
    const nf = from.add(periodDays * direction, 'day').startOf('day');
    const nt = to.add(periodDays * direction, 'day').endOf('day');
    onChange({ from: nf.toISOString(), to: nt.toISOString() });
  };

  return (
    <div className={styles.root}>
      <div className={styles.row}>
        <Button onClick={() => shift(-1)}><ChevronLeftIcon /></Button>
        {isMobile ? (
          <>
            <div className={styles.dateInputWrapper}>
              <Input
                className={styles.input}
                id="date-from"
                type="date"
                value={from.format('YYYY-MM-DD')}
                onChange={(e) => onChange({ from: dayjs((e.target as HTMLInputElement).value).startOf('day').toISOString(), to: to.toISOString() })}
                max={fromMaxMobile}
                inputClasses={styles.inputWithIcon}
              />
              <button
                type="button"
                className={styles.mobileCalendarButton}
                onClick={() => {
                  const el = document.getElementById('date-from') as HTMLInputElement | null;
                  if (el && typeof (el as any).showPicker === 'function') {
                    (el as any).showPicker();
                  } else {
                    el?.focus();
                  }
                }}
                aria-label="Open calendar"
              >
                <CalendarIcon />
              </button>
            </div>
            <div className={styles.dateInputWrapper}>
              <Input
                className={styles.input}
                id="date-to"
                type="date"
                value={to.format('YYYY-MM-DD')}
                onChange={(e) => onChange({ from: from.toISOString(), to: dayjs((e.target as HTMLInputElement).value).endOf('day').toISOString() })}
                min={toMinMobile}
                max={today.format('YYYY-MM-DD')}
                inputClasses={styles.inputWithIcon}
              />
              <button
                type="button"
                className={styles.mobileCalendarButton}
                onClick={() => {
                  const el = document.getElementById('date-to') as HTMLInputElement | null;
                  if (el && typeof (el as any).showPicker === 'function') {
                    (el as any).showPicker();
                  } else {
                    el?.focus();
                  }
                }}
                aria-label="Open calendar"
              >
                <CalendarIcon />
              </button>
            </div>
          </>
        ) : (
          <>
              <DatePicker
                  value={from.toISOString()}
                  onChange={(iso) => {
                      if (iso) onChange({ from: iso, to: to.toISOString() });
                  }}
                  maxDate={maxFromDate}
                  inputClassName={styles.fieldInput}
              />
              <DatePicker
                  value={to.toISOString()}
                  onChange={(iso) => {
                      if (iso) onChange({ from: from.toISOString(), to: dayjs(iso).endOf('day').toISOString() });
                  }}
                  minDate={from}
                  maxDate={today}
                  inputClassName={styles.fieldInput}
              />
          </>
        )}
        <Button onClick={() => shift(1)} disabled={rightDisabled}><ChevronRightIcon /></Button>
      </div>
      <div className={styles.quick}>
        <Button
          size="md"
          onClick={() => onChange({ from: today.startOf('day').toISOString(), to: today.endOf('day').toISOString() })}
        >
          {t('dateRange.today')}
        </Button>
        <Button
            size="md"
          onClick={() => onChange({ from: dayjs().subtract(7, 'day').startOf('day').toISOString(), to: today.endOf('day').toISOString() })}
        >
          {t('dateRange.lastWeek')}
        </Button>
        <Button
            size="md"
          onClick={() => onChange({ from: dayjs().subtract(30, 'day').startOf('day').toISOString(), to: today.endOf('day').toISOString() })}
        >
          {t('dateRange.lastMonth')}
        </Button>
        <Button
            size="md"
          onClick={() => onChange({ from: dayjs().subtract(365, 'day').startOf('day').toISOString(), to: today.endOf('day').toISOString() })}
        >
          {t('dateRange.lastYear')}
        </Button>
      </div>
    </div>
  );
}


