import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CreditCard, AlertTriangle, CheckCircle2, Clock, Send, MessageCircle,
  ChevronLeft, ChevronRight, Bell
} from 'lucide-react';
import {
  getPaymentStatus, getMonthKey, formatCurrency, formatDate,
  RENT_PER_PERSON, addPaymentReminder
} from '../data/store';
import { useData } from '../data/DataContext';

export default function PaymentTracker() {
  const { tenants, rentRecords, paymentReminders } = useData();
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthKey = getMonthKey(currentDate);
  const monthLabel = currentDate.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });
  const paymentStatus = getPaymentStatus(tenants, rentRecords, monthKey);

  const paid = paymentStatus.filter(t => t.isPaid);
  const unpaid = paymentStatus.filter(t => !t.isPaid);
  const overdue = paymentStatus.filter(t => t.isOverdue);

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

  const sendWhatsAppReminder = async (tenant) => {
    const message = encodeURIComponent(
      `Hi ${tenant.name}, this is a gentle reminder from KalpDev PG. Your rent of ₹${RENT_PER_PERSON} for ${monthLabel} is pending. Please pay at your earliest convenience. Thank you!`
    );
    window.open(`https://wa.me/91${tenant.phone}?text=${message}`, '_blank');

    await addPaymentReminder({
      tenantId: tenant.id,
      tenantName: tenant.name,
      month: monthKey,
      amount: RENT_PER_PERSON,
      type: 'whatsapp',
    });
  };

  const sendBulkReminder = async () => {
    if (unpaid.length === 0) return;
    for (const tenant of unpaid) {
      await addPaymentReminder({
        tenantId: tenant.id,
        tenantName: tenant.name,
        month: monthKey,
        amount: RENT_PER_PERSON,
        type: 'bulk',
      });
    }
    alert(`Reminders logged for ${unpaid.length} tenants. Use WhatsApp buttons to send individually.`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Tracker</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Track payments, overdue rent, and send reminders</p>
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard icon={CreditCard} label="Total Due" value={formatCurrency(paymentStatus.length * RENT_PER_PERSON)} color="bg-purple-50 dark:bg-purple-900/20 text-purple-600" />
        <StatCard icon={CheckCircle2} label="Paid" value={`${paid.length} tenants`} color="bg-green-50 dark:bg-green-900/20 text-green-600" />
        <StatCard icon={Clock} label="Pending" value={`${unpaid.length} tenants`} color="bg-amber-50 dark:bg-amber-900/20 text-amber-600" />
        <StatCard icon={AlertTriangle} label="Overdue" value={`${overdue.length} tenants`} color="bg-red-50 dark:bg-red-900/20 text-red-600" />
      </div>

      {/* Overdue Alert */}
      {overdue.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500" />
            <div>
              <p className="font-semibold text-red-700 dark:text-red-400">{overdue.length} tenant(s) overdue!</p>
              <p className="text-sm text-red-600 dark:text-red-400">Rent was due on 5th {monthLabel}</p>
            </div>
          </div>
          <button onClick={sendBulkReminder} className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium hover:bg-red-700 transition flex items-center gap-2">
            <Bell className="w-4 h-4" /> Send All Reminders
          </button>
        </motion.div>
      )}

      {/* Unpaid Tenants */}
      {unpaid.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" /> Pending Payments ({unpaid.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {unpaid.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${t.isOverdue ? 'bg-red-100 dark:bg-red-900/30' : 'bg-amber-100 dark:bg-amber-900/30'}`}>
                    <span className={`text-sm font-bold ${t.isOverdue ? 'text-red-600' : 'text-amber-600'}`}>{t.name[0]}</span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      Room {t.roomNumber} • Bed {t.bed}
                      {t.isOverdue && <span className="text-red-500 ml-2">• {t.daysOverdue} days overdue</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatCurrency(RENT_PER_PERSON)}</span>
                  <button
                    onClick={() => sendWhatsAppReminder(t)}
                    className="p-2 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition"
                    title="Send WhatsApp Reminder"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Paid Tenants */}
      {paid.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" /> Paid ({paid.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {paid.map((t) => (
              <div key={t.id} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">Room {t.roomNumber} • Paid on {formatDate(t.paidDate)}</div>
                  </div>
                </div>
                <span className="text-sm font-semibold text-green-600">{formatCurrency(RENT_PER_PERSON)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reminder History */}
      {paymentReminders.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Send className="w-5 h-5 text-purple-500" /> Reminder History
            </h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-64 overflow-y-auto">
            {paymentReminders.slice().reverse().slice(0, 20).map((r) => (
              <div key={r.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{r.tenantName}</span>
                  <span className="text-gray-500 dark:text-gray-400 ml-2">• {r.month} • {r.type}</span>
                </div>
                <span className="text-xs text-gray-400">{formatDate(r.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="glass-card-solid p-4">
      <div className={`w-10 h-10 rounded-xl ${color} flex items-center justify-center mb-3`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
      <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
    </div>
  );
}
