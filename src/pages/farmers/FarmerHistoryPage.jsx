import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, Filter, Milk, Phone, 
  TrendingUp, Download, Printer, ChevronRight, X, Plus 
} from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { milkService, farmerService } from '../../services/dataService';
import { formatDate, formatQuantity, formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function FarmerHistoryPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [farmer, setFarmer] = useState(null);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: 'Advance Payment'
  });

  useEffect(() => {
    loadData();
  }, [id, filterMode, filterDate, dateRange.start, dateRange.end]);

  const loadData = async () => {
    try {
      setLoading(true);
      const farmerRes = await farmerService.getOne(id);
      setFarmer(farmerRes.data.farmer);

      let collectionRes;
      if (filterMode === 'date' && filterDate) {
        collectionRes = await milkService.getByDate(id, filterDate);
      } else if (filterMode === 'range' && dateRange.start && dateRange.end) {
        collectionRes = await milkService.getByDateRange(id, dateRange.start, dateRange.end);
      } else if (filterMode === 'all') {
        collectionRes = await milkService.getByFarmer(id);
      } else {
        // Mode selected but params missing
        setCollections([]);
        setLoading(false);
        return;
      }
      
      setCollections(collectionRes.data.milkRecords || []);
    } catch (err) {
      toast.error('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setFilterMode('all');
    setFilterDate('');
    setDateRange({ start: '', end: '' });
  };

  const handlePrint = () => {
    window.print();
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!paymentForm.amount) return toast.error('Please enter amount');
    
    try {
      setPaymentLoading(true);
      await farmerService.addPayment(id, {
        ...paymentForm,
        amount: Number(paymentForm.amount)
      });
      toast.success('Payment recorded successfully!');
      setShowPaymentModal(false);
      setPaymentForm({
        amount: '',
        date: new Date().toISOString().split('T')[0],
        description: 'Advance Payment'
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record payment');
    } finally {
      setPaymentLoading(false);
    }
  };

  if (loading && !farmer) return <LoadingSpinner fullPage />;

  const stats = {
    totalLiters: collections.reduce((acc, col) => acc + (col.morning?.amount || 0) + (col.evening?.amount || 0), 0),
    avgDaily: collections.length > 0 ? (collections.reduce((acc, col) => acc + (col.morning?.amount || 0) + (col.evening?.amount || 0), 0) / collections.length).toFixed(1) : 0,
    count: collections.length
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-slate-100 rounded-xl transition-colors text-slate-500"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Collection History</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Farmers</span>
              <ChevronRight className="w-4 h-4" />
              <span>{farmer?.name}</span>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" icon={Plus} onClick={() => setShowPaymentModal(true)}>Record Payment</Button>
          <Button variant="secondary" icon={Printer} onClick={handlePrint}>Print Report</Button>
        </div>
      </div>

      {/* Farmer Profile & Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center text-2xl font-bold text-primary-700">
              {farmer?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-900">{farmer?.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {farmer?.phone}
                </span>
                <Badge color={farmer?.defaultMilkType?.toLowerCase() === 'cow' ? 'info' : 'warning'}>
                  {farmer?.defaultMilkType}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
          <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Supply</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{stats.totalLiters}</span>
            <span className="text-primary-200 text-sm mb-1">Liters</span>
          </div>
        </Card>

        <Card className="p-5 bg-white border border-slate-100">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Daily Avg</p>
          <div className="flex items-end gap-2">
             <TrendingUp className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-3xl font-bold text-slate-900">{stats.avgDaily}</span>
            <span className="text-slate-500 text-sm mb-1">L/day</span>
          </div>
        </Card>

        <Card className="p-5 bg-amber-50 border border-amber-100">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">Current Advance</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-700">{formatCurrency(farmer?.balance || 0)}</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <Select
            label="Filter View"
            value={filterMode}
            onChange={(e) => setFilterMode(e.target.value)}
            options={[
              { value: 'all', label: 'All Records' },
              { value: 'date', label: 'Specific Date' },
              { value: 'range', label: 'Date Range' },
            ]}
          />
          {filterMode === 'date' && (
            <Input 
              label="Select Date" 
              type="date" 
              value={filterDate} 
              onChange={(e) => setFilterDate(e.target.value)} 
            />
          )}
          {filterMode === 'range' && (
            <>
              <Input 
                label="Start Date" 
                type="date" 
                value={dateRange.start} 
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })} 
              />
              <Input 
                label="End Date" 
                type="date" 
                value={dateRange.end} 
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })} 
              />
            </>
          )}
          <div className="lg:col-start-4 flex justify-end gap-2">
             {filterMode !== 'all' && (
               <Button variant="secondary" size="sm" icon={X} onClick={clearFilters}>Clear</Button>
             )}
             <Badge color="slate" className="py-2 px-4">{stats.count} Total Entries</Badge>
          </div>
        </div>
      </Card>
      {/* History Table */}
      {collections.length === 0 ? (
        <EmptyState 
          icon={Calendar} 
          title="No records found" 
          description="Try adjusting your filters or record some collections first." 
        />
      ) : (
        <Card className="overflow-hidden border-slate-100 shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Morning (L)</th>
                  <th className="text-left p-4">Evening (L)</th>
                  <th className="text-left p-4">Total Day</th>
                  <th className="text-left p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {collections.map((col) => {
                  const dayTotal = (col.morning?.amount || 0) + (col.evening?.amount || 0);
                  return (
                    <tr key={col._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-semibold text-slate-700">{formatDate(col.date)}</td>
                      <td className="p-4">
                        {col.morning?.amount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{formatQuantity(col.morning.amount)}</span>
                            <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100">{col.morning.milkType}</span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4">
                        {col.evening?.amount > 0 ? (
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-slate-900">{formatQuantity(col.evening.amount)}</span>
                            <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">{col.evening.milkType}</span>
                          </div>
                        ) : <span className="text-slate-300">—</span>}
                      </td>
                      <td className="p-4">
                        <span className="text-lg font-bold text-primary-600">{formatQuantity(dayTotal)}</span>
                      </td>
                      <td className="p-4">
                        <Badge color="success" variant="flat">Recorded</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Ledger Section */}
      <Card className="overflow-hidden border-slate-100 shadow-sm mt-8">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary-500" />
            Payment & Advance Ledger
          </h3>
          <Badge color="neutral">{farmer?.ledger?.length || 0} Transactions</Badge>
        </div>
        {!farmer?.ledger?.length ? (
          <p className="p-10 text-center text-slate-400 text-sm italic">No payment history found for this farmer.</p>
        ) : (
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
                {[...(farmer.ledger || [])].reverse().map((entry, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 text-slate-600">{formatDate(entry.date)}</td>
                    <td className="p-4 font-medium text-slate-900">{entry.description}</td>
                    <td className="p-4">
                      <Badge color={entry.type === 'debit' ? 'warning' : 'success'}>
                        {entry.type === 'debit' ? 'Advance Paid' : 'Credit'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right font-bold text-slate-900">
                      {formatCurrency(entry.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Record Payment Modal */}
      <Modal 
        isOpen={showPaymentModal} 
        onClose={() => setShowPaymentModal(false)} 
        title="Record Payment / Advance"
      >
        <form onSubmit={handlePaymentSubmit} className="space-y-4">
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
            placeholder="Enter amount paid to farmer" 
            value={paymentForm.amount} 
            onChange={(e) => setPaymentForm({ ...paymentForm, amount: e.target.value })} 
            required 
          />
          <Input 
            label="Description / Notes" 
            placeholder="e.g. Weekly advance, Cash payment" 
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
