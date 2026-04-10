import { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './components/ProtectedRoute';

const Login = lazy(() =>
  import('./pages/auth/Login').then((module) => ({ default: module.Login })),
);
const Splash = lazy(() => import('./pages/splash'));
const Trading = lazy(() => import('./pages/trading'));
const Market = lazy(() => import('./pages/market'));
const Community = lazy(() => import('./pages/community'));
const Positions = lazy(() => import('./pages/positions'));
const OrderDetail = lazy(() => import('./pages/positions/OrderDetail'));
const Profile = lazy(() => import('./pages/profile'));
const PersonalInfo = lazy(() =>
  import('./pages/personal-info').then((module) => ({
    default: module.PersonalInfo,
  })),
);
const MessageCenter = lazy(() =>
  import('./pages/message-center').then((module) => ({
    default: module.MessageCenter,
  })),
);
const ChangePassword = lazy(() =>
  import('./pages/change-password').then((module) => ({
    default: module.ChangePassword,
  })),
);
const ChangeLanguage = lazy(() =>
  import('./pages/change-language').then((module) => ({
    default: module.ChangeLanguage,
  })),
);
const InstallApp = lazy(() =>
  import('./pages/install-app').then((module) => ({
    default: module.InstallApp,
  })),
);
const AboutUs = lazy(() =>
  import('./pages/about-us').then((module) => ({ default: module.AboutUs })),
);
const Deposit = lazy(() =>
  import('./pages/deposit').then((module) => ({ default: module.Deposit })),
);
const DepositFunds = lazy(() =>
  import('./pages/deposit/funds').then((module) => ({
    default: module.DepositFunds,
  })),
);
const DepositUpload = lazy(() =>
  import('./pages/deposit/upload').then((module) => ({
    default: module.DepositUpload,
  })),
);
const DepositDetail = lazy(() =>
  import('./pages/deposit/detail').then((module) => ({
    default: module.DepositDetail,
  })),
);
const Withdraw = lazy(() =>
  import('./pages/withdraw').then((module) => ({ default: module.Withdraw })),
);
const FundRecords = lazy(() =>
  import('./pages/fund-records').then((module) => ({
    default: module.FundRecords,
  })),
);
const MyBank = lazy(() =>
  import('./pages/my-bank').then((module) => ({ default: module.MyBank })),
);
const AddBankCard = lazy(() =>
  import('./pages/my-bank/add').then((module) => ({
    default: module.AddBankCard,
  })),
);
const Promotion = lazy(() =>
  import('./pages/promotion').then((module) => ({
    default: module.Promotion,
  })),
);

function RootRedirect() {
  const hasSeenSplash = localStorage.getItem('hasSeenSplash');
  const token = localStorage.getItem('token');

  if (!hasSeenSplash) {
    return <Navigate to="/splash" replace />;
  }

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Navigate to="/market" replace />;
}

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#09090b] flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#6c48f5]"></div>
        <p className="mt-4 text-[#8a8a93]">页面加载中...</p>
      </div>
    </div>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/splash" element={<Splash />} />
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<RootRedirect />} />
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
          path="/positions/order/:orderId"
          element={
            <ProtectedRoute>
              <OrderDetail />
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

        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </Suspense>
  );
}

export default App;
