
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import {
    collection,
    query,
    onSnapshot,
    QueryConstraint,
    DocumentData
} from 'firebase/firestore';

export function useFirestoreCollection<T = DocumentData>(
    collectionName: string,
    constraints: QueryConstraint[] = [],
    enabled: boolean = true
) {
    const [data, setData] = useState<T[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Use a ref to track if constraints actually changed deep down, 
    // but for now we'll rely on the user passing stable arrays (useMemo) 
    // or just accept re-subscriptions on render if not careful.
    // To be safe, we stringify the *serializable* parts if we could, but we can't.
    // We will just depend on the constraints array reference.

    useEffect(() => {
        if (!enabled) {
            setLoading(false);
            return;
        }

        if (!db) {
            console.warn("Firestore not initialized");
            return;
        }

        setLoading(true);

        try {
            const ref = collection(db, collectionName);
            const q = query(ref, ...constraints);

            const unsubscribe = onSnapshot(q, (snapshot) => {
                const results = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as unknown as T[];

                setData(results);
                setLoading(false);
                setError(null);
            }, (err) => {
                console.error(`Error fetching ${collectionName}:`, err);
                setError(err.message);
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err: any) {
            setError(err.message);
            setLoading(false);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [collectionName, enabled, constraints.length, ...constraints]);
    // We destructured constraints to try and catch changes, but it's imperfect. 
    // Ideally useMemo in parent.

    return { data, loading, error };
}
