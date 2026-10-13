"use client"

import { Session, User } from '@supabase/supabase-js';
import { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { supabase } from '@/lib/dbauth';
import { api, type Api } from '@/lib/api';

const authContext = createContext<{
    session: any | Session | null;
    user: any | User | null;
    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    setSession: React.Dispatch<React.SetStateAction<any | Session | null>>;
    /** Resolves to an error message, or null when signed in. */
    signIn: (email: string, password: string) => Promise<string | null>;
    signOut: () => Promise<void>;
}>({
    session: null,
    user: null,
    setUser: () => {},
    setSession: () => {},
    signIn: async () => null,
    signOut: async () => {},
});

export function AuthContext({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<any | Session | null>(null);

    useEffect(() => {
        // Supabase keeps the session in localStorage, so a reload stays signed in.
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setSession(session || null);
        });
        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        return error ? error.message : null;
    };

    const signOut = async () => {
        await supabase.auth.signOut();
    };

    return (
        <authContext.Provider value={{ user, session, setUser, setSession, signIn, signOut }}>
            {children}
        </authContext.Provider>
    );
}

export function useAuthContext() {
    const context = useContext(authContext);
    if (!context) {
        throw new Error('useAuthContext must be used within an AuthContext');
    }
    return context;
}

/** api() signed as the current user (no token when signed out). */
export function useApi(): Api {
    const { session } = useAuthContext();
    const token: string | undefined = session?.access_token;
    return useCallback((path, opts) => api(path, { ...opts, token }), [token]);
}
