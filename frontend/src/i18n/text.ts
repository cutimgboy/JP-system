import i18n from './config';

export const LANGUAGE_STORAGE_KEY = 'i18nextLng';

export type AppLanguage = 'zh-CN' | 'vi';

export const appLanguages: Array<{ code: AppLanguage; name: string; nativeName: string }> = [
  { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
  { code: 'vi', name: '越南语', nativeName: 'Tiếng Việt' },
];

export function normalizeLanguage(language?: string | null): AppLanguage {
  return language?.toLowerCase().startsWith('vi') ? 'vi' : 'zh-CN';
}

export function getCurrentLanguage(): AppLanguage {
  return normalizeLanguage(i18n.language || localStorage.getItem(LANGUAGE_STORAGE_KEY));
}

export function getLocale() {
  return getCurrentLanguage() === 'vi' ? 'vi-VN' : 'zh-CN';
}

export function tx(key: string, options?: Record<string, unknown>) {
  return i18n.t(key, { defaultValue: key, ...options });
}

export async function changeAppLanguage(language: AppLanguage) {
  const normalized = normalizeLanguage(language);
  localStorage.setItem(LANGUAGE_STORAGE_KEY, normalized);
  await i18n.changeLanguage(normalized);
  document.documentElement.lang = normalized === 'vi' ? 'vi' : 'zh-CN';
}
