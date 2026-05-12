import { db, COLLECTIONS, getCollection, addDocument, updateDocument, deleteDocument, setDocument, getDocument } from './firebase';
import { collection, doc, getDocs, query, where } from 'firebase/firestore';

// PG Structure Configuration
export const PG_STRUCTURE = {
  1: { rooms: 1, label: '1st Floor', roomNumbers: ['101'] },
  2: { rooms: 4, label: '2nd Floor', roomNumbers: ['201', '202', '203', '204'] },
  3: { rooms: 4, label: '3rd Floor', roomNumbers: ['301', '302', '303', '304'] },
};

export const ALL_ROOMS = [
  { floor: 1, room: 1, number: '101', beds: 2 },
  { floor: 2, room: 1, number: '201', beds: 2 },
  { floor: 2, room: 2, number: '202', beds: 2 },
  { floor: 2, room: 3, number: '203', beds: 2 },
  { floor: 2, room: 4, number: '204', beds: 2 },
  { floor: 3, room: 1, number: '301', beds: 2 },
  { floor: 3, room: 2, number: '302', beds: 2 },
  { floor: 3, room: 3, number: '303', beds: 2 },
  { floor: 3, room: 4, number: '304', beds: 2 },
];

export const RENT_PER_PERSON = 3500;
export const DEPOSIT_PER_BED = 3500;
export const TOTAL_ROOMS = 9;
export const TOTAL_BEDS = 18;
export const POINTS_TO_RUPEE = 10;
export const REFERRAL_REWARD_RUPEES = 500;
export const REFERRAL_REWARD_POINTS = 500 * 10; // 5000 points = ₹500

// ===== UTILITY =====
export function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 11);
}

export function getMonthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function formatCurrency(amount) {
  return `₹${Number(amount || 0).toLocaleString('en-IN')}`;
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

// ===== AUTH (session-based, stays local) =====
const ADMIN_SESSION_KEY = 'kalpdev_admin_session';
const STUDENT_SESSION_KEY = 'kalpdev_student_session';

export async function adminLogin(username, password) {
  const settings = await getDocument(COLLECTIONS.SETTINGS, 'admin_creds');
  const creds = settings || { username: 'admin', password: 'admin123' };
  if (username === creds.username && password === creds.password) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
    return { success: true };
  }
  return { success: false, error: 'Invalid username or password' };
}

export function isAdminLoggedIn() {
  return sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true';
}

export function adminLogout() {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}

export async function studentLogin(phone) {
  const tenants = await getCollection(COLLECTIONS.TENANTS);
  const tenant = tenants.find(t => t.phone === phone);
  if (tenant) {
    sessionStorage.setItem(STUDENT_SESSION_KEY, JSON.stringify(tenant));
    return { success: true, tenant };
  }
  return { success: false, error: 'No tenant found with this phone number' };
}

export function isStudentLoggedIn() {
  return !!sessionStorage.getItem(STUDENT_SESSION_KEY);
}

export function getLoggedInStudent() {
  const data = sessionStorage.getItem(STUDENT_SESSION_KEY);
  return data ? JSON.parse(data) : null;
}

export function studentLogout() {
  sessionStorage.removeItem(STUDENT_SESSION_KEY);
}

export async function getAdminCreds() {
  const settings = await getDocument(COLLECTIONS.SETTINGS, 'admin_creds');
  return settings || { username: 'admin', password: 'admin123' };
}

export async function saveAdminCreds(creds) {
  await setDocument(COLLECTIONS.SETTINGS, 'admin_creds', creds);
}

// ===== TENANTS =====
export async function getTenants() {
  return await getCollection(COLLECTIONS.TENANTS);
}

export async function addTenant(tenant) {
  return await addDocument(COLLECTIONS.TENANTS, tenant);
}

export async function updateTenant(id, data) {
  await updateDocument(COLLECTIONS.TENANTS, id, data);
}

export async function deleteTenant(id) {
  await deleteDocument(COLLECTIONS.TENANTS, id);
}

// ===== RENT =====
export async function getRentRecords() {
  return await getCollection(COLLECTIONS.RENT);
}

export async function markRentPaid(tenantId, month, amount) {
  return await addDocument(COLLECTIONS.RENT, {
    tenantId, month, amount, paid: true,
    paidDate: new Date().toISOString().split('T')[0],
  });
}

export async function markRentUnpaid(tenantId, month) {
  const records = await getRentRecords();
  const record = records.find(r => r.tenantId === tenantId && r.month === month);
  if (record) await deleteDocument(COLLECTIONS.RENT, record.id);
}

// ===== ELECTRICITY =====
export async function getElectricityRecords() {
  return await getCollection(COLLECTIONS.ELECTRICITY);
}

export async function addElectricityBill(bill) {
  return await addDocument(COLLECTIONS.ELECTRICITY, bill);
}

// ===== EXPENSES =====
export async function getExpenses() {
  return await getCollection(COLLECTIONS.EXPENSES);
}

export async function addExpense(expense) {
  return await addDocument(COLLECTIONS.EXPENSES, expense);
}

// ===== VISITORS =====
export async function getVisitors() {
  return await getCollection(COLLECTIONS.VISITORS);
}

