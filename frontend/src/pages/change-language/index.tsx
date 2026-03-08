import { ArrowLeft, Battery, Wifi, Signal, Check } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'en-US', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export function ChangeLanguage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [selectedLanguage, setSelectedLanguage] = useState(() => {
    // 直接从 localStorage 读取，而不是依赖 i18n.language
    return localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN';
  });

  useEffect(() => {
    // 初始化时设置当前语言
    const savedLanguage = localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN';
    setSelectedLanguage(savedLanguage);
    // 确保 i18n 使用正确的语言
    if (i18n.language !== savedLanguage) {
      i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Status Bar */}
      <div className="bg-[#141820] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white">12:00</div>
          <div className="flex items-center gap-1 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate('/profile')}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">{t('language.title')}</h1>
        </div>
      </div>

      {/* Language List */}
      <div className="px-4 pt-4 space-y-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={`w-full bg-[#1f2633] rounded-xl p-4 border ${
              selectedLanguage === language.code
                ? 'border-blue-500 bg-blue-500/10'
                : 'border-gray-700/50'
            } flex items-center justify-between hover:bg-gray-700/30 transition-colors`}
          >
            <div className="text-left">
              <div className="text-white font-medium">{language.nativeName}</div>
              <div className="text-gray-400 text-sm">{language.name}</div>
            </div>
            {selectedLanguage === language.code && (
              <Check className="w-5 h-5 text-blue-400" />
            )}
          </button>
        ))}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
