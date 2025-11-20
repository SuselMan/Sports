import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

type Props = {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
};

export function AddFab({ onClick, ariaLabel = 'add', disabled }: Props) {
  return (
    <Fab
      color="primary"
      aria-label={ariaLabel}
      onClick={onClick}
      disabled={disabled}
      sx={{
        position: 'fixed',
        right: 16,
        bottom: 16,
        zIndex: (theme) => theme.zIndex.appBar + 1,
      }}
    >
      <AddIcon />
    </Fab>
  );
}


