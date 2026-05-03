import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Layout
import Layout from './components/layout/Layout';
import UserLayout from './components/layout/UserLayout';
import LoadingSpinner from './components/ui/LoadingSpinner';

// Pages
import LandingPage from './pages/landing/LandingPage';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FarmerListPage from './pages/farmers/FarmerListPage';
import FarmerHistoryPage from './pages/farmers/FarmerHistoryPage';
import FarmerMilkHistoryPage from './pages/farmers/FarmerMilkHistoryPage';
import MilkCollectionPage from './pages/milk/MilkCollectionPage';
import RetailerListPage from './pages/retailers/RetailerListPage';
import SaleMilkPage from './pages/sales/SaleMilkPage';
import OpenRateMilkPage from './pages/open-rate/OpenRateMilkPage';
import CustomerListPage from './pages/home-delivery/CustomerListPage';
import CustomerDetailPage from './pages/home-delivery/CustomerDetailPage';
import UserDashboardPage from './pages/user-dashboard/UserDashboardPage';

// Protected Route Wrapper
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, loading } = useAuth();
  
  if (loading) return <LoadingSpinner fullPage text="Checking authentication..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/user-dashboard'} replace />;
  }
  
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Page — default route */}
      <Route path="/" element={<LandingPage />} />

      <Route path="/login" element={<LoginPage />} />
      
      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><Layout /></ProtectedRoute>}>
        <Route index element={<DashboardPage />} />
        
        {/* Farmers & Milk Collection */}
        <Route path="farmers" element={<FarmerListPage />} />
        <Route path="farmers/:id/history" element={<FarmerHistoryPage />} />
        <Route path="farmer-milk-history" element={<FarmerMilkHistoryPage />} />
        <Route path="milk-collection" element={<MilkCollectionPage />} />
        
        {/* Retailers & Sales */}
        <Route path="retailers" element={<RetailerListPage />} />
        <Route path="sales" element={<SaleMilkPage />} />
        
        {/* Open Market */}
        <Route path="open-rate" element={<OpenRateMilkPage />} />
        
        {/* Home Delivery */}
        <Route path="home-delivery">
          <Route index element={<CustomerListPage />} />
          <Route path=":id" element={<CustomerDetailPage />} />
        </Route>
      </Route>

      {/* User Routes */}
      <Route path="/user-dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserLayout /></ProtectedRoute>}>
        <Route index element={<UserDashboardPage />} />
      </Route>
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 3000,
            style: {
              background: '#333',
              color: '#fff',
              borderRadius: '12px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#fff' },
            },
            error: {
              iconTheme: { primary: '#EF4444', secondary: '#fff' },
            },
          }}
        />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
