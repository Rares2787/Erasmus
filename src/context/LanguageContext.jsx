// ============================================================================
// LER EduShare — Context Internaționalizare (i18n: RO / EN)
// ============================================================================

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../services/translations';

const LanguageContext = createContext(null);
const STORAGE_LANG_KEY = 'ler_selected_language';

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem(STORAGE_LANG_KEY) || 'en';
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_LANG_KEY, lang);
    document.documentElement.setAttribute('lang', lang);
  }, [lang]);

  function toggleLanguage() {
    setLang((prev) => (prev === 'ro' ? 'en' : 'ro'));
  }

  function setLanguage(newLang) {
    if (newLang === 'ro' || newLang === 'en') {
      setLang(newLang);
    }
  }

  function t(key, params = {}) {
    const dict = translations[lang] || translations.en;
    let text = dict[key] || translations.en[key] || translations.ro[key] || key;
    if (params && typeof params === 'object') {
      Object.keys(params).forEach((paramKey) => {
        text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
      });
    }
    return text;
  }

  const value = {
    lang,
    setLanguage,
    toggleLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
