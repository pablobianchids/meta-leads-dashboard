import { createContext, useContext, useState, useCallback } from 'react';
import { TRANSLATIONS, getInitialLang, interpolate } from '../i18n';

const I18nContext = createContext(null);

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(getInitialLang);

  const setLang = useCallback((next) => {
    if (!TRANSLATIONS[next]) return;
    setLangState(next);
    try { localStorage.setItem('dashboardLang', next); } catch {}
  }, []);

  const t = useCallback((key, vars) => {
    const raw = TRANSLATIONS[lang][key] ?? key;
    return vars ? interpolate(raw, vars) : raw;
  }, [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export const useI18n = () => {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error('useI18n must be used inside I18nProvider');
  return ctx;
};
