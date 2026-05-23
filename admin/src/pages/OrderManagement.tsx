import { useEffect, useMemo, useState } from 'react';
import { Search, RefreshCw } from 'lucide-react';
import { apiClient, extractData } from '../utils/api';
import {
  Button,
  DataTable,
  PageHeader,
  Pagination,
  StatusBadge,
  StatCard,
  Toolbar,
  fieldClass,
} from '../components/AdminUI';

interface Order {
  id: number;
  userId: number;
  accountType: 'demo' | 'real';
  stockCode: string;
  stockName: string;
  tradeType: 'bull' | 'bear';
  investmentAmount: number;
  openPrice: number;
  closePrice?: number;
  profitLoss: number;
  status: 'open' | 'closed';
  result: 'pending' | 'win' | 'loss' | 'draw';
  createdAt: string;
  openTime: string;
  closeTime?: string;
  user?: {
    id: number;
    nickname: string | null;
    phone: string | null;
  };
}

interface OrderStats {
  totalOrders: number;
  openOrders: number;
  winOrders: number;
  lossOrders: number;
  totalProfit: number;
  totalLoss: number;
}

type AccountFilter = 'all' | 'demo' | 'real';
type StatusFilter = 'all' | 'open' | 'closed';

export function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [stats, setStats] = useState<OrderStats>({
    totalOrders: 0,
    openOrders: 0,
    winOrders: 0,
    lossOrders: 0,
    totalProfit: 0,
    totalLoss: 0,
  });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [accountTypeFilter, setAccountTypeFilter] = useState<AccountFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [limit, setLimit] = useState(20);

  const params = useMemo(() => {
    const query: Record<string, string | number | undefined> = {
      page,
      limit,
      accountType: accountTypeFilter === 'all' ? undefined : accountTypeFilter,
      status: statusFilter === 'all' ? undefined : statusFilter,
      search: search || undefined,
    };
    return query;
  }, [accountTypeFilter, limit, page, search, statusFilter]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/orders/stats', {
        params: {
          accountType: accountTypeFilter === 'all' ? undefined : accountTypeFilter,
        },
      });
      const statsData = extractData<OrderStats>(response);
      if (statsData) {
        setStats(statsData);
      }
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/orders', { params });
      const result = extractData<{
        orders: Order[];
        totalPages: number;
        total: number;
      }>(response);

      setOrders(result?.orders || []);
      setTotalPages(result?.totalPages || 1);
      setTotal(result?.total || 0);
    } catch (error) {
      console.error('获取订单失败:', error);
      setOrders([]);
      setTotalPages(1);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchStats();
  }, [accountTypeFilter]);

  useEffect(() => {
    void fetchOrders();
  }, [params]);

  const applySearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="订单管理"
        description="查看全量交易订单、账户类型、结果和资金分布"
        actions={
          <>
            <Button variant="secondary" onClick={() => void fetchOrders()}>
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-6">
        <StatCard label="总订单数" value={stats.totalOrders.toLocaleString()} tone="blue" />
        <StatCard label="进行中" value={stats.openOrders.toLocaleString()} tone="yellow" />
        <StatCard label="盈利" value={stats.winOrders.toLocaleString()} tone="green" />
        <StatCard label="亏损" value={stats.lossOrders.toLocaleString()} tone="red" />
        <StatCard label="累计盈利" value={stats.totalProfit.toLocaleString()} tone="green" />
        <StatCard label="累计亏损" value={stats.totalLoss.toLocaleString()} tone="red" />
      </div>

      <Toolbar>
        <div className="flex flex-1 flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex flex-1 items-center gap-2">
            <Search className="h-4 w-4 text-slate-400" />
            <input
              className={`${fieldClass} flex-1`}
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  applySearch();
                }
              }}
              placeholder="搜索订单号、用户 ID、股票代码"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'demo', 'real'] as const).map((item) => (
              <Button
                key={item}
                variant={accountTypeFilter === item ? 'primary' : 'secondary'}
                onClick={() => {
                  setAccountTypeFilter(item);
                  setPage(1);
                }}
              >
                {item === 'all' ? '全部账户' : item === 'demo' ? '模拟账户' : '真实账户'}
              </Button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'closed'] as const).map((item) => (
              <Button
                key={item}
                variant={statusFilter === item ? 'primary' : 'secondary'}
                onClick={() => {
                  setStatusFilter(item);
                  setPage(1);
                }}
              >
                {item === 'all' ? '全部状态' : item === 'open' ? '进行中' : '已平仓'}
              </Button>
            ))}
          </div>
          <Button variant="primary" onClick={applySearch}>
            <Search className="h-4 w-4" />
            搜索
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">每页</span>
          <select
            className={fieldClass}
            value={limit}
            onChange={(event) => {
              setPage(1);
              setLimit(Number(event.target.value));
            }}
          >
            {[20, 50, 100].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </Toolbar>

      <DataTable
        loading={loading}
        rows={orders}
        rowKey={(row) => row.id}
        emptyText="当前筛选条件下没有订单"
        columns={[
          { key: 'id', title: '订单ID', render: (order) => order.id },
          {
            key: 'user',
            title: '用户',
            render: (order) => (
              <div>
                <div className="font-medium text-slate-950">{order.user?.nickname || `用户 ${order.userId}`}</div>
                <div className="text-xs text-slate-500">{order.user?.phone || `UID ${order.userId}`}</div>
              </div>
            ),
          },
          {
            key: 'accountType',
            title: '账户',
            render: (order) => (
              <StatusBadge tone={order.accountType === 'real' ? 'blue' : 'violet'}>
                {order.accountType === 'real' ? '真实' : '模拟'}
              </StatusBadge>
            ),
          },
          {
            key: 'stock',
            title: '标的',
            render: (order) => (
              <div>
                <div className="font-medium text-slate-950">{order.stockCode}</div>
                <div className="text-xs text-slate-500">{order.stockName}</div>
              </div>
            ),
          },
          {
            key: 'tradeType',
            title: '方向',
            render: (order) => (
              <StatusBadge tone={order.tradeType === 'bull' ? 'red' : 'cyan'}>
                {order.tradeType === 'bull' ? '看涨' : '看跌'}
              </StatusBadge>
            ),
          },
          {
            key: 'amount',
            title: '金额',
            render: (order) => `${Number(order.investmentAmount || 0).toLocaleString()} VND`,
          },
          {
            key: 'open',
            title: '开仓/平仓',
            render: (order) => (
              <div>
                <div>开: {Number(order.openPrice || 0).toFixed(4)}</div>
                <div className="text-xs text-slate-500">
                  平: {order.closePrice ? Number(order.closePrice).toFixed(4) : '-'}
                </div>
              </div>
            ),
          },
          {
            key: 'profit',
            title: '盈亏',
            render: (order) => (
              <span className={Number(order.profitLoss || 0) >= 0 ? 'text-emerald-700' : 'text-rose-700'}>
                {Number(order.profitLoss || 0) >= 0 ? '+' : ''}
                {Number(order.profitLoss || 0).toLocaleString()} VND
              </span>
            ),
          },
          {
            key: 'status',
            title: '状态',
            render: (order) => (
              <StatusBadge tone={order.status === 'open' ? 'yellow' : 'slate'}>
                {order.status === 'open' ? '进行中' : '已平仓'}
              </StatusBadge>
            ),
          },
          {
            key: 'time',
            title: '创建时间',
            render: (order) => new Date(order.createdAt).toLocaleString('zh-CN'),
          },
        ]}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setPage(1);
          setLimit(value);
        }}
      />
    </div>
  );
}
