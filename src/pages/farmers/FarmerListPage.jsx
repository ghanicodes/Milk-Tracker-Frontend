import { useState, useEffect } from 'react';
import { Plus, Users, Phone, Banknote, Edit3, Trash2 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { farmerService } from '../../services/dataService';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function FarmerListPage() {
  const [farmers, setFarmers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingFarmer, setEditingFarmer] = useState(null);
  const [formLoading, setFormLoading] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    phone: '',
    advance: 0,
    defaultMilkType: 'Cow',
  });

  useEffect(() => {
    loadFarmers();
  }, []);

  const loadFarmers = async () => {
    try {
      setLoading(true);
      const res = await farmerService.getAll();
      setFarmers(res.data.farmers || []);
    } catch (err) {
      setFarmers([]);
      if (err.response?.status !== 404) {
        toast.error('Could not load farmers. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.defaultMilkType) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      await farmerService.add(form);
      toast.success('Farmer added successfully!');
      setShowModal(false);
      setForm({ name: '', phone: '', advance: 0, defaultMilkType: 'Cow' });
      loadFarmers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add farmer (Endpoint may be missing)');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (farmer) => {
    setEditingFarmer(farmer);
    setForm({
      name: farmer.name,
      phone: farmer.phone,
      advance: farmer.advance || 0,
      defaultMilkType: farmer.defaultMilkType || 'Cow',
    });
    setEditModalOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await farmerService.update(editingFarmer._id, form);
      toast.success('Farmer updated!');
      setEditModalOpen(false);
      loadFarmers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update farmer (Endpoint may be missing)');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this farmer? This might affect their milk collections.')) return;
    try {
      await farmerService.delete(id);
      toast.success('Farmer removed');
      loadFarmers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete farmer (Endpoint may be missing)');
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Farmers</h2>
          <p className="text-sm text-slate-500">Manage your milk suppliers</p>
        </div>
        <Button icon={Plus} onClick={() => {
          setForm({ name: '', phone: '', advance: 0, defaultMilkType: 'Cow' });
          setShowModal(true);
        }}>
          Add Farmer
        </Button>
      </div>

      {farmers.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No farmers found"
          description="Click the button above to register your first farmer, or ensure the backend API is running."
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {farmers.map((farmer) => (
            <Card key={farmer._id} hover className="p-5 group">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center text-lg font-bold text-emerald-700 flex-shrink-0">
                    {farmer.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">{farmer.name}</h3>
                    <div className="flex items-center gap-1.5 text-slate-400 text-xs mt-1">
                      <Phone className="w-3 h-3" />
                      {farmer.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEditModal(farmer)}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => handleDelete(farmer._id)}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                <Badge color={farmer.defaultMilkType?.toLowerCase() === 'cow' ? 'info' : 'warning'}>
                  {farmer.defaultMilkType}
                </Badge>
                {farmer.advance > 0 && (
                  <span className="text-xs font-medium text-amber-600 flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                    <Banknote className="w-3 h-3" />
                    Advance: {formatCurrency(farmer.advance)}
                   </span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Add / Edit Farmer Modal */}
      <Modal 
        isOpen={showModal || editModalOpen} 
        onClose={() => { setShowModal(false); setEditModalOpen(false); }} 
        title={editModalOpen ? "Edit Farmer" : "Add New Farmer"}
      >
        <form onSubmit={editModalOpen ? handleEditSubmit : handleSubmit} className="space-y-4">
          <Input
            label="Farmer Name"
            placeholder="Enter farmer name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            placeholder="Enter phone number"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            required
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Default Milk Type"
              value={form.defaultMilkType}
              onChange={(e) => setForm({ ...form, defaultMilkType: e.target.value })}
              options={[
                { value: 'Cow', label: 'Cow' },
                { value: 'Buffalo', label: 'Buffalo' },
              ]}
              required
            />
            <Input
              label="Advance Amount (₹)"
              type="number"
              placeholder="0"
              value={form.advance}
              onChange={(e) => setForm({ ...form, advance: Number(e.target.value) })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => { setShowModal(false); setEditModalOpen(false); }} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" loading={formLoading} className="flex-1">
              {editModalOpen ? "Update Farmer" : "Add Farmer"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
