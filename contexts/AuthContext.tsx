import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/types/blog';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  useEffect(() => {
    // Listen for Firebase Auth state changes
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Get user profile from Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setAuthState({
          user: {
            id: firebaseUser.uid,
            name: firebaseUser.displayName || userData.name || '',
            email: firebaseUser.email || '',
            avatar: userData.avatar || '',
            bio: userData.bio || '',
            followersCount: userData.followersCount || 0,
            followingCount: userData.followingCount || 0,
            postsCount: userData.postsCount || 0,
          },
          isLoading: false,
          isAuthenticated: true,
        });
      } else {
        setAuthState({ user: null, isLoading: false, isAuthenticated: false });
      }
    });
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    await signInWithEmailAndPassword(auth, email, password);
    // onAuthStateChanged will update state
  };

  const signup = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    await updateProfile(user, { displayName: name });
    // Create user profile in Firestore
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      avatar: '',
      bio: 'New blogger ready to share amazing content',
      followersCount: 0,
      followingCount: 0,
      postsCount: 0,
    });
    // onAuthStateChanged will update state
  };

  const logout = async () => {
    await signOut(auth);
    setAuthState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}