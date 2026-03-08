import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Injectable()
export class MigrationService implements OnModuleInit {
  private readonly logger = new Logger(MigrationService.name);

  constructor(
    @InjectDataSource()
    private dataSource: DataSource,
  ) {}

  async onModuleInit() {
    await this.runMigrations();
  }

  private async runMigrations() {
    try {
      // 确保 migrations 表存在
      await this.ensureMigrationsTable();

      // 获取已执行的迁移
      const executedMigrations = await this.getExecutedMigrations();

      // 定义需要执行的迁移
      const migrations = [
        {
          name: '001-update-user-id-start',
          sqls: ['ALTER TABLE users AUTO_INCREMENT = 80000000'],
          description: '修改用户ID起始值为80000000',
        },
        {
          name: '002-clear-all-test-data',
          sqls: [
            'SET FOREIGN_KEY_CHECKS = 0',
            'TRUNCATE TABLE trade_orders',
            'TRUNCATE TABLE user_accounts',
            'TRUNCATE TABLE bank_cards',
            'TRUNCATE TABLE deposit_records',
            'TRUNCATE TABLE reward_claims',
            'TRUNCATE TABLE messages',
            'TRUNCATE TABLE users',
            'SET FOREIGN_KEY_CHECKS = 1',
            'ALTER TABLE users AUTO_INCREMENT = 80000000',
          ],
          description: '清除所有测试数据并重置用户ID起始值',
        },
      ];

      // 执行未执行的迁移
      for (const migration of migrations) {
        if (!executedMigrations.includes(migration.name)) {
          await this.executeMigration(migration);
        } else {
          this.logger.log(`迁移 ${migration.name} 已执行，跳过`);
        }
      }
    } catch (error) {
      this.logger.error('迁移执行失败', error);
    }
  }

  private async ensureMigrationsTable() {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      await queryRunner.query(`
        CREATE TABLE IF NOT EXISTS migrations (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255) UNIQUE NOT NULL COMMENT '迁移文件名',
          executedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '执行时间'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='数据库迁移记录表';
      `);
    } finally {
      await queryRunner.release();
    }
  }

  private async getExecutedMigrations(): Promise<string[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    try {
      const result = await queryRunner.query('SELECT name FROM migrations');
      return result.map((row: any) => row.name);
    } finally {
      await queryRunner.release();
    }
  }

  private async executeMigration(migration: { name: string; sqls: string[]; description: string }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(`开始执行迁移: ${migration.name} - ${migration.description}`);

      // 执行所有迁移 SQL
      for (const sql of migration.sqls) {
        await queryRunner.query(sql);
      }

      // 记录迁移
      await queryRunner.query(
        'INSERT INTO migrations (name) VALUES (?)',
        [migration.name],
      );

      await queryRunner.commitTransaction();
      this.logger.log(`迁移 ${migration.name} 执行成功`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`迁移 ${migration.name} 执行失败`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
