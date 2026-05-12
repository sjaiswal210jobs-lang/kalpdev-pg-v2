import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Plus, X, Calculator } from 'lucide-react';
import {
  ALL_ROOMS, getRoomOccupancy, addElectricityBill,
  formatCurrency, formatDate, getMonthKey
} from '../data/store';
import { useData } from '../data/DataContext';

export default function ElectricityBills() {
  const { tenants, electricityRecords } = useData();
  const [showForm, setShowForm] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [billAmount, setBillAmount] = useState('');
  const [billMonth, setBillMonth] = useState(getMonthKey());

  const handleSubmit = async (e) => {
    e.preventDefault();
    const occupants = getRoomOccupancy(tenants, selectedRoom);
    const occupantCount = occupants.length;

    if (occupantCount === 0) {
      alert('This room has no occupants. Cannot split the bill.');
      return;
    }

    const perPerson = Math.ceil(Number(billAmount) / occupantCount);

    const bill = {
      roomNumber: selectedRoom,
      month: billMonth,
      totalBill: Number(billAmount),
      occupants: occupantCount,
      perPersonAmount: perPerson,
      tenantNames: occupants.map(t => t.name),
    };

    await addElectricityBill(bill);
    setShowForm(false);
    setSelectedRoom('');
    setBillAmount('');
  };

  const selectedOccupants = selectedRoom ? getRoomOccupancy(tenants, selectedRoom) : [];
  const perPersonPreview = selectedOccupants.length > 0 && billAmount
    ? Math.ceil(Number(billAmount) / selectedOccupants.length)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Electricity Bills</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Room-wise electricity management with auto-split</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Add Bill
        </button>
      </div>

      {/* Bills History */}
      <div className="glass-card-solid overflow-hidden">
        {electricityRecords.length === 0 ? (
          <div className="p-12 text-center">
            <Zap className="w-12 h-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="text-gray-500 dark:text-gray-400">No electricity bills recorded yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Room</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Month</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Total Bill</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Occupants</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Per Person</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tenants</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {electricityRecords.slice().reverse().map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900 dark:text-white">Room {r.roomNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{r.month}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-white font-medium">{formatCurrency(r.totalBill)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300">{r.occupants}</td>
                    <td className="px-6 py-4 text-sm font-semibold text-purple-600 dark:text-purple-400">{formatCurrency(r.perPersonAmount)}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{r.tenantNames?.join(', ') || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add Bill Modal */}
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
                <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-500" />
                  Add Electricity Bill
                </h2>
                <button onClick={() => setShowForm(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Room *</label>
                  <select
                    required
                    value={selectedRoom}
                    onChange={(e) => setSelectedRoom(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select Room</option>
                    {ALL_ROOMS.map(r => (
                      <option key={r.number} value={r.number}>Room {r.number}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Month *</label>
                  <input
                    type="month"
                    required
                    value={billMonth}
                    onChange={(e) => setBillMonth(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Bill Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={billAmount}
                    onChange={(e) => setBillAmount(e.target.value)}
                    className="input-field"
                    placeholder="Enter total bill amount"
                  />
                </div>

                {/* Preview */}
                {selectedRoom && (
                  <div className="p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-2">
                      <Calculator className="w-4 h-4 text-purple-600" />
                      <span className="text-sm font-semibold text-purple-700 dark:text-purple-300">Auto Split Preview</span>
                    </div>
                    <div className="text-sm text-purple-600 dark:text-purple-400 space-y-1">
                      <p>Occupied beds: <strong>{selectedOccupants.length}</strong></p>
                      {selectedOccupants.map(t => (
                        <p key={t.id}>• {t.name} (Bed {t.bed})</p>
                      ))}
                      {perPersonPreview > 0 && (
                        <p className="mt-2 font-bold text-lg">Per person: {formatCurrency(perPersonPreview)}</p>
                      )}
                      {selectedOccupants.length === 0 && (
                        <p className="text-red-500">⚠️ No occupants in this room</p>
                      )}
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={selectedOccupants.length === 0}
                  className="btn-premium w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save Electricity Bill
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
