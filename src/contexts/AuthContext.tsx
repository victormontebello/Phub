import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, phone: string, userType: string, cvi: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  verifyEmail: (token: string, type: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setSession(session ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setSession(session ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Expiração automática de sessão
  useEffect(() => {
    if (!session || !session.expires_at) return;
    const expiresIn = session.expires_at * 1000 - Date.now();
    if (expiresIn <= 0) {
      signOut();
      return;
    }
    const timeout = setTimeout(() => {
      signOut();
    }, expiresIn);
    return () => clearTimeout(timeout);
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
  };

  const signUp = async (email: string, password: string, name: string, phone: string, userType: string, cvi: string) => {
    const baseUrl = import.meta.env.VITE_APP_URL?.replace(/\/$/, '') || '';
    const redirectUrl = `${baseUrl}/auth/callback`;
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name,
          phone: phone,
          user_type: userType,
          cvi: userType === 'veterinarian' ? cvi : null,
        },
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) throw error;

    const { error: dbError } = await supabase.from('profiles').insert({
      id: data.user?.id,
      email: email,
      full_name: name,
      phone: phone,
      avatar_url: '',
      user_type: userType,
      cvi: userType === 'veterinarian' ? cvi : null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (dbError) throw dbError;

    return true;
  };

  const verifyEmail = async (token: string, type: string) => {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type as any,
    });

    if (error) throw error;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    verifyEmail,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};