import { useState, useEffect } from 'react';
import { subscribeToCollection, getCollection, addDocument, updateDocument, deleteDocument, setDocument, getDocument, db, COLLECTIONS } from './firebase';
import { collection, doc, onSnapshot } from 'firebase/firestore';

// Hook to subscribe to a Firestore collection in real-time
export function useCollection(collectionName) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToCollection(collectionName, (items) => {
      setData(items);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName]);

  return { data, loading };
}

// Hook to subscribe to a single document
export function useDocument(collectionName, docId) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!docId) { setLoading(false); return; }
    const unsubscribe = onSnapshot(doc(db, collectionName, docId), (snap) => {
      setData(snap.exists() ? { id: snap.id, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [collectionName, docId]);

  return { data, loading };
}
