import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyC1TivclBVLz_eUfNepG4s5VHidY7aFNgY",
  authDomain: "kalpdev-pg.firebaseapp.com",
  projectId: "kalpdev-pg",
  storageBucket: "kalpdev-pg.firebasestorage.app",
  messagingSenderId: "309400554968",
  appId: "1:309400554968:web:22ff464b48275fef37f6ad",
  measurementId: "G-Q51PX5F0NQ"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Collection references
export const COLLECTIONS = {
  TENANTS: 'tenants',
  RENT: 'rent_records',
  ELECTRICITY: 'electricity_bills',
  EXPENSES: 'expenses',
  VISITORS: 'visitors',
  NOTICES: 'notices',
  SETTINGS: 'settings',
  PAYMENT_REMINDERS: 'payment_reminders',
  SHARING: 'sharing_details',
  REWARDS_PRODUCTS: 'rewards_products',
  REWARDS_POINTS: 'rewards_points',
  REWARDS_PURCHASES: 'rewards_purchases',
  REWARDS_REDEMPTIONS: 'rewards_redemptions',
  LANDING_CONTENT: 'landing_content',
};

// Generic Firestore helpers
export async function getCollection(collectionName) {
  const snapshot = await getDocs(collection(db, collectionName));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export async function getDocument(collectionName, docId) {
  const docRef = doc(db, collectionName, docId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
}

export async function addDocument(collectionName, data) {
  const docRef = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: new Date().toISOString(),
  });
  return { id: docRef.id, ...data, createdAt: new Date().toISOString() };
}

export async function setDocument(collectionName, docId, data) {
  await setDoc(doc(db, collectionName, docId), data, { merge: true });
}

export async function updateDocument(collectionName, docId, data) {
  await updateDoc(doc(db, collectionName, docId), data);
}

export async function deleteDocument(collectionName, docId) {
  await deleteDoc(doc(db, collectionName, docId));
}

// Real-time listener
export function subscribeToCollection(collectionName, callback) {
  return onSnapshot(collection(db, collectionName), (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(data);
  });
}

export { collection, doc, getDocs, getDoc, setDoc, addDoc, updateDoc, deleteDoc, query, where, orderBy, onSnapshot };
