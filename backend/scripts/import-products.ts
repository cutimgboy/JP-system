import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import { ProductEntity } from '../src/cfd/entities/product.entity';
import { resolveDataFile } from './utils/resolve-data-file';

function cellValue(row: any, key: string) {
  const value = row[key];
  return value === undefined || value === null || value === '' ? undefined : value;
}

const productDataColumns = [
  'orderNum',
  'type',
  'code',
  'tradeCode',
  'nameCn',
  'nameEn',
  'nameVn',
  'currencyType',
  'marginCurrency',
  'decimalPlaces',
  'bidSpread',
  'askSpread',
  'spread',
  'contractSize',
  'minPriceChange',
  'fixedLeverage',
  'liquidationRange',
  'forcedLiquidationRatio',
  'tradingHours',
  'descriptionCn',
  'descriptionVn',
  'isActive',
  'sortOrder',
] as const;

const legacyProductDataColumns = [
  'orderNum',
  'type',
  'code',
  'tradeCode',
  'nameCn',
  'nameEn',
  'nameVn',
  'currencyType',
  'marginCurrency',
  'decimalPlaces',
  'bidSpread',
  'askSpread',
  'spread',
  'contractSize',
  'minPriceChange',
  'fixedLeverage',
  'liquidationRange',
  'forcedLiquidationRatio',
  'tradingHours',
  'isActive',
  'sortOrder',
] as const;

function buildUpsertSql(columns: readonly string[]) {
  const createTableColumns = columns
    .map(column => `\`${column}\``)
    .join(', ');

  const createPlaceholders = columns
    .map(() => '?')
    .join(', ');

  const updateColumns = columns
    .filter(column => column !== 'code')
    .map(column => `\`${column}\` = VALUES(\`${column}\`)`)
    .join(', ');

  return `
    INSERT INTO products (${createTableColumns})
    VALUES (${createPlaceholders})
    ON DUPLICATE KEY UPDATE ${updateColumns}
  `;
}

const upsertSql = buildUpsertSql(productDataColumns);
const legacyUpsertSql = buildUpsertSql(legacyProductDataColumns);

async function bootstrap() {
  // 禁用行情服务初始化，避免导入脚本连接外部行情源或启动定时任务
  process.env.DISABLE_QUOTE_INIT = 'true';

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('开始导入产品数据...');

    // 读取 Excel 文件
    const filePath = resolveDataFile('CFD品种信息表.xlsx');
    const workbook = XLSX.readFile(filePath);

    // 读取"品种交易设置" sheet
    const sheetName = '品种交易设置';
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    console.log(`读取到 ${data.length} 条产品数据`);

    // 获取 ProductEntity 的 repository
    const productRepo = dataSource.getRepository(ProductEntity);
    const productTableColumns = await dataSource.query("SHOW COLUMNS FROM `products`");
    const productColumnNames = new Set(productTableColumns.map((column: any) => column.Field));
    const useRepositoryImport = productColumnNames.has('description_cn');
    const rawColumns = productColumnNames.has('descriptionCn') ? productDataColumns : legacyProductDataColumns;
    const rawUpsertSql = productColumnNames.has('descriptionCn') ? upsertSql : legacyUpsertSql;
    if (!useRepositoryImport && !productColumnNames.has('descriptionCn')) {
      console.log('当前 products 表缺少基础简介列，仅导入交易设置和 UTC+7 交易时间。');
    }

    // 清空现有数据（可选）
    // await productRepo.clear();
    // console.log('已清空现有产品数据');

    let successCount = 0;
    let errorCount = 0;

    for (const row of data as any[]) {
      try {
        const productData = {
          orderNum: row['序号'],
          type: row['品种类型'],
          code: row['代码'],
          tradeCode: row['交易代码'],
          nameCn: row['简体名称'],
          nameEn: row['英文名称'],
          nameVn: row['越南语名称'],
          currencyType: row['货币类型'],
          marginCurrency: row['保证金货币'],
          decimalPlaces: row['小数位'],
          bidSpread: row['买价价差'],
          askSpread: row['卖价价差'],
          spread: row['价差'],
          contractSize: row['合约量'],
          minPriceChange: row['交易最小变动'],
          fixedLeverage: row['固定杠杆'],
          liquidationRange: row['涨跌爆仓幅度'],
          forcedLiquidationRatio: row['强制平仓比例'],
          tradingHours: cellValue(row, '越南时区（UTC+7）周交易日历') || row['交易时间'],
          descriptionCn: cellValue(row, '公司简介（简体）'),
          descriptionVn: cellValue(row, '公司简介（越南）'),
          isActive: true,
          sortOrder: row['序号'],
        };

        if (useRepositoryImport) {
          // 检查产品是否已存在
          const existingProduct = await productRepo.findOne({
            where: { code: row['代码'] }
          });

          if (existingProduct) {
            // 更新现有产品
            await productRepo.update(existingProduct.id, productData);
            console.log(`✓ 更新产品: ${row['代码']} - ${row['简体名称']}`);
          } else {
            // 创建新产品
            const product = productRepo.create(productData);
            await productRepo.save(product);
            console.log(`✓ 创建产品: ${row['代码']} - ${row['简体名称']}`);
          }
        } else {
          await dataSource.query(rawUpsertSql, rawColumns.map(column => productData[column]));
          console.log(`✓ 导入产品: ${row['代码']} - ${row['简体名称']}`);
        }

        successCount++;
      } catch (error) {
        console.error(`✗ 导入失败: ${row['代码']} - ${error.message}`);
        errorCount++;
      }
    }

    console.log('\n导入完成！');
    console.log(`成功: ${successCount} 条`);
    console.log(`失败: ${errorCount} 条`);

  } catch (error) {
    console.error('导入过程出错:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
