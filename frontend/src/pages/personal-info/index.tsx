import { useEffect, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Copy, Edit2, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { apiClient, extractData } from '../../utils/api';
import { Toast } from '../../components/Toast';

interface UserInfo {
  id: number;
  phone: string | null;
  email: string | null;
  nickname: string | null;
  avatar: string | null;
  status: number;
  createTime?: string | null;
}

export function PersonalInfo() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);
  const [editForm, setEditForm] = useState({
    nickname: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await apiClient.get('/user/info');
        const userData = extractData<UserInfo>(response);
        if (userData) {
          setUserInfo(userData);
          setEditForm({
            nickname: userData.nickname || '',
            email: userData.email || '',
            phone: userData.phone || '',
          });
        }
      } catch (error) {
        console.error('获取用户信息失败:', error);
      }
    };

    void fetchUserInfo();
  }, []);

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      nickname: userInfo?.nickname || '',
      email: userInfo?.email || '',
      phone: userInfo?.phone || '',
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const response = await apiClient.put('/user/info', editForm);
      const userData = extractData<UserInfo>(response);
      if (userData) {
        setUserInfo(userData);
        setIsEditing(false);
        setToast({ message: '保存成功', type: 'success' });
      } else {
        setToast({ message: '保存失败', type: 'error' });
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      setToast({ message: '保存失败，请重试', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setToast({ message: '复制成功', type: 'success' });
    } catch (error) {
      setToast({ message: '复制失败', type: 'error' });
    }
  };

  const maskEmail = (email?: string | null) => {
    if (!email) return '未绑定';
    const [name, domain] = email.split('@');
    if (!domain) return email;
    return `${name.slice(0, 2)}***@${domain}`;
  };

  const formatDate = (value?: string | null) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const avatarText = (userInfo?.nickname || userInfo?.phone || 'U').slice(0, 1).toUpperCase();

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <div className="sticky top-0 z-20 flex h-[60px] items-center justify-between border-b border-white/5 bg-[#09090b]/90 px-4 backdrop-blur-md">
        <button
          onClick={() => navigate(-1)}
          className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full transition-colors hover:bg-white/10"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="absolute left-1/2 -translate-x-1/2 text-[18px] font-medium">个人信息</h1>
        {isEditing ? (
          <button onClick={handleCancel} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        ) : (
          <button onClick={() => setIsEditing(true)} className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-white/10">
            <Edit2 size={18} />
          </button>
        )}
      </div>

      <div className="px-5 pb-28 pt-4">
        <div className="mb-4 rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-2 shadow-sm">
          <InfoRow label="头像" noBorder={false}>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-[#6c48f5]/40 to-[#14141c]">
                {userInfo?.avatar ? (
                  <img src={userInfo.avatar} alt="avatar" className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[18px] font-bold">{avatarText}</span>
                )}
              </div>
              <ChevronRight size={16} className="text-[#8a8a93]" />
            </div>
          </InfoRow>

          <InfoRow label="UID">
            <div className="flex items-center gap-2">
              <span className="text-[14px] text-[#8a8a93]">{userInfo?.id || '-'}</span>
              {userInfo?.id ? (
                <button onClick={() => handleCopy(String(userInfo.id))} className="rounded-md p-1 transition-colors hover:bg-white/10">
                  <Copy size={14} className="text-[#8a8a93]" />
                </button>
              ) : null}
            </div>
          </InfoRow>

          <InfoRow label="昵称">
            {isEditing ? (
              <input
                value={editForm.nickname}
                onChange={(event) => setEditForm((prev) => ({ ...prev, nickname: event.target.value }))}
                placeholder="请输入昵称"
                className="w-[180px] rounded-[12px] border border-white/10 bg-[#09090b] px-3 py-2 text-right text-[14px] text-white outline-none focus:border-[#6c48f5]/50"
              />
            ) : (
              <span className="text-[14px] text-[#8a8a93]">{userInfo?.nickname || '未设置'}</span>
            )}
          </InfoRow>

          <InfoRow label="国家/地区">
            <span className="text-[14px] text-[#8a8a93]">Vietnam (VN)</span>
          </InfoRow>

          <InfoRow label="基础货币" noBorder>
            <span className="text-[14px] text-[#8a8a93]">VND</span>
          </InfoRow>
        </div>

        <div className="mb-4 rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-2 shadow-sm">
          <InfoRow label="身份认证">
            <span className="rounded-full border border-[#10b981]/20 bg-[#10b981]/10 px-2 py-0.5 text-[13px] text-[#10b981]">已认证</span>
          </InfoRow>
          <InfoRow label="手机绑定">
            {isEditing ? (
              <input
                value={editForm.phone}
                onChange={(event) => setEditForm((prev) => ({ ...prev, phone: event.target.value }))}
                placeholder="请输入手机号"
                className="w-[180px] rounded-[12px] border border-white/10 bg-[#09090b] px-3 py-2 text-right text-[14px] text-white outline-none focus:border-[#6c48f5]/50"
              />
            ) : (
              <span className="text-[14px] text-[#8a8a93]">{userInfo?.phone || '未绑定'}</span>
            )}
          </InfoRow>
          <InfoRow label="邮箱绑定" noBorder>
            {isEditing ? (
              <input
                value={editForm.email}
                onChange={(event) => setEditForm((prev) => ({ ...prev, email: event.target.value }))}
                placeholder="请输入邮箱"
                className="w-[180px] rounded-[12px] border border-white/10 bg-[#09090b] px-3 py-2 text-right text-[14px] text-white outline-none focus:border-[#6c48f5]/50"
              />
            ) : (
              <span className="text-[14px] text-[#8a8a93]">{maskEmail(userInfo?.email)}</span>
            )}
          </InfoRow>
        </div>

        <div className="rounded-[20px] border border-white/5 bg-[#14141c] px-4 py-2 shadow-sm">
          <InfoRow label="注册时间" noBorder>
            <span className="text-[14px] text-[#8a8a93]">{formatDate(userInfo?.createTime)}</span>
          </InfoRow>
        </div>
      </div>

      {isEditing && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-[#09090b] via-[#09090b]/95 to-transparent p-5 pt-10">
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex h-[52px] w-full items-center justify-center gap-2 rounded-[16px] bg-[#6c48f5] text-[16px] font-medium text-white shadow-[0_4px_16px_rgba(108,72,245,0.3)] transition-colors hover:bg-[#5a3bd9] disabled:opacity-50"
          >
            <Check size={20} />
            {loading ? '保存中...' : '保存修改'}
          </button>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  label,
  children,
  noBorder = false,
}: {
  label: string;
  children: React.ReactNode;
  noBorder?: boolean;
}) {
  return (
    <div className={`-mx-4 flex items-center justify-between px-4 py-4 ${noBorder ? '' : 'border-b border-white/5'}`}>
      <span className="text-[15px] font-medium text-white/90">{label}</span>
      {children}
    </div>
  );
}
