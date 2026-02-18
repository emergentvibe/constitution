'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

interface Citizen {
  id: string;
  user_id: string;
  wallet_address: string | null;
  display_name: string | null;
  status: 'pending' | 'active' | 'suspended' | 'revoked';
  created_at: string;
}

interface AuthContextType {
  user: User | null;
  citizen: Citizen | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshCitizen: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [citizen, setCitizen] = useState<Citizen | null>(null);
  const [loading, setLoading] = useState(true);
  
  const supabase = createClient();
  
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchCitizen(session.user.id);
      } else {
        setLoading(false);
      }
    });
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          await fetchCitizen(session.user.id);
        } else {
          setCitizen(null);
          setLoading(false);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  async function fetchCitizen(userId: string) {
    try {
      const { data, error } = await supabase
        .from('citizens')
        .select('*')
        .eq('user_id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        console.error('Error fetching citizen:', error);
      }
      
      setCitizen(data || null);
    } catch (err) {
      console.error('Error fetching citizen:', err);
    } finally {
      setLoading(false);
    }
  }
  
  async function signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error as Error | null };
  }
  
  async function signUp(email: string, password: string) {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error: error as Error | null };
  }
  
  async function signOut() {
    await supabase.auth.signOut();
    setCitizen(null);
  }
  
  async function refreshCitizen() {
    if (user) {
      await fetchCitizen(user.id);
    }
  }
  
  return (
    <AuthContext.Provider 
      value={{ user, citizen, loading, signIn, signUp, signOut, refreshCitizen }}
    >
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
