import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './de.json';
import en from './en.json';

// Detect browser language
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = ['de', 'en'].includes(browserLanguage) ? browserLanguage : 'de';

// Check localStorage for saved language preference
const savedLanguage = localStorage.getItem('inventory-language') || defaultLanguage;

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

