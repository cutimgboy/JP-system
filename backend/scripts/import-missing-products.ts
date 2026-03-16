import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { DataSource } from 'typeorm';
import { ProductEntity } from '../src/cfd/entities/product.entity';

async function bootstrap() {
  // 禁用模拟数据生成，避免脚本运行时启动定时任务
  process.env.MOCK_QUOTE_DATA = 'false';

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('开始导入缺失的产品数据...');

    const productRepo = dataSource.getRepository(ProductEntity);

    // KOSPI 数据
    const kospiData = {
      orderNum: 13,
      type: '指数',
      code: 'KOSPI',
      tradeCode: 'KOSPI',
      nameCn: '韩国KOSPI指数',
      nameEn: 'Korea Composite Stock Price Index',
      nameVn: 'Chỉ số IBEX 35 của Tây Ban Nha',
      currencyType: 'EUR',
      marginCurrency: 'USD',
      decimalPlaces: 1,
      bidSpread: 2,
      askSpread: 2,
      spread: 4,
      contractSize: 1,
      minPriceChange: 0.5,
      fixedLeverage: 200,
      liquidationRange: 0.0025,
      forcedLiquidationRatio: 0.5,
      tradingHours: '（GMT0时区）：周一、周二、周三、周四、周五  06:00 - 18:00',
      isActive: true,
      sortOrder: 13,
    };

    // VIX 数据
    const vixData = {
      orderNum: 14,
      type: '指数',
      code: 'VIX',
      tradeCode: 'VIX',
      nameCn: 'VIX恐慌指数',
      nameEn: 'CBOE Volatility Index',
      nameVn: 'Chỉ số AEX của Hà Lan',
      currencyType: 'EUR',
      marginCurrency: 'USD',
      decimalPlaces: 0.01,
      bidSpread: 30,
      askSpread: 30,
      spread: 0.6,
      contractSize: 1,
      minPriceChange: 0.5,
      fixedLeverage: 200,
      liquidationRange: 0.0025,
      forcedLiquidationRatio: 0.5,
      tradingHours: '（GMT0时区）：周一、周二、周三、周四、周五  07:00 - 15:30',
      isActive: true,
      sortOrder: 14,
    };

    // 导入 KOSPI
    try {
      const existingKospi = await productRepo.findOne({ where: { code: 'KOSPI' } });
      if (existingKospi) {
        await productRepo.update(existingKospi.id, kospiData);
        console.log('✓ 更新产品: KOSPI - 韩国KOSPI指数');
      } else {
        const kospi = productRepo.create(kospiData);
        await productRepo.save(kospi);
        console.log('✓ 创建产品: KOSPI - 韩国KOSPI指数');
      }
    } catch (error) {
      console.error('✗ 导入 KOSPI 失败:', error.message);
    }

    // 导入 VIX
    try {
      const existingVix = await productRepo.findOne({ where: { code: 'VIX' } });
      if (existingVix) {
        await productRepo.update(existingVix.id, vixData);
        console.log('✓ 更新产品: VIX - VIX恐慌指数');
      } else {
        const vix = productRepo.create(vixData);
        await productRepo.save(vix);
        console.log('✓ 创建产品: VIX - VIX恐慌指数');
      }
    } catch (error) {
      console.error('✗ 导入 VIX 失败:', error.message);
    }

    console.log('\n导入完成！');

  } catch (error) {
    console.error('导入过程出错:', error);
  } finally {
    await app.close();
  }
}

bootstrap();
