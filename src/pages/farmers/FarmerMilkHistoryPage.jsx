import { useState, useEffect } from 'react';
import { Milk, Calendar, Filter, X, TrendingUp, Users, Droplets } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { milkService, farmerService } from '../../services/dataService';
import { formatDate, formatQuantity } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function FarmerMilkHistoryPage() {
  const [farmers, setFarmers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [selectedFarmerId, setSelectedFarmerId] = useState('');
  const [filterMode, setFilterMode] = useState('all');
  const [filterDate, setFilterDate] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  // Load farmers list on mount
  useEffect(() => {
    loadFarmers();
  }, []);

  // Reload collections when filters change
  useEffect(() => {
    loadCollections();
  }, [selectedFarmerId, filterMode, filterDate, dateRange.start, dateRange.end]);

  const loadFarmers = async () => {
    try {
      const res = await farmerService.getAll();
      setFarmers(res.data.farmers || []);
    } catch {
      setFarmers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCollections = async () => {
    try {
      setIsUpdating(true);
      let res;

      if (selectedFarmerId) {
        // Farmer-specific queries
        if (filterMode === 'date' && filterDate) {
          res = await milkService.getByDate(selectedFarmerId, filterDate);
        } else if (filterMode === 'range' && dateRange.start && dateRange.end) {
          res = await milkService.getByDateRange(selectedFarmerId, dateRange.start, dateRange.end);
        } else {
          res = await milkService.getByFarmer(selectedFarmerId);
        }
      } else {
        // All farmers
        if (filterMode === 'date' && filterDate) {
          res = await milkService.getAllByDate(filterDate);
        } else if (filterMode === 'range' && dateRange.start && dateRange.end) {
          res = await milkService.getAllByDateRange(dateRange.start, dateRange.end);
        } else {
          res = await milkService.getAllCollections();
        }
      }

      setCollections(res.data.milkRecords || []);
    } catch (err) {
      toast.error('Failed to load records');
      setCollections([]);
    } finally {
      setIsUpdating(false);
    }
  };

  const clearFilters = () => {
    setSelectedFarmerId('');
    setFilterMode('all');
    setFilterDate('');
    setDateRange({ start: '', end: '' });
  };

  if (loading) return <LoadingSpinner fullPage />;

  // Calculate stats
  const stats = {
    totalLiters: collections.reduce((acc, col) => acc + (col.morning?.amount || 0) + (col.evening?.amount || 0), 0),
    morningTotal: collections.reduce((acc, col) => acc + (col.morning?.amount || 0), 0),
    eveningTotal: collections.reduce((acc, col) => acc + (col.evening?.amount || 0), 0),
    count: collections.length,
    uniqueFarmers: [...new Set(collections.map(c => c.farmer?._id || c.farmer))].length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Farmer Milk History</h2>
          <p className="text-sm text-slate-500">View all milk purchased from farmers</p>
        </div>
        <Badge color="slate" className="py-2 px-4 text-sm">{stats.count} Records</Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0">
          <p className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-1">Total Milk</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold">{formatQuantity(stats.totalLiters)}</span>
            <span className="text-primary-200 text-sm mb-1">Liters</span>
          </div>
        </Card>
        <Card className="p-5 bg-amber-50 border border-amber-100">
          <p className="text-amber-600 text-xs font-semibold uppercase tracking-wider mb-1">☀️ Morning</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-amber-700">{formatQuantity(stats.morningTotal)}</span>
            <span className="text-amber-500 text-sm mb-1">L</span>
          </div>
        </Card>
        <Card className="p-5 bg-indigo-50 border border-indigo-100">
          <p className="text-indigo-600 text-xs font-semibold uppercase tracking-wider mb-1">🌙 Evening</p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-indigo-700">{formatQuantity(stats.eveningTotal)}</span>
            <span className="text-indigo-500 text-sm mb-1">L</span>
          </div>
        </Card>
        <Card className="p-5 bg-white border border-slate-100">
          <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">Farmers</p>
          <div className="flex items-end gap-2">
            <Users className="w-5 h-5 text-emerald-500 mb-1" />
            <span className="text-3xl font-bold text-slate-900">{stats.uniqueFarmers}</span>
            <span className="text-slate-500 text-sm mb-1">Suppliers</span>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <Select
            label="Select Farmer"
            value={selectedFarmerId}
            onChange={(e) => setSelectedFarmerId(e.target.value)}
            options={[
              { value: '', label: 'All Farmers' },
              ...farmers.map((f) => ({ value: f._id, label: f.name })),
            ]}
          />
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
          <div className="flex justify-end">
            {(selectedFarmerId || filterMode !== 'all') && (
              <Button variant="secondary" size="sm" icon={X} onClick={clearFilters}>Clear Filters</Button>
            )}
          </div>
        </div>
      </Card>

      {/* Collection Records Table */}
      <div className={`transition-opacity duration-200 ${isUpdating ? 'opacity-50' : 'opacity-100'}`}>
        {collections.length === 0 ? (
          <EmptyState
            icon={Milk}
            title="No records found"
            description={selectedFarmerId ? "No milk collection records for this farmer." : "No milk collection records found. Try adjusting your filters."}
          />
        ) : (
          <Card className="overflow-hidden border-slate-100 shadow-sm relative">
            {isUpdating && (
              <div className="absolute top-0 left-0 w-full h-1 bg-primary-500/30 overflow-hidden">
                <div className="w-1/3 h-full bg-primary-600 animate-loading-bar"></div>
              </div>
            )}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="text-left p-4">Date</th>
                    <th className="text-left p-4">Farmer</th>
                    <th className="text-left p-4">Morning (L)</th>
                    <th className="text-left p-4">Evening (L)</th>
                    <th className="text-left p-4">Total Day</th>
                    <th className="text-left p-4">Milk Type</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {collections.map((col) => {
                    const morningAmt = col.morning?.amount || 0;
                    const eveningAmt = col.evening?.amount || 0;
                    const dayTotal = morningAmt + eveningAmt;
                    const farmerName = col.farmer?.name || '—';

                    return (
                      <tr key={col._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-semibold text-slate-700">{formatDate(col.date)}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                              {farmerName.charAt(0)?.toUpperCase()}
                            </div>
                            <span className="font-medium text-slate-900">{farmerName}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          {morningAmt > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{formatQuantity(morningAmt)}</span>
                              {col.morning?.milkType && (
                                <span className="text-[10px] bg-sky-50 text-sky-600 px-1.5 py-0.5 rounded border border-sky-100">
                                  {col.morning.milkType}
                                </span>
                              )}
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="p-4">
                          {eveningAmt > 0 ? (
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-slate-900">{formatQuantity(eveningAmt)}</span>
                              {col.evening?.milkType && (
                                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-1.5 py-0.5 rounded border border-indigo-100">
                                  {col.evening.milkType}
                                </span>
                              )}
                            </div>
                          ) : <span className="text-slate-300">—</span>}
                        </td>
                        <td className="p-4">
                          <span className="text-lg font-bold text-primary-600">{formatQuantity(dayTotal)}</span>
                        </td>
                        <td className="p-4">
                          {col.morning?.milkType && (
                            <Badge color={col.morning.milkType === 'Cow' ? 'info' : 'warning'}>
                              {col.morning.milkType}
                            </Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200">
                    <td className="p-4 font-bold text-slate-700" colSpan="2">Grand Total</td>
                    <td className="p-4 font-bold text-amber-700">{formatQuantity(stats.morningTotal)}</td>
                    <td className="p-4 font-bold text-indigo-700">{formatQuantity(stats.eveningTotal)}</td>
                    <td className="p-4 font-bold text-xl text-primary-600">{formatQuantity(stats.totalLiters)}</td>
                    <td className="p-4"></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
