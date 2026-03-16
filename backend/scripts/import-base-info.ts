import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import * as XLSX from 'xlsx';
import * as path from 'path';
import { ProductEntity } from '../src/cfd/entities/product.entity';

async function bootstrap() {
  // 禁用模拟数据生成，避免脚本运行时启动定时任务
  process.env.MOCK_QUOTE_DATA = 'false';

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('开始导入产品基础信息...');

    // 读取 Excel 文件
    const filePath = path.join(__dirname, '../信息.xlsx');
    const workbook = XLSX.readFile(filePath);

    const productRepo = dataSource.getRepository(ProductEntity);

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
          const product = await productRepo.findOne({ where: { code } });

          if (product) {
            await productRepo.update(product.id, {
              descriptionCn: row['公司简介（简体）'],
              descriptionVn: row['公司简介（越南）'],
              companyName: row['公司名称'],
              market: row['所属市场(英/越)'],
              website: row['网址'],
            });
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
          const product = await productRepo.findOne({ where: { code } });

          if (product) {
            await productRepo.update(product.id, {
              descriptionCn: row['币种简介（简体）'],
              descriptionVn: row['币种简介（越南）'],
              marketCapRank: row['市值排名'],
            });
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
