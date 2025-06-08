import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '@/types/blog';
import { auth, db } from '@/firebase';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc, onSnapshot, updateDoc, arrayUnion, increment } from 'firebase/firestore';
import { Alert } from 'react-native';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  followUser: (userIdToFollow: string) => Promise<void>;
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
            followers: userData.followers || [],
            following: userData.following || [],
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

  useEffect(() => {
    if (auth.currentUser) {
      const userDocRef = doc(db, 'users', auth.currentUser.uid);
      const unsubscribe = onSnapshot(userDocRef, (docSnapshot) => {
        if (docSnapshot.exists()) {
          const userData = docSnapshot.data();
          setAuthState((prev) => ({
            ...prev,
            user: prev.user
              ? {
                  ...prev.user,
                  name: userData.name,
                  email: userData.email,
                  avatar: userData.avatar,
                  bio: userData.bio ?? prev.user.bio ?? '',
                  followersCount: userData.followersCount ?? prev.user.followersCount ?? 0,
                  followingCount: userData.followingCount ?? prev.user.followingCount ?? 0,
                  postsCount: userData.postsCount ?? prev.user.postsCount ?? 0,
                  followers: userData.followers ?? prev.user.followers ?? [],
                  following: userData.following ?? prev.user.following ?? [],
                }
              : null,
          }));
        }
      });

      return () => unsubscribe();
    }
  }, [auth.currentUser]);

  const login = async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      let message = 'An unknown error occurred.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Login Error', message);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
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
        followers: [],
        following: [],
        notifications: [],
      });
    } catch (error) {
      let message = 'An unknown error occurred.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Signup Error', message);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const logout = async () => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
    try {
      await signOut(auth);
    } catch (error) {
      let message = 'An unknown error occurred.';
      if (error instanceof Error) {
        message = error.message;
      }
      Alert.alert('Logout Error', message);
    } finally {
      setAuthState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const followUser = async (userIdToFollow: string) => {
    if (!auth.currentUser) {
      console.error('User is not authenticated.');
      return;
    }

    const currentUserRef = doc(db, 'users', auth.currentUser.uid);
    const userToFollowRef = doc(db, 'users', userIdToFollow);

    try {
      await updateDoc(currentUserRef, {
        following: arrayUnion(userIdToFollow),
        followingCount: increment(1),
      });

      await updateDoc(userToFollowRef, {
        followers: arrayUnion(auth.currentUser.uid),
        followersCount: increment(1),
      });

      console.log('Successfully followed user:', userIdToFollow);
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, signup, logout, followUser }}>
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