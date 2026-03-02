import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CfdController } from './cfd.controller';
import { CfdService } from './cfd.service';
import { ProductController } from './controllers/product.controller';
import { ProductService } from './services/product.service';
import { TradingSettingsEntity } from './entities/trading-settings.entity';
import { StockInfoEntity } from './entities/stock-info.entity';
import { CryptoInfoEntity } from './entities/crypto-info.entity';
import { ProductEntity } from './entities/product.entity';
import { QuoteModule } from '../quote/quote.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      TradingSettingsEntity,
      StockInfoEntity,
      CryptoInfoEntity,
      ProductEntity,
    ]),
    QuoteModule,
  ],
  controllers: [CfdController, ProductController],
  providers: [CfdService, ProductService],
  exports: [CfdService, ProductService],
})
export class CfdModule {}