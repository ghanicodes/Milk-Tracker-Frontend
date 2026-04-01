import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Edit3, Truck, Calendar, Phone, MapPin,
  Milk, Banknote, Plus, CheckCircle2, XCircle, Clock
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import Badge from '../../components/ui/Badge';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { homeDeliveryService } from '../../services/dataService';
import { formatCurrency, formatDate, formatQuantity } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  const [deliveryForm, setDeliveryForm] = useState({
    deliveryDate: new Date().toISOString().split('T')[0],
    status: 'delivered',
    quantity: '',
  });

  const [editForm, setEditForm] = useState({});

  useEffect(() => { loadCustomer(); }, [id]);

  const loadCustomer = async () => {
    try {
      const res = await homeDeliveryService.getOne(id);
      setCustomer(res.data.homeDelivery);
    } catch (err) {
      toast.error('Customer not found');
      navigate('/home-delivery');
    } finally {
      setLoading(false);
    }
  };

  const handleAddDelivery = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await homeDeliveryService.addDelivery(id, {
        deliveryDate: deliveryForm.deliveryDate,
        status: deliveryForm.status,
        quantity: deliveryForm.quantity ? Number(deliveryForm.quantity) : undefined,
      });
      toast.success('Delivery logged!');
      setShowDeliveryModal(false);
      setDeliveryForm({ deliveryDate: new Date().toISOString().split('T')[0], status: 'delivered', quantity: '' });
      loadCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await homeDeliveryService.update(id, editForm);
      toast.success('Customer updated!');
      setShowEditModal(false);
      loadCustomer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      customerName: customer.customerName,
      customerPhone: customer.customerPhone,
      customerAddress: customer.customerAddress,
      area: customer.area || '',
      milkType: customer.milkType,
      quantity: customer.quantity,
      pricePerLiter: customer.pricePerLiter,
      deliverySchedule: customer.deliverySchedule,
      paymentType: customer.paymentType,
      isActive: customer.isActive,
    });
    setShowEditModal(true);
  };

  if (loading) return <LoadingSpinner />;
  if (!customer) return null;

  const deliveries = [...(customer.deliveryHistory || [])].reverse();
  const ledgerEntries = [...(customer.ledger || [])].reverse();
  const totalDelivered = deliveries.filter(d => d.status === 'delivered').length;
  const totalMissed = deliveries.filter(d => d.status === 'missed').length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/home-delivery')}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">{customer.customerName}</h2>
            <p className="text-sm text-slate-500">Customer Details</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" icon={Edit3} onClick={openEditModal}>Edit</Button>
          <Button size="sm" icon={Plus} onClick={() => setShowDeliveryModal(true)}>Log Delivery</Button>
        </div>
      </div>

      {/* Info Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Milk className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Milk Type</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{customer.milkType}</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <Truck className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Daily Qty</p>
              <p className="text-sm font-bold text-slate-900">{customer.quantity} L @ {formatCurrency(customer.pricePerLiter)}/L</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
              <Banknote className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Balance Due</p>
              <p className={`text-sm font-bold ${customer.balance > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                {formatCurrency(customer.balance)}
              </p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-rose-600" />
            </div>
            <div>
              <p className="text-xs text-slate-400">Schedule</p>
              <p className="text-sm font-bold text-slate-900 capitalize">{customer.deliverySchedule} • {customer.paymentType}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Customer Info */}
      <Card className="p-6">
        <h3 className="font-semibold text-slate-900 mb-4">Contact Info</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Phone className="w-4 h-4 text-slate-400" />{customer.customerPhone}
          </div>
          <div className="flex items-center gap-2 text-slate-600">
            <MapPin className="w-4 h-4 text-slate-400" />{customer.customerAddress}
          </div>
          <div className="flex items-center gap-2">
            <Badge color={customer.isActive ? 'success' : 'danger'}>
              {customer.isActive ? 'Active' : 'Inactive'}
            </Badge>
            <span className="text-xs text-slate-400">Since {formatDate(customer.startDate)}</span>
          </div>
        </div>
      </Card>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900">{totalDelivered}</p>
          <p className="text-xs text-slate-400">Delivered</p>
        </Card>
        <Card className="p-4 text-center">
          <XCircle className="w-6 h-6 text-red-400 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900">{totalMissed}</p>
          <p className="text-xs text-slate-400">Missed</p>
        </Card>
        <Card className="p-4 text-center">
          <Clock className="w-6 h-6 text-primary-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-slate-900">{deliveries.length}</p>
          <p className="text-xs text-slate-400">Total Days</p>
        </Card>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery History */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Delivery History</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {deliveries.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No deliveries yet</p>
            ) : (
              deliveries.map((d, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    {d.status === 'delivered' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-400" />
                    )}
                    <div>
                      <p className="text-sm font-medium text-slate-900">{formatDate(d.date)}</p>
                      <p className="text-xs text-slate-400">{d.quantity ? `${d.quantity} L` : '—'}</p>
                    </div>
                  </div>
                  <Badge color={d.status === 'delivered' ? 'success' : 'danger'}>
                    {d.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Ledger */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="font-semibold text-slate-900">Ledger (Transactions)</h3>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-50">
            {ledgerEntries.length === 0 ? (
              <p className="p-6 text-sm text-slate-400 text-center">No transactions yet</p>
            ) : (
              ledgerEntries.map((entry, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{entry.description || entry.type}</p>
                    <p className="text-xs text-slate-400">{formatDate(entry.date)}</p>
                  </div>
                  <span className={`text-sm font-bold ${entry.type === 'debit' ? 'text-red-500' : 'text-emerald-500'}`}>
                    {entry.type === 'debit' ? '+' : '-'}{formatCurrency(entry.amount)}
                  </span>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      {/* Log Delivery Modal */}
      <Modal isOpen={showDeliveryModal} onClose={() => setShowDeliveryModal(false)} title="Log Delivery">
        <form onSubmit={handleAddDelivery} className="space-y-4">
          <Input label="Delivery Date" type="date" value={deliveryForm.deliveryDate}
            onChange={(e) => setDeliveryForm({ ...deliveryForm, deliveryDate: e.target.value })} required />
          <Select label="Status" value={deliveryForm.status}
            onChange={(e) => setDeliveryForm({ ...deliveryForm, status: e.target.value })}
            options={[{ value: 'delivered', label: '✅ Delivered' }, { value: 'missed', label: '❌ Missed' }]} />
          <Input label="Quantity (L)" type="number" step="0.5" placeholder={`Default: ${customer.quantity} L`}
            value={deliveryForm.quantity} onChange={(e) => setDeliveryForm({ ...deliveryForm, quantity: e.target.value })} />
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowDeliveryModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">Log Delivery</Button>
          </div>
        </form>
      </Modal>

      {/* Edit Customer Modal */}
      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Customer" size="lg">
        <form onSubmit={handleEdit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Name" value={editForm.customerName || ''}
              onChange={(e) => setEditForm({ ...editForm, customerName: e.target.value })} />
            <Input label="Phone" value={editForm.customerPhone || ''}
              onChange={(e) => setEditForm({ ...editForm, customerPhone: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Address" value={editForm.customerAddress || ''}
              onChange={(e) => setEditForm({ ...editForm, customerAddress: e.target.value })} />
            <Input label="Area" value={editForm.area || ''}
              onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Select label="Milk Type" value={editForm.milkType || ''}
              onChange={(e) => setEditForm({ ...editForm, milkType: e.target.value })}
              options={[{ value: 'cow', label: 'Cow' }, { value: 'buffalo', label: 'Buffalo' }, { value: 'mix', label: 'Mix' }]} />
            <Input label="Quantity (L)" type="number" value={editForm.quantity || ''}
              onChange={(e) => setEditForm({ ...editForm, quantity: Number(e.target.value) })} />
            <Input label="Price (Rs/L)" type="number" value={editForm.pricePerLiter || ''}
              onChange={(e) => setEditForm({ ...editForm, pricePerLiter: Number(e.target.value) })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Schedule" value={editForm.deliverySchedule || ''}
              onChange={(e) => setEditForm({ ...editForm, deliverySchedule: e.target.value })}
              options={[{ value: 'daily', label: 'Daily' }, { value: 'alternate', label: 'Alternate' }, { value: 'custom', label: 'Custom' }]} />
            <Select label="Status" value={editForm.isActive ? 'true' : 'false'}
              onChange={(e) => setEditForm({ ...editForm, isActive: e.target.value === 'true' })}
              options={[{ value: 'true', label: 'Active' }, { value: 'false', label: 'Inactive' }]} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowEditModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">Save Changes</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
