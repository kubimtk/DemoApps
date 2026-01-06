# 🌍 Internationalization (i18n) Implementation

## Overview

The Inventory Management application now supports **German (DE)** and **English (EN)** languages with seamless switching and language persistence.

---

## 📦 Implementation Details

### **Technologies Used**
- **i18next**: Core internationalization framework
- **react-i18next**: React bindings for i18next
- **localStorage**: Persists user language preference

### **Project Structure**

```
frontend/src/
├── i18n/
│   ├── config.ts       # i18n configuration
│   ├── de.json         # German translations
│   └── en.json         # English translations
├── App.tsx             # Updated with translation hooks
└── App.css             # Styles for language switcher
```

---

## 🔧 Configuration

### **i18n Config (`src/i18n/config.ts`)**

```typescript
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import de from './de.json';
import en from './en.json';

// Auto-detect browser language
const browserLanguage = navigator.language.split('-')[0];
const defaultLanguage = ['de', 'en'].includes(browserLanguage) 
  ? browserLanguage 
  : 'de';

// Load saved language from localStorage
const savedLanguage = localStorage.getItem('inventory-language') 
  || defaultLanguage;

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
```

**Features:**
- ✅ Auto-detects browser language
- ✅ Falls back to German if language not supported
- ✅ Remembers user preference in localStorage

---

## 📝 Translation Files

### **Translation Structure**

Both `de.json` and `en.json` follow this structure:

```json
{
  "app": {
    "title": "...",
    "mockMode": "...",
    "mockModeDescription": "...",
    "resetData": "...",
    "resetConfirm": "...",
    "resetSuccess": "..."
  },
  "scanner": {
    "title": "...",
    "inputPlaceholder": "...",
    "scanButton": "...",
    "productNotFound": "...",
    "connectionError": "..."
  },
  "product": {
    "barcode": "...",
    "warehouse": "...",
    "currentStock": "...",
    "stock": "...",
    "lowStockWarning": "...",
    "removeError": "...",
    "negativeStockError": "...",
    "updateError": "..."
  },
  "actions": {
    "add5": "...",
    "remove3": "..."
  },
  "filter": {
    "label": "...",
    "all": "...",
    "workshop": "...",
    "storage": "..."
  },
  "overview": {
    "title": "..."
  }
}
```

---

## 🎨 UI Components

### **Language Switcher**

Located in the header, next to the app title:

```tsx
<div className="language-switcher">
  <button 
    className={i18n.language === 'de' ? 'active' : ''}
    onClick={() => changeLanguage('de')}
  >
    🇩🇪 DE
  </button>
  <button 
    className={i18n.language === 'en' ? 'active' : ''}
    onClick={() => changeLanguage('en')}
  >
    🇬🇧 EN
  </button>
</div>
```

**Features:**
- ✅ Visual feedback for active language
- ✅ Flag icons for better UX
- ✅ Instant language switching

---

## 💾 Language Persistence

### **How It Works**

1. **Initial Load:**
   - Check localStorage for saved language
   - If not found, use browser language
   - If browser language not supported, use German (default)

2. **Language Change:**
   - User clicks language button
   - App updates i18n language
   - Preference saved to localStorage
   - All text updates instantly

3. **Page Refresh:**
   - Language preference loads from localStorage
   - App maintains user's choice

**localStorage Key:** `inventory-language`  
**Possible Values:** `"de"` or `"en"`

---

## 🔍 Usage in Components

