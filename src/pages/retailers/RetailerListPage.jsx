import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Store, Search, Phone, MapPin, Trash2, Edit3 } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Card from '../../components/ui/Card';
import Modal from '../../components/ui/Modal';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { retailerService } from '../../services/dataService';
import { formatCurrency } from '../../utils/formatters';
import toast from 'react-hot-toast';

export default function RetailerListPage() {
  const [retailers, setRetailers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editingRetailer, setEditingRetailer] = useState(null);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: '', phone: '', address: '', defaultMilkType: '',
    milkPrices: { cow: 0, buffalo: 0 },
  });

  useEffect(() => {
    loadRetailers();
  }, [page]);

  const loadRetailers = async () => {
    setLoading(true);
    try {
      const res = await retailerService.getAll({ page, limit: 12 });
      setRetailers(res.data.retailers || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      setRetailers([]);
    } finally {
      setLoading(false);
    }
  };

  const openAddModal = () => {
    setEditingRetailer(null);
    setForm({ name: '', phone: '', address: '', defaultMilkType: '', milkPrices: { cow: 0, buffalo: 0 } });
    setShowModal(true);
  };

  const openEditModal = (retailer) => {
    setEditingRetailer(retailer);
    setForm({
      name: retailer.name,
      phone: retailer.phone,
      address: retailer.address,
      defaultMilkType: retailer.defaultMilkType,
      milkPrices: retailer.milkPrices || { cow: 0, buffalo: 0 },
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.address || !form.defaultMilkType) {
      toast.error('Please fill all required fields');
      return;
    }
    setFormLoading(true);
    try {
      if (editingRetailer) {
        await retailerService.update(editingRetailer._id, form);
        toast.success('Retailer updated!');
      } else {
        await retailerService.add(form);
        toast.success('Retailer added!');
      }
      setShowModal(false);
      loadRetailers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this retailer?')) return;
    try {
      await retailerService.delete(id);
      toast.success('Retailer deleted');
      loadRetailers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const filteredRetailers = retailers.filter(
    (r) => r.name?.toLowerCase().includes(search.toLowerCase()) ||
           r.phone?.includes(search) ||
           r.address?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">Retailers</h2>
          <p className="text-sm text-slate-500">{retailers.length} retailer(s) registered</p>
        </div>
        <Button icon={Plus} onClick={openAddModal}>Add Retailer</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          placeholder="Search retailers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
          id="retailer-search"
        />
      </div>

      {filteredRetailers.length === 0 ? (
        <EmptyState
          icon={Store}
          title="No retailers found"
          description={search ? 'Try a different search term.' : 'Add your first retailer to get started.'}
          actionLabel={!search ? 'Add Retailer' : undefined}
          onAction={!search ? openAddModal : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredRetailers.map((retailer) => (
            <Card key={retailer._id} hover className="p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-violet-100 to-violet-200 flex items-center justify-center text-lg font-bold text-violet-700 flex-shrink-0">
                    {retailer.name?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 truncate">{retailer.name}</h3>
                    <div className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
                      <Phone className="w-3 h-3" />
                      {retailer.phone}
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(retailer); }}
                    className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-primary-500 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); handleDelete(retailer._id); }}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs mb-3">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{retailer.address}</span>
              </div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Badge color={retailer.defaultMilkType?.toLowerCase() === 'cow' ? 'info' : 'warning'}>
                  {retailer.defaultMilkType}
                </Badge>
                <div className="text-xs text-slate-500">
                  <span>🐄 {formatCurrency(retailer.milkPrices?.cow)}</span>
                  <span className="mx-1.5">•</span>
                  <span>🐃 {formatCurrency(retailer.milkPrices?.buffalo)}</span>
                </div>
              </div>
              <button
                onClick={() => navigate(`/sales?retailerId=${retailer._id}`)}
                className="w-full mt-3 text-xs text-primary-600 font-medium py-2 rounded-lg hover:bg-primary-50 transition-colors"
              >
                View Sales →
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`w-9 h-9 rounded-xl text-sm font-medium transition-all ${
                page === i + 1
                  ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/25'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingRetailer ? 'Edit Retailer' : 'Add New Retailer'}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" placeholder="Retailer name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
          <Input label="Phone" placeholder="Phone number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
          <Input label="Address" placeholder="Full address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} required />
          <Select label="Default Milk Type" value={form.defaultMilkType} onChange={(e) => setForm({ ...form, defaultMilkType: e.target.value })}
            options={[{ value: 'Cow', label: 'Cow' }, { value: 'Buffalo', label: 'Buffalo' }]} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Cow Price (Rs/L)" type="number" value={form.milkPrices.cow}
              onChange={(e) => setForm({ ...form, milkPrices: { ...form.milkPrices, cow: Number(e.target.value) } })} />
            <Input label="Buffalo Price (Rs/L)" type="number" value={form.milkPrices.buffalo}
              onChange={(e) => setForm({ ...form, milkPrices: { ...form.milkPrices, buffalo: Number(e.target.value) } })} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowModal(false)} className="flex-1">Cancel</Button>
            <Button type="submit" loading={formLoading} className="flex-1">{editingRetailer ? 'Update' : 'Add'} Retailer</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
