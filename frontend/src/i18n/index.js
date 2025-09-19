import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import es from './resources/es.js';
import en from './resources/en.js';

const resources = {
  es: { translation: es },
  en: { translation: en },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    detection: {
      order: ['querystring', 'localStorage', 'navigator', 'htmlTag'],
      caches: ['localStorage'],
    },
  });

try {
  document.documentElement.setAttribute('lang', i18n.language || 'en');
  i18n.on('languageChanged', (lng) => {
    document.documentElement.setAttribute('lang', lng || 'en');
  });
} catch {}

export default i18n;


