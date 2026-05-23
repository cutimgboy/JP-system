import { useState } from 'react';
import { useNavigate } from 'react-router';
import { ChevronLeft, Check } from 'lucide-react';
import { motion } from 'motion/react';

export function LanguagePage() {
  const navigate = useNavigate();
  const [currentLang, setCurrentLang] = useState('简体中文');

  const languages = [
    { id: 'en', name: 'English' },
    { id: 'zh-CN', name: '简体中文' },
    { id: 'zh-TW', name: '繁體中文' },
    { id: 'vi', name: 'Tiếng Việt' }, // Vietnamese
    { id: 'th', name: 'ไทย' }, // Thai
    { id: 'ms', name: 'Bahasa Melayu' }, // Malay
    { id: 'id', name: 'Bahasa Indonesia' }, // Indonesian
  ];

  const handleSelect = (langName: string) => {
    setCurrentLang(langName);
    // In a real app, you would apply the language change here (e.g. i18n.changeLanguage)
    setTimeout(() => {
      navigate(-1);
    }, 300);
  };

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col text-white z-50 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          切换语言
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pt-4 pb-[120px]">
        <div className="bg-[#14141c] rounded-[20px] px-2 border-[0.5px] border-white/5 shadow-sm">
          {languages.map((lang, idx) => (
            <motion.div
              key={lang.id}
              onClick={() => handleSelect(lang.name)}
              whileTap={{ scale: 0.98 }}
              className={`flex items-center justify-between py-4 px-3 cursor-pointer transition-colors hover:bg-white/[0.02] ${
                idx !== languages.length - 1 ? 'border-b border-white/5' : ''
              }`}
            >
              <span className={`text-[15px] ${currentLang === lang.name ? 'text-[#6c48f5] font-medium' : 'text-white/90'}`}>
                {lang.name}
              </span>
              {currentLang === lang.name && (
                <Check size={18} className="text-[#6c48f5]" strokeWidth={2.5} />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
