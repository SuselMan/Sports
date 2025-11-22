import React from 'react';
import { Box, Stack, Typography, TextField, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import i18n from '../i18n';
import { storage } from '../utils/storage';

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
        <TextField
          select
          label={t('settings.theme')}
          value={mode}
          onChange={(e) => setMode((e.target.value as 'light' | 'dark'))}
          fullWidth
          size="small"
        >
          <MenuItem value="light">{t('settings.light')}</MenuItem>
          <MenuItem value="dark">{t('settings.dark')}</MenuItem>
        </TextField>
        <TextField
          select
          label={t('settings.language')}
          value={lang}
          onChange={(e) => changeLanguage(e.target.value)}
          fullWidth
          size="small"
        >
          <MenuItem value="en">English</MenuItem>
          <MenuItem value="ru">Русский</MenuItem>
          <MenuItem value="es">Español</MenuItem>
          <MenuItem value="fr">Français</MenuItem>
          <MenuItem value="pt">Português</MenuItem>
          <MenuItem value="zh">中文</MenuItem>
          <MenuItem value="hi">हिन्दी</MenuItem>
          <MenuItem value="ar">العربية</MenuItem>
          <MenuItem value="bn">বাংলা</MenuItem>
        </TextField>
      </Stack>
    </Box>
  );
}


