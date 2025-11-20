import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { DateRange, DateRangeValue } from './DateRange';

type Props = {
  title: string;
  range: DateRangeValue;
  onChange: (v: DateRangeValue) => void;
  right?: React.ReactNode; // additional controls/actions
};

export function PageHeader({ title, range, onChange, right }: Props) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={1.5}
      sx={{ mb: 2 }}
    >
      <DateRange value={range} onChange={onChange} />
      {right && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'stretch', sm: 'center' },
          }}
        >
          {right}
        </Box>
      )}
    </Stack>
  );
}


