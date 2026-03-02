import { useState, useEffect } from 'react';
import { apiClient } from '../utils/api';

interface Order {
  id: number;
  userId: number;
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
}

interface OrderStats {
  totalOrders: number;
  openOrders: number;
  winOrders: number;
  lossOrders: number;
  totalProfit: number;
  totalLoss: number;
}

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
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const limit = 20;

  // 获取订单统计
  const fetchStats = async () => {
    try {
      const response = await apiClient.get('/admin/orders/stats', {
        params: { accountType: 'real' }
      });
      setStats(response.data.data || response.data);
    } catch (error) {
      console.error('获取统计失败:', error);
    }
  };

  // 获取订单列表
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/orders', {
        params: {
          page,
          limit,
          accountType: 'real',
          search: search || undefined,
        }
      });
      const result = response.data.data || response.data;
      setOrders(result.orders || []);
      setTotalPages(result.totalPages || 1);
    } catch (error) {
      console.error('获取订单失败:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [page, search]);

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getTradeTypeLabel = (type: string) => {
    return type === 'bull' ? '看涨' : '看跌';
  };

  const getTradeTypeColor = (type: string) => {
    return type === 'bull' ? 'bg-red-100 text-red-800' : 'bg-teal-100 text-teal-800';
  };

  const getStatusLabel = (status: string) => {
    return status === 'open' ? '进行中' : '已平仓';
  };

  const getStatusColor = (status: string) => {
    return status === 'open' ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800';
  };

  const getResultColor = (result: string) => {
    if (result === 'win') return 'text-green-600';
    if (result === 'loss') return 'text-red-600';
    return 'text-gray-600';
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">订单管理</h1>
        <p className="text-gray-600 mt-1">查看和管理所有真实账户交易订单</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">总订单数</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{(stats?.totalOrders || 0).toLocaleString()}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">进行中</p>
              <p className="text-2xl font-bold text-gray-800 mt-1">{(stats?.openOrders || 0).toLocaleString()}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">盈利订单</p>
              <p className="text-2xl font-bold text-green-600 mt-1">{(stats?.winOrders || 0).toLocaleString()}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">亏损订单</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{(stats?.lossOrders || 0).toLocaleString()}</p>
            </div>
            <div className="bg-red-100 rounded-full p-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="搜索订单号、用户ID、股票代码..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
            />
            <button
              onClick={handleSearch}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              搜索
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">加载中...</div>
        ) : !orders || orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500">暂无订单数据</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">订单ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户ID</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">股票代码</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">类型</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">投资金额</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">开仓价</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">平仓价</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">盈亏</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">创建时间</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{order.userId}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.stockCode}
                        <div className="text-xs text-gray-500">{order.stockName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTradeTypeColor(order.tradeType)}`}>
                          {getTradeTypeLabel(order.tradeType)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(order.investmentAmount || 0).toLocaleString()} VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {Number(order.openPrice || 0).toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {order.closePrice ? Number(order.closePrice).toFixed(2) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold">
                        <span className={getResultColor(order.result)}>
                          {Number(order.profitLoss || 0) > 0 ? '+' : ''}{Number(order.profitLoss || 0).toLocaleString()} VND
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(order.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* 分页 */}
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                第 {page} 页，共 {totalPages} 页
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  上一页
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  下一页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
