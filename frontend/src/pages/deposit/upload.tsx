import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronLeft, Image as ImageIcon, Landmark, PartyPopper, Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';
import { tx } from "../../i18n/text";
import { compressImageFile } from '../../utils/image';
import { formatVndAmount } from '../../utils/currency';
import { goBackOrNavigate } from '../../utils/navigation';
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
  const [showSubmittedModal, setShowSubmittedModal] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'error' | 'warning';
  } | null>(null);
  const userBankCard = location.state?.userBankCard as BankCard | undefined;
  const systemBankCard = location.state?.systemBankCard as BankCard | undefined;
  const maxReceiptImages = 8;
  useEffect(() => {
    if (!userBankCard || !systemBankCard) {
      navigate('/deposit');
    }
  }, [userBankCard, systemBankCard, navigate]);
  const maskAccountNumber = (accountNumber?: string) => {
    if (!accountNumber) return '';
    if (accountNumber.length <= 8) return accountNumber;
    return `${accountNumber.slice(0, 4)} **** ${accountNumber.slice(-4)}`;
  };
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    const remainingSlots = Math.max(maxReceiptImages - uploadedImages.length, 0);
    const selectedFiles = Array.from(files).slice(0, remainingSlots);
    if (selectedFiles.length === 0) {
      setToast({
        message: tx("最多可上传8张凭证"),
        type: 'warning'
      });
      event.target.value = '';
      return;
    }
    Promise.all(selectedFiles.map(file => compressImageFile(file, {
      maxDimension: 960,
      quality: 0.72
    }))).then(newImages => {
      setUploadedImages(prev => [...prev, ...newImages]);
    }).catch(() => {
      setToast({
        message: tx("图片读取失败，请重新上传"),
        type: 'error'
      });
    });
    event.target.value = '';
  };
  const removeImage = (index: number) => {
    setUploadedImages(prev => prev.filter((_, currentIndex) => currentIndex !== index));
  };
  const handleSubmit = async () => {
    if (!amount) {
      setToast({
        message: tx("请输入存入金额"),
        type: 'warning'
      });
      return;
    }
    if (uploadedImages.length === 0) {
      setToast({
        message: tx("请上传转账凭证"),
        type: 'warning'
      });
      return;
    }
    if (!userBankCard || !systemBankCard) {
      setToast({
        message: tx("银行卡信息缺失"),
        type: 'error'
      });
      return;
    }
    setLoading(true);
    try {
      const response = await apiClient.post('/deposit', {
        amount: Number(amount),
        userBankName: userBankCard.bankName,
        userAccountName: userBankCard.accountName,
        userAccountNumber: userBankCard.accountNumber,
        systemBankName: systemBankCard.bankName,
        systemAccountName: systemBankCard.accountName,
        systemAccountNumber: systemBankCard.accountNumber,
        receiptImages: uploadedImages
      });
      const depositData = extractData(response);
      if (depositData) {
        setShowSubmittedModal(true);
      } else {
        setToast({
          message: tx("提交失败"),
          type: 'error'
        });
      }
    } catch (error) {
      console.error(tx("提交入金记录失败:"), error);
      setToast({
        message: tx("提交失败，请重试"),
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  const canSubmit = Boolean(amount) && uploadedImages.length > 0 && !loading;
  const formattedAmount = amount && !Number.isNaN(Number(amount)) ? formatVndAmount(amount) : formatVndAmount(0);
  return <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button onClick={() => goBackOrNavigate(navigate, '/deposit')} className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10">
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium text-white">{tx("上传转账凭证")}</h1>
        <div className="w-10" />
      </div>

      <div className="px-5 pb-[140px] pt-8">
        <motion.div initial={{
        opacity: 0,
        y: 20
      }} animate={{
        opacity: 1,
        y: 0
      }} transition={{
        duration: 0.4
      }}>
          <h2 className="mb-3 text-[18px] font-bold">{tx("汇款银行")}</h2>
          <div className="mb-8 rounded-[20px] border border-white/10 bg-[#14141c]/80 p-5 shadow-sm backdrop-blur-xl">
            <div className="mb-3 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-[#1a1a24]">
                <Landmark size={20} className="text-white" />
              </div>
              <span className="text-[18px] font-semibold">{userBankCard?.bankName || '-'}</span>
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 pl-[56px] text-[14px] text-[#8a8a93]">
              <span>{tx("账户名称：")}{userBankCard?.accountName || '-'}</span>
              <span className="font-mono">{tx("账户号码：")}{maskAccountNumber(userBankCard?.accountNumber)}</span>
            </div>
          </div>

          <h2 className="mb-3 text-[18px] font-bold">{tx("存入资金")}</h2>
          <div className="relative mb-2">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 border-r border-white/20 pr-4 text-[16px] font-medium">
              VND
            </div>
            <input type="number" value={amount} onChange={event => setAmount(event.target.value)} placeholder={tx("请输入存入金额")} className="h-[60px] w-full rounded-[16px] border border-white/10 bg-[#14141c] pl-[92px] pr-4 font-mono text-[18px] text-white shadow-sm outline-none transition-colors placeholder:font-sans placeholder:text-[#8a8a93] focus:border-[#6c48f5]/50" />
          </div>
          <div className="mb-10" />

          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-[18px] font-bold">{tx("上传转账凭证")}</h2>
            <button type="button" className="text-[14px] text-[#6c48f5] transition-colors hover:text-[#5a3bd9]">{tx("查看示例")}</button>
          </div>

          <div className="mb-10 flex flex-wrap gap-4">
            {uploadedImages.map((image, index) => <div key={image} className="group relative flex h-[100px] w-[100px] items-center justify-center overflow-hidden rounded-[16px] border border-white/10 bg-[#1a1a24] shadow-sm">
                <img src={image} alt={tx('转账凭证 {{index}}', { index: index + 1 })} className="h-full w-full object-cover" />
                <button type="button" onClick={() => removeImage(index)} className="absolute right-1 top-1 z-10 flex h-6 w-6 items-center justify-center rounded-full border border-white/20 bg-black/60 shadow-md transition-colors hover:bg-black/80">
                  <X size={14} className="text-white" />
                </button>
              </div>)}

            {uploadedImages.length < maxReceiptImages && <label className="flex h-[100px] w-[100px] cursor-pointer items-center justify-center rounded-[16px] border-[1.5px] border-dashed border-white/20 transition-all hover:border-white/40 hover:bg-white/5">
                <input type="file" accept="image/*" multiple onClick={event => {
              event.currentTarget.value = '';
            }} onChange={handleImageUpload} className="hidden" />
                {uploadedImages.length === 0 ? <ImageIcon size={32} className="text-[#8a8a93]" /> : <Plus size={32} className="text-[#8a8a93]" />}
              </label>}
          </div>

          <div className="space-y-3 rounded-[20px] border border-white/5 bg-[#1a1a24]/50 p-5 text-[13px] leading-relaxed text-[#8a8a93]">
            <p className="mb-2 font-semibold text-white/90">{tx("温馨提示")}</p>
            <p className="flex items-start gap-2">
              <span className="text-white/60">1.</span>{tx("若输入的金额与实际转账金额不一致，会影响资金到账速度")}</p>
            <p className="flex items-start gap-2">
              <span className="text-white/60">2.</span>{tx("在交易日20:00前存入的资金，将会当日存入交易账户，其他时间存入的资金，将会下个交易日存入账户")}</p>
          </div>
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
        <button onClick={handleSubmit} disabled={!canSubmit} className={`h-[52px] w-full rounded-[16px] text-[16px] font-medium text-white transition-all ${canSubmit ? 'border border-[#6c48f5]/30 bg-[#6c48f5] shadow-[0_4px_16px_rgba(108,72,245,0.3)] hover:bg-[#5a3be0]' : 'cursor-not-allowed border border-white/10 bg-[#1a1a24] text-white/30'}`}>
          {loading ? tx("提交中...") : tx("提交转账凭证")}
        </button>
      </div>

      <AnimatePresence>
        {showSubmittedModal && <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            <motion.div initial={{
          opacity: 0
        }} animate={{
          opacity: 1
        }} exit={{
          opacity: 0
        }} className="absolute inset-0 bg-[#09090b]/80 backdrop-blur-md" onClick={() => setShowSubmittedModal(false)} />
            <motion.div initial={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} animate={{
          opacity: 1,
          scale: 1,
          y: 0
        }} exit={{
          opacity: 0,
          scale: 0.95,
          y: 20
        }} transition={{
          type: 'spring',
          duration: 0.5
        }} className="relative flex w-full max-w-[340px] flex-col items-center rounded-[28px] border border-white/10 bg-[#14141c] p-8 text-center shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
              <div className="pointer-events-none absolute left-1/2 top-0 h-20 w-40 -translate-x-1/2 rounded-full bg-[#6c48f5]/20 blur-[30px]" />
              <div className="relative mb-6 flex h-[88px] w-[88px] items-center justify-center rounded-full bg-gradient-to-tr from-[#6c48f5] to-[#b084f5] shadow-[0_10px_30px_rgba(108,72,245,0.4)]">
                <div className="absolute inset-0 animate-ping rounded-full border-2 border-white/20 opacity-20" />
                <PartyPopper size={44} className="ml-1 text-white" />
              </div>

              <h3 className="mb-2 text-[22px] font-bold tracking-tight text-white">{tx("转账凭证已提交")}</h3>
              <p className="mb-8 font-mono text-[28px] font-bold tracking-tight text-[#10b981] drop-shadow-[0_2px_10px_rgba(16,185,129,0.2)]">
                {formattedAmount}
              </p>

              <div className="mb-8 w-full space-y-3 rounded-[20px] border border-white/5 bg-[#1a1a24]/80 p-5 text-left text-[13px] text-[#8a8a93]">
                <p className="mb-1 font-semibold text-white/90">{tx("温馨提示")}</p>
                <p className="leading-relaxed">{tx("1. 预计今天可到账，到账后将通过消息通知您。")}</p>
                <p className="leading-relaxed">{tx("2. 跨银行转账，需要较长时间处理，到账速度取决于银行的处理速度，我们收到资金后将会第一时间去处理。")}</p>
              </div>

              <button onClick={() => {
            setShowSubmittedModal(false);
            navigate('/profile');
          }} className="h-[52px] w-full rounded-[16px] border border-white/10 bg-[#2a2a36] text-[16px] font-medium text-white transition-colors hover:bg-[#3a3a46]">{tx("知道了")}</button>
            </motion.div>
          </div>}
      </AnimatePresence>
    </div>;
}
