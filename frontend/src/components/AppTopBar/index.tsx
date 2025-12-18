import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '@uikit/components/Button/Button';
import Sidebar from '@uikit/components/Sidebar/Sidebar';
import { useTranslation } from 'react-i18next';
import BarIcon from '@uikit/icons/bars-3.svg?react';
import { useAuthStore } from '../../store/auth';
import styles from './styles.module.css';

export function AppTopBar() {
  const { token, signOut } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);

  return (
    <div className={styles.root}>
      <div className={styles.inner}>
        <div className={styles.title}>kek</div>
        <div className={styles.spacer} />
        {token && (
          <nav className={styles.nav}>
            <Button type="ghost" onClick={() => navigate('/')} className={location.pathname === '/' ? '' : ''}>
              {t('nav.home')}
            </Button>
            <Button type="ghost" onClick={() => navigate('/exercises')}>
              {t('nav.exercises')}
            </Button>
            <Button type="ghost" onClick={() => navigate('/metrics')}>
              {t('nav.metrics')}
            </Button>
            <Button type="ghost" onClick={() => navigate('/statistics')}>
              {t('nav.statistics')}
            </Button>
            <Button type="ghost" onClick={() => navigate('/settings')}>
              {t('nav.settings')}
            </Button>
            <Button type="ghost" onClick={() => { signOut(); navigate('/login'); }}>
              {t('nav.logout')}
            </Button>
          </nav>
        )}
        {token && (
          <Button onClick={() => setOpen(true)} aria-label="menu" className={styles.menuBtn}>
            <BarIcon />
          </Button>
        )}
      </div>
      {token && (
        <Sidebar isOpen={open} close={() => setOpen(false)}>
          <div className={styles.mobileMenuActions}>
            <Button onClick={() => { setOpen(false); navigate('/'); }}>
              {t('nav.home')}
            </Button>
            <Button onClick={() => { setOpen(false); navigate('/exercises'); }}>
              {t('nav.exercises')}
            </Button>
            <Button onClick={() => { setOpen(false); navigate('/metrics'); }}>
              {t('nav.metrics')}
            </Button>
            <Button onClick={() => { setOpen(false); navigate('/statistics'); }}>
              {t('nav.statistics')}
            </Button>
            <Button onClick={() => { setOpen(false); navigate('/settings'); }}>
              {t('nav.settings')}
            </Button>
            <Button onClick={() => { setOpen(false); signOut(); navigate('/login'); }}>
              {t('nav.logout')}
            </Button>
          </div>
        </Sidebar>
      )}
    </div>
  );
}
