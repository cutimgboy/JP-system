import { useTranslation } from 'react-i18next';
import { appLanguages, changeAppLanguage, normalizeLanguage, type AppLanguage } from '../../i18n/text';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: AppLanguage) => {
    void changeAppLanguage(lng);
  };

  return (
    <select
      value={normalizeLanguage(i18n.language)}
      onChange={(e) => changeLanguage(normalizeLanguage(e.target.value))}
      className="px-3 py-1 border rounded"
    >
      {appLanguages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
