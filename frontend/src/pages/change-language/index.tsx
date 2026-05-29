import { useEffect, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import i18n from '../../i18n/config';
import { appLanguages, changeAppLanguage, normalizeLanguage, tx, type AppLanguage } from '../../i18n/text';
import { goBackOrNavigate } from '../../utils/navigation';

export function ChangeLanguage() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState(() => normalizeLanguage(localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN'));

  useEffect(() => {
    const savedLanguage = normalizeLanguage(localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN');
    setSelectedLanguage(savedLanguage);
    if (i18n.language !== savedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode: AppLanguage) => {
    setSelectedLanguage(languageCode);
    void changeAppLanguage(languageCode);
    setTimeout(() => goBackOrNavigate(navigate, '/profile'), 250);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => goBackOrNavigate(navigate, '/profile')}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">{tx('切换语言')}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-4">
        <div className="rounded-[20px] border border-white/5 bg-[#14141c] px-2 shadow-sm">
          {appLanguages.map((language, index) => (
            <motion.button
              key={language.code}
              type="button"
              onClick={() => handleLanguageChange(language.code)}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center justify-between px-3 py-4 text-left transition-colors hover:bg-white/[0.02] ${
                index !== appLanguages.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <span className={`text-[15px] ${selectedLanguage === language.code ? 'font-medium text-[#6c48f5]' : 'text-white/90'}`}>
                {language.name}
              </span>
              {selectedLanguage === language.code ? <Check size={18} className="text-[#6c48f5]" strokeWidth={2.5} /> : null}
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
