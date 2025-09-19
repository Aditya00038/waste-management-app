
"use client";

import { createContext, useContext, useState, ReactNode, useEffect, useCallback } from "react";
import type { User, UserRole } from "@/lib/types";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (user: User) => void;
  logout: () => Promise<void>;
  switchRole: (roleOrEmail: UserRole | string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get cached user data first
    const cachedUserString = localStorage.getItem('cached_user_data');
    if (cachedUserString) {
      try {
        const cachedUser = JSON.parse(cachedUserString) as User;
        // Use cached data immediately for faster UI rendering
        setUser(cachedUser);
        setLoading(false);
      } catch (e) {
        // Ignore parse errors, will load from Firebase instead
        localStorage.removeItem('cached_user_data');
      }
    }
    
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const userDocRef = doc(db, "users", fbUser.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          setUser(userData);
          
          // Cache user data for faster subsequent loads
          localStorage.setItem('cached_user_data', JSON.stringify(userData));
        } else {
          // This case handles both new signups and first-time logins for pre-created accounts
          const name = fbUser.displayName || fbUser.email?.split('@')[0] || 'New User';
          const avatar = fbUser.photoURL || `https://avatar.vercel.sh/${name}.png`;
          let newUser: User;

          // Special roles for pre-defined users
          switch (fbUser.email) {
            case 'admin@swachh.com':
              newUser = { id: fbUser.uid, name: 'Admin User', email: fbUser.email || '', role: 'Admin', avatar, moduleCompletion: {} };
              break;
            case 'gc@swachh.com':
              newUser = { id: fbUser.uid, name: 'Green Champion', email: fbUser.email || '', role: 'Green Champion', avatar, points: 2500, assignedZone: "Koregaon Park", courseProgress: 100, badges: ["Certified Recycler", "Waste Warrior"], moduleCompletion: {} };
              break;
            case 'ww@swachh.com':
              newUser = { id: fbUser.uid, name: 'Waste Worker', email: fbUser.email || '', role: 'Waste Worker', avatar, employeeId: 'WW-123', assignedRoute: 'Route 42', moduleCompletion: {} };
              break;
            case 'bp@swachh.com':
              newUser = { id: fbUser.uid, name: 'Bulk Producer', email: fbUser.email || '', role: 'Bulk Producer', avatar, institutionName: "The Grand Hotel", fines: 1500, address: "123 MG Road, Pune", moduleCompletion: {} };
              break;
            default:
              // Default role for any other new user
              newUser = {
                id: fbUser.uid,
                name,
                email: fbUser.email || '',
                role: 'Citizen',
                avatar,
                points: 0,
                badges: [],
                courseProgress: 0,
                moduleCompletion: {}
              };
          }
          
          await setDoc(userDocRef, newUser);
          setUser(newUser);
          
          // Cache user data
          localStorage.setItem('cached_user_data', JSON.stringify(newUser));
        }
      } else {
        setUser(null);
        // Clear cached data on logout
        localStorage.removeItem('cached_user_data');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await auth.signOut();
    setUser(null);
  };
  
  const login = (user: User) => {
    if (user && auth.currentUser) {
        setUser(user);
        const userDocRef = doc(db, "users", auth.currentUser.uid);
        setDoc(userDocRef, user, { merge: true });
    }
  }

  const switchRole = useCallback(async (role: UserRole | string): Promise<boolean> => {
    // This is a deprecated demo-only function and will be removed.
    // User role changes are now handled by an admin.
    return false;
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, login, logout, switchRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
