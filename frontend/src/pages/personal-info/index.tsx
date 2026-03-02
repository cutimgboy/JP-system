import { ArrowLeft, Battery, Wifi, Signal, Edit2, Check, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BottomNav } from '../../components/BottomNav';
import { useState, useEffect } from 'react';
import { apiClient } from '../../utils/api';

interface UserInfo {
  id: number;
  phone: string | null;
  email: string | null;
  nickname: string | null;
  avatar: string | null;
  status: number;
}

export function PersonalInfo() {
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    nickname: '',
    email: '',
    phone: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      const response: any = await apiClient.get('/user/info');
      console.log('获取用户信息响应:', response);
      // 处理嵌套的响应结构
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        const userData = actualData.data || actualData;
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

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userInfo) {
      setEditForm({
        nickname: userInfo.nickname || '',
        email: userInfo.email || '',
        phone: userInfo.phone || '',
      });
    }
    setMessage('');
  };

  const handleSave = async () => {
    setLoading(true);
    setMessage('');
    try {
      console.log('发送更新请求，数据:', editForm);
      const response: any = await apiClient.put('/user/info', editForm);
      console.log('收到响应:', response);

      // 处理嵌套的响应结构
      const actualData = response.data || response;
      if (actualData.code === 0 || response.code === 0) {
        const userData = actualData.data || actualData;
        setUserInfo(userData);
        setIsEditing(false);
        setMessage('保存成功');
        setTimeout(() => setMessage(''), 2000);
      } else {
        setMessage(actualData.msg || response.msg || '保存失败');
      }
    } catch (error) {
      console.error('更新用户信息失败:', error);
      setMessage('保存失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1a1f2e] pb-16">
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
          <h1 className="text-white text-base font-medium">个人信息</h1>
          {!isEditing && (
            <button
              onClick={handleEdit}
              className="absolute right-0 w-9 h-9 flex items-center justify-center hover:bg-gray-700/30 rounded-full transition-colors"
            >
              <Edit2 className="w-5 h-5 text-gray-300" />
            </button>
          )}
        </div>
      </div>

      {/* Message */}
      {message && (
        <div className="mx-4 mt-4 px-4 py-2 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm text-center">
          {message}
        </div>
      )}

      {/* Content */}
      <div className="px-4 pt-6">
        {/* Basic Information Card */}
        <div className="bg-[#1f2633] rounded-xl border border-gray-700/50 mb-4">
          {/* Nickname */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700/30">
            <span className="text-gray-300">昵称</span>
            {isEditing ? (
              <input
                type="text"
                value={editForm.nickname}
                onChange={(e) => setEditForm({ ...editForm, nickname: e.target.value })}
                className="bg-[#141820] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none w-48 text-right"
                placeholder="请输入昵称"
              />
            ) : (
              <span className="text-white">{userInfo?.nickname || '未设置'}</span>
            )}
          </div>

          {/* Email */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700/30">
            <span className="text-gray-300">电子邮箱</span>
            {isEditing ? (
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                className="bg-[#141820] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none w-48 text-right"
                placeholder="请输入邮箱"
              />
            ) : (
              <span className="text-white">{userInfo?.email || '未设置'}</span>
            )}
          </div>

          {/* Phone */}
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-gray-300">手机号</span>
            {isEditing ? (
              <input
                type="tel"
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                className="bg-[#141820] text-white px-3 py-2 rounded border border-gray-600 focus:border-blue-500 outline-none w-48 text-right"
                placeholder="请输入手机号"
              />
            ) : (
              <span className="text-white">{userInfo?.phone || '未设置'}</span>
            )}
          </div>
        </div>

        {/* Account Information Card */}
        <div className="bg-[#1f2633] rounded-xl border border-gray-700/50">
          {/* Trading Account */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700/30">
            <span className="text-gray-300">交易账号</span>
            <span className="text-gray-400">{userInfo?.id || '-'}</span>
          </div>

          {/* Base Currency */}
          <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700/30">
            <span className="text-gray-300">基础货币</span>
            <span className="text-white">VND</span>
          </div>

          {/* Region */}
          <div className="px-4 py-4 flex items-center justify-between">
            <span className="text-gray-300">国家地区</span>
            <span className="text-gray-400">越南</span>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-3 mt-6">
            <button
              onClick={handleCancel}
              className="flex-1 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <X className="w-5 h-5" />
              取消
            </button>
            <button
              onClick={handleSave}
              disabled={loading}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Check className="w-5 h-5" />
              {loading ? '保存中...' : '保存'}
            </button>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
