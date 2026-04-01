import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, Calendar, Filter } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { saleMilkService, retailerService } from '../../services/dataService';
import { formatDate, formatCurrency, formatQuantity } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function SaleMilkPage() {
  const [searchParams] = useSearchParams();
  const [retailers, setRetailers] = useState([]);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState(searchParams.get('retailerId') || '');
  const [filterMode, setFilterMode] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const [form, setForm] = useState({
    retailerId: searchParams.get('retailerId') || '',
    date: new Date().toISOString().split('T')[0],
    morning: { quantity: '', milkType: '', pricePerLiter: '' },
    evening: { quantity: '', milkType: '', pricePerLiter: '' },
  });

  useEffect(() => {
    loadRetailers();
  }, []);

  useEffect(() => {
    if (selectedRetailerId) loadSales();
  }, [selectedRetailerId, filterMode, filterDate, dateRange.start, dateRange.end]);

  const loadRetailers = async () => {
    try {
      const res = await retailerService.getAll({ page: 1, limit: 100 });
      setRetailers(res.data.retailers || []);
    } catch {
      setRetailers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadSales = async () => {
    if (!selectedRetailerId) return;
    try {
      let res;
      if (filterMode === 'date' && filterDate) {
        res = await saleMilkService.getByDate(selectedRetailerId, filterDate);
        setSales(res.data.saleRecord ? [res.data.saleRecord] : []);
      } else if (filterMode === 'range' && dateRange.start && dateRange.end) {
        res = await saleMilkService.getByDateRange(selectedRetailerId, dateRange.start, dateRange.end);
        setSales(res.data.saleRecords || []);
      } else {
        res = await saleMilkService.getByRetailer(selectedRetailerId);
        setSales(res.data.saleRecords || []);
      }
    } catch {
      setSales([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.retailerId || !form.date) {
      toast.error('Retailer and date are required');
      return;
    }
    setFormLoading(true);
    try {
      const payload = {
        retailerId: form.retailerId,
        date: form.date,
      };
      if (form.morning.quantity) {
        payload.morning = {
          quantity: Number(form.morning.quantity),
          milkType: form.morning.milkType || undefined,
          pricePerLiter: form.morning.pricePerLiter ? Number(form.morning.pricePerLiter) : undefined,
        };
      }
      if (form.evening.quantity) {
        payload.evening = {
          quantity: Number(form.evening.quantity),
          milkType: form.evening.milkType || undefined,
          pricePerLiter: form.evening.pricePerLiter ? Number(form.evening.pricePerLiter) : undefined,
        };
      }
      await saleMilkService.add(payload);
      toast.success('Sale recorded!');
      setShowModal(false);
      if (selectedRetailerId) loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (saleId) => {
    if (!window.confirm('Delete this sale record?')) return;
    try {
      await saleMilkService.delete(selectedRetailerId, saleId);
      toast.success('Sale deleted');
      loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const milkTypeOptions = [
    { value: 'Cow', label: 'Cow' },
    { value: 'Buffalo', label: 'Buffalo' },
  ];

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sale Milk</h2>
          <p className="text-sm text-slate-500">Track milk sales to retailers</p>
        </div>
        <Button icon={Plus} onClick={() => setShowModal(true)}>Record Sale</Button>
      </div>

      {/* Retailer Selector */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Select Retailer"
            value={selectedRetailerId}
            onChange={(e) => setSelectedRetailerId(e.target.value)}
            options={retailers.map((r) => ({ value: r._id, label: r.name }))}
          />
          <Select
            label="Filter"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            options={[
              { value: 'all', label: 'All Records' },
              { value: 'date', label: 'By Date' },
              { value: 'range', label: 'Date Range' },
            ]}
          />
          {filterMode === 'date' && (
            <Input label="Date" type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          )}
          {filterMode === 'range' && (
            <>
              <Input label="Start Date" type="date" value={dateRange.start} onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} />
              <Input label="End Date" type="date" value={dateRange.end} onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} />
            </>
          )}
        </div>
      </Card>

      {/* Sales Table */}
      {!selectedRetailerId ? (
        <EmptyState icon={ShoppingCart} title="Select a retailer" description="Choose a retailer above to view their sale records." />
      ) : sales.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No sales found" description="No sale records for this retailer." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Morning</th>
                  <th className="text-left p-4">Evening</th>
                  <th className="text-left p-4">Total Qty</th>
                  <th className="text-left p-4">Total Value</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {sales.map((sale) => {
                  const mQty = sale.morning?.quantity || 0;
                  const eQty = sale.evening?.quantity || 0;
                  const mVal = mQty * (sale.morning?.pricePerLiter || 0);
                  const eVal = eQty * (sale.evening?.pricePerLiter || 0);
                  return (
                    <tr key={sale._id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{formatDate(sale.date)}</td>
                      <td className="p-4">
                        {mQty > 0 ? (
                          <div>
                            <span className="font-medium">{formatQuantity(mQty)}</span>
                            <span className="text-slate-400 text-xs ml-1">@ {formatCurrency(sale.morning?.pricePerLiter)}/L</span>
                            {sale.morning?.milkType && <Badge color="info" className="ml-2">{sale.morning.milkType}</Badge>}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4">
                        {eQty > 0 ? (
                          <div>
                            <span className="font-medium">{formatQuantity(eQty)}</span>
                            <span className="text-slate-400 text-xs ml-1">@ {formatCurrency(sale.evening?.pricePerLiter)}/L</span>
                            {sale.evening?.milkType && <Badge color="warning" className="ml-2">{sale.evening.milkType}</Badge>}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4 font-semibold">{formatQuantity(mQty + eQty)}</td>
                      <td className="p-4 font-bold text-primary-600">{formatCurrency(mVal + eVal)}</td>
                      <td className="p-4 text-right">
                        <button onClick={() => handleDelete(sale._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add Sale Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Record Milk Sale" size="lg">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select label="Retailer" value={form.retailerId} onChange={(e) => setForm({ ...form, retailerId: e.target.value })}
              options={retailers.map((r) => ({ value: r._id, label: r.name }))} required />
            <Input label="Date" type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
          </div>

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-sm font-semibold text-amber-800 mb-3">☀️ Morning</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Quantity (L)" type="number" step="0.1" value={form.morning.quantity}
                onChange={(e) => setForm({ ...form, morning: { ...form.morning, quantity: e.target.value } })} />
              <Select label="Milk Type" value={form.morning.milkType}
                onChange={(e) => setForm({ ...form, morning: { ...form.morning, milkType: e.target.value } })} options={milkTypeOptions} />
              <Input label="Price (₹/L)" type="number" value={form.morning.pricePerLiter}
                onChange={(e) => setForm({ ...form, morning: { ...form.morning, pricePerLiter: e.target.value } })} placeholder="Auto" />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-800 mb-3">🌙 Evening</h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Input label="Quantity (L)" type="number" step="0.1" value={form.evening.quantity}
                onChange={(e) => setForm({ ...form, evening: { ...form.evening, quantity: e.target.value } })} />
              <Select label="Milk Type" value={form.evening.milkType}
                onChange={(e) => setForm({ ...form, evening: { ...form.evening, milkType: e.target.value } })} options={milkTypeOptions} />
              <Input label="Price (₹/L)" type="number" value={form.evening.pricePerLiter}
                onChange={(e) => setForm({ ...form, evening: { ...form.evening, pricePerLiter: e.target.value } })} placeholder="Auto" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">Save Sale</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
