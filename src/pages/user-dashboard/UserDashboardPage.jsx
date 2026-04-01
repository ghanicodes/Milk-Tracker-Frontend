import { useState, useEffect } from 'react';
import { Truck, Calendar, Wallet, CheckCircle, XCircle } from 'lucide-react';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { homeDeliveryService } from '../../services/dataService';
import { formatCurrency, formatDate } from '../../utils/formatters';

export default function UserDashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMyDelivery();
  }, []);

  const loadMyDelivery = async () => {
    try {
      const res = await homeDeliveryService.getMyDelivery();
      setData(res.data.homeDelivery);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage text="Loading your dashboard..." />;

  if (!data) {
    return (
      <div className="mt-10">
        <EmptyState 
          icon={Truck} 
          title="No Delivery Set Up" 
          description="You don't have an active home delivery subscription yet. Please contact the admin." 
        />
      </div>
    );
  }

  const { customerAddress, area, milkType, quantity, pricePerLiter, startDate, deliverySchedule, deliveryHistory, ledger, balance, paymentType } = data;

  const totalDelivered = deliveryHistory?.filter(d => d.status === 'delivered').length || 0;
  const totalMissed = deliveryHistory?.filter(d => d.status === 'missed').length || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-slate-900">My Subscription Dashboard</h2>
        <p className="text-sm text-slate-500">Track your daily milk deliveries and payments</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-gradient-to-br from-primary-500 to-primary-700 text-white border-0 shadow-lg shadow-primary-500/25">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <p className="font-semibold opacity-90">Daily Milk</p>
          </div>
          <p className="text-3xl font-bold mb-1">{quantity} L</p>
          <p className="text-sm text-primary-100 capitalize">{milkType} Milk • {deliverySchedule}</p>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Calendar className="w-5 h-5 text-indigo-500" />
              Delivery Stats
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <p className="text-2xl font-bold text-emerald-600 mb-1">{totalDelivered}</p>
              <p className="text-xs text-slate-400">Delivered</p>
            </div>
            <div className="flex-1">
              <p className="text-2xl font-bold text-rose-500 mb-1">{totalMissed}</p>
              <p className="text-xs text-slate-400">Missed</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-500 font-medium">
              <Wallet className="w-5 h-5 text-amber-500" />
              Current Balance
            </div>
          </div>
          <p className={`text-3xl font-bold mb-1 ${balance > 0 ? 'text-rose-500' : 'text-emerald-500'}`}>
            {formatCurrency(balance)}
          </p>
          <p className="text-sm text-slate-500 capitalize">{paymentType} Billing</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="overflow-hidden h-96 flex flex-col">
          <div className="p-5 border-b border-slate-100 font-semibold text-slate-800">Recent Deliveries</div>
          <div className="flex-1 overflow-y-auto p-2">
            {!deliveryHistory?.length ? (
              <p className="text-center text-sm text-slate-500 py-6">No deliveries recorded yet.</p>
            ) : (
              <div className="space-y-2 p-2">
                {[...deliveryHistory].reverse().map((d, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      {d.status === 'delivered' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-rose-400" />}
                      <div>
                        <p className="font-medium text-slate-800 text-sm">{formatDate(d.date)}</p>
                        <p className="text-xs text-slate-500">{d.status === 'delivered' ? 'Delivered successfully' : 'Delivery missed'}</p>
                      </div>
                    </div>
                    <Badge color={d.status === 'delivered' ? 'success' : 'danger'}>{d.quantity} L</Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>

        <Card className="overflow-hidden h-96 flex flex-col">
          <div className="p-5 border-b border-slate-100 font-semibold text-slate-800">Ledger Details</div>
          <div className="flex-1 overflow-y-auto p-2">
            {!ledger?.length ? (
              <p className="text-center text-sm text-slate-500 py-6">No ledger entries found.</p>
            ) : (
              <div className="space-y-2 p-2">
                {[...ledger].reverse().map((l, i) => (
                  <div key={i} className="flex justify-between items-center p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                    <div>
                      <p className="font-medium text-slate-800 text-sm">{l.description}</p>
                      <p className="text-xs text-slate-500">{formatDate(l.date)}</p>
                    </div>
                    <p className={`font-bold text-sm ${l.type === 'debit' ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {l.type === 'debit' ? '-' : '+'}{formatCurrency(l.amount)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>

    </div>
  );
}
