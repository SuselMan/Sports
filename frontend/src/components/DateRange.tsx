import React from 'react';
import { Stack, TextField, IconButton } from '@mui/material';
import dayjs from 'dayjs';
import { isMobile } from 'react-device-detect';
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

export type DateRangeValue = {
  from: string;
  to: string;
};

export function DateRange({ value, onChange }: { value: DateRangeValue; onChange: (v: DateRangeValue) => void }) {
  const from = dayjs(value.from);
  const to = dayjs(value.to);
  const today = dayjs();
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
    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ xs: 'stretch', sm: 'center' }} sx={{ width: { xs: '100%', sm: 'auto' } }}>
      <IconButton onClick={() => shift(-1)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }}>{'←'}</IconButton>
      {isMobile ? (
        <>
          <TextField
            type="date"
            value={from.format('YYYY-MM-DD')}
            onChange={(e) => onChange({ from: dayjs(e.target.value).startOf('day').toISOString(), to: to.toISOString() })}
            size="small"
            fullWidth
            inputProps={{ max: fromMaxMobile }}
          />
          <TextField
            type="date"
            value={to.format('YYYY-MM-DD')}
            onChange={(e) => onChange({ from: from.toISOString(), to: dayjs(e.target.value).endOf('day').toISOString() })}
            size="small"
            fullWidth
            inputProps={{ min: toMinMobile, max: today.format('YYYY-MM-DD') }}
          />
        </>
      ) : (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <DatePicker
            label="From"
            value={from}
            onChange={(d) => {
              if (d) onChange({ from: d.startOf('day').toISOString(), to: to.toISOString() });
            }}
            disableFuture
            maxDate={maxFromDate}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
          <DatePicker
            label="To"
            value={to}
            onChange={(d) => {
              if (d) onChange({ from: from.toISOString(), to: d.endOf('day').toISOString() });
            }}
            disableFuture
            minDate={from}
            maxDate={today}
            slotProps={{ textField: { size: 'small', fullWidth: true } }}
          />
        </LocalizationProvider>
      )}
      <IconButton onClick={() => shift(1)} sx={{ alignSelf: { xs: 'flex-start', sm: 'center' } }} disabled={rightDisabled}>{'→'}</IconButton>
    </Stack>
  );
}


