"use client"

import { Session, User } from '@supabase/supabase-js';
import { createContext, useState, useEffect, useContext } from 'react';
import { supabase, mockSignIn, mockModSignIn } from '@/lib/dbauth'; // mockModSignIn / mockSignIn for testing User/Mod view

const authContext = createContext<{
    session: any | Session | null;
    user: any | User | null;
    setUser: React.Dispatch<React.SetStateAction<any | null>>;
    setSession: React.Dispatch<React.SetStateAction<any | Session | null>>;
}>({
    session: null,
    user: null,
    setUser: () => {},
    setSession: () => {}
});
export function AuthContext({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<any | null>(null);
    const [session, setSession] = useState<any | Session | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user || null);
            setSession(session || null);
        });

        mockSignIn(); // for testing User view
        // mockModSignIn(); // for testing Mod view
        return () => subscription.unsubscribe();
    }, []);

    return (
        <authContext.Provider value={{ user, session, setUser, setSession }}>
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