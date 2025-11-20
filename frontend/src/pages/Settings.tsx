import React from 'react';
import { Box, Stack, Typography, TextField, MenuItem } from '@mui/material';

export default function Settings({ mode, setMode }: { mode: 'light' | 'dark'; setMode: (m: 'light' | 'dark') => void }) {
  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>Settings</Typography>
      <Stack spacing={2}>
        <TextField
          select
          label="Theme"
          value={mode}
          onChange={(e) => setMode((e.target.value as 'light' | 'dark'))}
          fullWidth
          size="small"
        >
          <MenuItem value="light">Light</MenuItem>
          <MenuItem value="dark">Dark</MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
}


