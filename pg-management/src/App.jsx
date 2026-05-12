import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import AdminLogin from './pages/AdminLogin';
import StudentLogin from './pages/StudentLogin';
import StudentDashboard from './pages/StudentDashboard';
import Dashboard from './pages/Dashboard';
import RoomsBeds from './pages/RoomsBeds';
import Tenants from './pages/Tenants';
import RentCollection from './pages/RentCollection';
import ElectricityBills from './pages/ElectricityBills';
import Expenses from './pages/Expenses';
import Visitors from './pages/Visitors';
import Reports from './pages/Reports';
import Notices from './pages/Notices';
import WebsiteEditor from './pages/WebsiteEditor';
import PaymentTracker from './pages/PaymentTracker';
import SharingManagement from './pages/SharingManagement';
import RewardsAdmin from './pages/RewardsAdmin';
import Settings from './pages/Settings';
import Sidebar from './components/Sidebar';
import TopBar from './components/TopBar';
import { getDarkMode, setDarkMode as saveDarkMode, isAdminLoggedIn, isStudentLoggedIn } from './data/store';
import { DataProvider } from './data/DataContext';

function AdminProtected({ children }) {
  if (!isAdminLoggedIn()) {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

function StudentProtected({ children }) {
  if (!isStudentLoggedIn()) {
    return <Navigate to="/student/login" replace />;
  }
  return children;
}

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(getDarkMode());

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkMode(darkMode);
  }, [darkMode]);

  return (
    <div className="flex min-h-screen bg-cream-50 dark:bg-gray-900 font-poppins">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 lg:ml-72">
        <TopBar
          onMenuClick={() => setSidebarOpen(true)}
          darkMode={darkMode}
          onToggleDark={() => setDarkMode(!darkMode)}
        />
        <main className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/rooms" element={<RoomsBeds />} />
            <Route path="/tenants" element={<Tenants />} />
            <Route path="/rent" element={<RentCollection />} />
            <Route path="/electricity" element={<ElectricityBills />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/visitors" element={<Visitors />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/notices" element={<Notices />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/website" element={<WebsiteEditor />} />
            <Route path="/payments" element={<PaymentTracker />} />
            <Route path="/sharing" element={<SharingManagement />} />
            <Route path="/rewards" element={<RewardsAdmin />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route
            path="/student/dashboard"
            element={
              <StudentProtected>
                <StudentDashboard />
              </StudentProtected>
            }
          />
          <Route
            path="/admin/*"
            element={
              <AdminProtected>
                <AdminLayout />
              </AdminProtected>
            }
          />
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
