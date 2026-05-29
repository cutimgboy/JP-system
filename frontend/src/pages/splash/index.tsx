import React from "react";
import { useNavigate } from "react-router-dom";
import { LanguageSwitcher } from "../../components/LanguageSwitcher";
import { tx } from "../../i18n/text";
export default function Splash() {
  const navigate = useNavigate();
  const handleStartTrading = () => {
    localStorage.setItem('hasSeenSplash', 'true');
    navigate('/login');
  };
  return <div className="relative w-full h-dvh bg-black overflow-hidden">
      {/* Background Image */}
      <img alt="" className="absolute inset-0 w-full h-full object-cover" src="/bgp.png" />

      <div className="absolute inset-0 mx-auto w-full max-w-[430px]">
        <LanguageSwitcher
          variant="splash"
          className="absolute right-4 top-[calc(env(safe-area-inset-top)+24px)] z-20"
        />

        <div className="absolute left-4 right-4 top-[12dvh] text-white">
          <h1 className="text-[48px] font-semibold leading-none tracking-normal drop-shadow-[0_4px_18px_rgba(0,0,0,0.45)]">
            JMP Trading
          </h1>
          <p className="mt-10 text-[18px] font-medium uppercase leading-none tracking-normal text-white/90">
            {tx("TOP 1 MARKET APP")}
          </p>
          <p className="mt-5 max-w-[330px] text-[42px] font-light leading-[1.08] tracking-normal text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.45)]">
            {tx("The future of trading.")}
          </p>
        </div>

        <div className="absolute bottom-[128px] left-4 right-4 flex items-center gap-3 text-white">
          <img src="/bft.png" alt={tx("巴菲特")} className="h-[58px] w-[58px] shrink-0 rounded-full object-cover object-center shadow-[0_8px_20px_rgba(0,0,0,0.45)]" />
          <div className="min-w-0 text-left drop-shadow-[0_3px_12px_rgba(0,0,0,0.65)]">
            <div className="text-[17px] font-bold leading-[1.15]">{tx("巴菲特")}</div>
            <div className="mt-0.5 max-w-[270px] text-[17px] font-normal leading-[1.15] text-white/95">{tx("世界上最成功的投资者")}</div>
          </div>
        </div>
      </div>

      {/* CTA Button */}
      <div className="absolute bottom-8 left-0 right-0 px-6">
        <button onClick={handleStartTrading} style={{
        backgroundColor: '#ffffff',
        color: '#000000'
      }} className="w-full h-[60px] rounded-[30px] font-bold text-[18px] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] transition-shadow duration-300 cursor-pointer">{tx("开始交易")}</button>
      </div>

      {/* Bottom Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white opacity-80 rounded-full" />
    </div>;
}
