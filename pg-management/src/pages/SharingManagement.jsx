import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Plus, X, Edit2, Trash2, Users, Phone, CheckCircle2, Clock, XCircle } from 'lucide-react';
import {
  addSharingDetail, updateSharingDetail, deleteSharingDetail as removeSharing,
  formatDate, generateId
} from '../data/store';
import { useData } from '../data/DataContext';

const emptyForm = {
  referrerName: '',
  referrerPhone: '',
  referredName: '',
  referredPhone: '',
  status: 'pending',
  notes: '',
  date: new Date().toISOString().split('T')[0],
};

export default function SharingManagement() {
  const { sharingDetails, tenants } = useData();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateSharingDetail(editId, form);
    } else {
      await addSharingDetail(form);
    }
    resetForm();
  };

  const handleEdit = (item) => {
    setForm(item);
    setEditId(item.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this referral record?')) return;
    await removeSharing(id);
  };

  const handleStatusChange = async (id, status) => {
    await updateSharingDetail(id, { status });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const pending = sharingDetails.filter(d => d.status === 'pending');
  const converted = sharingDetails.filter(d => d.status === 'converted');
  const rejected = sharingDetails.filter(d => d.status === 'rejected');

  const statusColors = {
    pending: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    converted: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    active: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Sharing & Referrals</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Track referrals, room sharing requests, and tenant recommendations</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Referral
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Pending</div>
        </div>
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{converted.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Converted</div>
        </div>
        <div className="glass-card-solid p-4 text-center">
          <div className="text-2xl font-bold text-red-600">{rejected.length}</div>
          <div className="text-xs text-gray-500 dark:text-gray-400">Rejected</div>
        </div>
      </div>

      {/* Referrals List */}
      <div className="glass-card-solid overflow-hidden">
        {sharingDetails.length === 0 ? (
          <div className="p-12 text-center">
            <Share2 className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No referrals or sharing records yet.</p>
            <p className="text-sm text-gray-400 mt-1">Track when tenants refer friends or request room sharing.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {sharingDetails.slice().reverse().map((d) => (
              <div key={d.id} className="p-5 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                        <Users className="w-4 h-4 text-purple-600" />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white text-sm">
                          {d.referredName}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Phone className="w-3 h-3" /> {d.referredPhone}
                        </div>
                      </div>
                    </div>
                    <div className="ml-12 space-y-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        Referred by: <span className="font-medium text-gray-700 dark:text-gray-300">{d.referrerName}</span>
                        {d.referrerPhone && ` (${d.referrerPhone})`}
                      </p>
                      {d.notes && <p className="text-xs text-gray-500 italic">{d.notes}</p>}
                      <p className="text-xs text-gray-400">{formatDate(d.date)}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusColors[d.status]}`}>
                      {d.status}
                    </span>
                    <div className="flex gap-1">
                      {d.status === 'pending' && (
                        <>
                          <button onClick={() => handleStatusChange(d.id, 'converted')} className="p-1.5 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 hover:bg-green-100 transition" title="Mark Converted">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleStatusChange(d.id, 'rejected')} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition" title="Mark Rejected">
                            <XCircle className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                      <button onClick={() => handleEdit(d)} className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition">
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button onClick={() => handleDelete(d.id)} className="p-1.5 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={resetForm}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                  {editId ? 'Edit Referral' : 'Add Referral'}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                  <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 mb-2">Referred Person (New Lead)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" required placeholder="Name" value={form.referredName} onChange={e => setForm({...form, referredName: e.target.value})} className="input-field text-sm" />
                    <input type="tel" required placeholder="Phone" value={form.referredPhone} onChange={e => setForm({...form, referredPhone: e.target.value})} className="input-field text-sm" />
                  </div>
                </div>
                <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">Referred By (Existing Tenant / Source)</p>
                  <div className="grid grid-cols-2 gap-3">
                    <select value={form.referrerName} onChange={e => setForm({...form, referrerName: e.target.value})} className="input-field text-sm">
                      <option value="">Select or type</option>
                      {tenants.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                    </select>
                    <input type="tel" placeholder="Phone (optional)" value={form.referrerPhone} onChange={e => setForm({...form, referrerPhone: e.target.value})} className="input-field text-sm" />
                  </div>
                  {!form.referrerName && (
                    <input type="text" placeholder="Or type referrer name" onChange={e => setForm({...form, referrerName: e.target.value})} className="input-field text-sm mt-2" />
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} className="input-field" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                  <select value={form.status} onChange={e => setForm({...form, status: e.target.value})} className="input-field">
                    <option value="pending">Pending</option>
                    <option value="converted">Converted (Joined)</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none" placeholder="Any additional info..." />
                </div>
                <button type="submit" className="btn-premium w-full">
                  {editId ? 'Update' : 'Add'} Referral
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
