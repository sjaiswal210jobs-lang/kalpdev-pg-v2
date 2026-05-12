import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Gift, ShoppingBag, Star, ExternalLink, X, Users, Send } from 'lucide-react';
import {
  addRewardsPurchase, redeemPoints, addRedemption, addSharingDetail,
  getLoggedInStudent, getRewardsPoints, POINTS_TO_RUPEE, REFERRAL_REWARD_RUPEES
} from '../data/store';
import { useData } from '../data/DataContext';

export default function StudentRewards() {
  const { rewardsProducts } = useData();
  const tenant = getLoggedInStudent();
  const [points, setPoints] = useState({ balance: 0, history: [] });
  const [showClaim, setShowClaim] = useState(null);
  const [showRedeem, setShowRedeem] = useState(false);
  const [claimStore, setClaimStore] = useState('');
  const [claimAmount, setClaimAmount] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const loadPoints = async () => {
      if (tenant?.id) {
        const pts = await getRewardsPoints(tenant.id);
        setPoints(pts);
      }
    };
    loadPoints();
  }, [tenant?.id]);

  if (!tenant) return null;

  const maxDiscount = Math.floor(points.balance / POINTS_TO_RUPEE);

  const handleClaim = async (e) => {
    e.preventDefault();
    if (!showClaim || !claimStore) return;
    await addRewardsPurchase({
      tenantId: tenant.id,
      tenantName: tenant.name,
      productId: showClaim.id,
      productName: showClaim.name,
      store: claimStore,
      amount: Number(claimAmount),
      pointsEarned: showClaim.pointsReward,
    });
    setMessage(`Purchase claimed! ${showClaim.pointsReward} points will be added after admin verification.`);
    setShowClaim(null);
    setClaimStore('');
    setClaimAmount('');
    setTimeout(() => setMessage(''), 4000);
  };

  const handleRedeem = async (e) => {
    e.preventDefault();
    const pts = Number(redeemAmount) * POINTS_TO_RUPEE;
    const result = await redeemPoints(tenant.id, pts, `Rent discount: ₹${redeemAmount}`);
    if (result.success) {
      await addRedemption({ tenantId: tenant.id, tenantName: tenant.name, points: pts, discount: Number(redeemAmount) });
      const updated = await getRewardsPoints(tenant.id);
      setPoints(updated);
      setMessage(`₹${redeemAmount} discount applied! Inform admin during rent payment.`);
      setShowRedeem(false);
      setRedeemAmount('');
    } else {
      setMessage('Insufficient points!');
    }
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="space-y-6">
      {/* Points Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Gift className="w-6 h-6" />
              <span className="font-semibold">My Rewards</span>
            </div>
            <button onClick={() => setShowRedeem(true)} className="px-4 py-2 bg-white/20 rounded-xl text-sm font-medium hover:bg-white/30 transition">
              Redeem Points
            </button>
          </div>
          <div className="text-4xl font-bold mb-1">{points.balance} <span className="text-lg font-normal text-white/70">points</span></div>
          <div className="text-sm text-white/70">= ₹{maxDiscount} rent discount available</div>
          <div className="mt-3 text-xs text-white/50">{POINTS_TO_RUPEE} points = ₹1 discount</div>
        </div>
      </motion.div>

      {message && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl text-green-700 dark:text-green-400 text-sm font-medium">
          {message}
        </motion.div>
      )}

      {/* Referral Section */}
      <ReferralCard tenant={tenant} setMessage={setMessage} />

      {/* Products to Compare */}
      <div>
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-purple-600" /> Shop & Earn Points
        </h3>
        {rewardsProducts.length === 0 ? (
          <div className="glass-card-solid p-8 text-center">
            <ShoppingBag className="w-10 h-10 mx-auto mb-2 text-gray-300" />
            <p className="text-gray-500 text-sm">No products available yet. Check back later!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {rewardsProducts.map(p => (
              <motion.div key={p.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card-solid overflow-hidden">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-40 object-cover" />}
                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{p.name}</h4>
                    <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full text-xs font-bold flex items-center gap-1">
                      <Star className="w-3 h-3" /> +{p.pointsReward}
                    </span>
                  </div>
                  {p.description && <p className="text-xs text-gray-500 mb-3">{p.description}</p>}
                  {p.category && <span className="inline-block px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400 mb-3">{p.category}</span>}

                  {/* Price Comparison */}
                  <div className="space-y-2 mb-4">
                    {p.amazonLink && (
                      <a href={p.amazonLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800 hover:bg-orange-100 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-orange-600">Amazon</span>
                          {p.amazonPrice && <span className="text-sm font-bold text-gray-900 dark:text-white">₹{p.amazonPrice}</span>}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-orange-500" />
                      </a>
                    )}
                    {p.flipkartLink && (
                      <a href={p.flipkartLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800 hover:bg-blue-100 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-blue-600">Flipkart</span>
                          {p.flipkartPrice && <span className="text-sm font-bold text-gray-900 dark:text-white">₹{p.flipkartPrice}</span>}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                      </a>
                    )}
                    {p.otherLink && (
                      <a href={p.otherLink} target="_blank" rel="noreferrer" className="flex items-center justify-between p-2.5 rounded-xl bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 hover:bg-green-100 transition">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-green-600">{p.otherStore || 'Other'}</span>
                          {p.otherPrice && <span className="text-sm font-bold text-gray-900 dark:text-white">₹{p.otherPrice}</span>}
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 text-green-500" />
                      </a>
                    )}
                  </div>

                  <button onClick={() => setShowClaim(p)} className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition">
                    I Purchased This → Claim {p.pointsReward} Points
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Points History */}
      {points.history && points.history.length > 0 && (
        <div className="glass-card-solid overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Points History</h3>
          </div>
          <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-48 overflow-y-auto">
            {points.history.slice().reverse().map(h => (
              <div key={h.id} className="p-3 flex items-center justify-between text-sm">
                <div>
                  <span className="text-gray-700 dark:text-gray-300">{h.reason}</span>
                  <div className="text-xs text-gray-400">{new Date(h.date).toLocaleDateString('en-IN')}</div>
                </div>
                <span className={`font-bold ${h.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                  {h.type === 'earned' ? '+' : '-'}{h.points}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Claim Modal */}
      <AnimatePresence>
        {showClaim && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowClaim(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Claim Purchase</h2>
                <button onClick={() => setShowClaim(null)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleClaim} className="p-6 space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-300">Claiming: <strong>{showClaim.name}</strong></p>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Which store did you buy from? *</label>
                  <select required value={claimStore} onChange={e => setClaimStore(e.target.value)} className="input-field">
                    <option value="">Select store</option>
                    {showClaim.amazonLink && <option value="Amazon">Amazon</option>}
                    {showClaim.flipkartLink && <option value="Flipkart">Flipkart</option>}
                    {showClaim.otherLink && <option value={showClaim.otherStore || 'Other'}>{showClaim.otherStore || 'Other'}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount Paid (₹) *</label>
                  <input type="number" required min="1" value={claimAmount} onChange={e => setClaimAmount(e.target.value)} className="input-field" />
                </div>
                <p className="text-xs text-purple-600 font-medium">You'll earn +{showClaim.pointsReward} points after admin verification</p>
                <button type="submit" className="btn-premium w-full">Submit Claim</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Redeem Modal */}
      <AnimatePresence>
        {showRedeem && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowRedeem(false)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()} className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-2xl">
              <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Redeem Points</h2>
                <button onClick={() => setShowRedeem(false)} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X className="w-5 h-5 text-gray-500" /></button>
              </div>
              <form onSubmit={handleRedeem} className="p-6 space-y-4">
                <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-xl text-center">
                  <div className="text-2xl font-bold text-purple-700 dark:text-purple-400">{points.balance} pts</div>
                  <div className="text-sm text-purple-600">Max discount: ₹{maxDiscount}</div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Discount Amount (₹) *</label>
                  <input type="number" required min="1" max={maxDiscount} value={redeemAmount} onChange={e => setRedeemAmount(e.target.value)} className="input-field" placeholder={`Max ₹${maxDiscount}`} />
                  {redeemAmount && <p className="text-xs text-gray-500 mt-1">Will deduct {Number(redeemAmount) * POINTS_TO_RUPEE} points</p>}
                </div>
                <button type="submit" disabled={!redeemAmount || Number(redeemAmount) > maxDiscount} className="btn-premium w-full disabled:opacity-50">Redeem as Rent Discount</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReferralCard({ tenant, setMessage }) {
  const [showReferForm, setShowReferForm] = useState(false);
  const [referName, setReferName] = useState('');
  const [referPhone, setReferPhone] = useState('');

  const handleRefer = async (e) => {
    e.preventDefault();
    await addSharingDetail({
      referrerName: tenant.name,
      referrerPhone: tenant.phone,
      referredName: referName,
      referredPhone: referPhone,
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      notes: 'Submitted by tenant via Student Portal',
    });
    setReferName('');
    setReferPhone('');
    setShowReferForm(false);
    setMessage(`Referral submitted! You'll earn ₹${REFERRAL_REWARD_RUPEES} when they join.`);
    setTimeout(() => setMessage(''), 4000);
  };

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-800 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
            <Users className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white">Refer a Friend</h3>
            <p className="text-sm text-green-700 dark:text-green-400">Earn ₹{REFERRAL_REWARD_RUPEES} for every successful referral!</p>
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
        Know someone looking for a PG? Refer them and get ₹{REFERRAL_REWARD_RUPEES} credited to your rewards when they join.
      </p>
      {!showReferForm ? (
        <button onClick={() => setShowReferForm(true)} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition flex items-center justify-center gap-2">
          <Send className="w-4 h-4" /> Refer Someone Now
        </button>
      ) : (
        <form onSubmit={handleRefer} className="space-y-3">
          <input type="text" required placeholder="Friend's Name" value={referName} onChange={e => setReferName(e.target.value)} className="input-field" />
          <input type="tel" required placeholder="Friend's Phone (10 digits)" maxLength={10} value={referPhone} onChange={e => setReferPhone(e.target.value)} className="input-field" />
          <div className="flex gap-2">
            <button type="submit" className="flex-1 py-2.5 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition text-sm">Submit Referral</button>
            <button type="button" onClick={() => setShowReferForm(false)} className="px-4 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium text-sm">Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
