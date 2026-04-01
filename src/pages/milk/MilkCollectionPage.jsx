import { useState, useEffect } from 'react';
import { Plus, Milk, Edit3, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { milkService, farmerService } from '../../services/dataService';
import { formatDate, formatQuantity } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function MilkCollectionPage() {
  const [farmers, setFarmers] = useState([]);
  const [collections, setCollections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  
  // Create Form State
  const [form, setForm] = useState({
    farmerId: '',
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
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [farmerRes, collectionRes] = await Promise.allSettled([
        farmerService.getAll(),
        milkService.getCollections(),
      ]);
      if (farmerRes.status === 'fulfilled') setFarmers(farmerRes.value.data.farmers || []);
      if (collectionRes.status === 'fulfilled') setCollections(collectionRes.value.data.milkRecords || collectionRes.value.data.milkCollections || []);
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">Milk Collection</h2>
        <p className="text-sm text-slate-500">Record and manage daily milk collections</p>
      </div>

      {/* Collection Form */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
          <Milk className="w-5 h-5 text-primary-500" />
          Record Collection
        </h3>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {farmers.length > 0 ? (
              <Select
                label="Select Farmer"
                value={form.farmerId}
                onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                options={farmers.map((f) => ({ value: f._id, label: f.name }))}
                required
              />
            ) : (
              <Input
                label="Farmer ID"
                placeholder="Enter farmer ID (add farmers first)"
                value={form.farmerId}
                onChange={(e) => setForm({ ...form, farmerId: e.target.value })}
                required
              />
            )}
            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
            />
          </div>

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

      {/* Collection History */}
      {collections.length > 0 && (
        <Card className="overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h3 className="text-lg font-semibold text-slate-900">Collection History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                <tr>
                  <th className="text-left p-4">Date</th>
                  <th className="text-left p-4">Farmer</th>
                  <th className="text-left p-4">Morning</th>
                  <th className="text-left p-4">Evening</th>
                  <th className="text-left p-4">Total</th>
                  <th className="text-right p-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {collections.map((col) => (
                  <tr key={col._id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 font-medium">{formatDate(col.date)}</td>
                    <td className="p-4">{col.farmer?.name || col.farmer || 'Unknown User'}</td>
                    <td className="p-4">{formatQuantity(col.morning?.amount)}</td>
                    <td className="p-4">{formatQuantity(col.evening?.amount)}</td>
                    <td className="p-4 font-semibold text-primary-600">
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
