import React from 'react';
import Button from '@uikit/components/Button/Button';
import PlusIcon from '@uikit/icons/plus.svg?react';
import styles from './styles.module.css';

type Props = {
  onClick: () => void;
  ariaLabel?: string;
  disabled?: boolean;
};

export function AddFab({ onClick, ariaLabel = 'add', disabled }: Props) {
  return (
    <div className={styles.root}>
      <Button
        className={styles.button}
        aria-label={ariaLabel}
        onClick={onClick}
        disabled={disabled}
        type="active"
        size="lg"
      >
        <PlusIcon aria-hidden="true" focusable="false" />
      </Button>
    </div>
  );
}
