import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Package, Trash2, ChevronDown, Search, ShoppingBag } from 'lucide-react';
import { db } from '@/lib/db';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';
import type { StoreOrder } from '@/types';

const STATUS_COLORS: Record<StoreOrder['status'], string> = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-blue-100 text-blue-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-600',
};

const PAYMENT_STATUS: Record<StoreOrder['paymentStatus'], string> = {
  unpaid: 'bg-red-100 text-red-600',
  paid: 'bg-green-100 text-green-700',
};

export default function OrderManagement() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const data = await db.storeOrders.getAll();
    setOrders(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.orderNumber.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const updateStatus = async (id: string, status: StoreOrder['status']) => {
    await db.storeOrders.update(id, { status });
    toast.success(`Order marked as ${status}`);
    load();
  };

  const markPaid = async (id: string) => {
    await db.storeOrders.update(id, { paymentStatus: 'paid' });
    toast.success('Payment recorded');
    load();
  };

  const deleteOrder = async (id: string) => {
    if (confirm('Delete this order?')) {
      await db.storeOrders.delete(id);
      toast.success('Order deleted');
      load();
    }
  };

  const totalRevenue = orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + o.totalAmount, 0);
  const pendingCount = orders.filter(o => o.status === 'pending').length;

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <Link to="/admin/store" className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="page-title">Order Management</h1>
          <p className="text-gray-500 text-sm">Track and manage store orders</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Total Orders', value: orders.length, color: 'bg-blue-50 border-blue-200 text-blue-800' },
          { label: 'Pending', value: pendingCount, color: 'bg-amber-50 border-amber-200 text-amber-800' },
          { label: 'Delivered', value: orders.filter(o => o.status === 'delivered').length, color: 'bg-green-50 border-green-200 text-green-800' },
          { label: 'Revenue', value: formatCurrency(totalRevenue), color: 'bg-emerald-50 border-emerald-200 text-emerald-800' },
        ].map(s => (
          <div key={s.label} className={`border rounded-xl p-4 ${s.color}`}>
            <p className="text-xs font-medium opacity-70">{s.label}</p>
            <p className="text-xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-5">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search by customer, order#…" value={search} onChange={e => setSearch(e.target.value)} className="form-input pl-9" />
          </div>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="form-input w-auto">
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-gray-400">Loading orders…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <ShoppingBag size={48} className="mx-auto mb-3 opacity-40" />
          <p>No orders found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(order => (
            <div key={order.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Header */}
              <div
                className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setExpanded(expanded === order.id ? null : order.id)}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-gray-900 text-sm font-mono">{order.orderNumber}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[order.status]}`}>{order.status}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PAYMENT_STATUS[order.paymentStatus]}`}>{order.paymentStatus}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-0.5">{order.customerName} · {order.customerPhone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-gray-900">{formatCurrency(order.totalAmount)}</p>
                  <p className="text-xs text-gray-400">{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</p>
                </div>
                <ChevronDown size={16} className={`text-gray-400 transition-transform flex-shrink-0 ${expanded === order.id ? 'rotate-180' : ''}`} />
              </div>

              {/* Expanded */}
              {expanded === order.id && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50">
                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                    <div className="space-y-2">
                      {order.items.map((item, i) => (
                        <div key={i} className="flex items-center justify-between bg-white rounded-lg px-3 py-2 border border-gray-100">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-gray-400" />
                            <span className="text-sm text-gray-800">{item.productName}</span>
                            <span className="text-xs text-gray-400">×{item.quantity}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {order.notes && (
                    <p className="text-xs text-gray-500 mb-3 bg-white rounded-lg px-3 py-2 border border-gray-100">Notes: {order.notes}</p>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.status === 'pending' && (
                      <button onClick={() => updateStatus(order.id, 'confirmed')} className="text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-medium">Confirm</button>
                    )}
                    {order.status === 'confirmed' && (
                      <button onClick={() => updateStatus(order.id, 'delivered')} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg font-medium">Mark Delivered</button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button onClick={() => updateStatus(order.id, 'cancelled')} className="text-xs bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg font-medium">Cancel</button>
                    )}
                    {order.paymentStatus === 'unpaid' && (
                      <button onClick={() => markPaid(order.id)} className="text-xs bg-emerald-100 text-emerald-700 hover:bg-emerald-200 px-3 py-1.5 rounded-lg font-medium">Mark Paid</button>
                    )}
                    <button onClick={() => deleteOrder(order.id)} className="text-xs bg-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 px-2 py-1.5 rounded-lg ml-auto">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
