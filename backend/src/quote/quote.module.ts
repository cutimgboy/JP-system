import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuoteService } from './quote.service';
import { QuoteController } from './quote.controller';
import { MockQuoteService } from './services/mock-quote.service';
import { StockRealtimePriceEntity } from './entities/stock-realtime-price.entity';
import { StockPriceChangeEntity } from './entities/stock-price-change.entity';
import { TradingSettingsEntity } from '../cfd/entities/trading-settings.entity';
import { ProductEntity } from '../cfd/entities/product.entity';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([
      StockRealtimePriceEntity,
      StockPriceChangeEntity,
      TradingSettingsEntity,
      ProductEntity,
    ]),
  ],
  controllers: [QuoteController],
  providers: [QuoteService, MockQuoteService],
  exports: [QuoteService, MockQuoteService],
})
export class QuoteModule {}