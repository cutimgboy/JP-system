import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { tx } from '../i18n/text';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading } = useAuth();
  const location = useLocation();

  // 加载中显示 loading
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090b]">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-t-2 border-[#6c48f5]"></div>
          <p className="mt-4 text-[#8a8a93]">{tx('加载中...')}</p>
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
