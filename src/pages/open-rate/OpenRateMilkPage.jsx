import { useState, useEffect } from 'react';
import { Plus, TrendingUp, Trash2, Edit3, List, ChevronLeft } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { openRateMilkService } from '../../services/dataService';
import { formatDate, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function OpenRateMilkPage() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    address: '',
    quantity: '',
    pricePerLiter: '',
    date: new Date().toISOString().split('T')[0],
    shift: 'morning',
  });

  useEffect(() => {
    loadRecords();
  }, []);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const res = await openRateMilkService.getAll();
      setRecords(res.data.openRateMilk || []);
    } catch (err) {
      if (err.response?.status !== 404) {
        toast.error('Failed to load open rate records');
      }
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.address || !form.quantity || !form.pricePerLiter || !form.date || !form.shift) {
      toast.error('All fields are required');
      return;
    }
    setFormLoading(true);
    try {
      await openRateMilkService.add({
        ...form,
        quantity: Number(form.quantity),
        pricePerLiter: Number(form.pricePerLiter),
      });
      toast.success('Open rate milk saved!');
      setForm({ name: '', address: '', quantity: '', pricePerLiter: '', date: new Date().toISOString().split('T')[0], shift: 'morning' });
      loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this record?')) return;
    try {
      await openRateMilkService.delete(id);
      toast.success('Record deleted successfully');
      loadRecords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete record');
    }
  };

  const totalAmount = (Number(form.quantity) || 0) * (Number(form.pricePerLiter) || 0);

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Open Rate Milk</h2>
          <p className="text-sm text-slate-500">
            {showHistory ? 'Viewing open market sales history' : 'Record open market milk sales'}
          </p>
        </div>
        <Button 
          variant={showHistory ? 'secondary' : 'primary'} 
          icon={showHistory ? ChevronLeft : List} 
          onClick={() => setShowHistory(!showHistory)}
        >
          {showHistory ? 'Back to Form' : 'Sales History'}
        </Button>
      </div>

      {!showHistory ? (
        <div className="max-w-2xl mx-auto mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-5 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary-500" />
              Record Sale
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Buyer Name" placeholder="Enter buyer name" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              <Input label="Address" placeholder="Buyer address" value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })} required />
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Quantity (Liters)" type="number" step="0.1" placeholder="0.0" value={form.quantity}
                  onChange={(e) => setForm({ ...form, quantity: e.target.value })} required />
                <Input label="Price / Liter (₹)" type="number" step="0.5" placeholder="0" value={form.pricePerLiter}
                  onChange={(e) => setForm({ ...form, pricePerLiter: e.target.value })} required />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Input label="Date" type="date" value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                <Select label="Shift" value={form.shift} onChange={(e) => setForm({ ...form, shift: e.target.value })}
                  options={[{ value: 'morning', label: 'Morning' }, { value: 'evening', label: 'Evening' }]} required />
              </div>

              {/* Live Total */}
              {totalAmount > 0 && (
                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-center">
                  <p className="text-sm text-emerald-600">Total Amount</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
              )}

              <Button type="submit" loading={formLoading} icon={Plus} className="w-full">
                Save Sale
              </Button>
            </form>
          </Card>
        </div>
      ) : (
        <div className="animate-slide-up mt-6">
          {records.length === 0 ? (
            <Card className="p-8">
              <EmptyState
                icon={TrendingUp}
                title="No Open Rate Sales"
                description="Records of your open market sales will appear here once you add them."
                actionLabel="Record New Sale"
                onAction={() => setShowHistory(false)}
              />
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-slate-900">Sales History</h3>
                <Badge color="success">{records.length} Records</Badge>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <tr>
                      <th className="text-left p-4 whitespace-nowrap">Date / Shift</th>
                      <th className="text-left p-4">Buyer Info</th>
                      <th className="text-right p-4 whitespace-nowrap">Qty & Rate</th>
                      <th className="text-right p-4">Total</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {records.map((record) => (
                      <tr key={record._id} className="hover:bg-slate-50 transition-colors group">
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-medium text-slate-900">{formatDate(record.date)}</div>
                          <div className="text-xs text-slate-500 capitalize">{record.shift}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-slate-900">{record.name}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{record.address}</div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="font-medium text-slate-900">{record.quantity} L</div>
                          <div className="text-xs text-slate-500">₹{record.pricePerLiter}/L</div>
                        </td>
                        <td className="p-4 text-right whitespace-nowrap">
                          <div className="font-bold text-emerald-600">
                            {formatCurrency(record.quantity * record.pricePerLiter)}
                          </div>
                        </td>
                        <td className="p-4 text-right">
                          <button onClick={() => handleDelete(record._id)}
                            className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 text-slate-400 hover:text-red-500 transition-all focus:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
