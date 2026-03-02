import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, Index } from 'typeorm';

/**
 * 产品实体 - 整合交易设置和基础信息
 * Product Entity
 */
@Entity('products')
export class ProductEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'int', name: 'order_num', comment: '序号' })
  orderNum: number;

  @Column({ type: 'varchar', length: 50, name: 'type', comment: '品种类型：指数/股票/商品/Crypto/外汇' })
  @Index()
  type: string;

  @Column({ type: 'varchar', length: 50, unique: true, name: 'code', comment: '代码' })
  code: string;

  @Column({ type: 'varchar', length: 50, name: 'trade_code', comment: '交易代码（用于获取行情）' })
  @Index()
  tradeCode: string;

  @Column({ type: 'varchar', length: 200, name: 'name_cn', comment: '简体名称' })
  nameCn: string;

  @Column({ type: 'varchar', length: 200, name: 'name_en', comment: '英文名称' })
  nameEn: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'name_vn', comment: '越南语名称' })
  nameVn: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'currency_type', comment: '货币类型' })
  currencyType: string;

  @Column({ type: 'varchar', length: 10, nullable: true, name: 'margin_currency', comment: '保证金货币' })
  marginCurrency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'decimal_places', comment: '小数位' })
  decimalPlaces: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'bid_spread', comment: '买价价差' })
  bidSpread: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'ask_spread', comment: '卖价价差' })
  askSpread: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'spread', comment: '价差' })
  spread: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'contract_size', comment: '合约量' })
  contractSize: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'min_price_change', comment: '交易最小变动' })
  minPriceChange: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'fixed_leverage', comment: '固定杠杆' })
  fixedLeverage: number;

  @Column({ type: 'decimal', precision: 10, scale: 6, nullable: true, name: 'liquidation_range', comment: '涨跌爆仓幅度' })
  liquidationRange: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'forced_liquidation_ratio', comment: '强制平仓比例' })
  forcedLiquidationRatio: number;

  @Column({ type: 'text', nullable: true, name: 'trading_hours', comment: '交易时间' })
  tradingHours: string;

  @Column({ type: 'boolean', default: true, name: 'is_active', comment: '是否启用' })
  isActive: boolean;

  @Column({ type: 'int', default: 0, name: 'sort_order', comment: '排序顺序' })
  sortOrder: number;

  // 基础信息字段
  @Column({ type: 'text', nullable: true, name: 'description_cn', comment: '简体介绍' })
  descriptionCn: string;

  @Column({ type: 'text', nullable: true, name: 'description_vn', comment: '越南语介绍' })
  descriptionVn: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'company_name', comment: '公司名称' })
  companyName: string;

  @Column({ type: 'varchar', length: 200, nullable: true, name: 'market', comment: '所属市场' })
  market: string;

  @Column({ type: 'varchar', length: 500, nullable: true, name: 'website', comment: '网址' })
  website: string;

  @Column({ type: 'int', nullable: true, name: 'market_cap_rank', comment: '市值排名' })
  marketCapRank: number;

  @CreateDateColumn({ name: 'created_at', comment: '创建时间' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', comment: '更新时间' })
  updatedAt: Date;
}
