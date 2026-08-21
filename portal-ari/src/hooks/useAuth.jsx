import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AuthContext = createContext(undefined);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [profile, setProfile] = useState(null); // { id, turma_id, nome, is_admin, turmas: { slug, nome } }
  const [loading, setLoading] = useState(true);

  async function carregarProfile(userId) {
    if (!userId) {
      setProfile(null);
      return;
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('id, nome, turma_id, is_admin, turmas ( slug, nome )')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao carregar profile:', error);
      setProfile(null);
      return;
    }
    setProfile(data);
  }

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await carregarProfile(session?.user?.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await carregarProfile(session?.user?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  // turmaSlug: o `nicheId` escolhido na landing page (ex: 'enem', 'concursos'...)
  async function signUp({ email, password, nome, turmaSlug }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nome, turma_slug: turmaSlug },
      },
    });
    return { data, error };
  }

  async function signIn({ email, password }) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  const value = {
    session,
    user: session?.user ?? null,
    profile,               // profile.turmas.slug / profile.is_admin disponíveis aqui
    turmaId: profile?.turma_id ?? null,
    loading,
    signUp,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (ctx === undefined) {
    throw new Error('useAuth precisa ser usado dentro de <AuthProvider>');
  }
  return ctx;
}