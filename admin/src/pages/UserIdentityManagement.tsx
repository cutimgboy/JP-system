import { useEffect, useMemo, useState } from 'react';
import { Eye, RefreshCw } from 'lucide-react';
import { Toast } from '../components/Toast';
import {
  Button,
  DataTable,
  Modal,
  PageHeader,
  Pagination,
  StatusBadge,
  Toolbar,
  fieldClass,
} from '../components/AdminUI';
import { apiClient, extractData } from '../utils/api';

interface IdentityRecord {
  id: number;
  userId: number;
  name: string;
  idNumber: string;
  idFrontImage: string;
  idBackImage: string;
  selfieImage: string;
  status: number;
  remark: string | null;
  createTime: string;
  user?: {
    id: number;
    nickname: string | null;
    phone: string | null;
    email: string | null;
  };
}

type StatusFilter = 0 | 1 | 2 | 'all';

const statusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '全部', value: 'all' },
];

export function UserIdentityManagement() {
  const [records, setRecords] = useState<IdentityRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedRecord, setSelectedRecord] = useState<IdentityRecord | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [limit, total]);

  useEffect(() => {
    void fetchRecords();
  }, [page, limit, statusFilter]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/admin/user-identities', {
        params: {
          page,
          limit,
          status: statusFilter === 'all' ? undefined : statusFilter,
        },
      });
      const payload = extractData<{
        records?: IdentityRecord[];
        total?: number;
        page?: number;
        limit?: number;
      }>(response);
      const nextRecords = Array.isArray(payload?.records) ? payload.records : [];
      setRecords(nextRecords);
      setTotal(Number(payload?.total || nextRecords.length));
    } catch (error) {
      console.error('获取身份信息失败:', error);
      setRecords([]);
      setTotal(0);
      setToast({ message: '获取身份信息失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const statusText = (status: number) => {
    if (status === 0) return '待审核';
    if (status === 1) return '已通过';
    if (status === 2) return '已拒绝';
    return '未知';
  };

  const statusTone = (status: number) => {
    if (status === 0) return 'yellow';
    if (status === 1) return 'green';
    if (status === 2) return 'red';
    return 'slate';
  };

  const maskIdNumber = (value: string) => {
    if (!value || value.length <= 8) return value || '-';
    return `${value.slice(0, 4)} **** **** ${value.slice(-4)}`;
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="身份信息管理"
        description="查看用户补充的身份资料和证件照片"
        actions={
          <Button variant="secondary" onClick={() => void fetchRecords()}>
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        }
      />

      <Toolbar>
        <div className="flex flex-wrap gap-2">
          {statusTabs.map((item) => (
            <Button
              key={item.label}
              variant={statusFilter === item.value ? 'primary' : 'secondary'}
              onClick={() => {
                setStatusFilter(item.value);
                setPage(1);
              }}
            >
              {item.label}
            </Button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">每页</span>
          <select className={fieldClass} value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
            {[10, 20, 50, 100].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Toolbar>

      <DataTable
        loading={loading}
        rows={records}
        rowKey={(row) => row.id}
        emptyText="暂无身份信息记录"
        columns={[
          { key: 'id', title: 'ID', render: (item) => item.id },
          {
            key: 'user',
            title: '用户',
            render: (item) => (
              <div>
                <div className="font-medium text-slate-950">{item.user?.nickname || `用户 ${item.userId}`}</div>
                <div className="text-xs text-slate-500">{item.user?.phone || item.user?.email || '-'}</div>
              </div>
            ),
          },
          { key: 'name', title: '真实姓名', render: (item) => item.name },
          { key: 'idNumber', title: '证件号码', render: (item) => maskIdNumber(item.idNumber) },
          { key: 'time', title: '提交时间', render: (item) => new Date(item.createTime).toLocaleString('zh-CN') },
          { key: 'status', title: '状态', render: (item) => <StatusBadge tone={statusTone(item.status)}>{statusText(item.status)}</StatusBadge> },
          {
            key: 'actions',
            title: '操作',
            render: (item) => (
              <Button variant="secondary" onClick={() => setSelectedRecord(item)}>
                <Eye className="h-4 w-4" />
                查看
              </Button>
            ),
          },
        ]}
      />

      <Pagination
        page={page}
        totalPages={totalPages}
        total={total}
        limit={limit}
        onPageChange={setPage}
        onLimitChange={(value) => {
          setPage(1);
          setLimit(value);
        }}
      />

      {selectedRecord && (
        <Modal title={`身份资料 #${selectedRecord.id}`} onClose={() => setSelectedRecord(null)} widthClass="max-w-4xl">
          <div className="grid gap-4 md:grid-cols-3">
            <InfoBox label="用户" value={selectedRecord.user?.nickname || `用户 ${selectedRecord.userId}`} />
            <InfoBox label="真实姓名" value={selectedRecord.name} />
            <InfoBox label="证件号码" value={selectedRecord.idNumber} />
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            {[
              { label: '证件正面', url: selectedRecord.idFrontImage },
              { label: '证件反面', url: selectedRecord.idBackImage },
              { label: '手持证件自拍照', url: selectedRecord.selfieImage },
            ].map((image) => (
              <button
                key={image.label}
                type="button"
                onClick={() => setPreviewUrl(image.url)}
                className="overflow-hidden rounded-md border border-slate-200 bg-slate-50 text-left"
              >
                <img src={image.url} alt={image.label} className="h-44 w-full object-cover" />
                <div className="px-3 py-2 text-sm font-medium text-slate-700">{image.label}</div>
              </button>
            ))}
          </div>
        </Modal>
      )}

      {previewUrl && (
        <Modal title="证件预览" onClose={() => setPreviewUrl(null)} widthClass="max-w-4xl">
          <img src={previewUrl} alt="preview" className="max-h-[70vh] w-full object-contain" />
        </Modal>
      )}

      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}

function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-slate-200 p-3">
      <div className="text-xs text-slate-500">{label}</div>
      <div className="mt-1 break-all font-medium text-slate-950">{value || '-'}</div>
    </div>
  );
}
