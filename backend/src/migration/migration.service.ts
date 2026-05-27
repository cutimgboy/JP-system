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
          name: '002-create-quote-history-tables',
          sqls: [
            `
              CREATE TABLE IF NOT EXISTS stock_ticks (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                code VARCHAR(20) NOT NULL COMMENT '股票代码',
                seq VARCHAR(64) NOT NULL COMMENT '行情源序列号',
                tick_time TIMESTAMP NOT NULL COMMENT 'tick时间戳',
                price DECIMAL(18,6) NOT NULL COMMENT '成交价格',
                volume BIGINT NOT NULL DEFAULT 0 COMMENT '成交量',
                turnover DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT '成交额',
                trade_direction TINYINT NULL COMMENT '交易方向：1-买入，2-卖出',
                received_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '接收时间',
                PRIMARY KEY (id),
                UNIQUE KEY uk_stock_ticks_code_seq (code, seq),
                KEY idx_stock_ticks_code_tick_time (code, tick_time),
                KEY idx_stock_ticks_tick_time (tick_time)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票原始Tick表'
            `,
            `
              CREATE TABLE IF NOT EXISTS stock_klines (
                id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
                code VARCHAR(20) NOT NULL COMMENT '股票代码',
                interval_sec INT NOT NULL COMMENT 'K线周期，单位秒',
                bucket_time TIMESTAMP NOT NULL COMMENT 'K线桶起始时间',
                open DECIMAL(18,6) NOT NULL COMMENT '开盘价',
                high DECIMAL(18,6) NOT NULL COMMENT '最高价',
                low DECIMAL(18,6) NOT NULL COMMENT '最低价',
                close DECIMAL(18,6) NOT NULL COMMENT '收盘价',
                volume BIGINT NOT NULL DEFAULT 0 COMMENT '成交量',
                turnover DECIMAL(20,2) NOT NULL DEFAULT 0 COMMENT '成交额',
                trade_count INT NOT NULL DEFAULT 0 COMMENT '成交笔数',
                first_tick_time TIMESTAMP NOT NULL COMMENT '桶内最早tick时间',
                last_tick_time TIMESTAMP NOT NULL COMMENT '桶内最晚tick时间',
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
                PRIMARY KEY (id),
                UNIQUE KEY uk_stock_klines_code_interval_bucket (code, interval_sec, bucket_time),
                KEY idx_stock_klines_interval_bucket (interval_sec, bucket_time)
              ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='股票K线聚合表'
            `,
          ],
          description: '创建行情K线表和可选原始tick表',
        },
        // Destructive data-reset operations must live in explicit scripts, never startup migrations.
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

  private async executeMigration(migration: {
    name: string;
    sqls: string[];
    description: string;
  }) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.logger.log(
        `开始执行迁移: ${migration.name} - ${migration.description}`,
      );

      // 执行所有迁移 SQL
      for (const sql of migration.sqls) {
        await queryRunner.query(sql);
      }

      // 记录迁移
      await queryRunner.query('INSERT INTO migrations (name) VALUES (?)', [
        migration.name,
      ]);

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
