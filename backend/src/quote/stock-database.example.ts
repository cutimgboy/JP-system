/**
 * 股票数据库模拟示例
 *
 * 这个文件展示了如何使用 Map 模拟数据库存储股票信息
 * 未来可以替换为真实的数据库查询
 */

export interface StockDatabaseItem {
  code: string;
  nameCn: string;
  nameEn: string;
  initialPrice: number;
}

/**
 * 模拟数据库 - 存储股票配置信息
 *
 * 使用方式：
 * 1. 添加新股票：stockDatabase.set('TSLA.US', { code: 'TSLA.US', nameCn: '特斯拉', nameEn: 'Tesla', initialPrice: 250.00 })
 * 2. 删除股票：stockDatabase.delete('TSLA.US')
 * 3. 获取所有股票代码：Array.from(stockDatabase.keys())
 * 4. 获取股票信息：stockDatabase.get('NVDA.US')
 */
export const createStockDatabase = (): Map<string, StockDatabaseItem> => {
  return new Map([
    ['NVDA.US', { code: 'NVDA.US', nameCn: '英伟达', nameEn: 'NVIDIA', initialPrice: 145.50 }],
    ['MSFT.US', { code: 'MSFT.US', nameCn: '微软', nameEn: 'Microsoft', initialPrice: 425.30 }],
    ['AAPL.US', { code: 'AAPL.US', nameCn: '苹果', nameEn: 'Apple', initialPrice: 258.09 }],
    ['AMZN.US', { code: 'AMZN.US', nameCn: '亚马逊', nameEn: 'Amazon', initialPrice: 215.80 }],
    ['GOOG.US', { code: 'GOOG.US', nameCn: '谷歌', nameEn: 'Google', initialPrice: 178.25 }],
  ]);
};

/**
 * 未来替换为真实数据库查询的示例：
 *
 * async function getStocksFromDatabase(): Promise<StockDatabaseItem[]> {
 *   const stocks = await stockInfoRepository.find({
 *     where: { type: 'US_STOCK' },
 *     select: ['code', 'nameCn', 'nameEn']
 *   });
 *
 *   return stocks.map(stock => ({
 *     code: stock.code,
 *     nameCn: stock.nameCn,
 *     nameEn: stock.nameEn,
 *     initialPrice: 100 // 可以从其他地方获取初始价格
 *   }));
 * }
 */
