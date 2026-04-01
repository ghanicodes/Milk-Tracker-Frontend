import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Truck, Search, Phone, MapPin, Trash2, Edit3, Eye } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { homeDeliveryService } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function CustomerListPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const navigate = useNavigate();

  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerAddress: '', area: '',
    milkType: '', quantity: '', pricePerLiter: '', startDate: new Date().toISOString().split('T')[0],
    deliverySchedule: 'daily', customDays: [], paymentType: 'monthly',
  });

  useEffect(() => { loadCustomers(); }, []);

  const loadCustomers = async () => {
    try {
      const res = await homeDeliveryService.getAll();
      setCustomers(res.data.homeDeliveries || []);
    } catch {
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customerName || !form.customerPhone || !form.customerAddress || !form.milkType || !form.quantity || !form.pricePerLiter) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await homeDeliveryService.add({
        ...form,
        quantity: Number(form.quantity),
        pricePerLiter: Number(form.pricePerLiter),
      });
      toast.success('Customer added!');
      setShowModal(false);
      setForm({
        customerName: '', customerPhone: '', customerAddress: '', area: '',
        milkType: '', quantity: '', pricePerLiter: '', startDate: new Date().toISOString().split('T')[0],
        deliverySchedule: 'daily', customDays: [], paymentType: 'monthly',
      });
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this customer? This will remove all delivery history.')) return;
    try {
      await homeDeliveryService.delete(id);
      toast.success('Customer removed');
      loadCustomers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filtered = customers.filter((c) => {
    const matchesSearch = c.customerName?.toLowerCase().includes(search.toLowerCase()) ||
      c.customerPhone?.includes(search) || c.area?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || (filterStatus === 'active' ? c.isActive : !c.isActive);
    return matchesSearch && matchesStatus;
  });

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Home Delivery</h2>
          <p className="text-sm text-slate-500">{customers.length} customer(s) • {customers.filter(c => c.isActive).length} active</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Add Customer</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search customers..." value={search} onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
            id="customer-search" />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'inactive'].map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${filterStatus === s
                ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'}`}>
              {s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Truck} title="No customers found" description={search ? 'Try a different search.' : 'Add your first delivery customer.'}
          actionLabel={!search ? 'Add Customer' : undefined} onAction={!search ? () => setShowModal(true) : undefined} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((customer) => (
            <Card key={customer._id} hover className="p-5 group" onClick={() => navigate(`/home-delivery/${customer._id}`)}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-200 flex items-center justify-center text-lg font-bold text-rose-700 flex-shrink-0">
                    {customer.customerName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate">{customer.customerName}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <Phone className="w-3 h-3" />{customer.customerPhone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); navigate(`/home-delivery/${customer._id}`); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors">
                    <Eye className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(customer._id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                <MapPin className="w-3 h-3" /><span className="truncate">{customer.area || customer.customerAddress}</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-center">
                <div>
                  <p className="text-xs text-slate-400">Qty/Day</p>
                  <p className="text-sm font-semibold text-slate-900">{customer.quantity} L</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Rate</p>
                  <p className="text-sm font-semibold text-slate-900">{formatCurrency(customer.pricePerLiter)}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Balance</p>
                  <p className={`text-sm font-bold ${customer.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {formatCurrency(customer.balance)}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-3">
                <Badge color={customer.isActive ? 'success' : 'danger'}>
                  {customer.isActive ? 'Active' : 'Inactive'}
                </Badge>
                <Badge color="neutral">{customer.milkType}</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add Customer Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Delivery Customer" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Customer Name" placeholder="Full name" value={form.customerName}
              onChange={(e) => setForm({ ...form, customerName: e.target.value })} required />
            <Input label="Phone" placeholder="Phone number" value={form.customerPhone}
              onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Address" placeholder="Full address" value={form.customerAddress}
              onChange={(e) => setForm({ ...form, customerAddress: e.target.value })} required />
            <Input label="Area" placeholder="Area/locality" value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Milk Type" value={form.milkType}
              onChange={(e) => setForm({ ...form, milkType: e.target.value })}
              options={[{ value: 'cow', label: 'Cow' }, { value: 'buffalo', label: 'Buffalo' }, { value: 'mix', label: 'Mix' }]} required />
            <Input label="Quantity (L/day)" type="number" step="0.5" value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
            <Input label="Price (₹/L)" type="number" value={form.pricePerLiter}
              onChange={(e) => setForm({ ...form, pricePerLiter: e.target.value })} required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input label="Start Date" type="date" value={form.startDate}
              onChange={(e) => setForm({ ...form, startDate: e.target.value })} required />
            <Select label="Delivery Schedule" value={form.deliverySchedule}
              onChange={(e) => setForm({ ...form, deliverySchedule: e.target.value })}
              options={[{ value: 'daily', label: 'Daily' }, { value: 'alternate', label: 'Alternate Days' }, { value: 'custom', label: 'Custom' }]} />
            <Select label="Payment Type" value={form.paymentType}
              onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
              options={[{ value: 'daily', label: 'Daily' }, { value: 'weekly', label: 'Weekly' }, { value: 'monthly', label: 'Monthly' }]} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">Add Customer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
