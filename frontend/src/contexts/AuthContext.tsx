"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider, db } from '@/lib/firebase';
import { User, AuthContextType } from '@/types';
import { useRouter } from 'next/navigation';
import { onAuthStateChanged, signOut, signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { api } from '@/lib/api';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Check if Firebase is initialized
const isFirebaseEnabled = auth !== null;

// Admin allowlist - emails that can access admin panel
const ADMIN_ALLOWLIST = [
    'admin@zapsters.com',
    'admin@zapsters.in'
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMockLogin, setShowMockLogin] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // If Firebase is not enabled, just set loading to false
        if (!isFirebaseEnabled) {
            console.warn('⚠️ Firebase not initialized - using development mode');
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
            if (firebaseUser) {
                try {
                    // Try to find user by UID
                    const userDocRef = doc(db, 'users', firebaseUser.uid);
                    let userDoc;

                    try {
                        userDoc = await getDoc(userDocRef);
                    } catch (firestoreErr: any) {
                        if (firestoreErr.code === 'permission-denied') {
                            console.error('🔥 Firestore Permission Error: Please update your Firestore Rules in the Firebase Console to allow reads.');
                            setError('Database permission denied. Admin: Check Firestore Rules.');
                            setLoading(false);
                            return;
                        }
                        throw firestoreErr;
                    }

                    let userData = null;

                    if (userDoc.exists()) {
                        userData = {
                            id: userDoc.id,
                            uid: firebaseUser.uid,
                            ...userDoc.data()
                        } as User;
                    } else {
                        // Search by email - Wrap in try/catch to handle permission errors gracefully
                        try {
                            const usersRef = collection(db, 'users');
                            const q = query(usersRef, where('email', '==', firebaseUser.email));
                            const querySnapshot = await getDocs(q);

                            if (!querySnapshot.empty) {
                                const doc = querySnapshot.docs[0];
                                userData = {
                                    id: doc.id,
                                    uid: firebaseUser.uid,
                                    ...doc.data()
                                } as User;
                            } else if (firebaseUser.email && ADMIN_ALLOWLIST.includes(firebaseUser.email)) {
                                // Create admin user
                                userData = {
                                    id: firebaseUser.uid,
                                    uid: firebaseUser.uid,
                                    email: firebaseUser.email,
                                    name: firebaseUser.displayName || 'Admin',
                                    role: 'admin',
                                    createdAt: new Date().toISOString()
                                } as User;
                            }
                        } catch (queryErr) {
                            console.warn("Could not query user by email (likely permissions). Proceeding with default student role.", queryErr);
                            // Fall through to default creation
                        }
                    }

                    if (userData) {
                        setUser(userData);
                    } else {
                        // Auto-create a student record or show legitimate error
                        // For now, allow access as 'student' default for new users
                        const newStudent: User = {
                            id: firebaseUser.uid,
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            name: firebaseUser.displayName || 'Student',
                            role: 'student',
                            createdAt: new Date().toISOString()
                        };
                        setUser(newStudent);

                        // Fire-and-forget sync to ensure Backend creates the real record
                        api.auth.sync().catch((e: any) => console.error("Background sync failed:", e));
                    }
                } catch (err) {
                    console.error('Error fetching user data:', err);
                    setError('Failed to load user data. Check console.');
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Login with Google
    const loginWithGoogle = async () => {
        if (!isFirebaseEnabled) {
            // Mock login for development
            setError(null);
            setShowMockLogin(true);
            return;
        }

        // Real Firebase login
        try {
            setError(null);
            setLoading(true);
            const result = await signInWithPopup(auth, googleProvider);
            console.log("Logged in:", result.user);
            // Result handling is managed by onAuthStateChanged listener
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login. Please try again.');
            setLoading(false);
        }
    };

    // Email/Password login
    const login = async (email: string, password: string) => {
        if (!isFirebaseEnabled) {
            // Mock login for development
            handleMockLogin(email);
            return;
        }

        try {
            setError(null);
            setLoading(true);
            await signInWithEmailAndPassword(auth, email, password);
            // user state updated by listener
        } catch (err: any) {
            console.error('Login error:', err);
            setError(err.message || 'Failed to login');
            setLoading(false);
        }
    };

    // Logout
    const logout = async () => {
        try {
            if (isFirebaseEnabled) {
                await signOut(auth);
            }
            setUser(null);
            localStorage.removeItem('mockEmail');
            router.push('/');
        } catch (err: any) {
            console.error('Logout error:', err);
            setError(err.message || 'Failed to logout');
        }
    };

    const handleMockLogin = async (mockEmail: string) => {
        setShowMockLogin(false); // Close modal
        setLoading(true);

        // Ensure no residual Firebase session exists
        if (isFirebaseEnabled && auth.currentUser) {
            try {
                await signOut(auth);
            } catch (e) {
                console.error("Error signing out residual user:", e);
            }
        }

        // Simulate login delay
        setTimeout(() => {
            if (!mockEmail) {
                setError('Login cancelled');
                setLoading(false);
                return;
            }

            const isAdmin = mockEmail === 'admin@zapsters.com';
            const mockUser: User = {
                id: 'mock-user-id',
                uid: 'mock-uid-123',
                email: mockEmail,
                name: isAdmin ? 'Admin User' : 'Test Student',
                role: isAdmin ? 'admin' : 'student',
                domainId: isAdmin ? undefined : 'web-dev',
                batchId: isAdmin ? undefined : 'batch-a',
                createdAt: new Date().toISOString()
            };

            localStorage.setItem('mockEmail', mockEmail);

            setUser(mockUser);
            setLoading(false);

            // Redirect based on role
            if (mockUser.role === 'admin') {
                router.push('/admin/dashboard');
            } else if (mockUser.role === 'tutor') {
                router.push('/tutor/dashboard');
            } else {
                router.push('/student/dashboard');
            }
        }, 500);
    };

    const value: AuthContextType = {
        user,
        loading,
        error,
        login,
        loginWithGoogle,
        loginWithMock: handleMockLogin,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
            {showMockLogin && (
                <MockLoginModal
                    onSubmit={handleMockLogin}
                    onCancel={() => {
                        setShowMockLogin(false);
                        setError('Login cancelled');
                    }}
                />
            )}
        </AuthContext.Provider>
    );
}

// Simple internal component for the modal
function MockLoginModal({ onSubmit, onCancel }: { onSubmit: (email: string) => void, onCancel: () => void }) {
    const [email, setEmail] = useState('');

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'flex-start',
            paddingTop: '80px', // Top positioning as requested
            animation: 'fadeIn 0.2s ease-out'
        }}>
            <style jsx>{`
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
            `}</style>
            <div style={{
                backgroundColor: 'white',
                padding: '2rem',
                borderRadius: '12px',
                width: '90%',
                maxWidth: '450px',
                boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                animation: 'slideDown 0.3s ease-out',
                display: 'flex',
                flexDirection: 'column',
                gap: '1.5rem'
            }}>
                <div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#111827' }}>
                        Development Login
                    </h3>
                    <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
                        Enter an email address to simulate a login.
                        <br />
                        <span style={{ fontSize: '0.8rem', color: '#E10600' }}>Tip: Use admin@zapsters.com for Admin access.</span>
                    </p>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <label htmlFor="mock-email" style={{ fontSize: '0.875rem', fontWeight: '500', color: '#374151' }}>
                        Email Address
                    </label>
                    <input
                        id="mock-email"
                        autoFocus
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') onSubmit(email);
                            if (e.key === 'Escape') onCancel();
                        }}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            border: '1px solid #D1D5DB',
                            fontSize: '1rem',
                            outline: 'none',
                            transition: 'border-color 0.15s ease'
                        }}
                    />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button
                        onClick={onCancel}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: '1px solid #D1D5DB',
                            backgroundColor: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSubmit(email)}
                        style={{
                            padding: '0.5rem 1rem',
                            borderRadius: '6px',
                            border: 'none',
                            backgroundColor: '#E10600',
                            color: 'white',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: '500',
                            boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)'
                        }}
                    >
                        Login
                    </button>
                </div>
            </div>
        </div>
    );
}

// Custom hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
