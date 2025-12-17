import React from 'react';
import { Fab } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import styles from './styles.module.css';

type Props = {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
};

export function AddFab({ onClick, ariaLabel = 'add', disabled }: Props) {
  return (
    <Fab
      className={styles.root}
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
