import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users, Plus, Search, Edit2, Trash2, Eye, X, Phone, Mail, Calendar, CreditCard, BedDouble
} from 'lucide-react';
import {
  addTenant, updateTenant, deleteTenant as removeTenant,
  ALL_ROOMS, PG_STRUCTURE, getRoomOccupancy, formatCurrency, formatDate,
  RENT_PER_PERSON, DEPOSIT_PER_BED
} from '../data/store';
import { useData } from '../data/DataContext';

const emptyForm = {
  name: '', phone: '', email: '', aadhaar: '', roomNumber: '', bed: '',
  deposit: DEPOSIT_PER_BED, joinDate: '', address: '', emergency: '', occupation: '', notes: ''
};

export default function Tenants() {
  const { tenants } = useData();
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [viewTenant, setViewTenant] = useState(null);

  const filtered = tenants.filter(t =>
    t.name.toLowerCase().includes(search.toLowerCase()) ||
    t.phone.includes(search) ||
    t.roomNumber?.includes(search)
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Check bed availability
    const occupants = getRoomOccupancy(tenants, form.roomNumber);
    const conflict = occupants.find(t => t.bed === form.bed && t.id !== editId);
    if (conflict) {
      alert(`Bed ${form.bed} in Room ${form.roomNumber} is already occupied by ${conflict.name}`);
      return;
    }

    if (editId) {
      await updateTenant(editId, form);
    } else {
      await addTenant(form);
    }
    resetForm();
  };

  const handleEdit = (tenant) => {
    setForm(tenant);
    setEditId(tenant.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to remove this tenant?')) {
      await removeTenant(id);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const availableBeds = (roomNumber) => {
    if (!roomNumber) return ['A', 'B'];
    const occupants = getRoomOccupancy(tenants, roomNumber);
    const taken = occupants.filter(t => t.id !== editId).map(t => t.bed);
    return ['A', 'B'].filter(b => !taken.includes(b));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Tenants</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">{tenants.length} tenants registered</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Tenant
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or room..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input-field pl-12"
        />
      </div>

      {/* Tenants Table */}
      <div className="glass-card-solid overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">
              {tenants.length === 0 ? 'No tenants added yet. Click "Add Tenant" to get started.' : 'No tenants match your search.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Phone</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Rent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Joined</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {filtered.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                          <span className="text-sm font-bold text-purple-600 dark:text-purple-400">{t.name[0]}</span>
                        </div>
                        <span className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">
                      Room {t.roomNumber} • Bed {t.bed}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{t.phone}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(RENT_PER_PERSON)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{formatDate(t.joinDate)}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setViewTenant(t)} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 transition">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleEdit(t)} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 hover:bg-amber-100 transition">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(t.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Form Modal */}
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
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editId ? 'Edit Tenant' : 'Add New Tenant'}
                </h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="Enter full name" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number *</label>
                    <input type="tel" required maxLength={10} value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="input-field" placeholder="10-digit phone" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="input-field" placeholder="Email address" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Aadhaar Number</label>
                    <input type="text" maxLength={12} value={form.aadhaar} onChange={e => setForm({...form, aadhaar: e.target.value})} className="input-field" placeholder="12-digit Aadhaar" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room *</label>
                    <select required value={form.roomNumber} onChange={e => setForm({...form, roomNumber: e.target.value, bed: ''})} className="input-field">
                      <option value="">Select Room</option>
                      {ALL_ROOMS.map(r => (
                        <option key={r.number} value={r.number}>Room {r.number} ({PG_STRUCTURE[r.floor].label})</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bed *</label>
                    <select required value={form.bed} onChange={e => setForm({...form, bed: e.target.value})} className="input-field">
                      <option value="">Select Bed</option>
                      {availableBeds(form.roomNumber).map(b => (
                        <option key={b} value={b}>Bed {b}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Deposit (₹)</label>
                    <input type="number" value={form.deposit} onChange={e => setForm({...form, deposit: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Join Date *</label>
                    <input type="date" required value={form.joinDate} onChange={e => setForm({...form, joinDate: e.target.value})} className="input-field" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Occupation</label>
                    <input type="text" value={form.occupation} onChange={e => setForm({...form, occupation: e.target.value})} className="input-field" placeholder="Student / Working" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Emergency Contact</label>
                    <input type="tel" value={form.emergency} onChange={e => setForm({...form, emergency: e.target.value})} className="input-field" placeholder="Emergency phone" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                  <textarea rows={2} value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="input-field resize-none" placeholder="Home address" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Notes</label>
                  <textarea rows={2} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} className="input-field resize-none" placeholder="Any additional notes" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="btn-premium flex-1">
                    {editId ? 'Update Tenant' : 'Add Tenant'}
                  </button>
                  <button type="button" onClick={resetForm} className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition">
                    Cancel
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Tenant Modal */}
      <AnimatePresence>
        {viewTenant && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={() => setViewTenant(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-md shadow-2xl"
            >
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Tenant Details</h2>
                <button onClick={() => setViewTenant(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="p-6 space-y-3">
                <DetailRow label="Name" value={viewTenant.name} />
                <DetailRow label="Phone" value={viewTenant.phone} />
                <DetailRow label="Email" value={viewTenant.email || '-'} />
                <DetailRow label="Aadhaar" value={viewTenant.aadhaar || '-'} />
                <DetailRow label="Room" value={`Room ${viewTenant.roomNumber}`} />
                <DetailRow label="Bed" value={`Bed ${viewTenant.bed}`} />
                <DetailRow label="Rent" value={formatCurrency(RENT_PER_PERSON)} />
                <DetailRow label="Deposit" value={formatCurrency(viewTenant.deposit || 0)} />
                <DetailRow label="Join Date" value={formatDate(viewTenant.joinDate)} />
                <DetailRow label="Occupation" value={viewTenant.occupation || '-'} />
                <DetailRow label="Emergency" value={viewTenant.emergency || '-'} />
                <DetailRow label="Address" value={viewTenant.address || '-'} />
                {viewTenant.notes && <DetailRow label="Notes" value={viewTenant.notes} />}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DetailRow({ label, value }) {
  return (
    <div className="flex justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right max-w-[60%]">{value}</span>
    </div>
  );
}
