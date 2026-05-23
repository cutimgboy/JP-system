import {
  BadgeDollarSign,
  Banknote,
  CreditCard,
  Gift,
  MessageSquareText,
  Trophy,
} from 'lucide-react';

export const adminNavItems = [
  {
    path: '/deposit-review',
    label: '入金审核',
    description: '处理用户充值凭证和到账审核',
    icon: Banknote,
  },
  {
    path: '/order-management',
    label: '订单管理',
    description: '查看交易订单、账户类型和盈亏结果',
    icon: BadgeDollarSign,
  },
  {
    path: '/bank-cards',
    label: '收款银行卡',
    description: '维护系统收款账户，同一时间只启用一张',
    icon: CreditCard,
  },
  {
    path: '/reward-settings',
    label: '奖励设置',
    description: '管理模拟/真实账户的奖励金额和启用状态',
    icon: Gift,
  },
  {
    path: '/community-management',
    label: '社区管理',
    description: '维护社区参与人数和排行榜运营数据',
    icon: Trophy,
  },
  {
    path: '/message-management',
    label: '消息管理',
    description: '维护消息中心内容、类型和排序',
    icon: MessageSquareText,
  },
] as const;

export type AdminNavPath = (typeof adminNavItems)[number]['path'];

export function getNavItem(pathname: string) {
  return (
    adminNavItems.find((item) => pathname.startsWith(item.path)) ||
    adminNavItems[0]
  );
}
