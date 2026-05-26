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

if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'vi'],
      defaultNS: 'common',
      ns: ['common'],
      detection: {
        order: ['querystring', 'localStorage'],
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

  document.documentElement.lang = i18n.language === 'vi' ? 'vi' : 'zh-CN';
  i18n.on('languageChanged', (language) => {
    document.documentElement.lang = language === 'vi' ? 'vi' : 'zh-CN';
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
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;
