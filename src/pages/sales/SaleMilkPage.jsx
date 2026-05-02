import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus, ShoppingCart, Trash2, Calendar, Filter, CreditCard, TrendingUp, Phone, MapPin, Check, Save } from 'lucide-react';
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
  const [selectedRetailer, setSelectedRetailer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [selectedRetailerId, setSelectedRetailerId] = useState(searchParams.get('retailerId') || '');
  const [filterMode, setFilterMode] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Inline Payment State
  const [localPayments, setLocalPayments] = useState({});
  const [savingPaymentId, setSavingPaymentId] = useState(null);

  const [form, setForm] = useState({
    retailerId: searchParams.get('retailerId') || '',
    date: new Date().toISOString().split('T')[0],
    morning: { quantity: '', milkType: '', pricePerLiter: '' },
    evening: { quantity: '', milkType: '', pricePerLiter: '' },
  });

  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Payment Received',
  });

  useEffect(() => {
    loadRetailers();
  }, []);

  useEffect(() => {
    if (selectedRetailerId) {
      loadSales();
      loadRetailerDetail();
    } else {
      setSelectedRetailer(null);
      setSales([]);
    }
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

  const loadRetailerDetail = async () => {
    if (!selectedRetailerId) return;
    try {
      const res = await retailerService.getOne(selectedRetailerId);
      setSelectedRetailer(res.data.retailer);
    } catch {
      setSelectedRetailer(null);
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
      if (selectedRetailerId) {
        loadSales();
        loadRetailerDetail();
      }
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
      loadRetailerDetail();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount) return toast.error('Please enter amount');

    setPaymentLoading(true);
    try {
      await retailerService.addPayment(selectedRetailerId, {
        ...paymentForm,
        amount: Number(paymentForm.amount),
      });
      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: 'Payment Received',
      });
      loadRetailerDetail();
      loadSales();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleInlinePaymentChange = (dateKey, value) => {
    setLocalPayments(prev => ({
      ...prev,
      [dateKey]: value
    }));
  };

  const handleInlinePaymentSave = async (dateKey, dateObj) => {
    const amount = Number(localPayments[dateKey]) || 0;
    setSavingPaymentId(dateKey);
    try {
      await retailerService.setDailyPayment(selectedRetailerId, { date: dateObj, amount });
      toast.success('Payment updated');
      loadRetailerDetail();
      loadSales();
    } catch (err) {
      toast.error('Failed to update payment');
      // Revert on failure by forcing a re-fetch or clearing local state could be done here
    } finally {
      setSavingPaymentId(null);
    }
  };

  const milkTypeOptions = [
    { value: 'Cow', label: 'Cow' },
    { value: 'Buffalo', label: 'Buffalo' },
  ];

  if (loading) return <LoadingSpinner />;

  // Build a unified timeline of daily records combining sales and payments
  const unifiedRecordsMap = {};

  // 1. Add sales to the map
  sales.forEach((sale) => {
    const dateKey = new Date(sale.date).toDateString();
    
    // Safely handle arrays or fallback to old object style if present
    const morningArr = Array.isArray(sale.morning) ? sale.morning : (sale.morning?.quantity ? [sale.morning] : []);
    const eveningArr = Array.isArray(sale.evening) ? sale.evening : (sale.evening?.quantity ? [sale.evening] : []);
    
    const mQty = morningArr.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const mVal = morningArr.reduce((sum, item) => sum + ((item.quantity || 0) * (item.pricePerLiter || 0)), 0);
    const mDesc = morningArr.map(item => `${item.quantity}L ${item.milkType}`).join(', ');

    const eQty = eveningArr.reduce((sum, item) => sum + (item.quantity || 0), 0);
    const eVal = eveningArr.reduce((sum, item) => sum + ((item.quantity || 0) * (item.pricePerLiter || 0)), 0);
    const eDesc = eveningArr.map(item => `${item.quantity}L ${item.milkType}`).join(', ');

    unifiedRecordsMap[dateKey] = {
      id: sale._id, // use sale ID if present
      saleId: sale._id,
      date: sale.date,
      dateKey,
      mQty,
      mVal,
      mDesc,
      eQty,
      eVal,
      eDesc,
      payment: 0,
    };
  });

  // 2. Add payments from the ledger to the map
  if (selectedRetailer?.ledger) {
    selectedRetailer.ledger.forEach((entry) => {
      if (entry.type === 'credit') {
        const dateKey = new Date(entry.date).toDateString();
        if (!unifiedRecordsMap[dateKey]) {
          unifiedRecordsMap[dateKey] = {
            id: `payment-${entry._id || Math.random()}`, // unique ID for row
            saleId: null, // no sale this day
            date: entry.date,
            dateKey,
            mQty: 0,
            mVal: 0,
            mDesc: '',
            eQty: 0,
            eVal: 0,
            eDesc: '',
            payment: 0,
          };
        }
        unifiedRecordsMap[dateKey].payment += entry.amount;
      }
    });
  }

  // 3. Sort chronologically (oldest first) to calculate running balance
  const unifiedRecords = Object.values(unifiedRecordsMap).sort((a, b) => new Date(a.date) - new Date(b.date));

  let runningBal = 0;
  unifiedRecords.forEach((record) => {
    const mVal = record.mQty * record.mPrice;
    const eVal = record.eQty * record.ePrice;

    // Use local payment if user is typing, otherwise use saved payment
    const effectivePayment = localPayments[record.dateKey] !== undefined
      ? (Number(localPayments[record.dateKey]) || 0)
      : record.payment;

    // Sales add to balance, payments subtract
    runningBal += (mVal + eVal);
    runningBal -= effectivePayment;
    record.runningBalance = runningBal;
    record.effectivePayment = effectivePayment;
  });

  // 4. Reverse to show newest first in table
  unifiedRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Calculate totals
  const totals = unifiedRecords.reduce(
    (acc, record) => {
      acc.totalMorningQty += record.mQty;
      acc.totalEveningQty += record.eQty;
      acc.totalQty += record.mQty + record.eQty;
      acc.totalValue += record.mVal + record.eVal;
      return acc;
    },
    { totalMorningQty: 0, totalEveningQty: 0, totalQty: 0, totalValue: 0 }
  );

  const totalPayments = selectedRetailer?.ledger
    ?.filter((e) => e.type === 'credit')
    .reduce((acc, e) => acc + e.amount, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Sale Milk</h2>
          <p className="text-sm text-slate-500">Track milk sales to retailers</p>
        </div>
        <div className="flex gap-2">
          {selectedRetailerId && selectedRetailer && (
            <Button variant="outline" icon={CreditCard} onClick={() => setShowPaymentModal(true)}>
              Record Payment
            </Button>
          )}
          <Button icon={Plus} onClick={() => setShowModal(true)}>Record Sale</Button>
        </div>
      </div>

      {/* Retailer Selector & Filters */}
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

      {/* Retailer Balance Summary */}
      {selectedRetailerId && selectedRetailer && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-5 lg:col-span-1">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-lg font-bold text-violet-700">
                {selectedRetailer.name?.charAt(0)?.toUpperCase()}
              </div>
              <div>
                <h3 className="font-bold text-slate-900">{selectedRetailer.name}</h3>
                <div className="flex items-center gap-1 text-slate-400 text-xs">
                  <Phone className="w-3 h-3" />
                  {selectedRetailer.phone}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1 text-slate-400 text-xs">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{selectedRetailer.address}</span>
            </div>
          </Card>

          <Card className={`p-5 text-white border-0 ${selectedRetailer.balance >= 0 ? 'bg-gradient-to-br from-rose-600 to-rose-700' : 'bg-gradient-to-br from-emerald-600 to-emerald-700'}`}>
            <p className={`${selectedRetailer.balance >= 0 ? 'text-rose-100' : 'text-emerald-100'} text-xs font-semibold uppercase tracking-wider mb-1`}>
              {selectedRetailer.balance >= 0 ? 'Total Owed' : 'Advance Balance'}
            </p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold">{formatCurrency(Math.abs(selectedRetailer.balance || 0))}</span>
            </div>
            <p className={`${selectedRetailer.balance >= 0 ? 'text-rose-200' : 'text-emerald-200'} text-xs mt-1`}>
              {selectedRetailer.balance >= 0 ? 'Outstanding balance to collect' : 'Retailer has overpaid'}
            </p>
          </Card>

          <Card className="p-5 bg-emerald-50 border border-emerald-100">
            <p className="text-emerald-600 text-xs font-semibold uppercase tracking-wider mb-1">Total Sales Value</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-emerald-700">{formatCurrency(totals.totalValue)}</span>
            </div>
            <p className="text-emerald-500 text-xs mt-1">{formatQuantity(totals.totalQty)} Liters sold</p>
          </Card>

          <Card className="p-5 bg-sky-50 border border-sky-100">
            <p className="text-sky-600 text-xs font-semibold uppercase tracking-wider mb-1">Total Payments</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-bold text-sky-700">{formatCurrency(totalPayments)}</span>
            </div>
            <p className="text-sky-500 text-xs mt-1">{selectedRetailer.ledger?.filter(e => e.type === 'credit').length || 0} transactions</p>
          </Card>
        </div>
      )}

      {/* Sales Table */}
      {!selectedRetailerId ? (
        <EmptyState icon={ShoppingCart} title="Select a retailer" description="Choose a retailer above to view their sale records." />
      ) : unifiedRecords.length === 0 ? (
        <EmptyState icon={ShoppingCart} title="No records found" description="No sale or payment records for this retailer." />
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4 underline decoration-amber-200">Morning</th>
                  <th className="text-left p-4 underline decoration-indigo-200">Evening</th>
                  <th className="text-left p-4">Total Milk</th>
                  <th className="text-left p-4">Bill Amount</th>
                  <th className="text-left p-4">Payment</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {unifiedRecords.map((record) => {
                  const dayTotalValue = record.mVal + record.eVal;

                  return (
                    <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4 font-medium">{formatDate(record.date)}</td>
                      <td className="p-4 font-medium text-amber-700 bg-amber-50/30">
                        {record.mQty > 0 ? (
                          <div className="flex flex-col">
                            <span>{formatQuantity(record.mQty)}</span>
                            {record.mDesc && <span className="text-xs text-amber-600/70 font-normal mt-0.5">{record.mDesc}</span>}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4 font-medium text-indigo-700 bg-indigo-50/30">
                        {record.eQty > 0 ? (
                          <div className="flex flex-col">
                            <span>{formatQuantity(record.eQty)}</span>
                            {record.eDesc && <span className="text-xs text-indigo-600/70 font-normal mt-0.5">{record.eDesc}</span>}
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4">
                        {record.mQty + record.eQty > 0 ? (
                          <span className="font-semibold text-slate-800">{formatQuantity(record.mQty + record.eQty)}</span>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4 font-bold text-primary-600">{dayTotalValue > 0 ? formatCurrency(dayTotalValue) : '—'}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2 max-w-[140px]">
                          <div className="relative flex-1">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-medium">Rs</span>
                            <input
                              type="number"
                              className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-emerald-700 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all hover:bg-white"
                              value={localPayments[record.dateKey] !== undefined ? localPayments[record.dateKey] : (record.payment || '')}
                              onChange={(e) => handleInlinePaymentChange(record.dateKey, e.target.value)}
                              placeholder="0"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleInlinePaymentSave(record.dateKey, record.date);
                              }}
                            />
                          </div>
                          {(localPayments[record.dateKey] !== undefined && Number(localPayments[record.dateKey]) !== record.payment) && (
                            <button
                              onClick={() => handleInlinePaymentSave(record.dateKey, record.date)}
                              disabled={savingPaymentId === record.dateKey}
                              className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors flex-shrink-0"
                              title="Save Payment"
                            >
                              {savingPaymentId === record.dateKey ? (
                                <div className="w-4 h-4 rounded-full border-2 border-emerald-700 border-t-transparent animate-spin" />
                              ) : (
                                <Save className="w-4 h-4" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="p-4 text-right">
                        {record.saleId ? (
                          <button onClick={() => handleDelete(record.saleId)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors" title="Delete Sale">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-50 border-t-2 border-slate-200 text-sm">
                  <td className="p-4 font-bold text-slate-700">Grand Totals</td>
                  <td className="p-4 font-bold text-amber-700">{formatQuantity(totals.totalMorningQty)}</td>
                  <td className="p-4 font-bold text-indigo-700">{formatQuantity(totals.totalEveningQty)}</td>
                  <td className="p-4 font-bold text-slate-900">{formatQuantity(totals.totalQty)}</td>
                  <td className="p-4 font-bold text-primary-600">{formatCurrency(totals.totalValue)}</td>
                  <td className="p-4 font-bold text-emerald-700">{formatCurrency(totalPayments)}</td>
                  <td className="p-4 text-right">
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-slate-400 uppercase tracking-wider mb-1">Net Balance</span>
                      <span className={`font-bold text-lg ${selectedRetailer?.balance > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                        {selectedRetailer?.balance > 0 ? `${formatCurrency(selectedRetailer.balance)} Dr` : selectedRetailer?.balance < 0 ? `${formatCurrency(Math.abs(selectedRetailer.balance))} Rs` : formatCurrency(0)}
                      </span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </Card>
      )}

      {/* Ledger Section */}
      {selectedRetailerId && selectedRetailer?.ledger?.length > 0 && (
        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary-500" />
              Payment & Transaction Ledger
            </h3>
            <Badge color="neutral">{selectedRetailer.ledger.length} Transactions</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Description</th>
                  <th className="text-left p-4">Type</th>
                  <th className="text-right p-4">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {[...(selectedRetailer.ledger || [])].reverse().map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-600">{formatDate(entry.date)}</td>
                    <td className="p-4 font-medium text-slate-900">{entry.description}</td>
                    <td className="p-4">
                      <Badge color={entry.type === 'credit' ? 'success' : 'warning'}>
                        {entry.type === 'credit' ? 'Payment' : 'Sale'}
                      </Badge>
                    </td>
                    <td className={`p-4 text-right font-bold ${entry.type === 'credit' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {entry.type === 'credit' ? '-' : '+'}{formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
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
              <Input label="Price (Rs/L)" type="number" value={form.morning.pricePerLiter}
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
              <Input label="Price (Rs/L)" type="number" value={form.evening.pricePerLiter}
                onChange={(e) => setForm({ ...form, evening: { ...form.evening, pricePerLiter: e.target.value } })} placeholder="Auto" />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">Save Sale</Button>
          </div>
        </form>
      </Modal>

      {/* Record Payment Modal */}
      <Modal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        title="Record Payment from Retailer"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-2">
            <div className="flex justify-between items-center">
              <span className={`text-sm font-medium ${selectedRetailer?.balance >= 0 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {selectedRetailer?.balance >= 0 ? 'Current Balance Owed' : 'Retailer is in Advance by'}
              </span>
              <span className={`text-xl font-bold ${selectedRetailer?.balance >= 0 ? 'text-emerald-800' : 'text-amber-800'}`}>
                {formatCurrency(Math.abs(selectedRetailer?.balance || 0))}
              </span>
            </div>
          </div>
          <Input
            label="Payment Date"
            type="date"
            value={paymentForm.date}
            onChange={(e) => setPaymentForm({ ...paymentForm, date: e.target.value })}
            required
          />
          <Input
            label="Amount (Rs)"
            type="number"
            placeholder="Enter payment amount"
            value={paymentForm.amount}
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })}
            required
          />
          <Input
            label="Description / Notes"
            placeholder="e.g. Cash payment, Bank transfer"
            value={paymentForm.description}
            onChange={(e) => setPaymentForm({ ...paymentForm, description: e.target.value })}
          />
          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setShowPaymentModal(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              loading={paymentLoading}
              className="flex-1"
            >
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
