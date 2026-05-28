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
        return text;
      }
      return text
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
        .replace(/全天休市/g, 'Đóng cửa cả ngày');
    };
    if (!source) {
      return [{
        session: tx("常规交易"),
        days: tx("周一至周五"),
        time: tx("以交易所实时开放状态为准")
      }];
    }
    return source.split(/\n|；|;/).map(row => row.trim()).filter(Boolean).map((row, index) => {
      const normalized = row.replace(/\s+/g, ' ');
      const localized = localizeCalendarText(normalized);
      const parts = normalized.split(/[:：]/);
      if (parts.length >= 2) {
        return {
          session: localizeCalendarText(parts[0].trim()) || tx('时段 {{index}}', { index: index + 1 }),
          days: tx("交易日"),
          time: localizeCalendarText(parts.slice(1).join(':').trim())
        };
      }
      const timeMatch = normalized.match(/(\d{1,2}:\d{2}\s*[-~至]\s*\d{1,2}:\d{2}.*)$/);
      if (timeMatch) {
        return {
          session: localizeCalendarText(normalized.replace(timeMatch[0], '').trim()) || tx('时段 {{index}}', { index: index + 1 }),
          days: tx("交易日"),
          time: localizeCalendarText(timeMatch[0])
        };
      }
      return {
        session: tx('时段 {{index}}', { index: index + 1 }),
        days: tx("交易日"),
        time: localized
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
        <div className="overflow-hidden rounded-2xl border border-white/5 bg-[#14141c]">
          <div className="grid grid-cols-[1fr_1fr_1.5fr] bg-white/[0.03] px-4 py-3 text-[11px] font-medium text-[#8a8a93]">
            <span>{tx("时段")}</span>
            <span>{tx("日期")}</span>
            <span className="text-right">{tx("时间")}</span>
          </div>
          {rows.map((row, index) => <div key={`${row.session}-${index}`} className="grid grid-cols-[1fr_1fr_1.5fr] items-center border-t border-white/5 px-4 py-3 text-[12px]">
              <span className="font-medium text-white">{row.session}</span>
              <span className="text-[#8a8a93]">{row.days}</span>
              <span className="text-right font-mono text-white">{row.time}</span>
            </div>)}
        </div>
        <p className="text-[11px] text-[#8a8a93] mt-3 opacity-60">{tx("以上交易时间并未考虑节假日或市场特殊情况调整的影响。")}</p>
      </div>
    </>;
}
