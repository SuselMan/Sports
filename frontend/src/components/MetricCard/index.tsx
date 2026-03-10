import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import type { Metric } from '@shared/Metrics.model';
import Button from '@uikit/components/Button/Button';
import ChartBarIcon from '@uikit/icons/chart-bar.svg?react';
import TrashIcon from '@uikit/icons/trash.svg?react';
import styles from './styles.module.css';

export function MetricCard({
  metric,
  onDelete,
  onOpen,
}: {
  metric: Metric;
  onDelete?: (id: string) => void;
  onOpen?: (metric: Metric) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const onKeyDown: React.KeyboardEventHandler<HTMLDivElement> = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen?.(metric);
    }
  };

  return (
    <div className={styles.root} onClick={() => onOpen?.(metric)} onKeyDown={onKeyDown} role="button" tabIndex={0}>
      <div className={styles.row}>
        <div className={styles.info}>
          <h3 className={styles.title}>{metric.name}</h3>
          <div className={styles.caption}>
            {t('metrics.unit')}
            :
            {' '}
            {metric.unit}
          </div>
        </div>
        <div className={styles.actions}>
          <Button
            type="ghost"
            size="md"
            aria-label={t('statistics.title')}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/metrics/${metric._id}/statistics`);
            }}
          >
            <ChartBarIcon />
          </Button>
          <Button
            type="ghost"
            size="md"
            aria-label={t('metrics.delete')}
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(metric._id);
            }}
          >
            <TrashIcon />
          </Button>
        </div>
      </div>
    </div>
  );
}


