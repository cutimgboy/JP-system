import { useState, useEffect } from 'react';
import { Toast } from '../components/Toast';
import {
  apiClient,
  extractData,
  extractMessage,
  isSuccessResponse,
} from '../utils/api';

interface DepositRecord {
  id: number;
  userId: number;
  amount: number;
  userBankName: string;
  userAccountName: string;
  userAccountNumber: string;
  systemBankName: string;
  systemAccountName: string;
  systemAccountNumber: string;
  receiptImages: string | null;
  status: number;
  remark: string | null;
  createTime: string;
  user?: {
    id: number;
    nickname: string;
    phone: string;
  };
}

export function DepositReview() {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<number | undefined>(0); // 0-待审核, 1-已通过, 2-已拒绝, undefined-全部
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewAction, setReviewAction] = useState<1 | 2>(1); // 1-通过, 2-拒绝
  const [remark, setRemark] = useState('');
  const [confirmAmount, setConfirmAmount] = useState(''); // 管理员手动输入的金额
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    fetchDeposits();
  }, [activeTab]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params = activeTab !== undefined ? { status: activeTab } : {};
      const response = await apiClient.get('/deposit/all', { params });
      const records = extractData<DepositRecord[]>(response) || [];
      setDeposits(Array.isArray(records) ? records : []);
    } catch (error) {
      console.error('获取入金记录失败:', error);
      setDeposits([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (deposit: DepositRecord) => {
    setSelectedDeposit(deposit);
    setShowDetailModal(true);
  };

  const handleReview = (deposit: DepositRecord, action: 1 | 2) => {
    setSelectedDeposit(deposit);
    setReviewAction(action);
    setRemark('');
    setConfirmAmount(''); // 重置金额输入
    setShowReviewModal(true);
  };

  const submitReview = async () => {
    if (!selectedDeposit) return;

    // 如果是通过操作，需要验证管理员输入的金额
    if (reviewAction === 1) {
      if (!confirmAmount) {
        setToast({ message: '请输入确认金额', type: 'warning' });
        return;
      }

      // 移除千分位分隔符和空格后再解析
      const cleanAmount = confirmAmount.replace(/[,\s]/g, '');
      const inputAmount = parseFloat(cleanAmount);
      const expectedAmount = parseFloat(String(selectedDeposit.amount));

      if (isNaN(inputAmount)) {
        setToast({ message: '请输入有效的金额', type: 'error' });
        return;
      }

      if (inputAmount !== expectedAmount) {
        setToast({ message: '输入金额与申请金额不一致，请核对', type: 'error' });
        return;
      }
    }

    try {
      const response = await apiClient.put(`/deposit/${selectedDeposit.id}/review`, {
        status: reviewAction,
        remark: remark || undefined,
      });

      if (isSuccessResponse(response)) {
        setToast({
          message: reviewAction === 1 ? '审核通过，已充值到账' : '已拒绝',
          type: 'success'
        });
        setShowReviewModal(false);
        void fetchDeposits();
      } else {
        setToast({ message: extractMessage(response, '操作失败'), type: 'error' });
      }
    } catch (error) {
      console.error('审核失败:', error);
      setToast({ message: '操作失败', type: 'error' });
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return '待审核';
      case 1: return '已通过';
      case 2: return '已拒绝';
      default: return '未知';
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return 'bg-yellow-100 text-yellow-800';
      case 1: return 'bg-green-100 text-green-800';
      case 2: return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN');
  };

  const parseReceiptImages = (images: string | null): string[] => {
    if (!images) return [];
    try {
      return JSON.parse(images);
    } catch {
      return [];
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">入金审核</h1>
        <p className="text-gray-600 mt-1">审核用户的充值申请</p>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab(0)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 0
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              待审核
            </button>
            <button
              onClick={() => setActiveTab(1)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 1
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              已通过
            </button>
            <button
              onClick={() => setActiveTab(2)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === 2
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              已拒绝
            </button>
            <button
              onClick={() => setActiveTab(undefined)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeTab === undefined
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              全部
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-6 text-center text-gray-500">加载中...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">用户</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">金额</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">汇款银行</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">申请时间</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">状态</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {deposits.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  deposits.map((deposit) => (
                    <tr key={deposit.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{deposit.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.user?.nickname || deposit.userId}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.amount.toLocaleString()} VND
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {deposit.userBankName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(deposit.createTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(deposit.status)}`}>
                          {getStatusText(deposit.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(deposit)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          查看
                        </button>
                        {deposit.status === 0 && (
                          <>
                            <button
                              onClick={() => handleReview(deposit, 1)}
                              className="text-green-600 hover:text-green-900 mr-3"
                            >
                              通过
                            </button>
                            <button
                              onClick={() => handleReview(deposit, 2)}
                              className="text-red-600 hover:text-red-900"
                            >
                              拒绝
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {showDetailModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">入金详情</h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">订单ID</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedDeposit.id}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">用户</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedDeposit.user?.nickname || selectedDeposit.userId}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">金额</label>
                  <div className="mt-1 text-sm text-gray-900">
                    {selectedDeposit.amount.toLocaleString()} VND
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">状态</label>
                  <div className="mt-1">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedDeposit.status)}`}>
                      {getStatusText(selectedDeposit.status)}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">汇款银行信息</label>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm">
                    <div>银行：{selectedDeposit.userBankName}</div>
                    <div>账户名：{selectedDeposit.userAccountName}</div>
                    <div>账号：{selectedDeposit.userAccountNumber}</div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">收款银行信息</label>
                <div className="bg-gray-50 p-3 rounded">
                  <div className="text-sm">
                    <div>银行：{selectedDeposit.systemBankName}</div>
                    <div>账户名：{selectedDeposit.systemAccountName}</div>
                    <div>账号：{selectedDeposit.systemAccountNumber}</div>
                  </div>
                </div>
              </div>

              {selectedDeposit.receiptImages && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">转账凭证</label>
                  <div className="grid grid-cols-3 gap-2">
                    {parseReceiptImages(selectedDeposit.receiptImages).map((img, index) => (
                      <img
                        key={index}
                        src={img}
                        alt={`凭证 ${index + 1}`}
                        className="w-full h-32 object-cover rounded border"
                      />
                    ))}
                  </div>
                </div>
              )}

              {selectedDeposit.remark && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">审核备注</label>
                  <div className="mt-1 text-sm text-gray-900">{selectedDeposit.remark}</div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700">申请时间</label>
                <div className="mt-1 text-sm text-gray-900">{formatDate(selectedDeposit.createTime)}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                关闭
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedDeposit && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {reviewAction === 1 ? '审核通过' : '审核拒绝'}
            </h2>

            {/* 通过时需要确认金额 */}
            {reviewAction === 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  确认金额（必填）
                </label>
                <div className="mb-2 text-sm text-gray-600">
                  申请金额：<span className="font-semibold text-gray-900">{selectedDeposit.amount.toLocaleString()} VND</span>
                </div>
                <input
                  type="text"
                  value={confirmAmount}
                  onChange={(e) => setConfirmAmount(e.target.value)}
                  placeholder="请手动输入上方金额以确认"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-xs text-red-500">请手动输入金额以确认充值，输入的金额必须与申请金额一致</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                备注（选填）
              </label>
              <textarea
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="请输入审核备注"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowReviewModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                取消
              </button>
              <button
                onClick={submitReview}
                className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors ${
                  reviewAction === 1
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                确认{reviewAction === 1 ? '通过' : '拒绝'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
