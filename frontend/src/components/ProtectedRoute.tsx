import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 加载中显示 loading
  if (loading) {
    return (
      <div className="min-h-screen bg-[#1a1f2e] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-gray-400">加载中...</p>
        </div>
      </div>
    );
  }

  // 未登录跳转到登录页
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.requiresPasswordSetup && location.pathname !== '/setup-password') {
    return <Navigate to="/setup-password" replace />;
  }

  if (!user.requiresPasswordSetup && location.pathname === '/setup-password') {
    return <Navigate to="/" replace />;
  }

  // 已登录显示内容
  return <>{children}</>;
}
