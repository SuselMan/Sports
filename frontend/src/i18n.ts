import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { storage } from './utils/storage';

const resources = {
  en: {
    common: {
      appName: 'kek',
      nav: {
        home: 'Home',
        exercises: 'Exercises',
        metrics: 'Metrics',
        statistics: 'Statistics',
        settings: 'Settings',
        logout: 'Logout',
      },
      settings: {
        title: 'Settings',
        theme: 'Theme',
        light: 'Light',
        dark: 'Dark',
        language: 'Language',
      },
      home: {
        noExercisesPrefix: "You don't have any exercises yet.",
        createFirstOne: 'Create your first one',
        noExercisesSuffix: 'to start tracking.',
        noRecordsForPeriod: 'No records for chosen period',
        noRecordsForPeriodHint: 'Add a record for this period to start tracking your workouts.',
        addRecordCta: 'Add record',
        logWhat: 'What do you want to log?',
        logExercise: 'Exercise',
        logMetric: 'Metric',
      },
      dateRange: {
        from: 'From',
        to: 'To',
        today: 'Today',
        lastWeek: 'Week',
        lastMonth: 'Month',
        lastYear: 'Year',
      },
      exercises: {
        title: 'Exercises',
        addTitle: 'Add Exercise',
        editTitle: 'Edit Exercise',
        name: 'Name',
        type: 'Type',
        muscles: 'Muscles',
        kindReps: 'REPS',
        kindTime: 'TIME',
        delete: 'Delete',
      },
      metrics: {
        title: 'Metrics',
        addTitle: 'Add Metric',
        editTitle: 'Edit Metric',
        name: 'Name',
        unit: 'Unit',
        delete: 'Delete',
      },
      records: {
        addTitle: 'Add Exercise Record',
        editTitle: 'Edit Exercise Record',
        exercise: 'Exercise',
        date: 'Date',
        reps: 'Reps',
        durationMs: 'Duration (ms)',
        durationMin: 'Duration (min)',
        weightKg: 'Weight (kg)',
        note: 'Note',
        repsLabel: 'Reps',
        durationLabel: 'duration',
        musclesLabel: 'muscles',
        fallbackExerciseName: 'Exercise',
      },
      metricRecords: {
        addTitle: 'Add Metric Record',
        editTitle: 'Edit Metric Record',
        metric: 'Metric',
        date: 'Date',
        value: 'Value',
        note: 'Note',
        fallbackMetricName: 'Metric',
      },
      actions: {
        cancel: 'Cancel',
        save: 'Save',
      },
      statistics: {
        title: 'Statistics',
        exerciseLabel: 'Exercise',
        chartRepsPerSet: 'Exercise: Total reps per set',
        chartWeight: 'Exercise: Weight',
        chartSetsPerDay: 'Exercise: Sets per day',
        chartOverallRepsPerDay: 'Overall: Reps per day',
      },
      commonTexts: {
        noDataForPeriod: 'No data for chosen period.',
        type: 'Type',
        muscles: 'Muscles',
      },
      group: {
        total: 'total',
        min: 'min',
        h: 'h',
      },
    },
  },
  ru: {
    common: {
      appName: 'Спорт',
      nav: {
        home: 'Главная',
        exercises: 'Упражнения',
        metrics: 'Метрики',
        statistics: 'Статистика',
        settings: 'Настройки',
        logout: 'Выйти',
      },
      settings: {
        title: 'Настройки',
        theme: 'Тема',
        light: 'Светлая',
        dark: 'Тёмная',
        language: 'Язык',
      },
      home: {
        noExercisesPrefix: 'У вас ещё нет упражнений.',
        createFirstOne: 'Создайте первое',
        noExercisesSuffix: 'чтобы начать отслеживание.',
        noRecordsForPeriod: 'Нет записей за выбранный период',
        noRecordsForPeriodHint: 'Добавьте запись за этот период, чтобы начать отслеживание.',
        addRecordCta: 'Добавить запись',
        logWhat: 'Что вы хотите записать?',
        logExercise: 'Упражнение',
        logMetric: 'Метрика',
      },
      dateRange: {
        from: 'От',
        to: 'До',
        today: 'Сегодня',
        lastWeek: 'Неделя',
        lastMonth: 'Месяц',
        lastYear: 'Год',
      },
      exercises: {
        title: 'Упражнения',
        addTitle: 'Добавить упражнение',
        editTitle: 'Редактировать упражнение',
        name: 'Название',
        type: 'Тип',
        muscles: 'Мышцы',
        kindReps: 'ПОВТ',
        kindTime: 'ВРЕМЯ',
        delete: 'Удалить',
      },
      metrics: {
        title: 'Метрики',
        addTitle: 'Добавить метрику',
        editTitle: 'Редактировать метрику',
        name: 'Название',
        unit: 'Ед. изм.',
        delete: 'Удалить',
      },
      records: {
        addTitle: 'Добавить запись',
        editTitle: 'Редактировать запись',
        exercise: 'Упражнение',
        date: 'Дата',
        reps: 'Повторы',
        durationMs: 'Длительность (мс)',
        durationMin: 'Длительность (мин)',
        weightKg: 'Вес (кг)',
        note: 'Заметка',
        repsLabel: 'Повторы',
        durationLabel: 'длительность',
        musclesLabel: 'мышцы',
        fallbackExerciseName: 'Упражнение',
      },
      metricRecords: {
        addTitle: 'Добавить метрику',
        editTitle: 'Редактировать метрику',
        metric: 'Метрика',
        date: 'Дата',
        value: 'Значение',
        note: 'Заметка',
        fallbackMetricName: 'Метрика',
      },
      actions: {
        cancel: 'Отмена',
        save: 'Сохранить',
      },
      statistics: {
        title: 'Статистика',
        exerciseLabel: 'Упражнение',
        chartRepsPerSet: 'Упражнение: Повторы за подход',
        chartWeight: 'Упражнение: Вес',
        chartSetsPerDay: 'Упражнение: Подходов в день',
        chartOverallRepsPerDay: 'Итого: Повторы в день',
      },
      commonTexts: {
        noDataForPeriod: 'Нет данных за выбранный период.',
        type: 'Тип',
        muscles: 'Мышцы',
      },
      group: {
        total: 'итого',
        min: 'мин',
        h: 'ч',
      },
    },
  },
  es: {
    common: {
      appName: 'Deportes',
      nav: {
        home: 'Inicio', exercises: 'Ejercicios', statistics: 'Estadísticas', settings: 'Ajustes', logout: 'Salir',
      },
      settings: {
        title: 'Ajustes', theme: 'Tema', light: 'Claro', dark: 'Oscuro', language: 'Idioma',
      },
      home: {
        noExercisesPrefix: 'Aún no tienes ejercicios.', createFirstOne: 'Crea el primero', noExercisesSuffix: 'para empezar a registrar.', noRecordsForPeriod: 'No hay registros para el período elegido', noRecordsForPeriodHint: 'Agrega un registro para este período para empezar a registrar.', addRecordCta: 'Agregar registro',
      },
      dateRange: {
        from: 'Desde', to: 'Hasta', today: 'Hoy', lastWeek: 'Semana', lastMonth: 'Mes', lastYear: 'Año',
      },
      exercises: {
        title: 'Ejercicios', addTitle: 'Agregar ejercicio', editTitle: 'Editar ejercicio', name: 'Nombre', type: 'Tipo', muscles: 'Músculos', kindReps: 'REPS', kindTime: 'TIME', delete: 'Eliminar',
      },
      records: {
        addTitle: 'Agregar registro', editTitle: 'Editar registro', exercise: 'Ejercicio', date: 'Fecha', reps: 'Repeticiones', durationMs: 'Duración (ms)', durationMin: 'Duración (min)', weightKg: 'Peso (kg)', note: 'Nota', repsLabel: 'reps', durationLabel: 'duración', musclesLabel: 'músculos', fallbackExerciseName: 'Ejercicio',
      },
      actions: { cancel: 'Cancelar', save: 'Guardar' },
      statistics: {
        title: 'Estadísticas', exerciseLabel: 'Ejercicio', chartRepsPerSet: 'Ejercicio: Repeticiones por serie', chartWeight: 'Ejercicio: Peso', chartSetsPerDay: 'Ejercicio: Series por día', chartOverallRepsPerDay: 'Total: Repeticiones por día',
      },
      commonTexts: { noDataForPeriod: 'No hay datos para el período elegido.', type: 'Tipo', muscles: 'Músculos' },
    },
  },
  fr: {
    common: {
      appName: 'Sports',
      nav: {
        home: 'Accueil', exercises: 'Exercices', statistics: 'Statistiques', settings: 'Paramètres', logout: 'Déconnexion',
      },
      settings: {
        title: 'Paramètres', theme: 'Thème', light: 'Clair', dark: 'Sombre', language: 'Langue',
      },
      home: {
        noExercisesPrefix: "Vous n'avez pas encore d'exercices.", createFirstOne: 'Créez votre premier', noExercisesSuffix: 'pour commencer le suivi.', noRecordsForPeriod: 'Aucun enregistrement pour la période choisie', noRecordsForPeriodHint: 'Ajoutez un enregistrement pour cette période pour commencer le suivi.', addRecordCta: 'Ajouter un enregistrement',
      },
      dateRange: {
        from: 'De', to: 'À', today: "Aujourd'hui", lastWeek: 'Semaine', lastMonth: 'Mois', lastYear: 'Année',
      },
      exercises: {
        title: 'Exercices', addTitle: 'Ajouter un exercice', editTitle: 'Modifier un exercice', name: 'Nom', type: 'Type', muscles: 'Muscles', kindReps: 'REPS', kindTime: 'TIME', delete: 'Supprimer',
      },
      records: {
        addTitle: 'Ajouter un enregistrement', editTitle: 'Modifier un enregistrement', exercise: 'Exercice', date: 'Date', reps: 'Répétitions', durationMs: 'Durée (ms)', durationMin: 'Durée (min)', weightKg: 'Poids (kg)', note: 'Note', repsLabel: 'répétitions', durationLabel: 'durée', musclesLabel: 'muscles', fallbackExerciseName: 'Exercice',
      },
      actions: { cancel: 'Annuler', save: 'Enregistrer' },
      statistics: {
        title: 'Statistiques', exerciseLabel: 'Exercice', chartRepsPerSet: 'Exercice : Répétitions par série', chartWeight: 'Exercice : Poids', chartSetsPerDay: 'Exercice : Séries par jour', chartOverallRepsPerDay: 'Total : Répétitions par jour',
      },
      commonTexts: { noDataForPeriod: 'Pas de données pour la période choisie.', type: 'Type', muscles: 'Muscles' },
    },
  },
  pt: {
    common: {
      appName: 'Esportes',
      nav: {
        home: 'Início', exercises: 'Exercícios', statistics: 'Estatísticas', settings: 'Configurações', logout: 'Sair',
      },
      settings: {
        title: 'Configurações', theme: 'Tema', light: 'Claro', dark: 'Escuro', language: 'Idioma',
      },
      home: {
        noExercisesPrefix: 'Você ainda não tem exercícios.', createFirstOne: 'Crie o primeiro', noExercisesSuffix: 'para começar a acompanhar.', noRecordsForPeriod: 'Sem registros para o período escolhido', noRecordsForPeriodHint: 'Adicione um registro para este período para começar a acompanhar.', addRecordCta: 'Adicionar registro',
      },
      dateRange: {
        from: 'De', to: 'Até', today: 'Hoje', lastWeek: 'Semana', lastMonth: 'Mês', lastYear: 'Ano',
      },
      exercises: {
        title: 'Exercícios', addTitle: 'Adicionar exercício', editTitle: 'Editar exercício', name: 'Nome', type: 'Tipo', muscles: 'Músculos', kindReps: 'REPS', kindTime: 'TIME', delete: 'Excluir',
      },
      records: {
        addTitle: 'Adicionar registro', editTitle: 'Editar registro', exercise: 'Exercício', date: 'Data', reps: 'Repetições', durationMs: 'Duração (ms)', durationMin: 'Duração (min)', weightKg: 'Peso (kg)', note: 'Nota', repsLabel: 'repetições', durationLabel: 'duração', musclesLabel: 'músculos', fallbackExerciseName: 'Exercício',
      },
      actions: { cancel: 'Cancelar', save: 'Salvar' },
      statistics: {
        title: 'Estatísticas', exerciseLabel: 'Exercício', chartRepsPerSet: 'Exercício: Repetições por série', chartWeight: 'Exercício: Peso', chartSetsPerDay: 'Exercício: Séries por dia', chartOverallRepsPerDay: 'Total: Repetições por dia',
      },
      commonTexts: { noDataForPeriod: 'Sem dados para o período escolhido.', type: 'Tipo', muscles: 'Músculos' },
    },
  },
  zh: {
    common: {
      appName: '运动',
      nav: {
        home: '首页', exercises: '练习', statistics: '统计', settings: '设置', logout: '退出',
      },
      settings: {
        title: '设置', theme: '主题', light: '浅色', dark: '深色', language: '语言',
      },
      home: {
        noExercisesPrefix: '你还没有练习。', createFirstOne: '创建第一个', noExercisesSuffix: '开始记录。', noRecordsForPeriod: '所选期间没有记录', noRecordsForPeriodHint: '为该期间添加一条记录以开始跟踪你的训练。', addRecordCta: '添加记录',
      },
      dateRange: {
        from: '从', to: '到', today: '今天', lastWeek: '周', lastMonth: '月', lastYear: '年',
      },
      exercises: {
        title: '练习', addTitle: '添加练习', editTitle: '编辑练习', name: '名称', type: '类型', muscles: '肌群', kindReps: 'REPS', kindTime: 'TIME', delete: '删除',
      },
      records: {
        addTitle: '添加记录', editTitle: '编辑记录', exercise: '练习', date: '日期', reps: '次数', durationMs: '时长 (毫秒)', durationMin: '时长 (分钟)', weightKg: '重量 (千克)', note: '备注', repsLabel: '次数', durationLabel: '时长', musclesLabel: '肌群', fallbackExerciseName: '练习',
      },
      actions: { cancel: '取消', save: '保存' },
      statistics: {
        title: '统计', exerciseLabel: '练习', chartRepsPerSet: '练习：每组次数', chartWeight: '练习：重量', chartSetsPerDay: '练习：每天组数', chartOverallRepsPerDay: '总计：每天次数',
      },
      commonTexts: { noDataForPeriod: '所选期间没有数据。', type: '类型', muscles: '肌群' },
    },
  },
  hi: {
    common: {
      appName: 'खेल',
      nav: {
        home: 'होम', exercises: 'व्यायाम', statistics: 'आँकड़े', settings: 'सेटिंग्स', logout: 'लॉगआउट',
      },
      settings: {
        title: 'सेटिंग्स', theme: 'थीम', light: 'लाइट', dark: 'डार्क', language: 'भाषा',
      },
      home: {
        noExercisesPrefix: 'आपके पास कोई व्यायाम नहीं है।', createFirstOne: 'पहला बनाएं', noExercisesSuffix: 'ट्रैकिंग शुरू करने के लिए।', noRecordsForPeriod: 'चुने गए समय के लिए कोई रिकॉर्ड नहीं', noRecordsForPeriodHint: 'इस अवधि के लिए ट्रैकिंग शुरू करने के लिए एक रिकॉर्ड जोड़ें।', addRecordCta: 'रिकॉर्ड जोड़ें',
      },
      dateRange: {
        from: 'से', to: 'तक', today: 'आज', lastWeek: 'सप्ताह', lastMonth: 'महीना', lastYear: 'साल',
      },
      exercises: {
        title: 'व्यायाम', addTitle: 'व्यायाम जोड़ें', editTitle: 'व्यायाम संपादित करें', name: 'नाम', type: 'प्रकार', muscles: 'मसल्स', kindReps: 'REPS', kindTime: 'TIME', delete: 'हटाएं',
      },
      records: {
        addTitle: 'रिकॉर्ड जोड़ें', editTitle: 'रिकॉर्ड संपादित करें', exercise: 'व्यायाम', date: 'तारीख', reps: 'रिप्स', durationMs: 'अवधि (मि.से.)', durationMin: 'अवधि (मिनट)', weightKg: 'वजन (किग्रा.)', note: 'नोट', repsLabel: 'रिप्स', durationLabel: 'अवधि', musclesLabel: 'मसल्स', fallbackExerciseName: 'व्यायाम',
      },
      actions: { cancel: 'रद्द करें', save: 'सेव' },
      statistics: {
        title: 'आँकड़े', exerciseLabel: 'व्यायाम', chartRepsPerSet: 'व्यायाम: प्रति सेट रिप्स', chartWeight: 'व्यायाम: वजन', chartSetsPerDay: 'व्यायाम: प्रति दिन सेट', chartOverallRepsPerDay: 'कुल: प्रति दिन रिप्स',
      },
      commonTexts: { noDataForPeriod: 'चुने गए समय के लिए डेटा नहीं।', type: 'प्रकार', muscles: 'मसल्स' },
    },
  },
  ar: {
    common: {
      appName: 'رياضة',
      nav: {
        home: 'الرئيسية', exercises: 'التمارين', statistics: 'الإحصائيات', settings: 'الإعدادات', logout: 'تسجيل الخروج',
      },
      settings: {
        title: 'الإعدادات', theme: 'السمة', light: 'فاتح', dark: 'داكن', language: 'اللغة',
      },
      home: {
        noExercisesPrefix: 'ليس لديك أي تمارين بعد.', createFirstOne: 'أنشئ الأول', noExercisesSuffix: 'لتبدأ التتبع.', noRecordsForPeriod: 'لا توجد سجلات للفترة المختارة', noRecordsForPeriodHint: 'أضف سجلاً لهذه الفترة لبدء التتبع.', addRecordCta: 'إضافة سجل',
      },
      dateRange: {
        from: 'من', to: 'إلى', today: 'اليوم', lastWeek: 'أسبوع', lastMonth: 'شهر', lastYear: 'سنة',
      },
      exercises: {
        title: 'التمارين', addTitle: 'إضافة تمرين', editTitle: 'تعديل تمرين', name: 'الاسم', type: 'النوع', muscles: 'العضلات', kindReps: 'REPS', kindTime: 'TIME', delete: 'حذف',
      },
      records: {
        addTitle: 'إضافة سجل', editTitle: 'تعديل سجل', exercise: 'تمرين', date: 'تاريخ', reps: 'تكرارات', durationMs: 'المدة (مللي ثانية)', durationMin: 'المدة (دقائق)', weightKg: 'الوزن (كجم)', note: 'ملاحظة', repsLabel: 'تكرارات', durationLabel: 'المدة', musclesLabel: 'العضلات', fallbackExerciseName: 'تمرين',
      },
      actions: { cancel: 'إلغاء', save: 'حفظ' },
      statistics: {
        title: 'الإحصائيات', exerciseLabel: 'تمرين', chartRepsPerSet: 'تمرين: التكرارات لكل مجموعة', chartWeight: 'تمرين: الوزن', chartSetsPerDay: 'تمرين: المجموعات يومياً', chartOverallRepsPerDay: 'الإجمالي: التكرارات يومياً',
      },
      commonTexts: { noDataForPeriod: 'لا توجد بيانات للفترة المختارة.', type: 'النوع', muscles: 'العضلات' },
    },
  },
  bn: {
    common: {
      appName: 'খেলাধুলা',
      nav: {
        home: 'হোম', exercises: 'ব্যায়াম', statistics: 'পরিসংখ্যান', settings: 'সেটিংস', logout: 'লগআউট',
      },
      settings: {
        title: 'সেটিংস', theme: 'থিম', light: 'লাইট', dark: 'ডার্ক', language: 'ভাষা',
      },
      home: {
        noExercisesPrefix: 'আপনার এখনও কোনো ব্যায়াম নেই।', createFirstOne: 'প্রথমটি তৈরি করুন', noExercisesSuffix: 'ট্র্যাকিং শুরু করতে।', noRecordsForPeriod: 'নির্বাচিত সময়ের জন্য কোনো রেকর্ড নেই', noRecordsForPeriodHint: 'এই সময়ের জন্য ট্র্যাকিং শুরু করতে একটি রেকর্ড যোগ করুন।', addRecordCta: 'রেকর্ড যোগ করুন',
      },
      dateRange: {
        from: 'থেকে', to: 'পর্যন্ত', today: 'আজ', lastWeek: 'সপ্তাহ', lastMonth: 'মাস', lastYear: 'বছর',
      },
      exercises: {
        title: 'ব্যায়াম', addTitle: 'ব্যায়াম যোগ করুন', editTitle: 'ব্যায়াম সম্পাদনা করুন', name: 'নাম', type: 'ধরন', muscles: 'মাংসপেশী', kindReps: 'REPS', kindTime: 'TIME', delete: 'মুছুন',
      },
      records: {
        addTitle: 'রেকর্ড যোগ করুন', editTitle: 'রেকর্ড সম্পাদনা করুন', exercise: 'ব্যায়াম', date: 'তারিখ', reps: 'রিপস', durationMs: 'সময়কাল (মিলিসেকেন্ড)', durationMin: 'সময়কাল (মিনিট)', weightKg: 'ওজন (কেজি)', note: 'নোট', repsLabel: 'রিপস', durationLabel: 'সময়কাল', musclesLabel: 'মাংসপেশী', fallbackExerciseName: 'ব্যায়াম',
      },
      actions: { cancel: 'বাতিল', save: 'সংরক্ষণ' },
      statistics: {
        title: 'পরিসংখ্যান', exerciseLabel: 'ব্যায়াম', chartRepsPerSet: 'ব্যায়াম: প্রতি সেট রিপস', chartWeight: 'ব্যায়াম: ওজন', chartSetsPerDay: 'ব্যায়াম: দিনে সেট', chartOverallRepsPerDay: 'মোট: দিনে রিপস',
      },
      commonTexts: { noDataForPeriod: 'নির্বাচিত সময়ের জন্য কোনো তথ্য নেই।', type: 'ধরন', muscles: 'মাংসপেশী' },
    },
  },
};

const storedLang = storage.get<string | null>('language', null);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    lng: storedLang || undefined,
    ns: ['common'],
    defaultNS: 'common',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator', 'htmlTag'],
      lookupLocalStorage: 'i18nextLng',
    },
  });

if (storedLang) {
  i18n.changeLanguage(storedLang);
}

export default i18n;
