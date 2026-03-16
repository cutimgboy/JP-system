import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

function Background() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-black">
      <motion.img
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        alt="Background"
        className="absolute inset-0 w-full h-full object-cover opacity-80"
        src="/bg.png"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/90" />
    </div>
  );
}

export default function Splash() {
  const navigate = useNavigate();

  const handleStartTrading = () => {
    localStorage.setItem('hasSeenSplash', 'true');
    navigate('/login');
  };

  return (
    <div className="relative w-full h-dvh max-w-md mx-auto bg-black text-white font-sans overflow-hidden shadow-2xl">
      <Background />

      {/* Main Content Layer */}
      <div className="relative z-10 w-full h-full flex flex-col justify-between pt-8 pb-8 px-6">

        {/* Top Header */}
        <div className="flex-1 flex flex-col pt-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            className="text-[48px] leading-[1.1] font-bold tracking-tight mb-8"
          >
            JPM Trading
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6, ease: "easeOut" }}
            className="flex flex-col gap-3 mt-4"
          >
            <p className="text-[#d1d5dc] text-[11px] font-bold tracking-[2.2px] uppercase">
              TOP 1 MARKET APP
            </p>
            <h2 className="text-[44px] leading-[1.1] font-medium tracking-wide">
              The future<br/>of trading.
            </h2>
          </motion.div>
        </div>

        {/* Bottom Section */}
        <div className="flex flex-col gap-8 w-full pb-[20px]">
          {/* Profile */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.9, ease: "easeOut" }}
            className="flex items-center gap-4"
          >
            <div className="relative w-[56px] h-[56px] rounded-full p-[1.5px] bg-gradient-to-tr from-gray-700 to-gray-400">
              <div className="w-full h-full rounded-full overflow-hidden bg-black border-[1.5px] border-[#1e2939]">
                <img src="/bft.png" alt="巴菲特" className="w-full h-full object-cover" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-[18px]">巴菲特</span>
              <span className="text-[#99a1af] text-[14px]">世界上最成功的投资者</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.1, ease: "easeOut" }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            onClick={handleStartTrading}
            style={{ backgroundColor: '#ffffff', color: '#000000' }}
            className="w-full h-[60px] rounded-[30px] font-bold text-[18px] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.25)] transition-shadow duration-300 cursor-pointer"
          >
            开始交易
          </motion.button>
        </div>

        {/* Bottom Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[130px] h-[5px] bg-white opacity-80 rounded-full"
        />
      </div>
    </div>
  );
}
