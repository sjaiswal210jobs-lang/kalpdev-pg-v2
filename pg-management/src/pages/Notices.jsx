import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, Plus, X, Megaphone, MessageCircle, Send, Users } from 'lucide-react';
import { addNotice, formatDate } from '../data/store';
import { useData } from '../data/DataContext';

export default function Notices() {
  const { notices, tenants } = useData();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', message: '', priority: 'normal' });
  const [sendingWhatsApp, setSendingWhatsApp] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addNotice(form);
    setForm({ title: '', message: '', priority: 'normal' });
    setShowForm(false);
  };

  const sendWhatsAppToAll = (notice) => {
    const message = encodeURIComponent(
      `📢 *KalpDev PG Notice*\n\n*${notice.title}*\n\n${notice.message}\n\n— KalpDev PG Management`
    );
    // Open WhatsApp for each tenant
    tenants.forEach((t, i) => {
      if (t.phone) {
        setTimeout(() => {
          window.open(`https://wa.me/91${t.phone}?text=${message}`, '_blank');
        }, i * 1500); // Stagger to avoid browser blocking
      }
    });
    setSendingWhatsApp(true);
    setTimeout(() => setSendingWhatsApp(false), 3000);
  };

  const sendWhatsAppToOne = (phone, notice) => {
    const message = encodeURIComponent(
      `📢 *KalpDev PG Notice*\n\n*${notice.title}*\n\n${notice.message}\n\n— KalpDev PG Management`
    );
    window.open(`https://wa.me/91${phone}?text=${message}`, '_blank');
  };

  const priorityColors = {
    high: 'border-l-red-500 bg-red-50 dark:bg-red-900/10',
    normal: 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/10',
    low: 'border-l-gray-400 bg-gray-50 dark:bg-gray-700/30',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Notices</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Post announcements for tenants</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Post Notice
        </button>
      </div>

      {sendingWhatsApp && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl flex items-center gap-3"
        >
          <MessageCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm text-green-700 dark:text-green-400 font-medium">
            Opening WhatsApp for {tenants.length} tenants... Allow popups if blocked.
          </p>
        </motion.div>
      )}

      {notices.length === 0 ? (
        <div className="glass-card-solid p-12 text-center">
          <Megaphone className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
          <p className="text-gray-500 dark:text-gray-400">No notices posted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notices.slice().reverse().map((notice, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`p-5 rounded-2xl border-l-4 ${priorityColors[notice.priority] || priorityColors.normal}`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white">{notice.title}</h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap ml-4">{formatDate(notice.createdAt)}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-300">{notice.message}</p>
              <div className="mt-3 flex items-center justify-between">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  notice.priority === 'high' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                  notice.priority === 'low' ? 'bg-gray-200 text-gray-600 dark:bg-gray-600 dark:text-gray-300' :
                  'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                }`}>
                  {notice.priority} priority
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => sendWhatsAppToAll(notice)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-lg text-xs font-medium hover:bg-green-100 dark:hover:bg-green-900/30 transition"
                    title="Send to all tenants via WhatsApp"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send to All ({tenants.length})
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Notice Modal */}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Post Notice</h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                  <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="input-field" placeholder="Notice title" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Message *</label>
                  <textarea rows={4} required value={form.message} onChange={e => setForm({...form, message: e.target.value})} className="input-field resize-none" placeholder="Notice content..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Priority</label>
                  <select value={form.priority} onChange={e => setForm({...form, priority: e.target.value})} className="input-field">
                    <option value="low">Low</option>
                    <option value="normal">Normal</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <button type="submit" className="btn-premium w-full">Post Notice</button>
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.title || !form.message) return;
                    await addNotice(form);
                    sendWhatsAppToAll(form);
                    setForm({ title: '', message: '', priority: 'normal' });
                    setShowForm(false);
                  }}
                  className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4" />
                  Post & Send via WhatsApp to All
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
