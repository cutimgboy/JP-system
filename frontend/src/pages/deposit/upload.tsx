import { ArrowLeft, Battery, Wifi, Signal, Building2, X, ImageIcon } from 'lucide-react';
import { BottomNav } from '../../components/BottomNav';
import { useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';

interface BankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
}

export function DepositUpload() {
  const navigate = useNavigate();
  const location = useLocation();
  const [amount, setAmount] = useState('');
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // 从路由状态获取银行卡信息
  const userBankCard = location.state?.userBankCard as BankCard | undefined;
  const systemBankCard = location.state?.systemBankCard as BankCard | undefined;

  useEffect(() => {
    // 如果没有银行卡信息，返回上一页
    if (!userBankCard || !systemBankCard) {
      navigate('/deposit');
    }
  }, [userBankCard, systemBankCard, navigate]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newImages = Array.from(files).map(file => URL.createObjectURL(file));
      setUploadedImages([...uploadedImages, ...newImages]);
    }
  };

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!amount) {
      setToast({ message: '请输入存入金额', type: 'warning' });
      return;
    }

    if (uploadedImages.length === 0) {
      setToast({ message: '请上传转账凭证', type: 'warning' });
      return;
    }

    if (!userBankCard || !systemBankCard) {
      setToast({ message: '银行卡信息缺失', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const response: any = await apiClient.post('/deposit', {
        amount: parseFloat(amount),
        userBankName: userBankCard.bankName,
        userAccountName: userBankCard.accountName,
        userAccountNumber: userBankCard.accountNumber,
        systemBankName: systemBankCard.bankName,
        systemAccountName: systemBankCard.accountName,
        systemAccountNumber: systemBankCard.accountNumber,
        receiptImages: uploadedImages,
      });

      console.log('提交入金记录响应:', response);
      const depositData = extractData(response);
      if (depositData) {
        setToast({ message: '提交成功，等待审核', type: 'success' });
        setTimeout(() => {
          navigate('/deposit/detail', { state: { depositId: depositData.id } });
        }, 1500);
      } else {
        setToast({ message: '提交失败', type: 'error' });
      }
    } catch (error) {
      console.error('提交入金记录失败:', error);
      setToast({ message: '提交失败，请重试', type: 'error' });
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
          <h1 className="text-white text-base font-medium">上传转账凭证</h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 pb-32">
        {/* Bank Information Section */}
        <div className="mb-6">
          <h2 className="text-white font-medium mb-3">汇款银行</h2>
          <div className="bg-[#1f2633] rounded-xl p-4 border border-gray-700/50">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#141820] rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-white font-medium mb-1">{userBankCard?.bankName}</div>
                <div className="text-xs text-gray-400">
                  <div>{userBankCard?.accountName}</div>
                  <div>{userBankCard?.accountNumber}</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Deposit Amount Section */}
        <div className="mb-6">
          <h2 className="text-white font-medium mb-3">存入资金</h2>
          <div className="bg-[#1f2633] rounded-lg px-4 py-3 border border-gray-700/50 flex items-center">
            <span className="text-gray-400 mr-3">VND</span>
            <span className="text-gray-600 mr-2">|</span>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="请输入存入金额"
              className="flex-1 bg-transparent text-white placeholder-gray-500 focus:outline-none"
            />
          </div>
          <p className="text-xs text-gray-400 mt-2">因银行监管需求，最低存入金额为50USD=xxxxVND</p>
        </div>

        {/* Upload Receipt Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-white font-medium">上传转账凭证</h2>
            <button className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
              查看示例
            </button>
          </div>

          {/* Upload Area */}
          <div className="grid grid-cols-3 gap-3">
            {uploadedImages.map((image, index) => (
              <div key={index} className="relative aspect-square bg-[#1f2633] rounded-lg border border-gray-700/50 overflow-hidden">
                <img src={image} alt={`上传图片 ${index + 1}`} className="w-full h-full object-cover" />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                >
                  <X className="w-3 h-3 text-white" />
                </button>
              </div>
            ))}

            {uploadedImages.length < 3 && (
              <label className="aspect-square bg-[#1f2633] rounded-lg border-2 border-dashed border-gray-600 flex items-center justify-center cursor-pointer hover:border-gray-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  multiple
                />
                <ImageIcon className="w-8 h-8 text-gray-500" />
              </label>
            )}
          </div>
        </div>

        {/* Tips Section */}
        <div className="bg-[#1f2633] rounded-lg p-4 border border-gray-700/50">
          <h3 className="text-white text-sm font-medium mb-3">温馨提示</h3>
          <div className="space-y-2 text-xs text-gray-400 leading-relaxed">
            <p>1.因银行监管需求，交易账户最低入金金额为500000VND，若低于该金额转账，会影响到账速度</p>
            <p>2.若输入的金金额与实际转账金额不一致，会影响到账速度</p>
            <p>3.在交易日20:00前存入的资金，将会当日存入交易账户，其他时间存入的资金，将会下个交易日存入账户</p>
          </div>
        </div>
      </div>

      {/* Submit Button - Fixed at bottom */}
      <div className="fixed bottom-20 left-0 right-0 px-4">
        <button
          onClick={handleSubmit}
          disabled={loading || !amount || uploadedImages.length === 0}
          className="w-full py-3.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-medium"
        >
          {loading ? '提交中...' : '提交转账凭证'}
        </button>
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
