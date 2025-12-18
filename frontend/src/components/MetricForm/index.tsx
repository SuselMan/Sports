import React from 'react';
import { useTranslation } from 'react-i18next';
import { Muscles } from '@shared/Shared.model';
import Input from '@uikit/components/Input/Input';
import Dropdown from '@uikit/components/Dropdown/Dropdown';
import Button from '@uikit/components/Button/Button';
import SearchSelect from '@uikit/components/SearchSelect/SearchSelect';
import type { Unit } from '@shared/Metrics.model';
import styles from './styles.module.css';
import { MusclesMap } from '../MusclesMap';
import { MUSCLES_OPTIONS } from '../../constants/muscles';

export type MetricFormValue = {
  name: string;
  unit: Unit;
  muscles: Muscles[];
};

const UNIT_OPTIONS: Unit[] = [
  'kg',
  'lb',
  'cm',
  'mm',
  'percent',
  'bpm',
  'kcal',
  'count',
];

export function MetricForm({
  form,
  onChange,
}: {
  form: MetricFormValue;
  onChange: (next: MetricFormValue) => void;
}) {
  const { t } = useTranslation();

  const toggleMuscle = (m: Muscles) => {
    const exists = form.muscles.includes(m);
    const next = exists ? form.muscles.filter((x) => x !== m) : [...form.muscles, m];
    onChange({ ...form, muscles: next });
  };

  const onClear = () => {
    onChange({ ...form, muscles: [] });
  };

  return (
    <div className={styles.root}>
      <Input
        label={t('metrics.name')}
        value={form.name}
        onChange={(e) => onChange({ ...form, name: (e.target as HTMLInputElement).value })}
      />

      <Dropdown header={`${t('metrics.unit')}: ${form.unit || '-'}`}>
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 8, padding: 8,
        }}
        >
          {UNIT_OPTIONS.map((u) => (
            <Button key={u} onClick={() => onChange({ ...form, unit: u })}>
              {u}
            </Button>
          ))}
        </div>
      </Dropdown>

      <SearchSelect
        options={MUSCLES_OPTIONS}
        selected={form.muscles}
        onChange={(opt, add) => {
          const muscle = opt as Muscles;
          const next = add ? [...form.muscles, muscle] : form.muscles.filter((m) => m !== muscle);
          onChange({ ...form, muscles: next });
        }}
        onClear={onClear}
      />

      <div style={{ height: '260px', border: '1px solid #eee', borderRadius: 4 }}>
        <MusclesMap
          muscles={form.muscles}
          onMuscleClicked={(m: Muscles) => toggleMuscle(m)}
        />
      </div>
    </div>
  );
}


