import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Gift, Plus, X, Edit2, Trash2, CheckCircle2, Star, Users, IndianRupee, ShoppingBag
} from 'lucide-react';
import {
  addRewardsProduct, updateRewardsProduct, deleteRewardsProduct,
  verifyPurchase, getRewardsPoints,
  formatCurrency, POINTS_TO_RUPEE, generateId
} from '../data/store';
import { useData } from '../data/DataContext';

const emptyProduct = {
  name: '', category: '', image: '',
  amazonLink: '', amazonPrice: '',
  flipkartLink: '', flipkartPrice: '',
  otherLink: '', otherStore: '', otherPrice: '',
  pointsReward: 50, description: '',
};

export default function RewardsAdmin() {
  const { tenants, rewardsProducts, rewardsPurchases } = useData();
  const [activeTab, setActiveTab] = useState('products');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyProduct);
  const [allPoints, setAllPoints] = useState({});

  useEffect(() => {
    const loadPoints = async () => {
      const pointsMap = {};
      for (const t of tenants) {
        const pts = await getRewardsPoints(t.id);
        pointsMap[t.id] = pts;
      }
      setAllPoints(pointsMap);
    };
    if (tenants.length > 0) loadPoints();
  }, [tenants]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editId) {
      await updateRewardsProduct(editId, form);
    } else {
      await addRewardsProduct(form);
    }
    resetForm();
  };

  const handleEdit = (p) => { setForm(p); setEditId(p.id); setShowForm(true); };
  const handleDelete = async (id) => { if (window.confirm('Delete this product?')) await deleteRewardsProduct(id); };
  const resetForm = () => { setForm(emptyProduct); setEditId(null); setShowForm(false); };

  const handleVerify = async (purchaseId) => {
    await verifyPurchase(purchaseId);
  };

  const tabs = [
    { id: 'products', label: 'Products', icon: ShoppingBag },
    { id: 'purchases', label: 'Purchases', icon: CheckCircle2 },
    { id: 'leaderboard', label: 'Points Leaderboard', icon: Star },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Rewards & Affiliate</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Manage products, verify purchases, and track points</p>
        </div>
        {activeTab === 'products' && (
          <button onClick={() => setShowForm(true)} className="btn-premium flex items-center gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${activeTab === tab.id ? 'bg-purple-600 text-white shadow-premium' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'}`}>
            <tab.icon className="w-4 h-4" />{tab.label}
          </button>
        ))}
      </div>

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rewardsProducts.length === 0 ? (
            <div className="col-span-full glass-card-solid p-12 text-center">
              <ShoppingBag className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No products added yet. Add affiliate products for tenants to compare and purchase.</p>
            </div>
          ) : rewardsProducts.map(p => (
            <div key={p.id} className="glass-card-solid overflow-hidden">
              {p.image && <img src={p.image} alt={p.name} className="w-full h-36 object-cover" />}
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold text-gray-900 dark:text-white text-sm">{p.name}</h4>
                  <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold">+{p.pointsReward} pts</span>
                </div>
                <p className="text-xs text-gray-500 mb-3">{p.category}</p>
                <div className="space-y-1 text-xs">
                  {p.amazonPrice && <div className="flex justify-between"><span className="text-orange-600 font-medium">Amazon</span><span>₹{p.amazonPrice}</span></div>}
                  {p.flipkartPrice && <div className="flex justify-between"><span className="text-blue-600 font-medium">Flipkart</span><span>₹{p.flipkartPrice}</span></div>}
                  {p.otherPrice && <div className="flex justify-between"><span className="text-green-600 font-medium">{p.otherStore}</span><span>₹{p.otherPrice}</span></div>}
                </div>
                <div className="flex gap-2 mt-3">
                  <button onClick={() => handleEdit(p)} className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600 hover:bg-amber-100 transition"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 hover:bg-red-100 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Purchases Tab */}
      {activeTab === 'purchases' && (
        <div className="glass-card-solid overflow-hidden">
          {rewardsPurchases.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No purchase claims yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {rewardsPurchases.slice().reverse().map(p => (
                <div key={p.id} className="p-4 flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white text-sm">{p.tenantName}</div>
                    <div className="text-xs text-gray-500">{p.productName} • {p.store} • ₹{p.amount}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{new Date(p.createdAt).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-purple-600">+{p.pointsEarned} pts</span>
                    {p.verified ? (
                      <span className="px-2 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold">Verified</span>
                    ) : (
                      <button onClick={() => handleVerify(p.id)} className="px-3 py-1.5 bg-green-600 text-white rounded-lg text-xs font-medium hover:bg-green-700 transition">Verify & Credit</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs text-gray-500">Conversion: {POINTS_TO_RUPEE} points = ₹1 rent discount</p>
          </div>
          {tenants.length === 0 ? (
            <div className="p-12 text-center"><p className="text-gray-500">No tenants yet.</p></div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {[...tenants].sort((a, b) => (allPoints[b.id]?.balance || 0) - (allPoints[a.id]?.balance || 0)).map((t, i) => {
                const pts = allPoints[t.id]?.balance || 0;
                const discount = Math.floor(pts / POINTS_TO_RUPEE);
                return (
                  <div key={t.id} className="p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-gray-200 text-gray-600' : i === 2 ? 'bg-orange-100 text-orange-700' : 'bg-purple-50 text-purple-600'}`}>
                        {i + 1}
                      </div>
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white text-sm">{t.name}</div>
                        <div className="text-xs text-gray-500">Room {t.roomNumber}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-purple-600 text-sm">{pts} pts</div>
                      <div className="text-xs text-gray-500">= ₹{discount} discount</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Product Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={resetForm}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? 'Edit' : 'Add'} Product</h2>
                <button onClick={resetForm} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Product Name *</label>
                    <input type="text" required value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="input-field" placeholder="e.g. Boat Earbuds" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                    <select value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="input-field">
                      <option value="">Select</option>
                      <option value="Electronics">Electronics</option>
                      <option value="Fashion">Fashion</option>
                      <option value="Books">Books</option>
                      <option value="Home">Home & Kitchen</option>
                      <option value="Beauty">Beauty</option>
                      <option value="Sports">Sports</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Points Reward *</label>
                    <input type="number" required min="1" value={form.pointsReward} onChange={e => setForm({...form, pointsReward: Number(e.target.value)})} className="input-field" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Image URL</label>
                    <input type="url" value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="input-field" placeholder="https://..." />
                  </div>
                </div>
                <div className="p-3 bg-orange-50 dark:bg-orange-900/10 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-orange-700 dark:text-orange-400">Amazon</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="url" placeholder="Affiliate Link" value={form.amazonLink} onChange={e => setForm({...form, amazonLink: e.target.value})} className="input-field text-xs col-span-2" />
                    <input type="number" placeholder="Price" value={form.amazonPrice} onChange={e => setForm({...form, amazonPrice: e.target.value})} className="input-field text-xs" />
                  </div>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-blue-700 dark:text-blue-400">Flipkart</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="url" placeholder="Affiliate Link" value={form.flipkartLink} onChange={e => setForm({...form, flipkartLink: e.target.value})} className="input-field text-xs col-span-2" />
                    <input type="number" placeholder="Price" value={form.flipkartPrice} onChange={e => setForm({...form, flipkartPrice: e.target.value})} className="input-field text-xs" />
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-xl space-y-2">
                  <p className="text-xs font-bold text-green-700 dark:text-green-400">Other Store</p>
                  <div className="grid grid-cols-3 gap-2">
                    <input type="text" placeholder="Store Name" value={form.otherStore} onChange={e => setForm({...form, otherStore: e.target.value})} className="input-field text-xs" />
                    <input type="url" placeholder="Link" value={form.otherLink} onChange={e => setForm({...form, otherLink: e.target.value})} className="input-field text-xs" />
                    <input type="number" placeholder="Price" value={form.otherPrice} onChange={e => setForm({...form, otherPrice: e.target.value})} className="input-field text-xs" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea rows={2} value={form.description} onChange={e => setForm({...form, description: e.target.value})} className="input-field resize-none" placeholder="Brief product description" />
                </div>
                <button type="submit" className="btn-premium w-full">{editId ? 'Update' : 'Add'} Product</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
