import { Outlet } from 'react-router-dom';
import Header from './Header';

export default function UserLayout() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Hide the hamburger menu in the User Header by passing a no-op */}
      <Header onMenuToggle={() => {}} />
      <main className="p-4 lg:p-8 flex-1 max-w-5xl mx-auto w-full">
        <div className="page-transition">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
