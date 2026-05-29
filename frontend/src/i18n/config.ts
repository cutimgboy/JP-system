import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import zhCNCommon from './resources/zh-CN/common.json';
import viCommon from './resources/vi/common.json';

const resources = {
  'zh-CN': {
    common: zhCNCommon,
  },
  'vi': {
    common: viCommon,
  },
};

type SupportedLanguage = 'zh-CN' | 'vi';

const normalizeSupportedLanguage = (language?: string | null): SupportedLanguage => {
  return language?.toLowerCase().startsWith('vi') ? 'vi' : 'zh-CN';
};

const getBrowserLanguage = () => {
  const languages = window.navigator.languages?.length ? window.navigator.languages : [window.navigator.language];
  return languages.find(Boolean) || null;
};

const getInitialLanguage = (): SupportedLanguage => {
  const queryLanguage = new URLSearchParams(window.location.search).get('lng');
  const savedLanguage = window.localStorage.getItem('i18nextLng');
  return normalizeSupportedLanguage(queryLanguage || savedLanguage || getBrowserLanguage());
};

if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      lng: getInitialLanguage(),
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'vi'],
      defaultNS: 'common',
      ns: ['common'],
      keySeparator: false,
      nsSeparator: false,
      detection: {
        order: ['querystring', 'localStorage', 'navigator'],
        caches: ['localStorage'],
        lookupQuerystring: 'lng',
        lookupLocalStorage: 'i18nextLng',
      },
      nonExplicitSupportedLngs: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });

  document.documentElement.lang = normalizeSupportedLanguage(i18n.language);
  i18n.on('languageChanged', (language) => {
    document.documentElement.lang = normalizeSupportedLanguage(language);
  });
} else {
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'vi'],
      defaultNS: 'common',
      ns: ['common'],
      keySeparator: false,
      nsSeparator: false,
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
