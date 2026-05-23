import { useEffect, useMemo, useState } from 'react';
import { Plus, Check, Pencil, Trash2 } from 'lucide-react';
import { Toast } from '../components/Toast';
import {
  Button,
  ConfirmDialog,
  DataTable,
  Modal,
  PageHeader,
  StatusBadge,
  fieldClass,
} from '../components/AdminUI';
import {
  apiClient,
  extractData,
  extractMessage,
  isSuccessResponse,
} from '../utils/api';

interface SystemBankCard {
  id: number;
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string | null;
  isActive: number;
  status: number;
}

type BankCardForm = {
  bankName: string;
  accountName: string;
  accountNumber: string;
  swiftCode: string;
};

const emptyForm: BankCardForm = {
  bankName: '',
  accountName: '',
  accountNumber: '',
  swiftCode: '',
};

export function BankCards() {
  const [bankCards, setBankCards] = useState<SystemBankCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCard, setEditingCard] = useState<SystemBankCard | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<
    { type: 'activate' | 'delete'; card: SystemBankCard } | null
  >(null);
  const [formData, setFormData] = useState<BankCardForm>(emptyForm);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  useEffect(() => {
    void fetchBankCards();
  }, []);

  const activeCards = useMemo(() => bankCards.filter((card) => card.status === 1), [bankCards]);

  const fetchBankCards = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/system-bank-card/list');
      const cards = extractData<SystemBankCard[]>(response) || [];
      setBankCards(Array.isArray(cards) ? cards : []);
    } catch (error) {
      console.error('获取银行卡列表失败:', error);
      setBankCards([]);
      setToast({ message: '获取银行卡列表失败', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCard(null);
    setFormData(emptyForm);
    setShowModal(true);
  };

  const openEdit = (card: SystemBankCard) => {
    setEditingCard(card);
    setFormData({
      bankName: card.bankName,
      accountName: card.accountName,
      accountNumber: card.accountNumber,
      swiftCode: card.swiftCode || '',
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.bankName || !formData.accountName || !formData.accountNumber) {
      setToast({ message: '请填写完整的银行卡信息', type: 'warning' });
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        swiftCode: formData.swiftCode || undefined,
      };

      const response = editingCard
        ? await apiClient.put(`/system-bank-card/${editingCard.id}`, payload)
        : await apiClient.post('/system-bank-card', payload);

      if (isSuccessResponse(response)) {
        setToast({ message: editingCard ? '更新成功' : '添加成功', type: 'success' });
        setShowModal(false);
        void fetchBankCards();
      } else {
        setToast({
          message: extractMessage(response, editingCard ? '更新失败' : '添加失败'),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('操作失败:', error);
      setToast({ message: '操作失败', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirm = async () => {
    if (!confirmTarget) return;

    try {
      const response =
        confirmTarget.type === 'activate'
          ? await apiClient.put(`/system-bank-card/${confirmTarget.card.id}/activate`)
          : await apiClient.delete(`/system-bank-card/${confirmTarget.card.id}`);

      if (isSuccessResponse(response)) {
        setToast({
          message:
            confirmTarget.type === 'activate' ? '启用成功' : '删除成功',
          type: 'success',
        });
        setConfirmTarget(null);
        void fetchBankCards();
      } else {
        setToast({
          message: extractMessage(
            response,
            confirmTarget.type === 'activate' ? '启用失败' : '删除失败',
          ),
          type: 'error',
        });
      }
    } catch (error) {
      console.error('操作失败:', error);
      setToast({ message: '操作失败', type: 'error' });
    }
  };

  return (
    <div className="space-y-4">
      <PageHeader
        title="收款银行卡管理"
        description="维护系统收款账户，同一时间只保留一张启用状态"
        actions={
          <>
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              添加银行卡
            </Button>
          </>
        }
      />

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">总记录</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">{bankCards.length}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">启用中</div>
          <div className="mt-2 text-2xl font-semibold text-emerald-700">{activeCards.length}</div>
        </div>
        <div className="rounded-md border border-slate-200 bg-white p-4">
          <div className="text-xs text-slate-500">当前状态</div>
          <div className="mt-2 text-2xl font-semibold text-slate-950">
            {activeCards[0]?.bankName || '-'}
          </div>
        </div>
      </div>

      <DataTable
        loading={loading}
        rowKey={(row) => row.id}
        rows={bankCards}
        emptyText="暂无系统收款银行卡"
        columns={[
          {
            key: 'id',
            title: 'ID',
            render: (card) => card.id,
          },
          {
            key: 'bank',
            title: '银行',
            render: (card) => (
              <div>
                <div className="font-medium text-slate-950">{card.bankName}</div>
                <div className="text-xs text-slate-500">SWIFT: {card.swiftCode || '-'}</div>
              </div>
            ),
          },
          {
            key: 'account',
            title: '账户',
            render: (card) => (
              <div>
                <div>{card.accountName}</div>
                <div className="text-xs text-slate-500">{card.accountNumber}</div>
              </div>
            ),
          },
          {
            key: 'status',
            title: '状态',
            render: (card) => (
              <StatusBadge tone={card.isActive === 1 ? 'green' : 'slate'}>
                {card.isActive === 1 ? '已启用' : '未启用'}
              </StatusBadge>
            ),
          },
          {
            key: 'actions',
            title: '操作',
            className: 'w-56',
            render: (card) => (
              <div className="flex flex-wrap gap-2">
                {card.isActive === 0 && (
                  <Button
                    variant="success"
                    onClick={() => setConfirmTarget({ type: 'activate', card })}
                  >
                    <Check className="h-4 w-4" />
                    启用
                  </Button>
                )}
                <Button variant="secondary" onClick={() => openEdit(card)}>
                  <Pencil className="h-4 w-4" />
                  编辑
                </Button>
                <Button
                  variant="danger"
                  onClick={() => setConfirmTarget({ type: 'delete', card })}
                >
                  <Trash2 className="h-4 w-4" />
                  删除
                </Button>
              </div>
            ),
          },
        ]}
      />

      {showModal && (
        <Modal
          title={editingCard ? '编辑银行卡' : '添加银行卡'}
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button onClick={() => setShowModal(false)} disabled={submitting}>
                取消
              </Button>
              <Button variant="primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? '保存中...' : '保存'}
              </Button>
            </>
          }
        >
          <div className="grid gap-4">
            <input
              className={fieldClass}
              value={formData.bankName}
              onChange={(event) => setFormData({ ...formData, bankName: event.target.value })}
              placeholder="银行名称"
            />
            <input
              className={fieldClass}
              value={formData.accountName}
              onChange={(event) => setFormData({ ...formData, accountName: event.target.value })}
              placeholder="账户名称"
            />
            <input
              className={fieldClass}
              value={formData.accountNumber}
              onChange={(event) => setFormData({ ...formData, accountNumber: event.target.value })}
              placeholder="账户号码"
            />
            <input
              className={fieldClass}
              value={formData.swiftCode}
              onChange={(event) => setFormData({ ...formData, swiftCode: event.target.value })}
              placeholder="SWIFT 代码（选填）"
            />
          </div>
        </Modal>
      )}

      {confirmTarget && (
        <ConfirmDialog
          title={confirmTarget.type === 'activate' ? '启用银行卡' : '删除银行卡'}
          danger={confirmTarget.type === 'delete'}
          message={
            confirmTarget.type === 'activate'
              ? `确认启用「${confirmTarget.card.bankName}」？启用后其他银行卡会自动失效。`
              : `确认删除「${confirmTarget.card.bankName}」？此操作会隐藏该银行卡。`
          }
          confirmText={confirmTarget.type === 'activate' ? '确认启用' : '确认删除'}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={handleConfirm}
        />
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
