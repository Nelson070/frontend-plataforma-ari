import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Protege as rotas /admin/* de verdade: exige login E is_admin = true no profile.
// Diferente do ProtectedRoute (que só exige estar logado).
export default function AdminRoute({ children }) {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!profile?.is_admin) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f4f7f6] text-center px-6">
        <div>
          <h1 className="text-xl font-black text-slate-900 mb-2">Acesso restrito</h1>
          <p className="text-slate-500 font-medium">
            Essa área é exclusiva para administradores da plataforma.
          </p>
        </div>
      </div>
    );
  }

  return children;
}