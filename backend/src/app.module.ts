import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PostsModule } from './posts/posts.module';
import { UserModule } from './user/user.module';
import { RedisModule } from './redis/redis.module';
import { CfdModule } from './cfd/cfd.module';
import { QuoteModule } from './quote/quote.module';
import { AdminModule } from './admin/admin.module';
import { BankCardModule } from './bank-card/bank-card.module';
import { SystemBankCardModule } from './system-bank-card/system-bank-card.module';
import { DepositModule } from './deposit/deposit.module';
import { RewardModule } from './reward/reward.module';
import { CommunityModule } from './community/community.module';
import { MessageModule } from './message/message.module';
import { MigrationModule } from './migration/migration.module';
import { JwtAuthGuard } from './user/guards/jwt-auth.guard';
import envConfig from '../config/env';

// 数据实体
import { PostsEntity } from './posts/entities/posts.entity';
import { UserEntity } from './user/entities/user.entity';
import { UserAccountEntity } from './user/entities/user-account.entity';
import { TradeOrderEntity } from './user/entities/trade-order.entity';
import { TradingSettingsEntity } from './cfd/entities/trading-settings.entity';
import { StockInfoEntity } from './cfd/entities/stock-info.entity';
import { CryptoInfoEntity } from './cfd/entities/crypto-info.entity';
import { ProductEntity } from './cfd/entities/product.entity';
import { StockRealtimePriceEntity } from './quote/entities/stock-realtime-price.entity';
import { StockPriceChangeEntity } from './quote/entities/stock-price-change.entity';
import { BankCardEntity } from './bank-card/entities/bank-card.entity';
import { SystemBankCardEntity } from './system-bank-card/entities/system-bank-card.entity';
import { DepositRecordEntity } from './deposit/entities/deposit-record.entity';
import { RewardSettingEntity } from './reward/entities/reward-setting.entity';
import { RewardClaimEntity } from './reward/entities/reward-claim.entity';
import { LeaderboardEntity } from './community/entities/leaderboard.entity';
import { CommunitySettingsEntity } from './community/entities/community-settings.entity';
import { MessageEntity } from './message/entities/message.entity';
import { MigrationEntity } from './migration/entities/migration.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // 设置为全局
      envFilePath: [envConfig.path],
    }),
    ScheduleModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        type: 'mysql', // 数据库类型
        entities: [
          PostsEntity,
          UserEntity,
          UserAccountEntity,
          TradeOrderEntity,
          TradingSettingsEntity,
          StockInfoEntity,
          CryptoInfoEntity,
          ProductEntity,
          StockRealtimePriceEntity,
          StockPriceChangeEntity,
          BankCardEntity,
          SystemBankCardEntity,
          DepositRecordEntity,
          RewardSettingEntity,
          RewardClaimEntity,
          LeaderboardEntity,
          CommunitySettingsEntity,
          MessageEntity,
          MigrationEntity,
        ], // 数据表实体，synchronize为true时，自动创建表，生产环境建议关闭
        host: configService.get('DB_HOST'), // 主机，默认为localhost
        port: configService.get<number>('DB_PORT'), // 端口号
        username: configService.get('DB_USER'), // 用户名
        password: configService.get('DB_PASSWD'), // 密码
        database: configService.get('DB_DATABASE'), //数据库名
        timezone: '+08:00', //服务器上配置的时区
        synchronize: true, //根据实体自动创建数据库表， 生产环境建议关闭（已通过脚本创建表结构）
      }),
    }),
    RedisModule,
    PostsModule,
    UserModule,
    CfdModule,
    QuoteModule,
    AdminModule,
    BankCardModule,
    SystemBankCardModule,
    DepositModule,
    RewardModule,
    CommunityModule,
    MessageModule,
    MigrationModule,
  ],
  controllers: [AppController],
  // 注册为全局守卫（已暂时关闭）
  providers: [
    AppService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
  ],
})
export class AppModule {}
