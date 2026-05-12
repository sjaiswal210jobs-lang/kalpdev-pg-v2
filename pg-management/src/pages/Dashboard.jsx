import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import {
  BedDouble, Users, CreditCard, TrendingUp, Building2, AlertCircle, CheckCircle2, Percent
} from 'lucide-react';
import {
  getOccupancyStats, getMonthKey, getMonthlyCollection, getPendingRent,
  formatCurrency, TOTAL_ROOMS, TOTAL_BEDS, RENT_PER_PERSON, ALL_ROOMS, getRoomOccupancy
} from '../data/store';
import { useData } from '../data/DataContext';

export default function Dashboard() {
  const { tenants, rentRecords } = useData();
  const stats = getOccupancyStats(tenants);
  const currentMonth = getMonthKey();
  const collected = getMonthlyCollection(rentRecords, currentMonth);
  const pending = getPendingRent(tenants, rentRecords, currentMonth);

  const statCards = [
    { label: 'Total Rooms', value: TOTAL_ROOMS, icon: Building2, color: 'from-blue-500 to-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Total Beds', value: TOTAL_BEDS, icon: BedDouble, color: 'from-purple-500 to-purple-600', bg: 'bg-purple-50 dark:bg-purple-900/20' },
    { label: 'Occupied Beds', value: stats.occupied, icon: Users, color: 'from-green-500 to-green-600', bg: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Vacant Beds', value: stats.vacant, icon: AlertCircle, color: 'from-amber-500 to-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    { label: 'Monthly Collection', value: formatCurrency(collected), icon: CheckCircle2, color: 'from-emerald-500 to-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: 'Pending Rent', value: formatCurrency(pending), icon: CreditCard, color: 'from-red-500 to-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: 'Total Tenants', value: tenants.length, icon: Users, color: 'from-indigo-500 to-indigo-600', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
    { label: 'Occupancy Rate', value: `${stats.percentage}%`, icon: Percent, color: 'from-pink-500 to-pink-600', bg: 'bg-pink-50 dark:bg-pink-900/20' },
  ];

  const pieData = [
    { name: 'Occupied', value: stats.occupied },
    { name: 'Vacant', value: stats.vacant },
  ];
  const COLORS = ['#7C3AED', '#E5E7EB'];

  // Monthly collection data (last 6 months)
  const barData = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const mk = getMonthKey(d);
    const label = d.toLocaleDateString('en-IN', { month: 'short' });
    barData.push({ month: label, collected: getMonthlyCollection(rentRecords, mk) });
  }

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="stat-card"
          >
            <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center flex-shrink-0`}>
              <card.icon className={`w-6 h-6 bg-gradient-to-br ${card.color} bg-clip-text text-purple-600`} />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-white">{card.value}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{card.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Occupancy Pie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card-solid p-6"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Occupancy Rate</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {pieData.map((_, index) => (
                    <Cell key={index} fill={COLORS[index]} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex justify-center gap-6 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Occupied ({stats.occupied})</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-200"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">Vacant ({stats.vacant})</span>
            </div>
          </div>
        </motion.div>

        {/* Rent Collection Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card-solid p-6 lg:col-span-2"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Rent Collection (Last 6 Months)</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip formatter={(value) => formatCurrency(value)} />
                <Bar dataKey="collected" fill="#7C3AED" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Room Layout */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card-solid p-6"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-6">Room Occupancy Layout</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {ALL_ROOMS.map((room) => {
            const occupants = getRoomOccupancy(tenants, room.number);
            const count = occupants.length;
            let statusColor = 'border-red-200 bg-red-50 dark:bg-red-900/10';
            let statusBadge = 'badge-red';
            let statusText = 'Vacant';
            if (count === 2) {
              statusColor = 'border-green-200 bg-green-50 dark:bg-green-900/10';
              statusBadge = 'badge-green';
              statusText = 'Full';
            } else if (count === 1) {
              statusColor = 'border-amber-200 bg-amber-50 dark:bg-amber-900/10';
              statusBadge = 'badge-yellow';
              statusText = 'Partial';
            }

            return (
              <div key={room.number} className={`p-4 rounded-xl border-2 ${statusColor} transition-all hover:scale-105`}>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-gray-900 dark:text-white text-sm">Room {room.number}</span>
                  <span className={statusBadge}>{statusText}</span>
                </div>
                <div className="space-y-2">
                  <BedStatus label="Bed A" tenant={occupants.find(t => t.bed === 'A')} />
                  <BedStatus label="Bed B" tenant={occupants.find(t => t.bed === 'B')} />
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}

function BedStatus({ label, tenant }) {
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs ${
      tenant ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
    }`}>
      <BedDouble className="w-3 h-3" />
      <span className="truncate">{tenant ? tenant.name : `${label} - Empty`}</span>
    </div>
  );
}
