import { useAuth } from '../../context/AuthContext';
import { Menu, LogOut, Bell } from 'lucide-react';
import { useLocation } from 'react-router-dom';

const pageTitles = {
  '/': 'Dashboard',
  '/farmers': 'Farmer Management',
  '/milk-collection': 'Milk Collection',
  '/retailers': 'Retailer Management',
  '/sales': 'Sale Milk',
  '/open-rate': 'Open Rate Milk',
  '/home-delivery': 'Home Delivery',
};

export default function Header({ onMenuToggle }) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const getTitle = () => {
    const match = Object.keys(pageTitles).find((path) =>
      location.pathname === path || (path !== '/' && location.pathname.startsWith(path))
    );
    return pageTitles[match] || 'Milk Tracker';
  };

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-lg border-b border-slate-100">
      <div className="flex items-center justify-between px-4 lg:px-8 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden transition-colors"
            id="menu-toggle"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{getTitle()}</h1>
            <p className="text-xs text-slate-400 hidden sm:block">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-colors relative">
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-primary-500 rounded-full"></span>
          </button>

          <div className="hidden sm:flex items-center gap-3 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-xs font-bold text-white uppercase">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="hidden md:block">
              <p className="text-sm font-semibold text-slate-700 capitalize">{user?.name || 'Admin'}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role || 'Manager'}</p>
            </div>
          </div>

          <button
            onClick={logout}
            className="p-2.5 rounded-xl text-slate-400 hover:bg-red-50 hover:text-red-500 transition-colors"
            id="logout-btn"
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
