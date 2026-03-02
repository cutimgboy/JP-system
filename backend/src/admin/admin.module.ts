import { Module } from '@nestjs/common';
import { AdminOrderController } from './admin-order.controller';
import { UserModule } from '../user/user.module';

@Module({
  imports: [UserModule],
  controllers: [AdminOrderController],
})
export class AdminModule {}
