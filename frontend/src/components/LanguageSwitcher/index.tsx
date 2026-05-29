import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Check, ChevronDown, Languages } from 'lucide-react';
import { appLanguages, changeAppLanguage, normalizeLanguage, tx, type AppLanguage } from '../../i18n/text';

type LanguageSwitcherProps = {
  className?: string;
  variant?: 'default' | 'splash';
};

export function LanguageSwitcher({ className = '', variant = 'default' }: LanguageSwitcherProps) {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const changeLanguage = (lng: AppLanguage) => {
    void changeAppLanguage(lng);
  };

  const isSplash = variant === 'splash';
  const currentLanguage = normalizeLanguage(i18n.language);
  const languageLabel = (language: AppLanguage) => tx(language === 'vi' ? '越南语' : '简体中文');

  useEffect(() => {
    if (!isSplash || !isOpen) return undefined;

    const closeWhenOutside = (event: MouseEvent | TouchEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', closeWhenOutside);
    document.addEventListener('touchstart', closeWhenOutside);

    return () => {
      document.removeEventListener('mousedown', closeWhenOutside);
      document.removeEventListener('touchstart', closeWhenOutside);
    };
  }, [isOpen, isSplash]);

  if (isSplash) {
    return (
      <div ref={containerRef} className={className}>
        <button
          type="button"
          aria-label={tx('切换语言')}
          aria-expanded={isOpen}
          className="inline-flex h-9 w-[142px] items-center justify-between rounded-full border border-white/20 bg-black/45 px-3 text-[13px] font-medium text-white shadow-[0_8px_24px_rgba(0,0,0,0.3)] outline-none backdrop-blur-md transition-colors hover:bg-black/55 focus:border-white/55"
          onClick={() => setIsOpen(value => !value)}
        >
          <Languages size={15} className="text-white/80" />
          <span className="min-w-0 flex-1 whitespace-nowrap px-1.5 text-center leading-none">{languageLabel(currentLanguage)}</span>
          <ChevronDown size={14} className={`text-white/75 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen ? (
          <div className="absolute right-0 mt-2 w-[142px] overflow-hidden rounded-[16px] border border-white/15 bg-[#15151d]/95 p-1.5 shadow-[0_18px_45px_rgba(0,0,0,0.42)] backdrop-blur-xl">
            {appLanguages.map((lang) => {
              const isSelected = currentLanguage === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  className={`flex h-10 w-full items-center justify-between rounded-[12px] px-3 text-left text-[13px] transition-colors ${
                    isSelected ? 'bg-[#6c48f5] font-semibold text-white' : 'text-white/80 hover:bg-white/[0.08]'
                  }`}
                  onClick={() => {
                    changeLanguage(lang.code);
                    setIsOpen(false);
                  }}
                >
                  <span>{languageLabel(lang.code)}</span>
                  {isSelected ? <Check size={15} strokeWidth={2.5} /> : null}
                </button>
              );
            })}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative inline-flex items-center">
        <select
          aria-label={tx('切换语言')}
          value={currentLanguage}
          onChange={(e) => changeLanguage(normalizeLanguage(e.target.value))}
          className="rounded border px-3 py-1"
        >
          {appLanguages.map((lang) => (
            <option key={lang.code} value={lang.code}>
              {languageLabel(lang.code)}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
