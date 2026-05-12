import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Building2, LogOut, User, Phone, Mail, MapPin, Calendar, CreditCard,
  Zap, BedDouble, FileText, Bell, Moon, Sun, MessageCircle, Gift
} from 'lucide-react';
import {
  getLoggedInStudent, studentLogout, getTenantRentHistory, getTenantElectricity,
  formatCurrency, formatDate, getMonthKey,
  RENT_PER_PERSON, getDarkMode, setDarkMode as saveDarkMode
} from '../data/store';
import { useData } from '../data/DataContext';
import StudentRewards from './StudentRewards';

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { rentRecords, electricityRecords, notices } = useData();
  const [tenant, setTenant] = useState(null);
  const [darkMode, setDarkMode] = useState(getDarkMode());
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const t = getLoggedInStudent();
    if (!t) {
      navigate('/student/login', { replace: true });
      return;
    }
    setTenant(t);
  }, [navigate]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveDarkMode(darkMode);
  }, [darkMode]);

  const handleLogout = () => {
    studentLogout();
    navigate('/student/login');
  };

  if (!tenant) return null;

  const rentHistory = getTenantRentHistory(rentRecords, tenant.id);
  const tenantElectricity = getTenantElectricity(electricityRecords, tenant.roomNumber);
  const currentMonth = getMonthKey();
  const isCurrentMonthPaid = rentHistory.some(r => r.month === currentMonth && r.paid);

  const tabs = [
    { id: 'overview', label: 'Overview', icon: User },
    { id: 'rent', label: 'Rent History', icon: CreditCard },
    { id: 'electricity', label: 'Electricity', icon: Zap },
    { id: 'notices', label: 'Notices', icon: Bell },
    { id: 'rewards', label: 'Rewards', icon: Gift },
  ];

  return (
    <div className="min-h-screen font-poppins bg-cream-50 dark:bg-gray-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-b border-gray-100 dark:border-gray-700">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white text-sm">KalpDev PG</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">Student Portal</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition"
            >
              {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition text-sm font-medium"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Welcome Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-3xl p-8 mb-8 text-white relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
          <div className="relative">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Welcome, {tenant.name}!</h2>
                <p className="text-white/70">Room {tenant.roomNumber} • Bed {tenant.bed}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{formatCurrency(RENT_PER_PERSON)}</div>
                <div className="text-xs text-white/70">Monthly Rent</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold">{tenant.roomNumber}</div>
                <div className="text-xs text-white/70">Room No.</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className="text-lg font-bold">Bed {tenant.bed}</div>
                <div className="text-xs text-white/70">Bed Assigned</div>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${isCurrentMonthPaid ? 'text-green-300' : 'text-yellow-300'}`}>
                  {isCurrentMonthPaid ? 'Paid' : 'Pending'}
                </div>
                <div className="text-xs text-white/70">This Month</div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-purple-600 text-white shadow-premium'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'overview' && (
            <div className="grid md:grid-cols-2 gap-6">
              {/* Personal Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-purple-600" />
                  Personal Information
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={User} label="Full Name" value={tenant.name} />
                  <InfoRow icon={Phone} label="Phone" value={tenant.phone} />
                  <InfoRow icon={Mail} label="Email" value={tenant.email || 'Not provided'} />
                  <InfoRow icon={MapPin} label="Address" value={tenant.address || 'Not provided'} />
                  <InfoRow icon={FileText} label="Aadhaar" value={tenant.aadhaar || 'Not provided'} />
                  <InfoRow icon={Phone} label="Emergency" value={tenant.emergency || 'Not provided'} />
                </div>
              </div>

              {/* Room Info */}
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-card">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <BedDouble className="w-5 h-5 text-purple-600" />
                  Room Details
                </h3>
                <div className="space-y-4">
                  <InfoRow icon={Building2} label="Room Number" value={tenant.roomNumber} />
                  <InfoRow icon={BedDouble} label="Bed" value={`Bed ${tenant.bed}`} />
                  <InfoRow icon={CreditCard} label="Monthly Rent" value={formatCurrency(RENT_PER_PERSON)} />
                  <InfoRow icon={CreditCard} label="Deposit Paid" value={formatCurrency(tenant.deposit || 0)} />
                  <InfoRow icon={Calendar} label="Join Date" value={formatDate(tenant.joinDate)} />
                </div>
                {/* WhatsApp Contact */}
                <a
                  href="https://wa.me/919999999999"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-6 flex items-center justify-center gap-2 w-full py-3 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-xl hover:bg-green-100 dark:hover:bg-green-900/30 transition font-medium text-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Contact Owner on WhatsApp
                </a>
              </div>
            </div>
          )}

          {activeTab === 'rent' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-purple-600" />
                  Rent Payment History
                </h3>
              </div>
              {rentHistory.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No rent payment records yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Paid Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {rentHistory.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{r.month}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(r.amount || RENT_PER_PERSON)}</td>
                          <td className="px-6 py-4">
                            <span className="badge-green">Paid</span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatDate(r.paidDate)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'electricity' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Electricity Bill History
                </h3>
              </div>
              {tenantElectricity.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <Zap className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No electricity records for your room yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room Bill</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Your Share</th>
                        <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Occupants</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                      {tenantElectricity.map((r, i) => (
                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                          <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{r.month}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{formatCurrency(r.totalBill)}</td>
                          <td className="px-6 py-4 text-sm font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(r.perPersonAmount)}</td>
                          <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{r.occupants}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'notices' && (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-card overflow-hidden">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Bell className="w-5 h-5 text-purple-600" />
                  Notices & Announcements
                </h3>
              </div>
              {notices.length === 0 ? (
                <div className="p-12 text-center text-gray-500 dark:text-gray-400">
                  <Bell className="w-12 h-12 mx-auto mb-3 opacity-30" />
                  <p>No notices posted yet.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {notices.slice().reverse().map((notice, i) => (
                    <div key={i} className="p-6">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h4>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{formatDate(notice.createdAt)}</span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300">{notice.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rewards' && (
            <StudentRewards />
          )}
        </motion.div>
      </div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
      <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <Icon className="w-4 h-4" />
        <span className="text-sm">{label}</span>
      </div>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
