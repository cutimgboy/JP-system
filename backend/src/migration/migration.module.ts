import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MigrationService } from './migration.service';
import { MigrationEntity } from './entities/migration.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MigrationEntity])],
  providers: [MigrationService],
  exports: [MigrationService],
})
export class MigrationModule {}
