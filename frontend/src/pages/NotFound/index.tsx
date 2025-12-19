import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import EmptyView from '@uikit/components/EmptyView/EmptyView';
import Button from '@uikit/components/Button/Button';
import { useAuthStore } from '../../store/auth';
import styles from './styles.module.css';

export default function NotFound() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const token = useAuthStore((s) => s.token);

  return (
    <div className={styles.root}>
      <EmptyView title={t('notFound.title')}>
        <div>{t('notFound.description')}</div>
        <div className={styles.actions}>
          {token ? (
            <Button type="active" size="md" onClick={() => navigate('/', { replace: true })}>
              {t('notFound.goHome')}
            </Button>
          ) : (
            <Button type="active" size="md" onClick={() => navigate('/login', { replace: true })}>
              {t('notFound.goLogin')}
            </Button>
          )}
        </div>
      </EmptyView>
    </div>
  );
}


