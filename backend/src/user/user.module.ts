import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { RewardModule } from '../reward/reward.module';

import { UserEntity } from './entities/user.entity';
import { UserAccountEntity } from './entities/user-account.entity';
import { TradeOrderEntity } from './entities/trade-order.entity';
import { UserService } from './services/user.service';
import { AuthService } from './services/auth.service';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { AccountService } from './services/account.service';
import { TradeOrderService } from './services/trade-order.service';
import { AuthController } from './auth.controller';
import { UserController } from './user.controller';
import { AccountController } from './controllers/account.controller';
import { TradeOrderController } from './controllers/trade-order.controller';
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';
import { FacebookStrategy } from './strategies/facebook.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, UserAccountEntity, TradeOrderEntity]),
    RewardModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: configService.get('JWT_EXPIRES_IN') || '7d',
        },
      }),
    }),
  ],
  controllers: [AuthController, UserController, AccountController, TradeOrderController],
  providers: [
    UserService,
    AuthService,
    SmsService,
    EmailService,
    AccountService,
    TradeOrderService,
    JwtStrategy,
    GoogleStrategy,
    FacebookStrategy,
  ],
  exports: [UserService, AuthService, AccountService, TradeOrderService],
})
export class UserModule {}
