import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { BedDouble, User, Eye } from 'lucide-react';
import { ALL_ROOMS, PG_STRUCTURE, getRoomOccupancy } from '../data/store';
import { useData } from '../data/DataContext';

export default function RoomsBeds() {
  const { tenants } = useData();
  const [selectedFloor, setSelectedFloor] = useState(0); // 0 = all

  const floors = [
    { id: 0, label: 'All Floors' },
    { id: 1, label: '1st Floor' },
    { id: 2, label: '2nd Floor' },
    { id: 3, label: '3rd Floor' },
  ];

  const filteredRooms = selectedFloor === 0
    ? ALL_ROOMS
    : ALL_ROOMS.filter(r => r.floor === selectedFloor);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rooms & Beds</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage room occupancy across all floors</p>
        </div>
      </div>

      {/* Floor Filter */}
      <div className="flex gap-2 flex-wrap">
        {floors.map(f => (
          <button
            key={f.id}
            onClick={() => setSelectedFloor(f.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              selectedFloor === f.id
                ? 'bg-purple-600 text-white shadow-premium'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Rooms Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRooms.map((room, i) => {
          const occupants = getRoomOccupancy(tenants, room.number);
          const bedA = occupants.find(t => t.bed === 'A');
          const bedB = occupants.find(t => t.bed === 'B');
          const count = occupants.length;

          let statusColor = 'border-red-200';
          let statusBg = 'bg-red-50 dark:bg-red-900/20';
          let statusText = 'Vacant';
          let statusBadge = 'badge-red';
          if (count === 2) {
            statusColor = 'border-green-200';
            statusBg = 'bg-green-50 dark:bg-green-900/20';
            statusText = 'Full';
            statusBadge = 'badge-green';
          } else if (count === 1) {
            statusColor = 'border-amber-200';
            statusBg = 'bg-amber-50 dark:bg-amber-900/20';
            statusText = 'Partial';
            statusBadge = 'badge-yellow';
          }

          return (
            <motion.div
              key={room.number}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`glass-card-solid p-6 border-l-4 ${statusColor}`}
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">Room {room.number}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{PG_STRUCTURE[room.floor].label}</p>
                </div>
                <span className={statusBadge}>{statusText}</span>
              </div>

              <div className="space-y-3">
                <BedCard label="Bed A" tenant={bedA} />
                <BedCard label="Bed B" tenant={bedB} />
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Occupancy</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{count}/2 Beds</span>
                </div>
                <div className="mt-2 w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full transition-all"
                    style={{ width: `${(count / 2) * 100}%` }}
                  ></div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function BedCard({ label, tenant }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl ${
      tenant
        ? 'bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800'
        : 'bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600'
    }`}>
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          tenant ? 'bg-purple-200 dark:bg-purple-800' : 'bg-gray-200 dark:bg-gray-600'
        }`}>
          {tenant ? <User className="w-4 h-4 text-purple-700 dark:text-purple-300" /> : <BedDouble className="w-4 h-4 text-gray-500" />}
        </div>
        <div>
          <div className="text-sm font-medium text-gray-900 dark:text-white">
            {tenant ? tenant.name : 'Empty'}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">{label}</div>
        </div>
      </div>
      {tenant && (
        <span className="text-xs text-purple-600 dark:text-purple-400 font-medium">{tenant.phone}</span>
      )}
    </div>
  );
}
