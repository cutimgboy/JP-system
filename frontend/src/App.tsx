import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/auth/Login';
import Trading from './pages/trading';
import Market from './pages/market';
import Community from './pages/community';
import Positions from './pages/positions';
import Profile from './pages/profile';
import { PersonalInfo } from './pages/personal-info';
import { MessageCenter } from './pages/message-center';
import { ChangePassword } from './pages/change-password';
import { ChangeLanguage } from './pages/change-language';
import { InstallApp } from './pages/install-app';
import { AboutUs } from './pages/about-us';
import { Deposit } from './pages/deposit';
import { DepositFunds } from './pages/deposit/funds';
import { DepositUpload } from './pages/deposit/upload';
import { DepositDetail } from './pages/deposit/detail';
import { Withdraw } from './pages/withdraw';
import { FundRecords } from './pages/fund-records';
import { MyBank } from './pages/my-bank';
import { AddBankCard } from './pages/my-bank/add';
import { Promotion } from './pages/promotion';

function App() {
  return (
    <Routes>
      {/* 登录页面 - 公开访问 */}
      <Route path="/login" element={<Login />} />

      {/* 受保护的路由 - 需要登录 */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Navigate to="/market" replace />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <Market />
          </ProtectedRoute>
        }
      />
      <Route
        path="/trading"
        element={
          <ProtectedRoute>
            <Trading />
          </ProtectedRoute>
        }
      />
      <Route
        path="/community"
        element={
          <ProtectedRoute>
            <Community />
          </ProtectedRoute>
        }
      />
      <Route
        path="/positions"
        element={
          <ProtectedRoute>
            <Positions />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Profile />
          </ProtectedRoute>
        }
      />
      <Route
        path="/personal-info"
        element={
          <ProtectedRoute>
            <PersonalInfo />
          </ProtectedRoute>
        }
      />
      <Route
        path="/message-center"
        element={
          <ProtectedRoute>
            <MessageCenter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />
      <Route
        path="/change-language"
        element={
          <ProtectedRoute>
            <ChangeLanguage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/install-app"
        element={
          <ProtectedRoute>
            <InstallApp />
          </ProtectedRoute>
        }
      />
      <Route
        path="/about-us"
        element={
          <ProtectedRoute>
            <AboutUs />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit"
        element={
          <ProtectedRoute>
            <Deposit />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit/funds"
        element={
          <ProtectedRoute>
            <DepositFunds />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit/upload"
        element={
          <ProtectedRoute>
            <DepositUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/deposit/detail"
        element={
          <ProtectedRoute>
            <DepositDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/withdraw"
        element={
          <ProtectedRoute>
            <Withdraw />
          </ProtectedRoute>
        }
      />
      <Route
        path="/fund-records"
        element={
          <ProtectedRoute>
            <FundRecords />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bank"
        element={
          <ProtectedRoute>
            <MyBank />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-bank/add"
        element={
          <ProtectedRoute>
            <AddBankCard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/promotion"
        element={
          <ProtectedRoute>
            <Promotion />
          </ProtectedRoute>
        }
      />

      {/* 404 页面 */}
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

export default App;
