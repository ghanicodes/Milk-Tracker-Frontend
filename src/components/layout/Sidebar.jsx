import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Milk,
  Store,
  ShoppingCart,
  TrendingUp,
  Truck,
  ChevronLeft,
  ChevronRight,
  Droplets,
  ClipboardList,
} from 'lucide-react';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/farmers', label: 'Farmers', icon: Users },
  { path: '/milk-collection', label: 'Milk Collection', icon: Milk },
  { path: '/farmer-milk-history', label: 'Farmer Milk History', icon: ClipboardList },
  { path: '/retailers', label: 'Retailers', icon: Store },
  { path: '/sales', label: 'Sale Milk', icon: ShoppingCart },
  { path: '/open-rate', label: 'Open Rate Milk', icon: TrendingUp },
  { path: '/home-delivery', label: 'Home Delivery', icon: Truck },
];

export default function Sidebar({ isOpen, onToggle }) {
  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={onToggle}
        />
      )}

      <aside
        className={`
          fixed top-0 left-0 h-full z-40
          gradient-dark text-white
          transition-all duration-300 ease-in-out
          ${isOpen ? 'w-64' : 'w-0 lg:w-20'}
          overflow-hidden
        `}
      >
        <div className="flex flex-col h-full min-w-[80px]">
          {/* Logo */}
          <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
              <Droplets className="w-5 h-5 text-white" />
            </div>
            {isOpen && (
              <div className="animate-fade-in">
                <h1 className="text-lg font-bold">Abdul Raheem</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">Your Daily Milk Records</p>
              </div>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
                  transition-all duration-200 group relative
                  ${isActive
                    ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/10'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }
                `}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {isOpen && <span className="animate-fade-in">{item.label}</span>}
                {!isOpen && (
                  <div className="absolute left-full ml-3 px-2 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none hidden lg:block">
                    {item.label}
                  </div>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Collapse toggle (desktop only) */}
          <div className="hidden lg:block p-3 border-t border-white/10">
            <button
              onClick={onToggle}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-400 hover:text-white hover:bg-white/5 transition-all duration-200"
            >
              {isOpen ? (
                <>
                  <ChevronLeft className="w-4 h-4" />
                  <span className="animate-fade-in">Collapse</span>
                </>
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
