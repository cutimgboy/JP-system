import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// 导入语言资源
import zhCNCommon from './resources/zh-CN/common.json';
import zhCNHome from './resources/zh-CN/home.json';
import enUSCommon from './resources/en-US/common.json';
import enUSHome from './resources/en-US/home.json';

const resources = {
  'zh-CN': {
    common: zhCNCommon,
    home: zhCNHome,
  },
  'en-US': {
    common: enUSCommon,
    home: enUSHome,
  },
};

// 只在浏览器环境中初始化
if (typeof window !== 'undefined') {
  i18n
    .use(LanguageDetector) // 检测用户语言
    .use(initReactI18next) // 初始化 react-i18next
    .init({
      resources,
      fallbackLng: 'zh-CN', // 默认语言
      supportedLngs: ['zh-CN', 'en-US'], // 支持的语言
      defaultNS: 'common', // 默认命名空间
      ns: ['common', 'home'], // 命名空间列表

      // 语言检测配置
      detection: {
        order: ['localStorage', 'navigator', 'htmlTag'],
        caches: ['localStorage'],
        lookupLocalStorage: 'i18nextLng',
      },

      // 其他配置
      interpolation: {
        escapeValue: false, // React 已经转义
      },
      react: {
        useSuspense: false, // SSR 不支持 Suspense
      },
    });
} else {
  // 服务端环境，使用简化配置
  i18n
    .use(initReactI18next)
    .init({
      resources,
      fallbackLng: 'zh-CN',
      supportedLngs: ['zh-CN', 'en-US'],
      defaultNS: 'common',
      ns: ['common', 'home'],
      interpolation: {
        escapeValue: false,
      },
      react: {
        useSuspense: false,
      },
    });
}

export default i18n;