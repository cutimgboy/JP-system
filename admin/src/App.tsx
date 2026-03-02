import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminLayout } from './components/AdminLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { BankCards } from './pages/BankCards';
import { DepositReview } from './pages/DepositReview';
import { OrderManagement } from './pages/OrderManagement';
import { RewardSettings } from './pages/RewardSettings';
import { CommunityManagement } from './pages/CommunityManagement';
import { MessageManagement } from './pages/MessageManagement';

function App() {
  return (
    <Routes>
      {/* 登录页面 */}
      <Route path="/login" element={<Login />} />

      {/* 后台管理页面 - 需要登录 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/bank-cards" replace />} />
        <Route path="bank-cards" element={<BankCards />} />
        <Route path="deposit-review" element={<DepositReview />} />
        <Route path="order-management" element={<OrderManagement />} />
        <Route path="reward-settings" element={<RewardSettings />} />
        <Route path="community-management" element={<CommunityManagement />} />
        <Route path="message-management" element={<MessageManagement />} />
      </Route>

      {/* 404 页面 */}
      <Route path="*" element={<div className="flex items-center justify-center h-screen text-gray-400">404 - 页面未找到</div>} />
    </Routes>
  );
}

export default App;
