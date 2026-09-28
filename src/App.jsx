import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import { useSpeak } from './context/SpeakContext';
import Layout from './components/Layout';
import SpeakAssistant from './components/SpeakAssistant';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';

import SellerDashboard from './pages/seller/SellerDashboard';
import SellerResults from './pages/seller/SellerResults';
import SellerRequests from './pages/seller/SellerRequests';
import SellerDeals from './pages/seller/SellerDeals';
import SellerChat from './pages/seller/SellerChat';

import CompanyDashboard from './pages/company/CompanyDashboard';
import CompanyProducts from './pages/company/CompanyProducts';
import CompanyDistributors from './pages/company/CompanyDistributors';
import CompanyRequests from './pages/company/CompanyRequests';
import CompanyDeals from './pages/company/CompanyDeals';
import CompanyChat from './pages/company/CompanyChat';

import DistributorDashboard from './pages/distributor/DistributorDashboard';
import DistributorRequests from './pages/distributor/DistributorRequests';
import DistributorDeals from './pages/distributor/DistributorDeals';
import DistributorChat from './pages/distributor/DistributorChat';

import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDeals from './pages/admin/AdminDeals';
import AdminCompanies from './pages/admin/AdminCompanies';
import AdminPending from './pages/admin/AdminPending';

import NotFound from './pages/NotFound';

const ROLE_BASE = {
  ROLE_COMPANY: '/company',
  ROLE_DISTRIBUTOR: '/distributor',
  ROLE_ADMIN: '/admin',
  ROLE_SELLER: '/seller',
};

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={ROLE_BASE[user.role] || '/seller'} replace />;
}

function RequireRole({ role, children }) {
  const { user, initializing } = useAuth();
  const location = useLocation();
  if (initializing) return <div className="spinner" />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  if (user.role !== role) {
    return <Navigate to={ROLE_BASE[user.role] || '/seller'} replace />;
  }
  return children;
}

export default function App() {
  const { user, initializing } = useAuth();
  const { toggle, playing } = useSpeak();

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={
            initializing ? (
              <div className="spinner" />
            ) : user ? (
              <RoleRedirect />
            ) : (
              <Landing />
            )
          }
        />
        <Route path="/login" element={user ? <RoleRedirect /> : <Login />} />
        <Route path="/signup" element={user ? <RoleRedirect /> : <Signup />} />

        <Route path="/seller" element={<RequireRole role="ROLE_SELLER"><Layout /></RequireRole>}>
          <Route index element={<SellerDashboard />} />
          <Route path="results" element={<SellerResults />} />
          <Route path="requests" element={<SellerRequests />} />
          <Route path="deals" element={<SellerDeals />} />
          <Route path="chat/:otherId" element={<SellerChat />} />
        </Route>

        <Route path="/company" element={<RequireRole role="ROLE_COMPANY"><Layout /></RequireRole>}>
          <Route index element={<CompanyDashboard />} />
          <Route path="products" element={<CompanyProducts />} />
          <Route path="distributors" element={<CompanyDistributors />} />
          <Route path="requests" element={<CompanyRequests />} />
          <Route path="deals" element={<CompanyDeals />} />
          <Route path="chat/:otherId" element={<CompanyChat />} />
        </Route>

        <Route path="/distributor" element={<RequireRole role="ROLE_DISTRIBUTOR"><Layout /></RequireRole>}>
          <Route index element={<DistributorDashboard />} />
          <Route path="requests" element={<DistributorRequests />} />
          <Route path="deals" element={<DistributorDeals />} />
          <Route path="chat/:otherId" element={<DistributorChat />} />
        </Route>

        <Route path="/admin" element={<RequireRole role="ROLE_ADMIN"><Layout /></RequireRole>}>
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="deals" element={<AdminDeals />} />
          <Route path="companies" element={<AdminCompanies />} />
          <Route path="pending" element={<AdminPending />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>

      <SpeakAssistant onToggle={toggle} playing={playing} />
    </>
  );
}