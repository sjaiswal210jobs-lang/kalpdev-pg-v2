import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, ChevronLeft, ChevronRight, Check, Undo2, CheckCircle2, Clock } from 'lucide-react';
import {
  markRentPaid, markRentUnpaid, getMonthKey,
  formatCurrency, formatDate, RENT_PER_PERSON
} from '../data/store';
import { useData } from '../data/DataContext';

export default function RentCollection() {
  const { tenants, rentRecords } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthKey = getMonthKey(currentDate);
  const monthLabel = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

  const paidTenants = tenants.filter(t => rentRecords.some(r => r.tenantId === t.id && r.month === monthKey && r.paid));
  const unpaidTenants = tenants.filter(t => !rentRecords.some(r => r.tenantId === t.id && r.month === monthKey && r.paid));

  const collected = paidTenants.length * RENT_PER_PERSON;
  const pending = unpaidTenants.length * RENT_PER_PERSON;

  const prevMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() - 1);
    setCurrentDate(d);
  };

  const nextMonth = () => {
    const d = new Date(currentDate);
    d.setMonth(d.getMonth() + 1);
    setCurrentDate(d);
  };

  const handleMarkPaid = async (tenantId) => {
    await markRentPaid(tenantId, monthKey, RENT_PER_PERSON);
  };

  const handleMarkUnpaid = async (tenantId) => {
    await markRentUnpaid(tenantId, monthKey);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rent Collection</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track monthly rent payments</p>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between glass-card-solid p-4">
        <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{monthLabel}</h2>
        <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition">
          <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-100 dark:border-green-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <span className="text-sm font-medium text-green-700 dark:text-green-400">Collected</span>
          </div>
          <div className="text-2xl font-bold text-green-800 dark:text-green-300">{formatCurrency(collected)}</div>
          <div className="text-sm text-green-600 dark:text-green-400 mt-1">{paidTenants.length} tenants paid</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="p-6 rounded-2xl bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-100 dark:border-amber-800"
        >
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6 text-amber-600" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">Pending</span>
          </div>
          <div className="text-2xl font-bold text-amber-800 dark:text-amber-300">{formatCurrency(pending)}</div>
          <div className="text-sm text-amber-600 dark:text-amber-400 mt-1">{unpaidTenants.length} tenants pending</div>
        </motion.div>
      </div>

      {/* Rent Table */}
      <div className="glass-card-solid overflow-hidden">
        {tenants.length === 0 ? (
          <div className="p-12 text-center">
            <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No tenants to show. Add tenants first.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tenant</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {tenants.map((t) => {
                  const isPaid = rentRecords.some(r => r.tenantId === t.id && r.month === monthKey && r.paid);
                  return (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                            <span className="text-xs font-bold text-purple-600 dark:text-purple-400">{t.name[0]}</span>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">Room {t.roomNumber} • Bed {t.bed}</td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(RENT_PER_PERSON)}</td>
                      <td className="px-6 py-4">
                        {isPaid ? (
                          <span className="badge-green">Paid</span>
                        ) : (
                          <span className="badge-yellow">Pending</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => handleMarkUnpaid(t.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-medium hover:bg-red-100 transition"
                          >
                            <Undo2 className="w-3 h-3" /> Undo
                          </button>
                        ) : (
                          <button
                            onClick={() => handleMarkPaid(t.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-xs font-medium hover:bg-green-100 transition"
                          >
                            <Check className="w-3 h-3" /> Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
