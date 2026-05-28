import { getCurrentLanguage } from '../../i18n/text';
import { productFallbackMap } from './productFallback';

export interface ProductInfo {
  code?: string;
  tradeCode?: string;
  name?: string;
  nameCn?: string;
  nameEn?: string;
  nameVn?: string;
  type?: string;
  currencyType?: string;
  marginCurrency?: string;
  decimalPlaces?: number;
  bidSpread?: number;
  askSpread?: number;
  spread?: number;
  contractSize?: number;
  minPriceChange?: number;
  fixedLeverage?: number;
  liquidationRange?: number;
  forcedLiquidationRatio?: number;
  tradingHours?: string;
  companyName?: string;
  listingDate?: string;
  issuePrice?: number | string;
  isinCode?: string;
  foundedYear?: number | string;
  ceo?: string;
  market?: string;
  marketCn?: string;
  marketEn?: string;
  employees?: number | string;
  fiscalYearEnd?: number | string;
  address?: string;
  city?: string;
  provinceCn?: string;
  provinceEn?: string;
  countryCn?: string;
  countryEn?: string;
  countryVn?: string;
  zipCode?: string | number;
  phone?: string;
  website?: string;
  marketCapRank?: number;
  marketCap?: string;
  fullyDilutedMarketCap?: string;
  circulatingSupply?: string;
  maxSupply?: string;
  totalSupply?: string;
  issueDate?: string;
  allTimeHigh?: string | number;
  allTimeLow?: string | number;
  descriptionCn?: string;
  descriptionVn?: string;
  price?: number;
  change?: number;
  changePercent?: number;
}

type ProductInfoMap = Record<string, ProductInfo>;

const fallbackByCode = productFallbackMap as ProductInfoMap;

function normalizeProductCode(code: string) {
  return code.trim().split('.')[0].toUpperCase();
}

function hasValue(value: unknown) {
  return value !== undefined && value !== null && value !== '';
}

export function getFallbackProductInfo(stockCode: string): ProductInfo | null {
  return fallbackByCode[normalizeProductCode(stockCode)] || null;
}

export function mergeProductInfo(stockCode: string, apiInfo?: ProductInfo | null): ProductInfo | null {
  const fallback = getFallbackProductInfo(stockCode);
  if (!fallback && !apiInfo) {
    return null;
  }
  const merged: ProductInfo = {
    ...(fallback || {}),
    ...(apiInfo || {}),
  };
  if (!hasValue(merged.tradeCode)) {
    merged.tradeCode = apiInfo?.tradeCode || fallback?.tradeCode || stockCode;
  }
  if (!hasValue(merged.market) && hasValue(merged.marketCn)) {
    merged.market = merged.marketCn;
  }
  return merged;
}

export function getLocalizedProductName(productInfo: ProductInfo | null | undefined, fallbackCode: string) {
  if (!productInfo) {
    return fallbackCode;
  }
  const fallbackName = productInfo.nameEn || productInfo.name;
  if (getCurrentLanguage() === 'vi') {
    return productInfo.nameVn || fallbackName || productInfo.nameCn || fallbackCode;
  }
  return productInfo.nameCn || fallbackName || productInfo.nameVn || fallbackCode;
}

export function getLocalizedDescription(productInfo: ProductInfo | null | undefined) {
  if (!productInfo) {
    return '';
  }
  return getCurrentLanguage() === 'vi'
    ? productInfo.descriptionVn || productInfo.descriptionCn || ''
    : productInfo.descriptionCn || productInfo.descriptionVn || '';
}

export function getLocalizedMarket(productInfo: ProductInfo | null | undefined) {
  if (!productInfo) {
    return '';
  }
  if (getCurrentLanguage() === 'vi') {
    return productInfo.marketEn || productInfo.market || productInfo.marketCn || '';
  }
  return productInfo.marketCn || productInfo.market || productInfo.marketEn || '';
}

export function getLocalizedCountry(productInfo: ProductInfo | null | undefined) {
  if (!productInfo) {
    return '';
  }
  if (getCurrentLanguage() === 'vi') {
    return productInfo.countryVn || productInfo.countryEn || productInfo.countryCn || '';
  }
  return productInfo.countryCn || productInfo.countryEn || productInfo.countryVn || '';
}