export async function addVisitor(visitor) {
  return await addDocument(COLLECTIONS.VISITORS, visitor);
}

// ===== NOTICES =====
export async function getNotices() {
  return await getCollection(COLLECTIONS.NOTICES);
}

export async function addNotice(notice) {
  return await addDocument(COLLECTIONS.NOTICES, notice);
}

// ===== DARK MODE (stays local) =====
export function getDarkMode() {
  return localStorage.getItem('kalpdev_dark_mode') === 'true';
}

export function setDarkMode(value) {
  localStorage.setItem('kalpdev_dark_mode', value.toString());
}

// ===== COMPUTED HELPERS =====
export function getRoomOccupancy(tenants, roomNumber) {
  return tenants.filter(t => t.roomNumber === roomNumber);
}

export function getOccupancyStats(tenants) {
  const occupied = tenants.length;
  const vacant = TOTAL_BEDS - occupied;
  const percentage = Math.round((occupied / TOTAL_BEDS) * 100);
  return { occupied, vacant, percentage, total: TOTAL_BEDS };
}

export function getMonthlyCollection(rentRecords, month) {
  const records = rentRecords.filter(r => r.month === month && r.paid);
  return records.reduce((sum, r) => sum + (r.amount || RENT_PER_PERSON), 0);
}

export function getPendingRent(tenants, rentRecords, month) {
  const paidIds = rentRecords.filter(r => r.month === month && r.paid).map(r => r.tenantId);
  const unpaid = tenants.filter(t => !paidIds.includes(t.id));
  return unpaid.length * RENT_PER_PERSON;
}

// ===== PAYMENT TRACKER =====
export async function getPaymentReminders() {
  return await getCollection(COLLECTIONS.PAYMENT_REMINDERS);
}

export async function addPaymentReminder(reminder) {
  return await addDocument(COLLECTIONS.PAYMENT_REMINDERS, { ...reminder, status: 'pending' });
}

export function getPaymentStatus(tenants, rentRecords, month) {
  const paidRecords = rentRecords.filter(r => r.month === month && r.paid);
  const paidIds = paidRecords.map(r => r.tenantId);
  const dueDate = `${month}-05`;
  const today = new Date().toISOString().split('T')[0];

  return tenants.map(t => {
    const record = paidRecords.find(r => r.tenantId === t.id);
    const isOverdue = !record && today > dueDate;
    return {
      ...t, isPaid: !!record, paidDate: record ? record.paidDate : null, isOverdue,
      daysOverdue: isOverdue ? Math.floor((new Date(today) - new Date(dueDate)) / (1000 * 60 * 60 * 24)) : 0,
    };
  });
}

// ===== SHARING / REFERRALS =====
export async function getSharingDetails() {
  return await getCollection(COLLECTIONS.SHARING);
}

export async function addSharingDetail(detail) {
  return await addDocument(COLLECTIONS.SHARING, { ...detail, status: 'active' });
}

export async function updateSharingDetail(id, data) {
  await updateDocument(COLLECTIONS.SHARING, id, data);
}

export async function deleteSharingDetail(id) {
  await deleteDocument(COLLECTIONS.SHARING, id);
}

// ===== REWARDS & AFFILIATE =====
export async function getRewardsProducts() {
  return await getCollection(COLLECTIONS.REWARDS_PRODUCTS);
}

export async function addRewardsProduct(product) {
  return await addDocument(COLLECTIONS.REWARDS_PRODUCTS, product);
}

export async function updateRewardsProduct(id, data) {
  await updateDocument(COLLECTIONS.REWARDS_PRODUCTS, id, data);
}

export async function deleteRewardsProduct(id) {
  await deleteDocument(COLLECTIONS.REWARDS_PRODUCTS, id);
}

export async function getRewardsPoints(tenantId) {
  const doc = await getDocument(COLLECTIONS.REWARDS_POINTS, tenantId);
  return doc || { balance: 0, history: [] };
}

export async function addPoints(tenantId, points, reason) {
  const current = await getRewardsPoints(tenantId);
  const updated = {
    balance: (current.balance || 0) + points,
    history: [...(current.history || []), { id: generateId(), type: 'earned', points, reason, date: new Date().toISOString() }],
  };
  await setDocument(COLLECTIONS.REWARDS_POINTS, tenantId, updated);
  return updated;
}

export async function redeemPoints(tenantId, points, reason) {
  const current = await getRewardsPoints(tenantId);
  if (current.balance < points) return { success: false, error: 'Insufficient points' };
  const updated = {
    balance: current.balance - points,
    history: [...(current.history || []), { id: generateId(), type: 'redeemed', points, reason, date: new Date().toISOString() }],
  };
  await setDocument(COLLECTIONS.REWARDS_POINTS, tenantId, updated);
  return { success: true, data: updated };
}

export async function getRewardsPurchases() {
  return await getCollection(COLLECTIONS.REWARDS_PURCHASES);
}

export async function addRewardsPurchase(purchase) {
  return await addDocument(COLLECTIONS.REWARDS_PURCHASES, { ...purchase, verified: false });
}

