import { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase.js';
import { verifyUser } from '../services/api.js';

const AuthContext = createContext(null);

let pendingRole = null;
let pendingUsername = null;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Listen to Firebase auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        // Sync Firestore profile
        try {
          const res = await verifyUser({
            role: pendingRole || undefined,
            username: pendingUsername || undefined,
          });
          setUserProfile(res.user);
          pendingRole = null;
          pendingUsername = null;
        } catch (err) {
          console.warn('[Auth] Backend sync failed — proceeding with Firebase auth only:', err?.message);
        }
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  // Register — Firebase creates user + hashes password automatically
  // Backend /verify is called after by onAuthStateChanged to create Firestore profile
  const register = async ({ email, password, username, role }) => {
    pendingRole = role;
    pendingUsername = username;
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: username });
    return credential.user;
  };

  // Login
  const login = async ({ email, password }) => {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return credential.user;
  };

  // Logout
  const logout = async () => {
    await signOut(auth);
    setUserProfile(null);
  };

  const isAdmin = userProfile?.role === 'admin';
  const isSeller = userProfile?.role === 'seller';
  const isBuyer = userProfile?.role === 'buyer' || userProfile?.role === 'user' || !userProfile?.role;

  return (
    <AuthContext.Provider value={{
      user, userProfile, setUserProfile,
      loading, isAdmin, isSeller, isBuyer,
      register, login, logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