### **Basic Usage**

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <div>
      <h1>{t('app.title')}</h1>
      <p>{t('scanner.inputPlaceholder')}</p>
      <button onClick={() => i18n.changeLanguage('en')}>
        Switch to English
      </button>
    </div>
  );
}
```

### **Translation Function**

- `t('key')`: Returns translated string
- `t('nested.key')`: Access nested translations
- `i18n.language`: Current language code
- `i18n.changeLanguage(lng)`: Switch language

---

## 🌐 Supported Languages

| Language | Code | Flag | Status |
|----------|------|------|--------|
| German   | `de` | 🇩🇪   | ✅ Complete |
| English  | `en` | 🇬🇧   | ✅ Complete |

---

## 🧪 Testing

### **Manual Testing Checklist**

- [x] Language switcher buttons work
- [x] All UI text translates correctly
- [x] Error messages display in correct language
- [x] Language persists after page refresh
- [x] Mock mode banner translates
- [x] Product warnings translate
- [x] Action buttons translate
- [x] Filter labels translate

### **Browser Compatibility**

- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari
- ✅ Mobile browsers

---

## 🎯 Key Features

### **1. Full UI Translation**
Every user-facing text element is translated:
- Page titles and headings
- Button labels
- Input placeholders
- Error messages
- Warning messages
- Filter options

### **2. Product Names Stay German**
Product names (`Schrauben M3`, `Muttern M5`) remain in German as they are **product identifiers**, not UI text. This is intentional and follows best practices for inventory systems.

### **3. Warehouse Names**
Warehouse names (`Werkstatt`, `Lager`) remain in German as they are business-specific terms that may not need translation in a German inventory system.

---

## 🚀 Adding New Languages

To add a new language (e.g., French):

1. **Create translation file:**
   ```bash
   cp src/i18n/en.json src/i18n/fr.json
   ```

2. **Translate all strings in `fr.json`**

3. **Update `config.ts`:**
   ```typescript
   import fr from './fr.json';
   
   i18n.init({
     resources: {
       de: { translation: de },
       en: { translation: en },
       fr: { translation: fr }  // Add new language
     },
     // ...
   });
   ```

4. **Add language button:**
   ```tsx
   <button 
     className={i18n.language === 'fr' ? 'active' : ''}
     onClick={() => changeLanguage('fr')}
   >
     🇫🇷 FR
   </button>
   ```

---

## 📊 Translation Coverage

| Category | Keys | DE | EN |
|----------|------|----|----|
| App      | 6    | ✅ | ✅ |
| Scanner  | 5    | ✅ | ✅ |
| Product  | 8    | ✅ | ✅ |
| Actions  | 2    | ✅ | ✅ |
| Filter   | 4    | ✅ | ✅ |
| Overview | 1    | ✅ | ✅ |
| **Total** | **26** | ✅ | ✅ |

---

## 🔄 Mock Mode Compatibility

The i18n implementation works seamlessly with both:
- ✅ **Real Backend API** (localhost/production)
- ✅ **Mock Mode** (Vercel deployment with localStorage)

Translation state is independent of data persistence.

---

## 📱 Responsive Design

The language switcher adapts to different screen sizes:
- **Desktop**: Displayed inline with title
- **Mobile**: Wraps below title with gap spacing

---

## 🐛 Known Issues

None. All translations tested and working correctly.

---

## 📚 Resources

- [i18next Documentation](https://www.i18next.com/)
- [react-i18next Documentation](https://react.i18next.com/)
- [BDD Feature Files](./english.inventory.feature)

---

## ✅ Implementation Checklist

- [x] Install i18next and react-i18next
- [x] Create translation files (de.json, en.json)
- [x] Configure i18n with localStorage persistence
- [x] Update App.tsx with useTranslation hook
- [x] Replace all hardcoded strings with t() calls
- [x] Add language switcher UI
- [x] Style language switcher buttons
- [x] Test language switching
- [x] Test persistence across refreshes
- [x] Verify mock mode compatibility
- [x] Build and verify no TypeScript errors
- [x] Document implementation

---

## 🎉 Result

The application now provides a **professional bilingual experience** with:
- ✅ Instant language switching
- ✅ Persistent user preferences
- ✅ Complete UI translation coverage
- ✅ Modern, accessible language switcher
- ✅ Zero performance impact
- ✅ Seamless integration with existing features

**Status:** 🟢 **PRODUCTION READY**

