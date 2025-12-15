import React from 'react';
import { Box, Stack, Typography } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { storage } from '../utils/storage';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Button from '@uikit/components/Button/Button';

export default function Settings({ mode, setMode }: { mode: 'light' | 'dark'; setMode: (m: 'light' | 'dark') => void }) {
  const { t } = useTranslation();
  const [lang, setLang] = React.useState<string>(() => storage.get<string>('language', i18n.language || 'en'));

  const changeLanguage = (code: string) => {
    setLang(code);
    storage.set('language', code);
    i18n.changeLanguage(code);
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>{t('settings.title')}</Typography>
      <Stack spacing={2}>
        <Dropdown
          header={`${t('settings.theme')}: ${mode === 'light' ? t('settings.light') : t('settings.dark')}`}
        >
          <Stack spacing={1} style={{ padding: 8 }}>
            <Button onClick={() => setMode('light')}>{t('settings.light')}</Button>
            <Button onClick={() => setMode('dark')}>{t('settings.dark')}</Button>
          </Stack>
        </Dropdown>
        <Dropdown
          header={`${t('settings.language')}: ${
            {
              en: 'English', ru: 'Русский', es: 'Español', fr: 'Français',
              pt: 'Português', zh: '中文', hi: 'हिन्दी', ar: 'العربية', bn: 'বাংলা'
            }[lang] || lang
          }`}
        >
          <Stack spacing={1} style={{ padding: 8, maxHeight: 240, overflow: 'auto' }}>
            <Button onClick={() => changeLanguage('en')}>English</Button>
            <Button onClick={() => changeLanguage('ru')}>Русский</Button>
            <Button onClick={() => changeLanguage('es')}>Español</Button>
            <Button onClick={() => changeLanguage('fr')}>Français</Button>
            <Button onClick={() => changeLanguage('pt')}>Português</Button>
            <Button onClick={() => changeLanguage('zh')}>中文</Button>
            <Button onClick={() => changeLanguage('hi')}>हिन्दी</Button>
            <Button onClick={() => changeLanguage('ar')}>العربية</Button>
            <Button onClick={() => changeLanguage('bn')}>বাংলা</Button>
          </Stack>
        </Dropdown>
      </Stack>
    </Box>
  );
}


