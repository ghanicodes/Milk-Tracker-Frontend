import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCard } from '../components/ui/Card';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import Button from '../components/ui/Button';
import {
  Users, Store, Truck, ShoppingCart, TrendingUp,
  Milk, ArrowRight, Plus, Calendar
} from 'lucide-react';
import { retailerService, homeDeliveryService } from '../services/dataService';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    retailers: 0,
    homeDeliveries: 0,
    activeDeliveries: 0,
    totalBalance: 0,
  });
  const [recentCustomers, setRecentCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [retailerRes, deliveryRes] = await Promise.allSettled([
        retailerService.getAll({ page: 1, limit: 5 }),
        homeDeliveryService.getAll(),
      ]);

      const rData = retailerRes.status === 'fulfilled' ? retailerRes.value.data : {};
      const dData = deliveryRes.status === 'fulfilled' ? deliveryRes.value.data : {};

      const deliveries = dData.homeDeliveries || [];
      const active = deliveries.filter((d) => d.isActive);
      const totalBal = deliveries.reduce((sum, d) => sum + (d.balance || 0), 0);

      setStats({
        retailers: rData.total || 0,
        homeDeliveries: deliveries.length,
        activeDeliveries: active.length,
        totalBalance: totalBal,
      });

      setRecentCustomers(deliveries.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  const quickActions = [
    { label: 'Add Farmer', icon: Users, path: '/farmers', color: 'from-emerald-500 to-emerald-600' },
    { label: 'Record Milk', icon: Milk, path: '/milk-collection', color: 'from-sky-500 to-sky-600' },
    { label: 'Add Retailer', icon: Store, path: '/retailers', color: 'from-violet-500 to-violet-600' },
    { label: 'Record Sale', icon: ShoppingCart, path: '/sales', color: 'from-amber-500 to-amber-600' },
    { label: 'Add Delivery', icon: Truck, path: '/home-delivery', color: 'from-rose-500 to-rose-600' },
    { label: 'Open Rate', icon: TrendingUp, path: '/open-rate', color: 'from-primary-500 to-primary-600' },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 rounded-3xl p-8 text-white">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-white/5 rounded-full translate-y-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2">Good {getGreeting()}, Admin! 👋</h2>
          <p className="text-primary-100 text-sm sm:text-base max-w-lg">
            Here's an overview of your milk business. Monitor deliveries, track sales, and manage your team efficiently.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard
          icon={Store}
          title="Total Retailers"
          value={stats.retailers}
          subtitle="Registered retailers"
          color="primary"
        />
        <StatCard
          icon={Truck}
          title="Home Deliveries"
          value={stats.homeDeliveries}
          subtitle={`${stats.activeDeliveries} active`}
          color="emerald"
        />
        <StatCard
          icon={Users}
          title="Active Subscriptions"
          value={stats.activeDeliveries}
          subtitle="Currently active"
          color="sky"
        />
        <StatCard
          icon={TrendingUp}
          title="Outstanding Balance"
          value={`Rs ${stats.totalBalance.toLocaleString('en-IN')}`}
          subtitle="Pending payments"
          color="amber"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={() => navigate(action.path)}
              className="flex flex-col items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs font-semibold text-slate-600">{action.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Customers */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">Recent Home Delivery Customers</h3>
          <Button
            variant="ghost"
            size="sm"
            icon={ArrowRight}
            onClick={() => navigate('/home-delivery')}
          >
            View All
          </Button>
        </div>
        <div className="divide-y divide-slate-50">
          {recentCustomers.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400">No customers yet</div>
          ) : (
            recentCustomers.map((customer) => (
              <div
                key={customer._id}
                className="flex items-center justify-between p-4 px-6 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/home-delivery/${customer._id}`)}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-sm font-bold text-primary-700">
                    {customer.customerName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{customer.customerName}</p>
                    <p className="text-xs text-slate-400">{customer.area || customer.customerAddress}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">Rs {(customer.balance || 0).toLocaleString('en-IN')}</p>
                  <span className={`text-xs font-medium ${customer.isActive ? 'text-emerald-500' : 'text-red-400'}`}>
                    {customer.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'Morning';
  if (hour < 17) return 'Afternoon';
  return 'Evening';
}
