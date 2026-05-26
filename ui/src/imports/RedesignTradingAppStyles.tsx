import svgPaths from "./svg-oka71vbtzs";
import imgContainer from "figma:asset/a051d475d6f74bd8a2670c733ce115a21182f8b7.png";
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { BarChart2, ArrowLeftRight, Trophy, Briefcase, User, ChevronDown as ChevronDownIcon, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { TradePage } from '../app/components/TradePage';
import { PositionsPage } from '../app/components/PositionsPage';
import { ProfilePage } from '../app/components/ProfilePage';
import { RankingPage } from '../app/components/RankingPage';

export function AccountSelector() {
  const [accountType, setAccountType] = useState<'demo' | 'real'>('demo');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const accounts = {
    demo: { id: 'demo', label: '模拟', fullLabel: '模拟账户', balance: '500,000.00 VND' },
    real: { id: 'real', label: '真实', fullLabel: '真实账户', balance: '0.00 VND' },
  };

  const current = accounts[accountType];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative z-50 flex-1" ref={dropdownRef}>
      {/* Header trigger */}
      <div 
        className="flex items-center gap-3 cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        {/* Circle Avatar */}
        <div className="w-[42px] h-[42px] rounded-full border border-white/20 flex items-center justify-center bg-transparent shrink-0">
          <span className="text-white text-[14px] font-['Inter:Medium'] font-medium">{current.label}</span>
        </div>
        
        {/* Text details */}
        <div className="flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <span className="text-[#8a8a93] text-[12px] font-medium tracking-wide">可用资金</span>
            <ChevronDownIcon size={14} className={`text-[#8a8a93] transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
          </div>
          <span className="text-white text-[18px] font-bold leading-none font-mono tracking-tight">${current.balance.replace(' VND', '')}</span>
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute left-0 top-[calc(100%+16px)] w-[240px] bg-white rounded-[24px] shadow-[0_20px_40px_-10px_rgba(0,0,0,0.5)] overflow-hidden"
          >
            <div className="flex flex-col p-1">
              {Object.values(accounts).map((acc, index) => {
                const isSelected = accountType === acc.id;
                return (
                  <div 
                    key={acc.id}
                    onClick={() => { setAccountType(acc.id as 'demo'|'real'); setIsOpen(false); }}
                    className={`
                      p-4 flex items-center justify-between cursor-pointer rounded-[20px] transition-colors
                      ${isSelected ? 'bg-gray-50' : 'hover:bg-gray-50'}
                      ${index !== 0 ? 'mt-1' : ''}
                    `}
                  >
                    <div className="flex flex-col gap-1">
                      <span className="text-[14px] font-semibold text-gray-900">{acc.fullLabel}</span>
                      <span className="text-[13px] font-mono font-medium text-gray-600">{acc.balance}</span>
                    </div>
                    {isSelected && (
                      <div className="w-[22px] h-[22px] rounded-full border-2 border-[#10b981] flex items-center justify-center">
                        <CheckCircle2 size={14} className="text-[#10b981]" strokeWidth={3} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Div1() {
  return <div className="h-[40px] shrink-0 w-[91px]" data-name="div" />;
}

export function DepositButton() {
  const navigate = useNavigate();
  return (
    <button 
      onClick={() => navigate('/deposit')}
      className="bg-[#6c48f5] flex h-[38px] items-center justify-center rounded-[16px] shadow-[0px_10px_15px_0px_rgba(108,72,245,0.2),0px_4px_6px_0px_rgba(108,72,245,0.2)] w-[82px] cursor-pointer hover:bg-[#5a3bd9] transition-colors shrink-0 ml-4">
      <span className="font-['Inter:Medium','Noto_Sans_JP:Medium',sans-serif] font-medium leading-[16px] not-italic relative shrink-0 text-[14px] text-white whitespace-nowrap">存款交易</span>
    </button>
  );
}

function Header() {
  return (
    <div className="absolute content-stretch flex h-[48px] items-center justify-between left-[24px] top-[24px] w-[337px]" data-name="header">
      <AccountSelector />
      <DepositButton />
    </div>
  );
}

function H() {
  return (
    <div className="content-stretch flex h-[35.991px] items-start relative shrink-0 w-full" data-name="h1">
      <p className="flex-[1_0_0] font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[36px] min-h-px min-w-px not-italic relative text-[30px] text-white tracking-[0.3955px]">你好 交易者~</p>
    </div>
  );
}

function Container4() {
  return (
    <div className="absolute content-stretch flex flex-col h-[63.978px] items-start left-[23.99px] top-[95.99px] w-[337.227px]" data-name="Container">
      <H />
    </div>
  );
}

function Container8() {
  return <div className="bg-white shrink-0 size-[19.994px]" data-name="Container" />;
}

function Container7() {
  return (
    <div className="bg-[#155dfc] relative rounded-[26164800px] shadow-[0px_10px_15px_0px_rgba(21,93,252,0.2),0px_4px_6px_0px_rgba(21,93,252,0.2)] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function H2() {
  return (
    <div className="h-[22.492px] relative shrink-0 w-full" data-name="h4">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">Chainlink</p>
    </div>
  );
}

function P() {
  return (
    <div className="h-[16.497px] relative shrink-0 w-full" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6a7282] text-[11px] top-[0.56px] tracking-[0.0645px] whitespace-nowrap">CHKUSD</p>
    </div>
  );
}

function Container9() {
  return (
    <div className="h-[38.989px] relative shrink-0 w-[66.329px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative size-full">
        <H2 />
        <P />
      </div>
    </div>
  );
}

function Div2() {
  return (
    <div className="h-[40px] relative shrink-0 w-[118.318px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.989px] items-center relative size-full">
        <Container7 />
        <Container9 />
      </div>
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[23.99px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <div className="absolute inset-[26.38%_0]" data-name="Vector">
        <div className="absolute inset-[-10%_-1.15%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 101.03 13.5997">
            <path d={svgPaths.p27bf3300} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeWidth="2.26662" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Div3() {
  return (
    <div className="flex-[1_0_0] h-[23.99px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[15.997px] pr-[15.998px] relative size-full">
        <Svg />
      </div>
    </div>
  );
}

function P1() {
  return (
    <div className="h-[22.492px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[55px] not-italic text-[15px] text-right text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">$ 20.22</p>
    </div>
  );
}

function TrendingDown() {
  return (
    <div className="absolute left-[6.45px] size-[9.991px] top-[2.5px]" data-name="TrendingDown">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99082 9.99082">
        <g clipPath="url(#clip0_1_223)" id="TrendingDown">
          <path d={svgPaths.p28feff00} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
          <path d={svgPaths.p27269c6f} id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
        </g>
        <defs>
          <clipPath id="clip0_1_223">
            <rect fill="white" height="9.99082" width="9.99082" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function P2() {
  return (
    <div className="h-[14.998px] relative shrink-0 w-full" data-name="p">
      <TrendingDown />
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[55.43px] not-italic text-[#ef4444] text-[10px] text-right top-[0.56px] tracking-[0.1172px] whitespace-nowrap">{` 4.36 %`}</p>
    </div>
  );
}

function Div4() {
  return (
    <div className="h-[39.488px] relative shrink-0 w-[54.596px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <P1 />
        <P2 />
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#14141c] h-[73.554px] relative rounded-[24px] shrink-0 w-[337.227px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16.778px] py-[0.78px] relative size-full">
        <Div2 />
        <Div3 />
        <Div4 />
      </div>
    </div>
  );
}

function Container11() {
  return <div className="bg-white shrink-0 size-[19.994px]" data-name="Container" />;
}

function Container10() {
  return (
    <div className="bg-[#10b981] relative rounded-[26164800px] shadow-[0px_10px_15px_0px_rgba(16,185,129,0.2),0px_4px_6px_0px_rgba(16,185,129,0.2)] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Container11 />
      </div>
    </div>
  );
}

function H3() {
  return (
    <div className="absolute h-[22.492px] left-0 top-0 w-[78.562px]" data-name="h4">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">Compound</p>
    </div>
  );
}

function P3() {
  return (
    <div className="absolute h-[16.497px] left-0 top-[22.49px] w-[78.562px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6a7282] text-[11px] top-[0.56px] tracking-[0.0645px] whitespace-nowrap">0.065</p>
    </div>
  );
}

function Container12() {
  return (
    <div className="h-[38.989px] relative shrink-0 w-[78.562px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H3 />
        <P3 />
      </div>
    </div>
  );
}

function Div5() {
  return (
    <div className="h-[40px] relative shrink-0 w-[130.551px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.989px] items-center relative size-full">
        <Container10 />
        <Container12 />
      </div>
    </div>
  );
}

function Svg1() {
  return (
    <div className="h-[23.99px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <div className="absolute inset-[10.63%_0_26.38%_0]" data-name="Vector">
        <div className="absolute inset-[-7.5%_-1.31%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 88.4682 17.3775">
            <path d={svgPaths.p2998680} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeWidth="2.26662" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Div6() {
  return (
    <div className="flex-[1_0_0] h-[23.99px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[15.998px] pr-[15.997px] relative size-full">
        <Svg1 />
      </div>
    </div>
  );
}

function P4() {
  return (
    <div className="h-[22.492px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[55px] not-italic text-[15px] text-right text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">$ 30.22</p>
    </div>
  );
}

function TrendingDown1() {
  return (
    <div className="absolute left-[6.77px] size-[9.991px] top-[2.5px]" data-name="TrendingDown">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99082 9.99082">
        <g clipPath="url(#clip0_1_223)" id="TrendingDown">
          <path d={svgPaths.p28feff00} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
          <path d={svgPaths.p27269c6f} id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
        </g>
        <defs>
          <clipPath id="clip0_1_223">
            <rect fill="white" height="9.99082" width="9.99082" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function P5() {
  return (
    <div className="h-[14.998px] relative shrink-0 w-full" data-name="p">
      <TrendingDown1 />
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[55.76px] not-italic text-[#ef4444] text-[10px] text-right top-[0.56px] tracking-[0.1172px] whitespace-nowrap">{` 4.36 %`}</p>
    </div>
  );
}

function Div7() {
  return (
    <div className="h-[39.488px] relative shrink-0 w-[54.925px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <P4 />
        <P5 />
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-[#14141c] h-[73.554px] relative rounded-[24px] shrink-0 w-[337.227px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16.778px] py-[0.78px] relative size-full">
        <Div5 />
        <Div6 />
        <Div7 />
      </div>
    </div>
  );
}

function Span1() {
  return (
    <div className="h-[27.999px] relative shrink-0 w-[13.171px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[28px] left-0 not-italic text-[20px] text-white top-[-0.44px] tracking-[-0.4492px] whitespace-nowrap">B</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="bg-[#f7931a] relative rounded-[26164800px] shadow-[0px_10px_15px_0px_rgba(247,147,26,0.2),0px_4px_6px_0px_rgba(247,147,26,0.2)] shrink-0 size-[40px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Span1 />
      </div>
    </div>
  );
}

function H4() {
  return (
    <div className="absolute h-[22.492px] left-0 top-0 w-[49.662px]" data-name="h4">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">Bitcoin</p>
    </div>
  );
}

function P6() {
  return (
    <div className="absolute h-[16.497px] left-0 top-[22.49px] w-[49.662px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6a7282] text-[11px] top-[0.56px] tracking-[0.0645px] whitespace-nowrap">0.065</p>
    </div>
  );
}

function Container14() {
  return (
    <div className="h-[38.989px] relative shrink-0 w-[49.662px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H4 />
        <P6 />
      </div>
    </div>
  );
}

function Div8() {
  return (
    <div className="h-[40px] relative shrink-0 w-[101.651px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.989px] items-center relative size-full">
        <Container13 />
        <Container14 />
      </div>
    </div>
  );
}

function Svg2() {
  return (
    <div className="h-[23.99px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <div className="absolute inset-[26.38%_0]" data-name="Vector">
        <div className="absolute inset-[-10%_-0.97%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 119.708 13.6003">
            <path d={svgPaths.p180cfd00} id="Vector" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeWidth="2.26662" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Div9() {
  return (
    <div className="flex-[1_0_0] h-[23.99px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[15.997px] pr-[15.998px] relative size-full">
        <Svg2 />
      </div>
    </div>
  );
}

function P7() {
  return (
    <div className="h-[22.492px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[53px] not-italic text-[15px] text-right text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">$ 10.22</p>
    </div>
  );
}

function TrendingUp() {
  return (
    <div className="absolute left-[4.43px] size-[9.991px] top-[2.5px]" data-name="TrendingUp">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99082 9.99082">
        <g clipPath="url(#clip0_1_199)" id="TrendingUp">
          <path d={svgPaths.p17ecd180} id="Vector" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
          <path d={svgPaths.p2cadd780} id="Vector_2" stroke="var(--stroke-0, #10B981)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
        </g>
        <defs>
          <clipPath id="clip0_1_199">
            <rect fill="white" height="9.99082" width="9.99082" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function P8() {
  return (
    <div className="h-[14.998px] relative shrink-0 w-full" data-name="p">
      <TrendingUp />
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[53.42px] not-italic text-[#10b981] text-[10px] text-right top-[0.56px] tracking-[0.1172px] whitespace-nowrap">{` 4.36 %`}</p>
    </div>
  );
}

function Div10() {
  return (
    <div className="h-[39.488px] relative shrink-0 w-[52.586px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <P7 />
        <P8 />
      </div>
    </div>
  );
}

function Link2() {
  return (
    <div className="bg-[#14141c] h-[73.554px] relative rounded-[24px] shrink-0 w-[337.227px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between pl-[16.778px] pr-[16.777px] py-[0.78px] relative size-full">
        <Div8 />
        <Div9 />
        <Div10 />
      </div>
    </div>
  );
}

function Svg3() {
  return (
    <div className="relative shrink-0 size-[24.015px]" data-name="svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 24.0145 24.0145">
        <g id="svg">
          <path d={svgPaths.p1337a600} fill="var(--fill-0, white)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function Container15() {
  return (
    <div className="bg-gradient-to-b from-[#8c6bff] relative rounded-[26164800px] shadow-[0px_10px_15px_0px_rgba(108,72,245,0.2),0px_4px_6px_0px_rgba(108,72,245,0.2)] shrink-0 size-[40px] to-[#6c48f5]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Svg3 />
      </div>
    </div>
  );
}

function H5() {
  return (
    <div className="absolute h-[22.492px] left-0 top-0 w-[69.168px]" data-name="h4">
      <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-0 not-italic text-[15px] text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">Ethereum</p>
    </div>
  );
}

function P9() {
  return (
    <div className="absolute h-[16.497px] left-0 top-[22.49px] w-[69.168px]" data-name="p">
      <p className="absolute font-['Inter:Regular',sans-serif] font-normal leading-[16.5px] left-0 not-italic text-[#6a7282] text-[11px] top-[0.56px] tracking-[0.0645px] whitespace-nowrap">0.020</p>
    </div>
  );
}

function Container16() {
  return (
    <div className="flex-[1_0_0] h-[38.989px] min-h-px min-w-px relative" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <H5 />
        <P9 />
      </div>
    </div>
  );
}

function Div11() {
  return (
    <div className="h-[40px] relative shrink-0 w-[121.157px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[11.989px] items-center relative size-full">
        <Container15 />
        <Container16 />
      </div>
    </div>
  );
}

function Svg4() {
  return (
    <div className="h-[23.99px] overflow-clip relative shrink-0 w-full" data-name="svg">
      <div className="absolute inset-[26.38%_0]" data-name="Vector">
        <div className="absolute inset-[-10%_-1.16%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 100.043 13.5997">
            <path d={svgPaths.p3d838818} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeWidth="2.26662" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Div12() {
  return (
    <div className="flex-[1_0_0] h-[23.99px] min-h-px min-w-px relative" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start pl-[15.997px] pr-[15.998px] relative size-full">
        <Svg4 />
      </div>
    </div>
  );
}

function P10() {
  return (
    <div className="h-[22.492px] relative shrink-0 w-full" data-name="p">
      <p className="-translate-x-full absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[22.5px] left-[53px] not-italic text-[15px] text-right text-white top-[-1.44px] tracking-[-0.2344px] whitespace-nowrap">$ 16.22</p>
    </div>
  );
}

function TrendingDown2() {
  return (
    <div className="absolute left-[4.59px] size-[9.991px] top-[2.5px]" data-name="TrendingDown">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 9.99082 9.99082">
        <g clipPath="url(#clip0_1_223)" id="TrendingDown">
          <path d={svgPaths.p28feff00} id="Vector" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
          <path d={svgPaths.p27269c6f} id="Vector_2" stroke="var(--stroke-0, #EF4444)" strokeLinecap="round" strokeLinejoin="round" strokeWidth="0.832569" />
        </g>
        <defs>
          <clipPath id="clip0_1_223">
            <rect fill="white" height="9.99082" width="9.99082" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function P11() {
  return (
    <div className="h-[14.998px] relative shrink-0 w-full" data-name="p">
      <TrendingDown2 />
      <p className="-translate-x-full absolute font-['Inter:Regular',sans-serif] font-normal leading-[15px] left-[53.58px] not-italic text-[#ef4444] text-[10px] text-right top-[0.56px] tracking-[0.1172px] whitespace-nowrap">{` 4.36 %`}</p>
    </div>
  );
}

function Div13() {
  return (
    <div className="h-[39.488px] relative shrink-0 w-[52.744px]" data-name="div">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[1.998px] items-start relative size-full">
        <P10 />
        <P11 />
      </div>
    </div>
  );
}

function Link3() {
  return (
    <div className="bg-[#14141c] h-[73.554px] relative rounded-[24px] shrink-0 w-[337.227px]" data-name="Link">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.05)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_4px_6px_0px_rgba(0,0,0,0.1),0px_2px_4px_0px_rgba(0,0,0,0.1)]" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-between px-[16.778px] py-[0.78px] relative size-full">
        <Div11 />
        <Div12 />
        <Div13 />
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="absolute content-stretch flex flex-col gap-[11.989px] h-[330.185px] items-start left-[0.11px] top-[-227.82px] w-[337.227px]" data-name="Container">
      <Link />
      <Link1 />
      <Link2 />
      <Link3 />
    </div>
  );
}

function Container5() {
  return (
    <div className="absolute content-stretch flex flex-col h-[368.674px] items-start left-[23.99px] top-[616.93px] w-[337.227px]" data-name="Container">
      <Container6 />
    </div>
  );
}

function Container19() {
  return (
    <div className="absolute h-[154px] left-0 opacity-40 top-0 w-[336px]" data-name="Container">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img alt="" className="absolute h-[135.67%] left-[-0.06%] max-w-none top-0 w-[100.02%]" src={imgContainer} />
      </div>
    </div>
  );
}

function Container20() {
  return <div className="absolute bg-[#6c48f5] blur-[100px] h-[152px] left-[120px] opacity-40 rounded-[26164800px] top-[2px] w-[256px]" data-name="Container" />;
}

function Container18() {
  return (
    <div className="absolute bg-[#0f0f1a] h-[154px] left-[0.22px] top-[0.22px] w-[335px]" data-name="Container">
      <Container19 />
      <Container20 />
    </div>
  );
}

function P12() {
  return (
    <div className="absolute h-[15.998px] left-[0.23px] top-[-7.77px] w-[287.687px]" data-name="p">
      <p className="absolute font-['Inter:Regular','Noto_Sans_JP:Regular','Noto_Sans_SC:Regular',sans-serif] font-normal leading-[16px] left-0 not-italic text-[#99a1af] text-[12px] top-[0.78px] whitespace-nowrap">充值交易 可获得现金奖励</p>
    </div>
  );
}

function H1() {
  return (
    <div className="h-[47.993px] relative shrink-0 w-[138.068px]" data-name="h2">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold','Noto_Sans_SC:Bold','Noto_Sans_JP:Bold',sans-serif] font-bold leading-[48px] left-0 not-italic text-[32px] text-white top-[-0.32px] tracking-[-0.3938px] whitespace-nowrap">500.00%奖励</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="absolute content-stretch flex h-[47.993px] items-center left-[0.46px] top-[8.46px] w-[287.687px]" data-name="Container">
      <H1 />
    </div>
  );
}

function Container22() {
  return (
    <div className="h-[67.986px] relative shrink-0 w-[287.687px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col gap-[3.996px] items-start relative size-full">
        <P12 />
        <Container23 />
      </div>
    </div>
  );
}

function Button() {
  return (
    <div className="absolute bg-white h-[31.983px] left-[0.23px] rounded-[20px] shadow-[0px_0px_20px_0px_rgba(255,255,255,0.3)] top-[82.23px] w-[101.785px]" data-name="button">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="-translate-x-1/2 absolute font-['Inter:Semi_Bold','Noto_Sans_JP:Bold',sans-serif] font-semibold leading-[16px] left-[50.99px] not-italic text-[12px] text-black text-center top-[8.77px] whitespace-nowrap">立即参与</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="absolute content-stretch flex flex-col h-[130px] items-start justify-between left-[24.22px] top-[24.22px] w-[287px]" data-name="Container">
      <Container22 />
      <Button />
    </div>
  );
}

function Container27() {
  return <div className="bg-white shrink-0 size-[11.989px]" data-name="Container" />;
}

function Container26() {
  return (
    <div className="bg-[#2a5ada] relative rounded-[26164800px] shrink-0 size-[23.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center pr-[0.012px] relative size-full">
        <Container27 />
      </div>
    </div>
  );
}

function Span2() {
  return (
    <div className="h-[15.998px] relative shrink-0 w-[54.742px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.78px] whitespace-nowrap">Chainlink</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="absolute bg-[rgba(45,49,86,0.4)] content-stretch flex gap-[7.993px] h-[46px] items-center left-[31.55px] opacity-90 pl-[12.769px] pr-[0.78px] py-[0.78px] rounded-[16px] top-[0.38px] w-[180px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]" />
      <Container26 />
      <Span2 />
    </div>
  );
}

function Span3() {
  return (
    <div className="h-[15.998px] relative shrink-0 w-[8.322px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Bold',sans-serif] font-bold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.78px] whitespace-nowrap">B</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="bg-[#f7931a] relative rounded-[26164800px] shrink-0 size-[23.99px]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Span3 />
      </div>
    </div>
  );
}

function Span4() {
  return (
    <div className="h-[15.998px] relative shrink-0 w-[41.035px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.78px] whitespace-nowrap">Bitcoin</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="absolute bg-[rgba(45,49,86,0.6)] content-stretch flex gap-[7.993px] h-[46px] items-center left-[11.55px] pl-[12.769px] pr-[0.78px] py-[0.78px] rounded-[16px] top-[33.91px] w-[180px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(255,255,255,0.1)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)]" />
      <Container29 />
      <Span4 />
    </div>
  );
}

function Svg5() {
  return (
    <div className="relative shrink-0 size-[15.998px]" data-name="svg">
      <svg className="absolute block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 15.9975 15.9975">
        <g clipPath="url(#clip0_1_220)" id="svg">
          <path d={svgPaths.pd994bb0} fill="var(--fill-0, white)" id="Vector" />
        </g>
        <defs>
          <clipPath id="clip0_1_220">
            <rect fill="white" height="15.9975" width="15.9975" />
          </clipPath>
        </defs>
      </svg>
    </div>
  );
}

function Container31() {
  return (
    <div className="bg-gradient-to-b from-[#8c6bff] relative rounded-[26164800px] shrink-0 size-[23.99px] to-[#6c48f5]" data-name="Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex items-center justify-center relative size-full">
        <Svg5 />
      </div>
    </div>
  );
}

function Span5() {
  return (
    <div className="h-[15.998px] relative shrink-0 w-[56.814px]" data-name="span">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <p className="absolute font-['Inter:Semi_Bold',sans-serif] font-semibold leading-[16px] left-0 not-italic text-[12px] text-white top-[0.78px] whitespace-nowrap">Ethereum</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="absolute bg-gradient-to-r content-stretch flex from-[rgba(108,72,245,0.8)] gap-[7.993px] h-[46px] items-center left-[-8.45px] pl-[12.769px] pr-[0.78px] py-[0.78px] rounded-[16px] to-[rgba(67,38,184,0.8)] top-[67.44px] w-[180px]" data-name="Container">
      <div aria-hidden="true" className="absolute border-[0.78px] border-[rgba(108,72,245,0.3)] border-solid inset-0 pointer-events-none rounded-[16px] shadow-[0px_8px_32px_0px_rgba(108,72,245,0.3)]" />
      <Container31 />
      <Span5 />
    </div>
  );
}

function Container24() {
  return (
    <div className="absolute h-[136.594px] left-[222.22px] top-[32.22px] w-[179.993px]" data-name="Container">
      <Container25 />
      <Container28 />
      <Container30 />
    </div>
  );
}

function Container17() {
  const navigate = useNavigate();
  return (
    <div 
      onClick={() => navigate('/activity')}
      className="absolute bg-[rgba(255,255,255,0)] border-[0.78px] border-[rgba(255,255,255,0.05)] border-solid h-[156px] left-[24.1px] overflow-clip rounded-[32px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-[146.1px] w-[337px] cursor-pointer hover:scale-[1.02] transition-transform duration-200" 
      data-name="Container"
    >
      <Container18 />
      <Container21 />
      <Container24 />
    </div>
  );
}

function CategorySwitcher() {
  const categories = ['指数', '股票', '商品', '数字货币', '外汇'];
  const [activeIndex, setActiveIndex] = useState(3); // Default to Crypto (数字货币) since the list shows Crypto assets

  return (
    <div 
      className="absolute flex items-center left-[24px] top-[321px] w-[337px] overflow-hidden"
    >
      <div 
        className="flex gap-[12px] w-full overflow-x-auto" 
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style>{`
          .hide-scroll::-webkit-scrollbar { display: none; }
        `}</style>
        <div className="flex gap-[10px] hide-scroll pb-[4px]">
          {categories.map((cat, i) => (
            <div 
              key={cat} 
              onClick={() => setActiveIndex(i)}
              className={`flex shrink-0 items-center justify-center rounded-[20px] px-[18px] py-[8px] cursor-pointer transition-all duration-200 ${
                i === activeIndex 
                  ? 'bg-[#1a1a24] text-white border-[1px] border-[rgba(255,255,255,0.1)] shadow-[0px_4px_10px_0px_rgba(0,0,0,0.2)]' 
                  : 'bg-transparent text-[#6a7282] border-[1px] border-transparent hover:text-white'
              }`}
            >
              <span className="text-[14px] font-['Inter:Medium'] font-medium whitespace-nowrap">{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="bg-[#0a0a0c] h-[1036.597px] relative shrink-0 w-full" data-name="Container">
      <Header />
      <Container4 />
      <CategorySwitcher />
      <Container5 />
      <Container17 />
    </div>
  );
}

function Container1() {
  return (
    <div className="absolute content-stretch flex flex-col h-[845.272px] items-start left-0 overflow-clip top-0 w-[385.207px]" data-name="Container">
      <Container2 />
    </div>
  );
}



function BottomNavigation({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  const tabs = [
    { id: '市场', label: '市场', icon: BarChart2 },
    { id: '交易', label: '交易', icon: ArrowLeftRight },
    { id: '排行', label: '排行', icon: Trophy },
    { id: '持仓', label: '持仓', icon: Briefcase },
    { id: '我的', label: '我的', icon: User },
  ];

  return (
    <div className="bg-[#18181b]/80 h-[81.5px] relative rounded-[30px] shrink-0 w-full flex items-center justify-between px-[16px] backdrop-blur-xl border-[0.78px] border-white/5">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const Icon = tab.icon;
        return (
          <div
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className="relative flex flex-col items-center justify-center w-[60px] h-full cursor-pointer group"
          >
            <motion.div
              initial={false}
              animate={{
                y: isActive ? -10 : 0,
                scale: isActive ? 1.1 : 1,
                color: isActive ? '#fff' : '#8a8a93',
              }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 20
              }}
              className="relative z-10 flex items-center justify-center h-[34px] w-[34px] rounded-[12px]"
            >
              {isActive && (
                <motion.div
                  layoutId="active-bg-rect"
                  className="absolute inset-0 bg-[#6c48f5] rounded-[12px] shadow-[0px_2px_8px_rgba(108,72,245,0.4)]"
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                />
              )}
              <motion.div
                initial={false}
                animate={{ 
                  scale: isActive ? [1, 0.8, 1.1, 1] : 1 
                }}
                transition={{ 
                  duration: 0.4,
                  times: [0, 0.3, 0.7, 1]
                }}
                className="relative z-10"
              >
                <Icon
                  size={18}
                  strokeWidth={isActive ? 2.5 : 2}
                />
              </motion.div>
            </motion.div>
            
            <motion.span 
              initial={false}
              animate={{
                opacity: isActive ? 1 : 0,
                y: isActive ? 0 : 5,
                scale: isActive ? 1 : 0.9
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 20
              }}
              className="absolute bottom-[16px] text-[11px] font-medium text-white whitespace-nowrap"
            >
              {tab.label}
            </motion.span>
            
            {!isActive && (
              <span className="absolute bottom-[16px] text-[10px] text-[#8a8a93] group-hover:text-white/70 transition-colors duration-200">
                {tab.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function Container32({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="absolute bg-gradient-to-t content-stretch flex flex-col from-[#09090b] h-[113.53px] items-start left-0 pt-[15.997px] px-[23.99px] to-[rgba(0,0,0,0)] top-[731.74px] via-1/2 via-[rgba(9,9,11,0.9)] w-[385.207px]" data-name="Container">
      <BottomNavigation activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

function Container({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) {
  return (
    <div className="absolute bg-[#09090b] border-[#1f1f22] border-[3.899px] border-solid h-[853.07px] left-0 overflow-clip rounded-[40px] shadow-[0px_25px_50px_-12px_rgba(0,0,0,0.25)] top-0 w-[393.005px]" data-name="Container">
      {activeTab === '交易' ? <TradePage /> : 
       activeTab === '持仓' ? <PositionsPage onNavigateToTrade={(asset) => {
         // Could pass asset to TradePage if it accepted it, but for now just switch tab
         setActiveTab('交易');
       }} /> : 
       activeTab === '我的' ? <ProfilePage /> : 
       activeTab === '排行' ? <RankingPage /> : <Container1 />}
      <Container32 activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
}

export default function RedesignTradingAppStyles() {
  const [activeTab, setActiveTab] = useState(() => {
    return sessionStorage.getItem('activeTab') || '市场';
  });

  useEffect(() => {
    sessionStorage.setItem('activeTab', activeTab);
  }, [activeTab]);

  const [showWelcome, setShowWelcome] = useState(() => {
    return !sessionStorage.getItem('guideCompleted');
  });

  return (
    <div className="bg-black relative size-full flex items-center justify-center" data-name="Redesign trading app styles">
      <div className="relative size-[853.07px] w-[393.005px] overflow-hidden">
        <Container activeTab={activeTab} setActiveTab={setActiveTab} />
      </div>

      {/* Guide Step 0: Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <div className="absolute inset-0 z-[9999] flex items-center justify-center px-10">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative w-[300px] max-w-full bg-white rounded-[20px] p-6 shadow-2xl flex flex-col items-center"
            >
              <div className="w-[88px] h-[88px] relative flex items-center justify-center mb-6 group">
                {/* Glow behind icon */}
                <div className="absolute inset-0 bg-gradient-to-br from-[#10b981] to-[#6c48f5] rounded-[24px] opacity-20 blur-xl group-hover:opacity-40 transition-opacity duration-500"></div>
                {/* Dark container */}
                <div className="absolute inset-0 bg-[#1c1c24] rounded-[24px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.2),0_10px_30px_rgba(0,0,0,0.3)] flex items-center justify-center overflow-hidden border border-[#10b981]/30">
                  {/* Internal ambient light */}
                  <div className="absolute -right-4 -top-4 w-16 h-16 bg-[#10b981]/40 blur-2xl rounded-full"></div>
                  <div className="absolute -left-4 -bottom-4 w-16 h-16 bg-[#6c48f5]/40 blur-2xl rounded-full"></div>
                  {/* Vector SVG Chart Icon */}
                  <svg width="42" height="42" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="relative z-10 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                    <path d="M3 17L9 11L13 15L21 7" stroke="url(#trendGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 7H21V13" stroke="url(#trendGrad)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <defs>
                      <linearGradient id="trendGrad" x1="3" y1="17" x2="21" y2="7" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#6c48f5"/>
                        <stop offset="1" stopColor="#10b981"/>
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              </div>
              <h3 className="text-[18px] font-bold text-black mb-2">欢迎来到交易世界</h3>
              <p className="text-[16px] font-bold text-black/80 mb-6 text-center leading-relaxed">
                30 秒带你体验一笔交易<br />准备好了么？
              </p>
              <button 
                onClick={() => {
                  setShowWelcome(false);
                  sessionStorage.setItem('guideCompleted', 'true');
                  sessionStorage.setItem('tradeGuideStarted', 'true');
                  setActiveTab('交易');
                  window.dispatchEvent(new CustomEvent('start-trade-guide'));
                }}
                className="w-full h-[48px] bg-[#10b981] hover:bg-[#059669] text-white rounded-[12px] font-bold text-[16px] transition-colors shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              >
                去下一笔
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}