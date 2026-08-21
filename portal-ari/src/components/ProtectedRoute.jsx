import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Envolve rotas que exigem aluno logado. Enquanto a sessão ainda está
// carregando, mostra um loading simples em vez de chutar pro /login
// (senão todo refresh de página manda o aluno de volta pro login por um instante).
export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-brand-orange rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}