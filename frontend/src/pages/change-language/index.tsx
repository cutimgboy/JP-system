import { useEffect, useState } from 'react';
import { Check, ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
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
  const [selectedLanguage, setSelectedLanguage] = useState(() => localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('i18nextLng') || i18n.language || 'zh-CN';
    setSelectedLanguage(savedLanguage);
    if (i18n.language !== savedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (languageCode: string) => {
    setSelectedLanguage(languageCode);
    void i18n.changeLanguage(languageCode);
    localStorage.setItem('i18nextLng', languageCode);
    setTimeout(() => navigate(-1), 250);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">切换语言</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[120px] pt-4">
        <div className="rounded-[20px] border border-white/5 bg-[#14141c] px-2 shadow-sm">
          {languages.map((language, index) => (
            <motion.button
              key={language.code}
              type="button"
              onClick={() => handleLanguageChange(language.code)}
              whileTap={{ scale: 0.98 }}
              className={`flex w-full items-center justify-between px-3 py-4 text-left transition-colors hover:bg-white/[0.02] ${
                index !== languages.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <div>
                <div className={`text-[15px] ${selectedLanguage === language.code ? 'font-medium text-[#6c48f5]' : 'text-white/90'}`}>
                  {language.nativeName}
                </div>
                <div className="mt-0.5 text-[12px] text-[#8a8a93]">{language.name}</div>
              </div>
              {selectedLanguage === language.code ? <Check size={18} className="text-[#6c48f5]" strokeWidth={2.5} /> : null}
            </motion.button>
          ))}
        </div>

        <p className="mt-4 px-1 text-[12px] leading-relaxed text-[#8a8a93]">
          当前仅展示已配置翻译资源的语言。新增语言需要先补齐对应的资源文件。
        </p>
      </div>
    </div>
  );
}
