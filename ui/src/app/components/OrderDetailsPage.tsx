import { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router';
import { ChevronLeft, TrendingUp, TrendingDown, Clock, Activity, Target, ShieldCheck, Share, Download, X, Bitcoin } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { toast } from 'sonner';

import { ImageWithFallback } from './figma/ImageWithFallback';

import coverImg from "../../imports/image-9.png";
import qrCodeImg from "../../imports/image-10.png";
import adImg from "../../imports/image-11.png";

export function OrderDetailsPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [showShare, setShowShare] = useState(false);

  // Mock checking the ID to determine direction (just for demo purposes)
  const isUp = id !== 'TRD-10292';
  const asset = isUp ? 'BTC/USDT' : 'ETH/USDT';
  const pnl = isUp ? '+460.00' : '-1000.00';
  const isProfit = pnl.startsWith('+');

  const handleSaveImage = () => {
    toast.success('图片已保存到手机相册');
    setShowShare(false);
  };

  const handleTradeAgain = () => {
    // Navigate back to the trade page for this asset
    navigate('/'); 
  };

  return (
    <div className="absolute inset-0 bg-[#09090b] flex flex-col overflow-hidden text-white z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 h-[60px] shrink-0 border-b border-white/5 relative z-10 bg-[#09090b]/80 backdrop-blur-md">
        <button 
          onClick={() => navigate(-1)} 
          className="w-10 h-10 flex items-center justify-center -ml-2 text-white hover:bg-white/10 rounded-full transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-[18px] font-medium text-white absolute left-1/2 -translate-x-1/2">
          订单详情
        </h1>
        <div className="w-10"></div>
      </div>

      <div className="flex-1 overflow-y-auto pb-[100px]">
        {/* Top PnL Area */}
        <div className="pt-8 pb-6 px-6 flex flex-col items-center border-b border-white/5 bg-gradient-to-b from-[#14141c] to-transparent">
          <div className="text-[#8a8a93] text-[13px] mb-2">盈亏结算 (USDT)</div>
          <div className={`text-[40px] font-bold font-mono tracking-tight mb-2 ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
            {pnl}
          </div>
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[#1a1a24] border border-white/5">
            <span className="w-2 h-2 rounded-full bg-[#8a8a93]"></span>
            <span className="text-[12px] text-[#8a8a93]">已结算</span>
          </div>
        </div>

        {/* Details Card */}
        <div className="px-4 py-6 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#14141c] rounded-[20px] p-5 border border-white/5 shadow-sm space-y-5"
          >
            {/* Header info */}
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[12px] flex items-center justify-center ${
                  isUp ? 'bg-[#10b981]/10 text-[#10b981]' : 'bg-[#ef4444]/10 text-[#ef4444]'
                }`}>
                  {isUp ? <TrendingUp size={22} /> : <TrendingDown size={22} />}
                </div>
                <div>
                  <div className="text-[16px] font-bold">{asset}</div>
                  <div className={`text-[12px] font-medium mt-0.5 ${isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    买{isUp ? '涨' : '跌'}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-[#8a8a93] text-[12px] mb-0.5">订单号</div>
                <div className="text-[13px] font-mono">{id}</div>
              </div>
            </div>

            {/* List items */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">投资金额</span>
                <span className="text-[14px] font-medium font-mono">1,000.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">开仓价格</span>
                <span className="text-[14px] font-medium font-mono">34,512.45</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">结算价格</span>
                <span className="text-[14px] font-medium font-mono">{isUp ? '34,600.12' : '34,520.10'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">收益率</span>
                <span className="text-[14px] font-medium font-mono">92%</span>
              </div>
            </div>
            
            <div className="pt-4 border-t border-white/5 space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">开仓时间</span>
                <span className="text-[14px] text-white/90 font-mono">2023-10-24 16:44:22</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8a8a93] text-[14px]">结算时间</span>
                <span className="text-[14px] text-white/90 font-mono">2023-10-24 16:45:22</span>
              </div>
            </div>
          </motion.div>

          {/* Security note */}
          <div className="flex items-start gap-2 p-4 bg-[#6c48f5]/5 rounded-[16px] border border-[#6c48f5]/10 mb-4">
            <ShieldCheck size={16} className="text-[#6c48f5] mt-0.5 shrink-0" />
            <p className="text-[#8a8a93] text-[12px] leading-relaxed">
              所有交易数据均实时同步至链上/结算中心，保证公开透明。系统采用银行级加密，保障您的资金安全。
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent pb-[calc(1rem+env(safe-area-inset-bottom))] border-t border-white/5 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={handleTradeAgain}
            className="flex-1 h-[52px] rounded-full bg-[#1a1a24] text-white font-medium flex items-center justify-center border border-white/5 active:scale-95 transition-all"
          >
            再来一笔
          </button>
          <button 
            onClick={() => setShowShare(true)}
            className="flex-1 h-[52px] rounded-full bg-[#6c48f5] text-white font-medium flex items-center justify-center shadow-[0_4px_16px_rgba(108,72,245,0.4)] active:scale-95 transition-all"
          >
            <Share size={18} className="mr-2" />
            分享交易
          </button>
        </div>
      </div>

      {/* Share Modal */}
      <AnimatePresence>
        {showShare && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col justify-center items-center bg-black/80 backdrop-blur-sm p-6"
          >
            <button 
              onClick={() => setShowShare(false)}
              className="absolute top-6 right-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white"
            >
              <X size={20} />
            </button>
            
            {/* Share Poster Card */}
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-[320px] bg-[#14141c]/80 backdrop-blur-2xl rounded-[24px] overflow-hidden border border-[#6c48f5]/30 shadow-[0_0_40px_rgba(108,72,245,0.4)] relative flex flex-col"
            >
              {/* Header */}
              <div className="px-6 pt-6 pb-2 flex items-center gap-2 relative z-10">
                <div className="w-6 h-6 rounded bg-[#6c48f5] flex items-center justify-center shadow-[0_0_10px_rgba(108,72,245,0.6)]">
                  <Activity size={14} className="text-white" />
                </div>
                <span className="text-white font-bold text-sm tracking-wider drop-shadow-md">NEXUS TRADE</span>
              </div>

              {/* Data Content */}
              <div className="px-6 pb-4 relative z-10">
                <div className="text-center mb-5">
                  <div className="text-[#8a8a93] text-[13px] mb-1">30s交易收益</div>
                  <div className={`text-[48px] font-bold font-mono leading-none tracking-tight drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    +92<span className="text-[24px]">%</span>
                  </div>
                  <div className={`text-[16px] font-mono mt-2 ${isProfit ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                    {pnl} USDT
                  </div>
                </div>

                <div className="space-y-3 border-t border-white/10 pt-4 mb-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a93] text-sm">交易品种</span>
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-[#f7931a] flex items-center justify-center">
                        <Bitcoin size={14} className="text-white" />
                      </div>
                      <span className="text-white font-medium">{asset}</span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8a8a93] text-sm">交易方向</span>
                    <span className={`font-medium ${isUp ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
                      买{isUp ? '涨' : '跌'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Advertisement Image */}
              <div className="w-full h-[140px] relative mt-2">
                <div className="absolute inset-0 bg-gradient-to-br from-[#6c48f5]/20 to-transparent mix-blend-overlay z-10"></div>
                <img 
                  src={adImg} 
                  alt="Advertisement" 
                  className="w-full h-full object-cover mix-blend-screen opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141c] via-[#14141c]/40 to-transparent z-10"></div>
              </div>

              {/* QR Code Mock */}
              <div className="px-6 pb-6 relative z-10 -mt-8">
                <div className="flex items-center justify-between p-3 bg-white/5 backdrop-blur-md rounded-xl border border-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                  <div className="flex flex-col">
                    <span className="text-white text-sm font-medium">扫码加入交易</span>
                    <span className="text-[#8a8a93] text-xs mt-0.5">交易全球资产 获取全球收益</span>
                  </div>
                  <div className="w-[52px] h-[52px] bg-white rounded-[10px] p-1 shadow-lg shrink-0 overflow-hidden border-2 border-white">
                    <img src={qrCodeImg} alt="QR Code" className="w-full h-full object-cover" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Save Button */}
            <motion.button 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              onClick={handleSaveImage}
              className="mt-8 flex items-center justify-center gap-2 px-8 py-3 rounded-full bg-white text-black font-bold active:scale-95 transition-transform"
            >
              <Download size={18} />
              保存图片
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}