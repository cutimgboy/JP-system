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

async function bootstrap() {
  // 禁用行情服务初始化，避免导入脚本连接外部行情源或启动定时任务
  process.env.DISABLE_QUOTE_INIT = 'true';

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('开始导入产品基础信息...');

    // 读取 Excel 文件
    const filePath = resolveDataFile('CFD品种信息表.xlsx');
    const workbook = XLSX.readFile(filePath);

    const productRepo = dataSource.getRepository(ProductEntity);
    const productTableColumns = await dataSource.query("SHOW COLUMNS FROM `products`");
    const productColumnNames = new Set(productTableColumns.map((column: any) => column.Field));
    const useRepositoryImport = productColumnNames.has('description_cn');
    const hasLegacyBaseInfoColumns = productColumnNames.has('descriptionCn');
    if (!useRepositoryImport && !hasLegacyBaseInfoColumns) {
      console.log('当前 products 表缺少基础简介列，跳过产品基础信息写入。');
    }

    let successCount = 0;
    let errorCount = 0;

    // 导入股票基础信息
    if (workbook.SheetNames.includes('股票基础信息')) {
      const worksheet = workbook.Sheets['股票基础信息'];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log(`\n读取到 ${data.length} 条股票基础信息`);

      for (const row of data as any[]) {
        try {
          const code = row['代码'];
          const product = useRepositoryImport
            ? await productRepo.findOne({ where: { code } })
            : null;
          const productExists = useRepositoryImport
            ? Boolean(product)
            : Number((await dataSource.query('SELECT COUNT(*) AS count FROM `products` WHERE `code` = ?', [code]))[0]?.count || 0) > 0;

          if (productExists) {
            const stockData = {
              descriptionCn: cellValue(row, '公司简介（简体）'),
              descriptionVn: cellValue(row, '公司简介（越南）'),
              companyName: cellValue(row, '公司名称'),
              market: cellValue(row, '所属市场(英/越)'),
              website: cellValue(row, '网址'),
            };
            if (useRepositoryImport) {
              await productRepo.update(product!.id, stockData);
            } else if (hasLegacyBaseInfoColumns) {
              await dataSource.query(
                'UPDATE `products` SET `descriptionCn` = ?, `descriptionVn` = ?, `companyName` = ?, `market` = ?, `website` = ? WHERE `code` = ?',
                [stockData.descriptionCn, stockData.descriptionVn, stockData.companyName, stockData.market, stockData.website, code],
              );
            }
            console.log(`✓ 更新股票基础信息: ${code} - ${row['简体名称']}`);
            successCount++;
          } else {
            console.log(`⚠ 未找到产品: ${code}`);
          }
        } catch (error) {
          console.error(`✗ 导入失败: ${row['代码']} - ${error.message}`);
          errorCount++;
        }
      }
    }

    // 导入加密货币基础信息
    if (workbook.SheetNames.includes('加密货币基础信息')) {
      const worksheet = workbook.Sheets['加密货币基础信息'];
      const data = XLSX.utils.sheet_to_json(worksheet);
      console.log(`\n读取到 ${data.length} 条加密货币基础信息`);

      for (const row of data as any[]) {
        try {
          const code = row['代码'];
          const product = useRepositoryImport
            ? await productRepo.findOne({ where: { code } })
            : null;
          const productExists = useRepositoryImport
            ? Boolean(product)
            : Number((await dataSource.query('SELECT COUNT(*) AS count FROM `products` WHERE `code` = ?', [code]))[0]?.count || 0) > 0;

          if (productExists) {
            const cryptoData = {
              descriptionCn: cellValue(row, '币种简介（简体）'),
              descriptionVn: cellValue(row, '币种简介（越南）'),
              marketCapRank: cellValue(row, '市值排名'),
            };
            if (useRepositoryImport) {
              await productRepo.update(product!.id, cryptoData);
            } else if (hasLegacyBaseInfoColumns) {
              await dataSource.query(
                'UPDATE `products` SET `descriptionCn` = ?, `descriptionVn` = ?, `marketCapRank` = ? WHERE `code` = ?',
                [cryptoData.descriptionCn, cryptoData.descriptionVn, cryptoData.marketCapRank, code],
              );
            }
            console.log(`✓ 更新加密货币基础信息: ${code} - ${row['简体名称']}`);
            successCount++;
          } else {
            console.log(`⚠ 未找到产品: ${code}`);
          }
        } catch (error) {
          console.error(`✗ 导入失败: ${row['代码']} - ${error.message}`);
          errorCount++;
        }
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
