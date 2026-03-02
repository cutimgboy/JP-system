import { ArrowLeft, Battery, Wifi, Signal } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { apiClient } from '../../utils/api';
import { Toast } from '../../components/Toast';

export function AddBankCard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [formData, setFormData] = useState({
    bankName: '',
    accountName: '',
    accountNumber: '',
    swiftCode: '',
  });

  const handleSubmit = async () => {
    // 验证表单
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      setToast({ message: '请填写完整的银行卡信息', type: 'warning' });
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/bank-card', formData);
      console.log('添加银行卡响应:', response);
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        setToast({ message: '添加成功', type: 'success' });
        setTimeout(() => {
          navigate('/my-bank');
        }, 1500);
      } else {
        setToast({ message: actualData.msg || '添加失败', type: 'error' });
      }
    } catch (error) {
      console.error('添加银行卡失败:', error);
      setToast({ message: '添加失败，请重试', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Status Bar */}
      <div className="bg-[#141820] px-4 pt-3 pb-2">
        <div className="flex items-center justify-between text-xs">
          <div className="text-white">12:00</div>
          <div className="flex items-center gap-1 text-white">
            <Signal className="w-4 h-4" />
            <Wifi className="w-4 h-4" />
            <Battery className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Navigation Header */}
      <div className="bg-[#141820] px-4 py-4 border-b border-gray-700/50">
        <div className="flex items-center justify-center relative">
          <button
            onClick={() => navigate(-1)}
            className="absolute left-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-300" />
          </button>
          <h1 className="text-white text-base font-medium">添加银行卡</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-32">
        <div className="space-y-4">
          {/* Bank Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">银行名称 *</label>
            <input
              type="text"
              value={formData.bankName}
              onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
              placeholder="请输入银行名称"
              className="w-full bg-[#1f2633] text-white px-4 py-3 rounded-lg border border-gray-700/50 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Account Name */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">账户名称 *</label>
            <input
              type="text"
              value={formData.accountName}
              onChange={(e) => setFormData({ ...formData, accountName: e.target.value })}
              placeholder="请输入账户名称"
              className="w-full bg-[#1f2633] text-white px-4 py-3 rounded-lg border border-gray-700/50 focus:border-blue-500 outline-none"
            />
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">账户号码 *</label>
            <input
              type="text"
              value={formData.accountNumber}
              onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
              placeholder="请输入账户号码"
              className="w-full bg-[#1f2633] text-white px-4 py-3 rounded-lg border border-gray-700/50 focus:border-blue-500 outline-none"
            />
          </div>

          {/* SWIFT Code */}
          <div>
            <label className="block text-sm text-gray-300 mb-2">SWIFT代码（选填）</label>
            <input
              type="text"
              value={formData.swiftCode}
              onChange={(e) => setFormData({ ...formData, swiftCode: e.target.value })}
              placeholder="请输入SWIFT代码"
              className="w-full bg-[#1f2633] text-white px-4 py-3 rounded-lg border border-gray-700/50 focus:border-blue-500 outline-none"
            />
          </div>
        </div>

        {/* Tips */}
        <div className="mt-6 bg-[#1f2633] rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-white text-sm font-medium mb-3">温馨提示</h3>
          <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <p>1. 请确保银行卡信息准确无误，错误的信息可能导致转账失败</p>
            <p>2. 账户名称需与您的实名认证信息一致</p>
            <p>3. 如需国际转账，请填写SWIFT代码</p>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !formData.bankName || !formData.accountName || !formData.accountNumber}
          className="w-full py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '提交中...' : '确认添加'}
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
