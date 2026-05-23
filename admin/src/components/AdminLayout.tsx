import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { LogOut, Menu, Shield, User2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { adminNavItems, getNavItem } from '../config/navigation';

export function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const activeNav = useMemo(() => getNavItem(location.pathname), [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-slate-100 text-slate-900">
      <aside
        className={`border-r border-slate-200 bg-slate-950 text-white transition-all ${collapsed ? 'w-20' : 'w-72'}`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-blue-600">
              <Shield className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div>
                <div className="text-sm font-semibold">JP 后台管理</div>
                <div className="text-xs text-white/50">运营控制台</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={() => setCollapsed((value) => !value)}
            className="rounded-md p-2 text-white/70 hover:bg-white/10 hover:text-white"
            title={collapsed ? '展开侧栏' : '收起侧栏'}
          >
            {collapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        </div>

        <nav className="space-y-1 px-3 py-4">
          {adminNavItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname.startsWith(item.path);

            return (
              <button
                key={item.path}
                type="button"
                onClick={() => navigate(item.path)}
                className={`flex w-full items-start gap-3 rounded-md px-3 py-3 text-left transition ${
                  active ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
                }`}
              >
                <Icon className="mt-0.5 h-4 w-4 shrink-0" />
                {!collapsed && (
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{item.label}</div>
                    <div className="mt-1 text-xs leading-5 text-white/45">{item.description}</div>
                  </div>
                )}
              </button>
            );
          })}
        </nav>

        <div className="mt-auto border-t border-white/10 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-white/10">
              <User2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <div className="text-sm font-medium">管理员</div>
                <div className="text-xs text-white/45">当前模块: {activeNav.label}</div>
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/10"
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && '退出登录'}
          </button>
        </div>
      </aside>

      <main className="flex min-w-0 flex-1 flex-col">
        <div className="border-b border-slate-200 bg-white px-6 py-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="text-sm text-slate-500">后台管理</div>
              <div className="text-lg font-semibold text-slate-950">{activeNav.label}</div>
            </div>
            <div className="text-sm text-slate-500">
              仅授权管理员可操作
            </div>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-auto px-6 py-5">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
