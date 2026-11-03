import { createContext, useContext, useState, useEffect } from 'react';
import { TRANSLATIONS } from '../i18n/translations';

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState('en'); // 'en' | 'kn' | 'hi'

  useEffect(() => {
    const saved = localStorage.getItem('bb_lang');
    if (saved && TRANSLATIONS[saved]) {
      setLang(saved);
    }
  }, []);

  const changeLanguage = (newLang) => {
    if (TRANSLATIONS[newLang]) {
      setLang(newLang);
      localStorage.setItem('bb_lang', newLang);
    }
  };

  const t = (key) => {
    return TRANSLATIONS[lang]?.[key] || TRANSLATIONS['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return {
      lang: 'en',
      changeLanguage: () => {},
      t: (key) => TRANSLATIONS['en'][key] || key
    };
  }
  return ctx;
}

