import { useCallback, useEffect, useState } from 'react';
import { Lang, T, translations } from './i18n';

const LANG_KEY = 'lang';

export function useLang(): [T, () => void] {
  const [lang, setLang] = useState<Lang>('zh');

  useEffect(() => {
    const stored = localStorage.getItem(LANG_KEY) as Lang | null;
    if (stored === 'zh' || stored === 'en') setLang(stored);
  }, []);

  const toggle = useCallback(() => {
    setLang(prev => {
      const next: Lang = prev === 'zh' ? 'en' : 'zh';
      localStorage.setItem(LANG_KEY, next);
      return next;
    });
  }, []);

  return [translations[lang], toggle];
}
