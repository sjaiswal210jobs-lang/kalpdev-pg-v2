import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, LineChart, Line } from 'recharts';
import { BarChart3, TrendingUp, TrendingDown, Building2 } from 'lucide-react';
import {
  getOccupancyStats, getMonthKey, getMonthlyCollection,
  formatCurrency, RENT_PER_PERSON, TOTAL_BEDS
} from '../data/store';
import { useData } from '../data/DataContext';

export default function Reports() {
  const { tenants, rentRecords, electricityRecords, expenses } = useData();
  const stats = getOccupancyStats(tenants);

  // Last 6 months data
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mk = getMonthKey(d);
    const label = d.toLocaleDateString('en-IN', { month: 'short', year: '2-digit' });
    const collected = getMonthlyCollection(rentRecords, mk);
    const potential = tenants.length * RENT_PER_PERSON;
    const elecRecovery = electricityRecords
      .filter(r => r.month === mk)
      .reduce((sum, r) => sum + r.totalBill, 0);

    monthlyData.push({
      month: label,
      collected,
      potential,
      electricity: elecRecovery,
    });
  }

  const currentMonth = getMonthKey();
  const currentCollection = getMonthlyCollection(rentRecords, currentMonth);
  const totalPotential = tenants.length * RENT_PER_PERSON;
  const vacantLoss = stats.vacant * RENT_PER_PERSON;
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const totalElecRecovery = electricityRecords.reduce((sum, r) => sum + r.totalBill, 0);

  const reportCards = [
    { label: 'Monthly Rent Collection', value: formatCurrency(currentCollection), icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Pending Rent', value: formatCurrency(totalPotential - currentCollection), icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Electricity Recovery', value: formatCurrency(totalElecRecovery), icon: BarChart3, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Vacant Room Loss', value: formatCurrency(vacantLoss), icon: Building2, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: TrendingDown, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Occupancy Rate', value: `${stats.percentage}%`, icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Financial Reports</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Overview of revenue, expenses, and occupancy</p>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card-solid p-5"
          >
            <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <div className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.label}</div>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-solid p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rent Collection Trend</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="collected" fill="#7C3AED" radius={[6, 6, 0, 0]} name="Collected" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-solid p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Electricity Recovery</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Line type="monotone" dataKey="electricity" stroke="#F59E0B" strokeWidth={3} dot={{ r: 5 }} name="Electricity" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
