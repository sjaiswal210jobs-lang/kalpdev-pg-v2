import React, { createContext, useContext, useState, useEffect } from 'react';
import { subscribeToCollection, COLLECTIONS } from './firebase';

const DataContext = createContext(null);

export function DataProvider({ children }) {
  const [tenants, setTenants] = useState([]);
  const [rentRecords, setRentRecords] = useState([]);
  const [electricityRecords, setElectricityRecords] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [visitors, setVisitors] = useState([]);
  const [notices, setNotices] = useState([]);
  const [paymentReminders, setPaymentReminders] = useState([]);
  const [sharingDetails, setSharingDetails] = useState([]);
  const [rewardsProducts, setRewardsProducts] = useState([]);
  const [rewardsPurchases, setRewardsPurchases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribers = [];

    try {
      unsubscribers.push(subscribeToCollection(COLLECTIONS.TENANTS, setTenants));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.RENT, setRentRecords));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.ELECTRICITY, setElectricityRecords));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.EXPENSES, setExpenses));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.VISITORS, setVisitors));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.NOTICES, setNotices));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.PAYMENT_REMINDERS, setPaymentReminders));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.SHARING, setSharingDetails));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.REWARDS_PRODUCTS, setRewardsProducts));
      unsubscribers.push(subscribeToCollection(COLLECTIONS.REWARDS_PURCHASES, setRewardsPurchases));
    } catch (err) {
      console.error('Firebase subscription error:', err);
    }

    // Don't block rendering
    setLoading(false);

    return () => unsubscribers.forEach(unsub => { try { unsub(); } catch(e) {} });
  }, []);

  const value = {
    tenants, rentRecords, electricityRecords, expenses, visitors, notices,
    paymentReminders, sharingDetails, rewardsProducts, rewardsPurchases, loading,
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
}
