import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCheck, Plus, X } from 'lucide-react';
import { addVisitor, formatDate } from '../data/store';
import { useData } from '../data/DataContext';

export default function Visitors() {
  const { visitors } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', purpose: '', visitingTenant: '', date: '', timeIn: '', timeOut: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addVisitor(form);
    setForm({ name: '', phone: '', purpose: '', visitingTenant: '', date: '', timeIn: '', timeOut: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Visitors</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track visitor entries</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Visitor
        </button>
      </div>

      <div className="glass-card-solid overflow-hidden">
        {visitors.length === 0 ? (
          <div className="p-12 text-center">
            <UserCheck className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No visitor records yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Visitor</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Purpose</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Visiting</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {visitors.slice().reverse().map((v, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{v.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{v.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{v.purpose}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{v.visitingTenant}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(v.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{v.timeIn}{v.timeOut ? ` - ${v.timeOut}` : ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Visitor Modal */}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Add Visitor</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visitor Name *</label>
                  <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
                  <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Purpose *</label>
                  <input type="text" required value={form.purpose} onChange={e => setForm({...form, purpose: e.target.value})} className="input-field" placeholder="e.g. Meeting, Delivery" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Visiting Tenant</label>
                  <input type="text" value={form.visitingTenant} onChange={e => setForm({...form, visitingTenant: e.target.value})} className="input-field" placeholder="Tenant name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date *</label>
                    <input type="date" required value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time In</label>
                    <input type="time" value={form.timeIn} onChange={e => setForm({...form, timeIn: e.target.value})} className="input-field" />
                  </div>
                </div>
                <button type="submit" className="btn-premium w-full">Save Visitor</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
