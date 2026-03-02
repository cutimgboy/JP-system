import { ArrowLeft, Battery, Wifi, Signal, Check } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const languages: Language[] = [
  { code: 'zh-CN', name: 'Chinese (Simplified)', nativeName: '简体中文' },
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
];

export function ChangeLanguage() {
  const navigate = useNavigate();
  const [selectedLanguage, setSelectedLanguage] = useState('zh-CN');

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
          <h1 className="text-white text-base font-medium">切换语言</h1>
        </div>
      </div>

      {/* Language List */}
      <div className="px-4 pt-4 space-y-2">
        {languages.map((language) => (
          <button
            key={language.code}
            onClick={() => setSelectedLanguage(language.code)}
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
