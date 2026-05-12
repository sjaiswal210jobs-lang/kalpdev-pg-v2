import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Key, Building2, Save, Check } from 'lucide-react';
import { getAdminCreds, saveAdminCreds } from '../data/store';

export default function Settings() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCreds = async () => {
      const creds = await getAdminCreds();
      setUsername(creds.username);
      setPassword(creds.password);
      setLoading(false);
    };
    loadCreds();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    await saveAdminCreds({ username, password, name: 'KalpDev Admin' });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Manage admin credentials and preferences</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Admin Credentials */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card-solid p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
              <Key className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Admin Credentials</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Update login username and password</p>
            </div>
          </div>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <button type="submit" className="btn-premium flex items-center gap-2">
              {saved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              {saved ? 'Saved!' : 'Save Changes'}
            </button>
          </form>
        </motion.div>

        {/* PG Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card-solid p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">PG Information</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Building configuration</p>
            </div>
          </div>
          <div className="space-y-3">
            <InfoItem label="PG Name" value="KalpDev PG" />
            <InfoItem label="Total Floors" value="3" />
            <InfoItem label="Total Rooms" value="9" />
            <InfoItem label="Total Beds" value="18" />
            <InfoItem label="Rent per Person" value="₹3,500/month" />
            <InfoItem label="Deposit per Bed" value="₹3,500" />
            <InfoItem label="1st Floor" value="1 Room, 2 Beds" />
            <InfoItem label="2nd Floor" value="4 Rooms, 8 Beds" />
            <InfoItem label="3rd Floor" value="4 Rooms, 8 Beds" />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-700 last:border-0">
      <span className="text-sm text-gray-500 dark:text-gray-400">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  );
}