export async function verifyPurchase(purchaseId) {
  const purchases = await getRewardsPurchases();
  const purchase = purchases.find(p => p.id === purchaseId);
  if (purchase && !purchase.verified) {
    await updateDocument(COLLECTIONS.REWARDS_PURCHASES, purchaseId, { verified: true, verifiedAt: new Date().toISOString() });
    await addPoints(purchase.tenantId, purchase.pointsEarned, `Purchase: ${purchase.productName}`);
  }
}

export async function getRedemptions() {
  return await getCollection(COLLECTIONS.REWARDS_REDEMPTIONS);
}

export async function addRedemption(redemption) {
  return await addDocument(COLLECTIONS.REWARDS_REDEMPTIONS, redemption);
}

// ===== LANDING PAGE CMS =====
const DEFAULT_SERVICES = [
  { id: '1', title: 'Gated Society', desc: 'Secure gated community with restricted access for residents only.', img: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=600&h=400&fit=crop' },
  { id: '2', title: 'CCTV Surveillance', desc: '24/7 CCTV monitoring across all floors and common areas.', img: 'https://images.unsplash.com/photo-1558002038-1055907df827?w=600&h=400&fit=crop' },
  { id: '3', title: 'Security Guard', desc: 'Trained security personnel on duty round the clock.', img: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&h=400&fit=crop' },
  { id: '4', title: 'Mineral Drinking Water', desc: 'Pure RO mineral water available 24/7 for all residents.', img: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=600&h=400&fit=crop' },
  { id: '5', title: 'Free High-Speed WiFi', desc: 'Unlimited high-speed internet for work and entertainment.', img: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=600&h=400&fit=crop' },
  { id: '6', title: 'Personal Cupboard', desc: 'Dedicated lockable cupboard for each resident.', img: 'https://images.unsplash.com/photo-1558997519-83ea9252edf8?w=600&h=400&fit=crop' },
  { id: '7', title: 'Bed with Mattress', desc: 'Comfortable beds with quality mattresses for restful sleep.', img: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&h=400&fit=crop' },
  { id: '8', title: 'Fully Furnished PG', desc: 'Move-in ready rooms with all essential furniture provided.', img: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&h=400&fit=crop' },
  { id: '9', title: 'No Electricity Restrictions', desc: 'Use AC, heater, or any appliance — no extra charges.', img: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=600&h=400&fit=crop' },
  { id: '10', title: 'Sports & Recreation', desc: 'Badminton, carrom, and chess available for leisure time.', img: 'https://images.unsplash.com/photo-1529926706528-db9e5010cd3e?w=600&h=400&fit=crop' },
  { id: '11', title: 'Project & Technical Guidance', desc: 'Expert mentorship for academic projects and technical skills.', img: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600&h=400&fit=crop' },
  { id: '12', title: 'Interview Prep & Job Referrals', desc: 'Mock interviews, resume help, and direct referrals in top companies.', img: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=600&h=400&fit=crop' },
];

const DEFAULT_TESTIMONIALS = [
  { id: '1', name: 'Rahul Sharma', room: 'Room 201', text: 'Best PG experience! Clean rooms, great food, and amazing community.', rating: 5 },
  { id: '2', name: 'Priya Patel', room: 'Room 302', text: 'Feels like home away from home. The management is very responsive.', rating: 5 },
  { id: '3', name: 'Amit Kumar', room: 'Room 203', text: 'Affordable, comfortable, and well-maintained. Highly recommended!', rating: 4 },
];

const DEFAULT_HERO = {
  tagline: 'Premium Girls PG Living',
  title: 'KalpDev PG',
  subtitle: 'Comfort • Safety • Better Living',
  description: 'A safe and premium paying guest accommodation exclusively for girls — with career guidance, sports facilities, and a supportive community to help you grow.',
  heroImage: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=700&h=500&fit=crop',
};

export async function getLandingServices() {
  const doc = await getDocument(COLLECTIONS.LANDING_CONTENT, 'services');
  return doc?.items || DEFAULT_SERVICES;
}

export async function saveLandingServices(services) {
  await setDocument(COLLECTIONS.LANDING_CONTENT, 'services', { items: services });
}

export async function getLandingTestimonials() {
  const doc = await getDocument(COLLECTIONS.LANDING_CONTENT, 'testimonials');
  return doc?.items || DEFAULT_TESTIMONIALS;
}

export async function saveLandingTestimonials(testimonials) {
  await setDocument(COLLECTIONS.LANDING_CONTENT, 'testimonials', { items: testimonials });
}

export async function getLandingHero() {
  const doc = await getDocument(COLLECTIONS.LANDING_CONTENT, 'hero');
  return doc || DEFAULT_HERO;
}

export async function saveLandingHero(hero) {
  await setDocument(COLLECTIONS.LANDING_CONTENT, 'hero', hero);
}

// Tenant-specific helpers
export function getTenantRentHistory(rentRecords, tenantId) {
  return rentRecords.filter(r => r.tenantId === tenantId);
}

export function getTenantElectricity(electricityRecords, roomNumber) {
  return electricityRecords.filter(r => r.roomNumber === roomNumber);
}
