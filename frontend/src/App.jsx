import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AuthProvider from './context/AuthContext';
import AccountProvider from './context/AccountContext';
import CurrencyProvider from './context/CurrencyContext';
import  ProtectedRoute  from './components/Auth/ProtectedRoute';
import Navbar from './components/Layout/Navbar';
import Sidebar from './components/Layout/Sidebar';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Accounts from './pages/Accounts';
import Transactions from './pages/Transactions';
import Budgets from './pages/Budgets';
import Analytics from './pages/Analytics';
import BabySteps from './pages/BabySteps';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

import { Outlet } from 'react-router-dom';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CurrencyProvider>
          <AccountProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Protected Routes with Layout */}
              <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/accounts" element={<Accounts />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/budgets" element={<Budgets />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/babysteps" element={<BabySteps />} />
                <Route path="/settings" element={<Settings />} />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AccountProvider>
        </CurrencyProvider>
      </AuthProvider>
    </Router>
  );
}

const AppLayout = () => {
  return (
    <div className="app-layout">
      <Navbar />
      <div className="app-content" style={{ display: 'flex' }}>
        <Sidebar />
        <main className="main-content" style={{ flex: 1 }}>
          <Outlet /> {/* <--- THIS IS REQUIRED FOR NESTED ROUTES */}
        </main>
      </div>
    </div>
  );
};

export default App;