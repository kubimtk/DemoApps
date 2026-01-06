import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './de.json';
import en from './en.json';

// Detect browser language (with fallback for tests)
const getBrowserLanguage = () => {
  if (typeof navigator !== 'undefined' && navigator.language) {
    return navigator.language.split('-')[0];
  }
  return 'en'; // Default for test environment
};

const browserLanguage = getBrowserLanguage();
const defaultLanguage = ['de', 'en'].includes(browserLanguage) ? browserLanguage : 'de';

// Check localStorage for saved language preference (with fallback for tests)
const getSavedLanguage = () => {
  if (typeof localStorage !== 'undefined') {
    return localStorage.getItem('inventory-language') || defaultLanguage;
  }
  return defaultLanguage;
};

const savedLanguage = getSavedLanguage();

i18n
  .use(initReactI18next)
  .init({
    resources: {
      de: { translation: de },
      en: { translation: en }
    },
    lng: savedLanguage,
    fallbackLng: 'de',
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;

