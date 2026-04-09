import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Button from '@uikit/components/Button/Button';
import i18n from '../../i18n';
import { apiClient } from '../../api/apiClient';
import { frontendBuildNumber } from '../../buildInfo';
import { storage } from '../../utils/storage';
import { useAuthStore } from '../../store/auth';
import { useSyncStore } from '../../store/sync';
import { resetLocalData } from '../../offline/repo';
import { OFFLINE_ONLY } from '../../config';
import styles from './styles.module.css';

export type MapSex = 'male' | 'female';

export default function Settings({ mode, setMode, mapSex, setMapSex }: {
  mode: 'light' | 'dark'; setMode: (m: 'light' | 'dark') => void;
  mapSex: MapSex; setMapSex: (s: MapSex) => void;
}) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const signOut = useAuthStore((s) => s.signOut);
  const [lang, setLang] = React.useState<string>(() => storage.get<string>('language', i18n.language || 'en'));
  const [backendBuild, setBackendBuild] = React.useState<number | null>(null);
  const triggerSync = useSyncStore((s) => s.triggerSync);

  React.useEffect(() => {
    if (OFFLINE_ONLY) return;
    apiClient.getVersion()
      .then((v) => setBackendBuild(v.backendBuild))
      .catch(() => setBackendBuild(null));
  }, []);

  const changeLanguage = (code: string) => {
    setLang(code);
    storage.set('language', code);
    i18n.changeLanguage(code);
  };

  return (
    <div className={styles.root}>
      <div className={styles.title}>{t('settings.title')}</div>
      <div className={styles.section}>
        <Dropdown header={`${t('settings.theme')}: ${mode === 'light' ? t('settings.light') : t('settings.dark')}`}>
          <div className={styles.menuCol}>
            <Button onClick={() => setMode('light')}>{t('settings.light')}</Button>
            <Button onClick={() => setMode('dark')}>{t('settings.dark')}</Button>
          </div>
        </Dropdown>
      </div>

      <div className={styles.section}>
        <Dropdown
          header={`${t('settings.language')}: ${
            {
              en: 'English',
              ru: 'Русский',
              es: 'Español',
              fr: 'Français',
              pt: 'Português',
              zh: '中文',
              hi: 'हिन्दी',
              ar: 'العربية',
              bn: 'বাংলা',
            }[lang] || lang
          }`}
        >
          <div className={styles.menuCol}>
            <Button onClick={() => changeLanguage('en')}>English</Button>
            <Button onClick={() => changeLanguage('ru')}>Русский</Button>
            <Button onClick={() => changeLanguage('es')}>Español</Button>
            <Button onClick={() => changeLanguage('fr')}>Français</Button>
            <Button onClick={() => changeLanguage('pt')}>Português</Button>
            <Button onClick={() => changeLanguage('zh')}>中文</Button>
            <Button onClick={() => changeLanguage('hi')}>हिन्दी</Button>
            <Button onClick={() => changeLanguage('ar')}>العربية</Button>
            <Button onClick={() => changeLanguage('bn')}>বাংলা</Button>
          </div>
        </Dropdown>
      </div>
      <div className={styles.section}>
        <Dropdown header={`${t('settings.muscleMap')}: ${mapSex === 'male' ? t('settings.male') : t('settings.female')}`}>
          <div className={styles.menuCol}>
            <Button onClick={() => setMapSex('male')}>{t('settings.male')}</Button>
            <Button onClick={() => setMapSex('female')}>{t('settings.female')}</Button>
          </div>
        </Dropdown>
      </div>

      <div className={styles.section}>
        <Button
          type="secondary"
          onClick={async () => {
            // eslint-disable-next-line no-alert
            const ok = window.confirm(t('settings.resetLocalDataConfirm'));
            if (!ok) return;
            await resetLocalData();
            if (!OFFLINE_ONLY) await triggerSync();
          }}
        >
          {t('settings.resetLocalData')}
        </Button>
      </div>
      {!OFFLINE_ONLY && (
        <div className={styles.section}>
          <Button
            type="secondary"
            onClick={() => { signOut(); navigate('/login'); }}
          >
            {t('nav.logout')}
          </Button>
        </div>
      )}

      <div className={styles.footer}>
        <small>
          Build&nbsp;
          {frontendBuildNumber}
          {!OFFLINE_ONLY && `/${backendBuild ?? '?'}`}
        </small>
      </div>
    </div>
  );
}
