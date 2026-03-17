import React from "react";
import { useNavigate } from "react-router-dom";

export default function Splash() {
  const navigate = useNavigate();

  const handleStartTrading = () => {
    localStorage.setItem('hasSeenSplash', 'true');
    navigate('/login');
  };

  return (
    <div className="relative w-full h-dvh bg-black overflow-hidden">
      {/* Background Image */}
      <img
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover"
        src="/bg.png"
      />

      {/* CTA Button */}
      <div className="absolute bottom-8 left-0 right-0 px-6">
        <button
          onClick={handleStartTrading}
          style={{ backgroundColor: '#ffffff', color: '#000000' }}
          className="w-full h-[60px] rounded-[30px] font-bold text-[18px] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] transition-shadow duration-300 cursor-pointer"
        >
          开始交易
        </button>
      </div>

      {/* Bottom Indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white opacity-80 rounded-full" />
    </div>
  );
}
