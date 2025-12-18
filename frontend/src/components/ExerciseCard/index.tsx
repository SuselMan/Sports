import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Exercise } from '@shared/Exercise.model';
import Button from '@uikit/components/Button/Button';
import ChartBarIcon from '@uikit/icons/chart-bar.svg?react';
import TrashIcon from '@uikit/icons/trash.svg?react';
import styles from './styles.module.css';

export function ExerciseCard({
  exercise,
  onDelete,
  onOpen,
}: {
  exercise: Exercise;
  onDelete?: (id: string) => void;
  onOpen?: (exercise: Exercise) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.(exercise);
    }
  };
  return (
    <div className={styles.root} onClick={() => onOpen?.(exercise)} onKeyDown={onKeyDown} role="button" tabIndex={0}>
      <div className={styles.row}>
        <div className={styles.info}>
          <h3 className={styles.title}>{exercise.name}</h3>
          <div className={styles.caption}>
            {t('commonTexts.type')}
            :
            {' '}
            {exercise.type}
          </div>
          <div className={styles.caption}>
            {t('commonTexts.muscles')}
            :
            {' '}
            {exercise.muscles.join(', ')}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            type="ghost"
            size="md"
            aria-label={t('statistics.title')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/statistics/${exercise._id}`);
            }}
          >
            <ChartBarIcon />
          </Button>
          <Button
            type="ghost"
            size="md"
            aria-label={t('exercises.delete')}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(exercise._id);
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}
