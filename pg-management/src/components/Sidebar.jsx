import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BedDouble, Users, CreditCard, Zap, Receipt,
  UserCheck, BarChart3, Bell, Settings, LogOut, Building2, X, Globe, AlertCircle, Share2, Gift
} from 'lucide-react';
import { adminLogout } from '../data/store';

const navItems = [
  { path: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { path: '/admin/rooms', icon: BedDouble, label: 'Rooms & Beds' },
  { path: '/admin/tenants', icon: Users, label: 'Tenants' },
  { path: '/admin/rent', icon: CreditCard, label: 'Rent Collection' },
  { path: '/admin/payments', icon: AlertCircle, label: 'Payment Tracker' },
  { path: '/admin/electricity', icon: Zap, label: 'Electricity Bills' },
  { path: '/admin/expenses', icon: Receipt, label: 'Expenses' },
  { path: '/admin/visitors', icon: UserCheck, label: 'Visitors' },
  { path: '/admin/sharing', icon: Share2, label: 'Sharing & Referrals' },
  { path: '/admin/rewards', icon: Gift, label: 'Rewards & Affiliate' },
  { path: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { path: '/admin/notices', icon: Bell, label: 'Notices' },
  { path: '/admin/website', icon: Globe, label: 'Website Editor' },
  { path: '/admin/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ isOpen, onClose }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate('/admin/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 z-50 flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-premium">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-gray-900 dark:text-white">KalpDev</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400">PG Management</p>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-2 overflow-y-auto">
          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>
    </>
  );
}
