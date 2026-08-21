import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Trophy, Zap, Flame, Target, TrendingUp, Medal, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamificacao, useRanking } from '../hooks/useGamificacao';

export default function Desempenho() {
  const navigate = useNavigate();
  const [perfil, setPerfil] = useState(null);
  
  // Pegamos os dados em tempo real do seu Hook de Gamificação!
  const { xp, streak, loading: loadingGami } = useGamificacao();
  
  // Pegamos o Ranking (limitado aos Top 10)
  const { ranking, loading: loadingRanking } = useRanking({ limite: 10 });

  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return navigate('/login');
      
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, turma_id')
        .eq('id', user.id)
        .single();
        
      if (data) setPerfil(data);
    }
    carregarPerfil();
  }, [navigate]);

  // Lógica simples de Níveis (A cada 500 XP o aluno sobe de nível)
  const nivelAtual = Math.floor(xp / 500) + 1;
  const xpProximoNivel = nivelAtual * 500;
  const progressoNivel = ((xp % 500) / 500) * 100;

  // Dados simulados de matérias para o gráfico (numa v2 puxaremos do banco)
  const desempenhoMaterias = [
    { nome: 'Matemática Básica', acertos: 85, cor: 'bg-brand-orange' },
    { nome: 'Lógica', acertos: 60, cor: 'bg-amber-500' },
    { nome: 'Estatística', acertos: 40, cor: 'bg-red-500' },
    { nome: 'Geometria', acertos: 90, cor: 'bg-emerald-500' },
  ];

  if (loadingGami || loadingRanking || !perfil) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans p-6 md:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* HEADER */}
        <div className="flex items-center gap-4 mb-4">
          <Link to="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-brand-orange" />
              Meu Desempenho
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Acompanhe sua evolução e posição na turma.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* LADO ESQUERDO: ESTATÍSTICAS E GRÁFICOS */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* CARDS DE TOPO */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              
              {/* Card Nível */}
              <div className="bg-slate-950 p-6 rounded-3xl text-white relative overflow-hidden shadow-lg shadow-slate-900/20">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-brand-orange rounded-full opacity-20 blur-2xl"></div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-white/10 rounded-xl"><Trophy className="w-5 h-5 text-brand-orange" /></div>
                  <span className="font-bold text-sm text-slate-300 uppercase tracking-wider">Nível Atual</span>
                </div>
                <h3 className="text-4xl font-black mb-1">{nivelAtual}</h3>
                <p className="text-xs font-medium text-slate-400">Iniciante</p>
                
                <div className="mt-5">
                  <div className="flex justify-between text-xs font-bold mb-2">
                    <span className="text-brand-orange">{xp} XP</span>
                    <span className="text-slate-400">Meta: {xpProximoNivel} XP</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-brand-orange rounded-full transition-all duration-1000" style={{ width: `${progressoNivel}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Card Streak */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center mb-3">
                  <Flame className="w-7 h-7 text-brand-orange" />
                </div>
                <span className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-1">Ofensiva</span>
                <h3 className="text-3xl font-black text-slate-900">{streak} <span className="text-lg text-slate-500">dias</span></h3>
              </div>

              {/* Card XP Total */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-center items-center text-center">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-3">
                  <Zap className="w-7 h-7 text-amber-500" />
                </div>
                <span className="font-bold text-xs text-slate-500 uppercase tracking-wider mb-1">XP Total Acumulado</span>
                <h3 className="text-3xl font-black text-slate-900">{xp}</h3>
              </div>

            </div>

            {/* GRÁFICO DE BARRAS: DESEMPENHO POR MATÉRIA */}
            <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-8">
                <Target className="w-6 h-6 text-slate-400" />
                <h2 className="text-lg font-black text-slate-900">Taxa de Acertos por Matéria</h2>
              </div>

              <div className="space-y-5">
                {desempenhoMaterias.map((materia, idx) => (
                  <div key={idx}>
                    <div className="flex justify-between text-sm font-bold mb-2">
                      <span className="text-slate-700">{materia.nome}</span>
                      <span className="text-slate-900">{materia.acertos}%</span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full ${materia.cor} transition-all duration-1000`} 
                        style={{ width: `${materia.acertos}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* LADO DIREITO: RANKING DA TURMA */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col h-full overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center gap-3 shrink-0">
              <Medal className="w-6 h-6 text-brand-orange" />
              <div>
                <h2 className="font-black text-slate-900">Ranking da Turma</h2>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Top 10 Alunos</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {ranking.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-medium text-sm">
                  Nenhum aluno com XP ainda.
                </div>
              ) : (
                ranking.map((aluno, idx) => {
                  const isEu = aluno.id === perfil.id;
                  let corPosicao = "bg-slate-100 text-slate-500";
                  if (idx === 0) corPosicao = "bg-amber-100 text-amber-600 border border-amber-200";
                  if (idx === 1) corPosicao = "bg-slate-200 text-slate-600 border border-slate-300";
                  if (idx === 2) corPosicao = "bg-orange-100 text-orange-700 border border-orange-200";

                  return (
                    <div 
                      key={aluno.id} 
                      className={`flex items-center gap-3 p-3 rounded-2xl transition-colors ${isEu ? 'bg-orange-50 border border-orange-100' : 'hover:bg-slate-50'}`}
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm shrink-0 ${corPosicao}`}>
                        {idx + 1}
                      </div>
                      
                      <div className="flex-1 min-w-0 flex items-center gap-2">
                        <span className={`font-bold truncate text-sm ${isEu ? 'text-brand-orange' : 'text-slate-700'}`}>
                          {aluno.nome?.split(' ')[0] || 'Aluno'} {isEu && '(Você)'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg shrink-0">
                        <Zap className="w-3.5 h-3.5 text-amber-500" />
                        <span className="font-bold text-xs text-slate-700">{aluno.xp}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}