import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Receipt, Plus, X } from 'lucide-react';
import { addExpense, formatCurrency, formatDate } from '../data/store';
import { useData } from '../data/DataContext';

export default function Expenses() {
  const { expenses } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', amount: '', category: '', date: '', notes: '' });

  const categories = ['Maintenance', 'Cleaning', 'Plumbing', 'Electrical', 'Furniture', 'Internet', 'Water', 'Other'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addExpense(form);
    setForm({ title: '', amount: '', category: '', date: '', notes: '' });
    setShowForm(false);
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Expenses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track all PG maintenance expenses</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Expense
        </button>
      </div>

      {/* Total */}
      <div className="glass-card-solid p-6">
        <div className="text-sm text-gray-500 dark:text-gray-400">Total Expenses</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalExpenses)}</div>
      </div>

      {/* Expenses List */}
      <div className="glass-card-solid overflow-hidden">
        {expenses.length === 0 ? (
          <div className="p-12 text-center">
            <Receipt className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No expenses recorded yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {expenses.slice().reverse().map((exp, i) => (
              <div key={i} className="p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                    <Receipt className="w-5 h-5 text-red-500" />
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{exp.title}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{exp.category} • {formatDate(exp.date)}</div>
                  </div>
                </div>
                <div className="text-sm font-bold text-red-600 dark:text-red-400">-{formatCurrency(exp.amount)}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Expense</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Expense title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount (₹) *</label>
                  <input type="number" required min="1" value={form.amount} onChange={e => setForm({...form, amount: e.target.value})} className="input-field" placeholder="Amount" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category *</label>
                  <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                  <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none" placeholder="Optional notes" />
                </div>
                <button type="submit" className="btn-premium w-full">Save Expense</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
