import { useEffect, useMemo, useState } from 'react';
import { Eye, CircleCheck, CircleX, RefreshCw } from 'lucide-react';
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
  textareaClass,
} from '../components/AdminUI';
import {
  apiClient,
  extractData,
  extractMessage,
  isSuccessResponse,
} from '../utils/api';

interface DepositRecord {
  id: number;
  userId: number;
  amount: number;
  userBankName: string;
  userAccountName: string;
  userAccountNumber: string;
  systemBankName: string;
  systemAccountName: string;
  systemAccountNumber: string;
  receiptImages: string | null;
  status: number;
  remark: string | null;
  createTime: string;
  user?: {
    id: number;
    nickname: string;
    phone: string;
  };
}

type StatusFilter = 0 | 1 | 2 | 'all';

const depositStatusTabs: Array<{ label: string; value: StatusFilter }> = [
  { label: '待审核', value: 0 },
  { label: '已通过', value: 1 },
  { label: '已拒绝', value: 2 },
  { label: '全部', value: 'all' },
];

export function DepositReview() {
  const [deposits, setDeposits] = useState<DepositRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRecord | null>(null);
  const [reviewTarget, setReviewTarget] = useState<{ deposit: DepositRecord; status: 1 | 2 } | null>(null);
  const [remark, setRemark] = useState('');
  const [confirmAmount, setConfirmAmount] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  const totalPages = useMemo(() => Math.max(Math.ceil(total / limit), 1), [limit, total]);

  useEffect(() => {
    void fetchDeposits();
  }, [page, limit, statusFilter]);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      const params: Record<string, number | undefined> = {
        page,
        limit,
        status: statusFilter === 'all' ? undefined : statusFilter,
      };
      const response = await apiClient.get('/deposit/all', { params });
      const payload = extractData<{
        records?: DepositRecord[];
        total?: number;
        page?: number;
        limit?: number;
      }>(response);

      const records = Array.isArray(payload?.records) ? payload?.records : [];
      setDeposits(records);
      setTotal(Number(payload?.total || records.length));
      if (payload?.page && payload.page !== page) {
        setPage(payload.page);
      }
      if (payload?.limit && payload.limit !== limit) {
        setLimit(payload.limit);
      }
    } catch (error) {
      console.error('获取入金记录失败:', error);
      setDeposits([]);
      setTotal(0);
      setToast({ message: '获取入金记录失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openReview = (deposit: DepositRecord, status: 1 | 2) => {
    setSelectedDeposit(deposit);
    setReviewTarget({ deposit, status });
    setRemark('');
    setConfirmAmount('');
  };

  const submitReview = async () => {
    if (!reviewTarget) return;

    if (reviewTarget.status === 1) {
      const cleanAmount = confirmAmount.replace(/[,\s]/g, '');
      const inputAmount = Number(cleanAmount);
      if (!cleanAmount || Number.isNaN(inputAmount)) {
        setToast({ message: '请输入确认金额', type: 'warning' });
        return;
      }
      if (inputAmount !== Number(reviewTarget.deposit.amount)) {
        setToast({ message: '确认金额与申请金额不一致', type: 'error' });
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await apiClient.put(`/deposit/${reviewTarget.deposit.id}/review`, {
        status: reviewTarget.status,
        remark: remark || undefined,
      });

      if (isSuccessResponse(response)) {
        setToast({
          message: reviewTarget.status === 1 ? '审核通过，已入账' : '已拒绝该申请',
          type: 'success',
        });
        setReviewTarget(null);
        void fetchDeposits();
      } else {
        setToast({ message: extractMessage(response, '审核失败'), type: 'error' });
      }
    } catch (error) {
      console.error('审核失败:', error);
      setToast({ message: '审核失败', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const parseReceiptImages = (images: string | null): string[] => {
    if (!images) return [];
    try {
      const parsed = JSON.parse(images);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
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

  return (
    <div className="space-y-4">
      <PageHeader
        title="入金审核"
        description="集中处理用户充值申请、凭证核验和到账确认"
        actions={
          <>
            <Button variant="secondary" onClick={() => void fetchDeposits()}>
              <RefreshCw className="h-4 w-4" />
              刷新
            </Button>
          </>
        }
      />

      <Toolbar>
        <div className="flex flex-wrap gap-2">
          {depositStatusTabs.map((item) => (
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
          <select
            className={fieldClass}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
          >
            {[10, 20, 50, 100].map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </Toolbar>

      <div className="grid gap-3 md:grid-cols-4">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">当前列表</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{deposits.length}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">待审核</div>
          <div className="mt-2 text-2xl font-semibold text-amber-600">
            {deposits.filter((item) => item.status === 0).length}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">已通过</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">
            {deposits.filter((item) => item.status === 1).length}
          </div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">总金额</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">
            {deposits.reduce((sum, item) => sum + Number(item.amount || 0), 0).toLocaleString()}
          </div>
        </div>
      </div>

      <DataTable
        loading={loading}
        rows={deposits}
        rowKey={(row) => row.id}
        emptyText="当前筛选条件下没有入金记录"
        columns={[
          {
            key: 'id',
            title: 'ID',
            render: (item) => item.id,
          },
          {
            key: 'user',
            title: '用户',
            render: (item) => (
              <div>
                <div className="font-medium text-slate-950">{item.user?.nickname || `用户 ${item.userId}`}</div>
                <div className="text-xs text-slate-500">{item.user?.phone || '-'}</div>
              </div>
            ),
          },
          {
            key: 'amount',
            title: '金额',
            render: (item) => <span className="font-semibold text-slate-950">{Number(item.amount).toLocaleString()} VND</span>,
          },
          {
            key: 'bank',
            title: '汇款银行',
            render: (item) => (
              <div>
                <div>{item.userBankName}</div>
                <div className="text-xs text-slate-500">{item.userAccountName}</div>
              </div>
            ),
          },
          {
            key: 'time',
            title: '申请时间',
            render: (item) => new Date(item.createTime).toLocaleString('zh-CN'),
          },
          {
            key: 'status',
            title: '状态',
            render: (item) => <StatusBadge tone={statusTone(item.status)}>{statusText(item.status)}</StatusBadge>,
          },
          {
            key: 'actions',
            title: '操作',
            className: 'w-72',
            render: (item) => (
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setSelectedDeposit(item)}>
                  <Eye className="h-4 w-4" />
                  查看
                </Button>
                {item.status === 0 && (
                  <>
                    <Button variant="success" onClick={() => openReview(item, 1)}>
                      <CircleCheck className="h-4 w-4" />
                      通过
                    </Button>
                    <Button variant="danger" onClick={() => openReview(item, 2)}>
                      <CircleX className="h-4 w-4" />
                      拒绝
                    </Button>
                  </>
                )}
              </div>
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

      {selectedDeposit && (
        <Modal
          title={`入金详情 #${selectedDeposit.id}`}
          onClose={() => setSelectedDeposit(null)}
          widthClass="max-w-3xl"
        >
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs text-slate-500">用户</div>
              <div className="mt-1 font-medium text-slate-950">{selectedDeposit.user?.nickname || selectedDeposit.userId}</div>
              <div className="text-sm text-slate-500">{selectedDeposit.user?.phone || '-'}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs text-slate-500">金额</div>
              <div className="mt-1 text-lg font-semibold text-slate-950">{Number(selectedDeposit.amount).toLocaleString()} VND</div>
              <div className="text-sm text-slate-500">{new Date(selectedDeposit.createTime).toLocaleString('zh-CN')}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs text-slate-500">汇款账户</div>
              <div className="mt-1 text-sm text-slate-700">
                {selectedDeposit.userBankName} / {selectedDeposit.userAccountName}
              </div>
              <div className="text-xs text-slate-500">{selectedDeposit.userAccountNumber}</div>
            </div>
            <div className="rounded-md border border-slate-200 p-3">
              <div className="text-xs text-slate-500">收款账户</div>
              <div className="mt-1 text-sm text-slate-700">
                {selectedDeposit.systemBankName} / {selectedDeposit.systemAccountName}
              </div>
              <div className="text-xs text-slate-500">{selectedDeposit.systemAccountNumber}</div>
            </div>
          </div>

          {selectedDeposit.remark && (
            <div className="mt-4 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              {selectedDeposit.remark}
            </div>
          )}

          <div className="mt-4">
            <div className="mb-2 text-sm font-medium text-slate-900">转账凭证</div>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              {parseReceiptImages(selectedDeposit.receiptImages).map((url) => (
                <button
                  key={url}
                  type="button"
                  onClick={() => setPreviewUrl(url)}
                  className="overflow-hidden rounded-md border border-slate-200"
                >
                  <img src={url} alt="receipt" className="h-36 w-full object-cover" />
                </button>
              ))}
              {parseReceiptImages(selectedDeposit.receiptImages).length === 0 && (
                <div className="rounded-md border border-dashed border-slate-300 p-6 text-center text-sm text-slate-500">
                  暂无凭证
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}

      {reviewTarget && (
        <Modal
          title={reviewTarget.status === 1 ? '审核通过' : '审核拒绝'}
          onClose={() => setReviewTarget(null)}
          widthClass="max-w-xl"
          footer={
            <>
              <Button onClick={() => setReviewTarget(null)} disabled={submitting}>
                取消
              </Button>
              <Button variant={reviewTarget.status === 1 ? 'success' : 'danger'} onClick={submitReview} disabled={submitting}>
                {submitting ? '提交中...' : '确认提交'}
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div>用户：{reviewTarget.deposit.user?.nickname || reviewTarget.deposit.userId}</div>
              <div>金额：{Number(reviewTarget.deposit.amount).toLocaleString()} VND</div>
              <div>银行：{reviewTarget.deposit.userBankName}</div>
            </div>

            {reviewTarget.status === 1 && (
              <div>
                <div className="mb-2 text-sm font-medium text-slate-900">确认金额</div>
                <input
                  className={fieldClass}
                  value={confirmAmount}
                  onChange={(event) => setConfirmAmount(event.target.value)}
                  placeholder="请人工核对并输入金额"
                />
              </div>
            )}

            <div>
              <div className="mb-2 text-sm font-medium text-slate-900">审核备注</div>
              <textarea
                className={textareaClass}
                rows={4}
                value={remark}
                onChange={(event) => setRemark(event.target.value)}
                placeholder="填写审核原因或备注"
              />
            </div>
          </div>
        </Modal>
      )}

      {previewUrl && (
        <Modal
          title="凭证预览"
          onClose={() => setPreviewUrl(null)}
          widthClass="max-w-4xl"
        >
          <img src={previewUrl} alt="preview" className="max-h-[70vh] w-full object-contain" />
        </Modal>
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
