import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MockQuoteService } from './services/mock-quote.service';
import { StockTickEntity } from './entities/stock-tick.entity';
import { StockKlineEntity } from './entities/stock-kline.entity';
import { TradingSettingsEntity } from '../cfd/entities/trading-settings.entity';
import { ProductEntity } from '../cfd/entities/product.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      StockTickEntity,
      StockKlineEntity,
      TradingSettingsEntity,
      ProductEntity,
    ]),
  ],
  controllers: [QuoteController],
  providers: [QuoteService, MockQuoteService],
  exports: [QuoteService, MockQuoteService],
})
export class QuoteModule {}
