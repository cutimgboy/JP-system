import {
  Column,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

/**
 * 股票 K 线聚合实体
 * 按 code + interval_sec + bucket_time 聚合 OHLCV。
 */
@Entity('stock_klines')
@Index(
  'uk_stock_klines_code_interval_bucket',
  ['code', 'interval_sec', 'bucket_time'],
  { unique: true },
)
@Index('idx_stock_klines_interval_bucket', ['interval_sec', 'bucket_time'])
export class StockKlineEntity {
  @PrimaryGeneratedColumn({ type: 'bigint', unsigned: true })
  id: string;

  @Column({ type: 'varchar', length: 20, comment: '股票代码' })
  code: string;

  @Column({ type: 'int', comment: 'K线周期，单位秒' })
  interval_sec: number;

  @Column({ type: 'timestamp', comment: 'K线桶起始时间' })
  bucket_time: Date;

  @Column({ type: 'decimal', precision: 18, scale: 6, comment: '开盘价' })
  open: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, comment: '最高价' })
  high: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, comment: '最低价' })
  low: number;

  @Column({ type: 'decimal', precision: 18, scale: 6, comment: '收盘价' })
  close: number;

  @Column({ type: 'bigint', default: 0, comment: '成交量' })
  volume: number;

  @Column({
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0,
    comment: '成交额',
  })
  turnover: number;

  @Column({ type: 'int', default: 0, comment: '成交笔数' })
  trade_count: number;

  @Column({ type: 'timestamp', comment: '桶内最早tick时间' })
  first_tick_time: Date;

  @Column({ type: 'timestamp', comment: '桶内最晚tick时间' })
  last_tick_time: Date;

  @UpdateDateColumn({ type: 'timestamp', comment: '更新时间' })
  updated_at: Date;
}
