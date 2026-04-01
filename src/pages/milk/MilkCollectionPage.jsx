import { useState, useEffect } from 'react';
import { Plus, Milk, Edit3, Trash2, ChevronLeft, ArrowLeft, Phone, TrendingUp, History } from 'lucide-react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { milkService, farmerService } from '../../services/dataService';
import { formatDate, formatQuantity } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MilkCollectionPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const farmerIdParam = searchParams.get('farmerId');
  
  const [farmers, setFarmers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [currentFarmer, setCurrentFarmer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Create Form State
  const [form, setForm] = useState({
    farmerId: farmerIdParam || '',
    date: new Date().toISOString().split('T')[0],
    morningAmount: '',
    morningMilkType: '',
    eveningAmount: '',
    eveningMilkType: '',
  });

  // Edit State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState(null);
  const [editForm, setEditForm] = useState({
    date: '',
    morningAmount: '',
    morningMilkType: '',
    eveningAmount: '',
    eveningMilkType: '',
  });

  useEffect(() => {
    loadData();
    if (farmerIdParam) {
      setForm(prev => ({ ...prev, farmerId: farmerIdParam }));
    }
  }, [farmerIdParam]);

  const loadData = async () => {
    try {
      setLoading(true);
      const requests = [
        farmerService.getAll(),
        farmerIdParam ? milkService.getByFarmer(farmerIdParam) : milkService.getCollections(),
      ];
      if (farmerIdParam) requests.push(farmerService.getOne(farmerIdParam));

      const [farmerRes, collectionRes, singleFarmerRes] = await Promise.allSettled(requests);
      
      if (farmerRes.status === 'fulfilled') setFarmers(farmerRes.value.data.farmers || []);
      if (collectionRes.status === 'fulfilled') setCollections(collectionRes.value.data.milkRecords || collectionRes.value.data.milkCollections || []);
      if (singleFarmerRes?.status === 'fulfilled') setCurrentFarmer(singleFarmerRes.value.data.farmer);
      else if (!farmerIdParam) setCurrentFarmer(null);
    } catch {
      // endpoints may not exist
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.farmerId) {
      toast.error('Please select a farmer');
      return;
    }
    setFormLoading(true);
    try {
      await milkService.addCollection(form.farmerId, {
        date: form.date,
        morningAmount: form.morningAmount ? Number(form.morningAmount) : undefined,
        morningMilkType: form.morningMilkType || undefined,
        eveningAmount: form.eveningAmount ? Number(form.eveningAmount) : undefined,
        eveningMilkType: form.eveningMilkType || undefined,
      });
      toast.success('Milk collection recorded!');
      setForm({
        ...form,
        morningAmount: '',
        morningMilkType: '',
        eveningAmount: '',
        eveningMilkType: '',
      });
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to record collection');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (col) => {
    setEditingCollection(col);
    setEditForm({
      date: col.date ? new Date(col.date).toISOString().split('T')[0] : '',
      morningAmount: col.morning?.amount || '',
      morningMilkType: col.morning?.milkType || '',
      eveningAmount: col.evening?.amount || '',
      eveningMilkType: col.evening?.milkType || '',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await milkService.updateCollection(editingCollection._id, {
        date: editForm.date,
        morningAmount: editForm.morningAmount ? Number(editForm.morningAmount) : undefined,
        morningMilkType: editForm.morningMilkType || undefined,
        eveningAmount: editForm.eveningAmount ? Number(editForm.eveningAmount) : undefined,
        eveningMilkType: editForm.eveningMilkType || undefined,
      });
      toast.success('Milk collection updated!');
      setEditModalOpen(false);
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this collection record?')) return;
    try {
      await milkService.deleteCollection(id);
      toast.success('Collection deleted');
      loadData();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <LoadingSpinner />;

  const milkTypeOptions = [
    { value: 'Cow', label: 'Cow' },
    { value: 'Buffalo', label: 'Buffalo' },
  ];

  // Stats for selected farmer
  const stats = currentFarmer ? {
    totalLiters: collections.reduce((acc, col) => acc + (col.morning?.amount || 0) + (col.evening?.amount || 0), 0),
    avgDaily: collections.length > 0 ? (collections.reduce((acc, col) => acc + (col.morning?.amount || 0) + (col.evening?.amount || 0), 0) / collections.length).toFixed(1) : 0,
    memberSince: collections.length > 0 ? [...collections].sort((a,b) => new Date(a.date) - new Date(b.date))[0].date : (currentFarmer.createdAt || currentFarmer.startDate),
  } : null;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">
            {farmerIdParam && currentFarmer ? `${currentFarmer.name}'s Records` : 'Milk Collection'}
          </h2>
          <p className="text-sm text-slate-500">
            {farmerIdParam ? 'Comprehensive view of farmer supply history' : 'Record and manage daily milk collections'}
          </p>
        </div>
        {farmerIdParam && (
          <Button 
            variant="secondary" 
            icon={ArrowLeft} 
            onClick={() => {
              setSearchParams({});
              setForm(prev => ({ ...prev, farmerId: '' }));
              setCurrentFarmer(null);
            }}
          >
            All Collections
          </Button>
        )}
      </div>

      {/* Farmer Dashboard Header (only if farmerIdParam is present) */}
      {farmerIdParam && currentFarmer && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 bg-white border border-slate-100 lg:col-span-1">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 text-lg truncate">{currentFarmer.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm">
                  <Phone className="w-3.5 h-3.5" />
                  {currentFarmer.phone}
                </div>
              </div>
            </div>
            <div className="space-y-3 pt-3 border-t border-slate-50">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Default Type</span>
                <Badge color={currentFarmer.defaultMilkType?.toLowerCase() === 'cow' ? 'info' : 'warning'}>{currentFarmer.defaultMilkType}</Badge>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Member Since</span>
                <span className="font-medium text-slate-700">{formatDate(stats.memberSince)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Advance Taken</span>
                <span className="font-bold text-rose-500">Rs {currentFarmer.advance || 0}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-gradient-to-br from-primary-600 to-primary-700 text-white border-0 shadow-lg shadow-primary-500/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-white/20 rounded-lg">
                <Milk className="w-5 h-5 text-white" />
              </div>
              <span className="font-semibold opacity-90 text-sm">Total Supply</span>
            </div>
            <p className="text-4xl font-bold mb-1">{stats.totalLiters} L</p>
            <p className="text-primary-100 text-xs">Total milk supplied to date</p>
          </Card>

          <Card className="p-6 border border-slate-100 flex flex-col justify-center">
             <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-indigo-500" />
              </div>
              <span className="font-semibold text-slate-500 text-sm">Daily Average</span>
            </div>
            <p className="text-4xl font-bold text-slate-900 mb-1">{stats.avgDaily} L</p>
            <p className="text-slate-400 text-xs">Average collection per entry</p>
          </Card>
        </div>
      )}

      {/* Collection Form (conditionally hidden or moved) */}
      <Card className={`p-6 ${farmerIdParam ? 'bg-slate-50/50 border-dashed' : ''}`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
            <Milk className="w-5 h-5 text-primary-500" />
            {farmerIdParam ? `Record New Entry for ${currentFarmer?.name}` : 'Record Collection'}
          </h3>
          {farmerIdParam && (
             <Button 
                variant="secondary" 
                size="sm" 
                icon={History} 
                onClick={() => navigate(`/farmers/${farmerIdParam}/history`)}
              >
                Collection History
              </Button>
          )}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
           {!farmerIdParam && (
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                  label="Select Farmer"
                  value={form.farmerId}
                  onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                  options={farmers.map((f) => ({ value: f._id, label: f.name }))}
                  required
                />
              <Input
                label="Date"
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                required
              />
            </div>
           )}
           {farmerIdParam && (
              <div className="grid grid-cols-1 gap-4">
                <Input
                  label="Date"
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>
           )}

          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-sm font-semibold text-amber-800 mb-3">☀️ Morning Collection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Amount (Liters)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={form.morningAmount}
                onChange={(e) => setForm({ ...form, morningAmount: e.target.value })}
              />
              <Select
                label="Milk Type"
                value={form.morningMilkType}
                onChange={(e) => setForm({ ...form, morningMilkType: e.target.value })}
                options={milkTypeOptions}
              />
            </div>
          </div>

          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-800 mb-3">🌙 Evening Collection</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Amount (Liters)"
                type="number"
                step="0.1"
                placeholder="0.0"
                value={form.eveningAmount}
                onChange={(e) => setForm({ ...form, eveningAmount: e.target.value })}
              />
              <Select
                label="Milk Type"
                value={form.eveningMilkType}
                onChange={(e) => setForm({ ...form, eveningMilkType: e.target.value })}
                options={milkTypeOptions}
              />
            </div>
          </div>

          <Button type="submit" loading={formLoading} icon={Plus} className="w-full sm:w-auto">
            Save Collection
          </Button>
        </form>
      </Card>

      {/* Recent Collections (only shown on global view) */}
      {!farmerIdParam && collections.length > 0 && (
        <Card className="overflow-hidden border border-slate-100 animate-slide-up">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
            <h3 className="text-lg font-semibold text-slate-900">
              {farmerIdParam ? 'Supply Record History' : 'Recent Collections'}
            </h3>
            {farmerIdParam && <Badge color="primary">{collections.length} Entries</Badge>}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-4">Date</th>
                  {!farmerIdParam && <th className="text-left p-4">Farmer</th>}
                  <th className="text-left p-4">Morning</th>
                  <th className="text-left p-4">Evening</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {collections.map((col) => (
                  <tr key={col._id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-4 font-medium">{formatDate(col.date)}</td>
                    {!farmerIdParam && <td className="p-4">{col.farmer?.name || col.farmer || 'Unknown User'}</td>}
                    <td className="p-4">
                      {col.morning?.amount > 0 ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          {formatQuantity(col.morning?.amount)}
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded uppercase">{col.morning?.milkType?.charAt(0)}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4">
                      {col.evening?.amount > 0 ? (
                        <span className="flex items-center gap-1.5 font-medium">
                          {formatQuantity(col.evening?.amount)}
                          <span className="text-[10px] bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded uppercase">{col.evening?.milkType?.charAt(0)}</span>
                        </span>
                      ) : '—'}
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {formatQuantity((col.morning?.amount || 0) + (col.evening?.amount || 0))}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditModal(col)}
                          className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors">
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(col._id)}
                          className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Edit Modal */}
      <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Milk Collection" size="lg">
        <form onSubmit={handleEditSubmit} className="space-y-5">
          <Input
            label="Date"
            type="date"
            value={editForm.date}
            onChange={(e) => setEditForm({ ...editForm, date: e.target.value })}
            required
          />
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <h4 className="text-sm font-semibold text-amber-800 mb-3">☀️ Morning</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Amount (Liters)"
                type="number"
                step="0.1"
                value={editForm.morningAmount}
                onChange={(e) => setEditForm({ ...editForm, morningAmount: e.target.value })}
              />
              <Select
                label="Milk Type"
                value={editForm.morningMilkType}
                onChange={(e) => setEditForm({ ...editForm, morningMilkType: e.target.value })}
                options={milkTypeOptions}
              />
            </div>
          </div>
          <div className="p-4 bg-indigo-50 rounded-xl border border-indigo-100">
            <h4 className="text-sm font-semibold text-indigo-800 mb-3">🌙 Evening</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Amount (Liters)"
                type="number"
                step="0.1"
                value={editForm.eveningAmount}
                onChange={(e) => setEditForm({ ...editForm, eveningAmount: e.target.value })}
              />
              <Select
                label="Milk Type"
                value={editForm.eveningMilkType}
                onChange={(e) => setEditForm({ ...editForm, eveningMilkType: e.target.value })}
                options={milkTypeOptions}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setEditModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="flex-1">
              Update Collection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
