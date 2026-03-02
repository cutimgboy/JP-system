import { useTranslation } from 'react-i18next';
import { useNavigate, useLocation } from 'react-router-dom';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    // 可选：更新 localStorage
    localStorage.setItem('i18nextLng', lng);
  };

  const languages = [
    { code: 'zh-CN', label: '中文' },
    { code: 'en-US', label: 'English' },
  ];

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
      className="px-3 py-1 border rounded"
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.label}
        </option>
      ))}
    </select>
  );
}