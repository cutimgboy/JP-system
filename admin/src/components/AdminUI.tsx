import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { AlertTriangle, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

type Tone = 'slate' | 'blue' | 'green' | 'yellow' | 'red' | 'violet' | 'cyan';

const toneClasses: Record<Tone, string> = {
  slate: 'border-slate-200 bg-slate-50 text-slate-700',
  blue: 'border-blue-200 bg-blue-50 text-blue-700',
  green: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  yellow: 'border-amber-200 bg-amber-50 text-amber-700',
  red: 'border-rose-200 bg-rose-50 text-rose-700',
  violet: 'border-violet-200 bg-violet-50 text-violet-700',
  cyan: 'border-cyan-200 bg-cyan-50 text-cyan-700',
};

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';

const buttonClasses: Record<ButtonVariant, string> = {
  primary: 'border-blue-600 bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50',
  danger: 'border-rose-600 bg-rose-600 text-white hover:bg-rose-700',
  ghost: 'border-transparent bg-transparent text-slate-600 hover:bg-slate-100',
  success: 'border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700',
};

export function PageHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h1 className="text-xl font-semibold text-slate-950">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        )}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Button({
  variant = 'secondary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
}) {
  return (
    <button
      className={`inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${buttonClasses[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function RefreshButton({
  loading,
  onClick,
}: {
  loading?: boolean;
  onClick: () => void;
}) {
  return (
    <Button onClick={onClick} disabled={loading}>
      <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
      刷新
    </Button>
  );
}

export function Toolbar({ children }: { children: ReactNode }) {
  return (
    <div className="mb-4 flex flex-col gap-3 rounded-md border border-slate-200 bg-white p-3 lg:flex-row lg:items-center lg:justify-between">
      {children}
    </div>
  );
}

export function StatusBadge({
  children,
  tone = 'slate',
}: {
  children: ReactNode;
  tone?: Tone;
}) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${toneClasses[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({
  label,
  value,
  tone = 'slate',
}: {
  label: string;
  value: ReactNode;
  tone?: Tone;
}) {
  return (
    <div className="rounded-md border border-slate-200 bg-white p-4">
      <div className={`mb-2 inline-flex rounded-md border px-2 py-0.5 text-xs ${toneClasses[tone]}`}>
        {label}
      </div>
      <div className="text-2xl font-semibold text-slate-950">{value}</div>
    </div>
  );
}

export interface Column<T> {
  key: string;
  title: string;
  className?: string;
  render: (row: T) => ReactNode;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyText = '暂无数据',
}: {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  emptyText?: string;
}) {
  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 ${column.className || ''}`}
                >
                  {column.title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  加载中...
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-slate-500">
                  {emptyText}
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={rowKey(row)} className="hover:bg-slate-50">
                  {columns.map((column) => (
                    <td key={column.key} className={`px-4 py-3 text-sm text-slate-700 ${column.className || ''}`}>
                      {column.render(row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function Pagination({
  page,
  totalPages,
  total,
  limit,
  onPageChange,
  onLimitChange,
}: {
  page: number;
  totalPages: number;
  total?: number;
  limit?: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}) {
  return (
    <div className="mt-3 flex flex-col gap-3 rounded-md border border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
      <div>
        第 {page} / {totalPages} 页
        {typeof total === 'number' && `，共 ${total.toLocaleString()} 条`}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {onLimitChange && (
          <select
            value={limit}
            onChange={(event) => onLimitChange(Number(event.target.value))}
            className="h-9 rounded-md border border-slate-300 bg-white px-2"
          >
            {[20, 50, 100].map((value) => (
              <option key={value} value={value}>
                {value} 条/页
              </option>
            ))}
          </select>
        )}
        <Button
          onClick={() => onPageChange(Math.max(1, page - 1))}
          disabled={page <= 1}
        >
          <ChevronLeft className="h-4 w-4" />
          上一页
        </Button>
        <Button
          onClick={() => onPageChange(Math.min(totalPages, page + 1))}
          disabled={page >= totalPages}
        >
          下一页
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export function Modal({
  title,
  children,
  footer,
  onClose,
  widthClass = 'max-w-xl',
}: {
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  onClose: () => void;
  widthClass?: string;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4">
      <div className={`max-h-[90vh] w-full overflow-hidden rounded-md bg-white shadow-xl ${widthClass}`}>
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-950">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-500 hover:bg-slate-100"
          >
            关闭
          </button>
        </div>
        <div className="max-h-[68vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 px-5 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmText = '确认',
  danger,
  loading,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: ReactNode;
  confirmText?: string;
  danger?: boolean;
  loading?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <Modal
      title={title}
      onClose={onCancel}
      widthClass="max-w-md"
      footer={
        <>
          <Button onClick={onCancel} disabled={loading}>取消</Button>
          <Button
            variant={danger ? 'danger' : 'primary'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? '处理中...' : confirmText}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 text-sm text-slate-600">
        <AlertTriangle className={`mt-0.5 h-5 w-5 ${danger ? 'text-rose-600' : 'text-amber-500'}`} />
        <div>{message}</div>
      </div>
    </Modal>
  );
}

export const fieldClass =
  'h-9 rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';

export const textareaClass =
  'rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100';
