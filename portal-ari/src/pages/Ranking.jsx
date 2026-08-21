import React, { useState, useEffect } from 'react';
import { Trophy, Globe, Search, Medal, BookOpen, Loader2 } from 'lucide-react';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabaseClient';
import { useRanking } from '../hooks/useGamificacao';

const MEDALHA_STYLE = {
  1: 'bg-amber-400 text-amber-900',
  2: 'bg-slate-300 text-slate-700',
  3: 'bg-orange-300 text-orange-900',
};

export default function Ranking() {
  const [perfil, setPerfil] = useState(null);
  const [filtroRanking, setFiltroRanking] = useState('curso'); // 'curso' ou 'geral'
  const [busca, setBusca] = useState('');

  // 1. Busca o perfil do usuário logado para saber qual é a turma dele
  useEffect(() => {
    async function carregarPerfil() {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('id, nome, turma_id, xp')
          .eq('id', user.id)
          .single();
        setPerfil(data);
      }
    }
    carregarPerfil();
  }, []);

  // 2. Aciona o hook de ranking (passando a turma se o filtro for 'curso')
  const { ranking, loading } = useRanking({
    turmaId: filtroRanking === 'curso' ? perfil?.turma_id : null,
    limite: 100, // Traz os top 100
  });

  // 3. Calcula a posição atual do usuário logado no ranking selecionado
  let minhaPosicaoNum = '-';
  let meuXp = perfil?.xp || 0;
  const minhaIndex = ranking.findIndex(r => r.id === perfil?.id);
  
  if (minhaIndex !== -1) {
    minhaPosicaoNum = minhaIndex + 1;
    meuXp = ranking[minhaIndex].xp;
  }

  // 4. Filtra o ranking exibido com base no que foi digitado na barra de busca
  const listaFiltrada = ranking.filter((u) =>
    u.nome?.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center shrink-0">
              <Trophy className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Ranking</h2>
              <p className="text-xs font-medium text-slate-500">Veja como você está em relação aos outros alunos</p>
            </div>
          </div>

          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
            {perfil?.nome ? perfil.nome.charAt(0).toUpperCase() : 'A'}
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-5 pb-10">
            
            {/* Sua posição */}
            <div className="bg-slate-950 rounded-3xl p-6 flex items-center justify-between text-white shadow-lg shadow-slate-900/10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center font-black text-lg shrink-0">
                  #{minhaPosicaoNum}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sua posição</p>
                  <h3 className="text-lg font-black">{meuXp.toLocaleString('pt-BR')} XP</h3>
                </div>
              </div>
            </div>

            {/* Abas de escopo + busca */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex p-1 bg-slate-100 rounded-xl flex-1">
                <button
                  onClick={() => setFiltroRanking('curso')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    filtroRanking === 'curso' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <BookOpen className="w-4 h-4" /> Meu Curso
                </button>
                <button
                  onClick={() => setFiltroRanking('geral')}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                    filtroRanking === 'geral' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <Globe className="w-4 h-4" /> Ranking Geral
                </button>
              </div>

              <div className="relative sm:w-56">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar aluno..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium focus:outline-none focus:border-brand-orange transition-colors"
                />
              </div>
            </div>

            {/* Lista de ranking */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
              <div className="divide-y divide-slate-100 relative min-h-[200px]">
                
                {loading && (
                  <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-brand-orange" />
                  </div>
                )}

                {listaFiltrada.map((user, index) => {
                  const pos = index + 1;
                  const isEu = user.id === perfil?.id;

                  return (
                    <div key={user.id} className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isEu ? 'bg-orange-50' : 'hover:bg-slate-50'}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                        MEDALHA_STYLE[pos] || 'bg-slate-100 text-slate-500'
                      }`}>
                        {pos <= 3 ? <Medal className="w-4 h-4" /> : pos}
                      </div>
                      
                      <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${isEu ? 'bg-brand-orange text-white' : 'bg-slate-900 text-white'}`}>
                        {user.nome?.charAt(0).toUpperCase() || 'A'}
                      </div>
                      
                      <span className={`flex-1 font-bold text-sm ${isEu ? 'text-brand-orange' : 'text-slate-800'}`}>
                        {user.nome} {isEu && '(Você)'}
                      </span>
                      
                      <span className="font-black text-sm text-slate-900">
                        {user.xp.toLocaleString('pt-BR')} <span className="text-xs font-medium text-slate-400">XP</span>
                      </span>
                    </div>
                  );
                })}

                {!loading && listaFiltrada.length === 0 && (
                  <p className="px-5 py-12 text-center text-sm text-slate-400 font-medium">
                    Nenhum aluno encontrado no ranking.
                  </p>
                )}
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}