import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../../utils/api';
import { getCurrentLanguage, tx } from "../../../i18n/text";
import { mergeProductInfo } from '../productInfo';
interface TradingHoursProps {
  stockCode: string;
}
export function TradingHours({
  stockCode
}: TradingHoursProps) {
  const [tradingHoursText, setTradingHoursText] = useState<string>('');
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchProductInfo = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get(`/api/products/${stockCode}`);
        const productData = extractData(response);
        setTradingHoursText(mergeProductInfo(stockCode, productData)?.tradingHours || '');
      } catch (error) {
        console.error(tx("获取产品信息失败:"), error);
        setTradingHoursText(mergeProductInfo(stockCode)?.tradingHours || '');
      } finally {
        setLoading(false);
      }
    };
    if (stockCode) {
      fetchProductInfo();
    }
  }, [stockCode]);
  if (loading) {
    return null;
  }
  const parseTradingHours = (value: string) => {
    const source = value.trim();
    const localizeCalendarText = (text: string) => {
      if (getCurrentLanguage() !== 'vi') {
        return text
          .replace(/周一/g, '星期一')
          .replace(/周二/g, '星期二')
          .replace(/周三/g, '星期三')
          .replace(/周四/g, '星期四')
          .replace(/周五/g, '星期五')
          .replace(/周六/g, '星期六')
          .replace(/周日/g, '星期日')
          .replace(/全天休市/g, '休市');
      }
      return text
        .replace(/次日（星期一）/g, 'hôm sau (Thứ Hai)')
        .replace(/次日（星期二）/g, 'hôm sau (Thứ Ba)')
        .replace(/次日（星期三）/g, 'hôm sau (Thứ Tư)')
        .replace(/次日（星期四）/g, 'hôm sau (Thứ Năm)')
        .replace(/次日（星期五）/g, 'hôm sau (Thứ Sáu)')
        .replace(/次日（星期六）/g, 'hôm sau (Thứ Bảy)')
        .replace(/次日（星期日）/g, 'hôm sau (Chủ Nhật)')
        .replace(/次日（周一）/g, 'hôm sau (Thứ Hai)')
        .replace(/次日（周二）/g, 'hôm sau (Thứ Ba)')
        .replace(/次日（周三）/g, 'hôm sau (Thứ Tư)')
        .replace(/次日（周四）/g, 'hôm sau (Thứ Năm)')
        .replace(/次日（周五）/g, 'hôm sau (Thứ Sáu)')
        .replace(/次日（周六）/g, 'hôm sau (Thứ Bảy)')
        .replace(/次日（周日）/g, 'hôm sau (Chủ Nhật)')
        .replace(/周一/g, 'Thứ Hai')
        .replace(/周二/g, 'Thứ Ba')
        .replace(/周三/g, 'Thứ Tư')
        .replace(/周四/g, 'Thứ Năm')
        .replace(/周五/g, 'Thứ Sáu')
        .replace(/周六/g, 'Thứ Bảy')
        .replace(/周日/g, 'Chủ Nhật')
        .replace(/星期一/g, 'Thứ Hai')
        .replace(/星期二/g, 'Thứ Ba')
        .replace(/星期三/g, 'Thứ Tư')
        .replace(/星期四/g, 'Thứ Năm')
        .replace(/星期五/g, 'Thứ Sáu')
        .replace(/星期六/g, 'Thứ Bảy')
        .replace(/星期日/g, 'Chủ Nhật')
        .replace(/全天休市/g, 'Đóng cửa cả ngày')
        .replace(/休市/g, 'Đóng cửa');
    };
    if (!source) {
      return [{
        day: tx("周一至周五"),
        time: tx("以交易所实时开放状态为准")
      }];
    }
    return source.split(/\n|[；;](?=\s*(?:周[一二三四五六日]|星期[一二三四五六日]))/).map(row => row.trim()).filter(Boolean).map((row, index) => {
      const normalized = row
        .replace(/\s+/g, ' ')
        .replace(/[–—]/g, '-')
        .replace(/\s*-\s*/g, ' - ');
      const dayMatch = normalized.match(/^(周[一二三四五六日]|星期[一二三四五六日])\s*(.*)$/);
      if (dayMatch) {
        const timeText = dayMatch[2].trim();
        return {
          day: localizeCalendarText(dayMatch[1]),
          time: localizeCalendarText(timeText || tx("以交易所实时开放状态为准"))
        };
      }
      const parts = normalized.split(/\s*[:：]\s*/);
      if (parts.length >= 2 && !/\d{1,2}$/.test(parts[0])) {
        return {
          day: localizeCalendarText(parts[0].trim()) || tx('时段 {{index}}', { index: index + 1 }),
          time: localizeCalendarText(parts.slice(1).join(':').trim())
        };
      }
      return {
        day: tx('时段 {{index}}', { index: index + 1 }),
        time: localizeCalendarText(normalized)
      };
    });
  };
  const rows = parseTradingHours(tradingHoursText);
  return <>
      {/* Separator */}
      <div className="h-[8px] bg-[#14141c] w-full my-2"></div>

      <div className="px-5 py-4 pb-12">
        <h3 className="text-[16px] font-bold mb-4 flex items-center gap-2 text-white">
          <div className="w-1 h-4 bg-[#f7931a] rounded-full"></div>{tx("交易时间")}</h3>
        <div className="flex flex-col gap-3 rounded-2xl border border-white/5 bg-[#14141c] p-4">
          {rows.map((row, index) => {
          const isClosed = /休市|Đóng cửa/.test(row.time);
          return <div key={`${row.day}-${index}`} className={`flex items-start justify-between gap-4 text-[13px] ${isClosed ? 'text-[#8a8a93] opacity-60' : ''}`}>
              <span className={`shrink-0 font-medium ${isClosed ? '' : 'text-white'}`}>{row.day}</span>
              <span className={`text-right leading-relaxed ${isClosed ? '' : 'font-mono text-[#8a8a93]'}`}>{row.time}</span>
            </div>;
        })}
        </div>
        <p className="text-[11px] text-[#8a8a93] mt-3 opacity-60">{tx("以上交易时间并未考虑节假日或市场特殊情况调整的影响。")}</p>
      </div>
    </>;
}
