import React, { useState } from 'react';
import { Trophy, Globe, MapPin, School, Search, Medal } from 'lucide-react';
import Sidebar from './Sidebar';

const ESCOPOS = [
  { id: 'brasil', label: 'Brasil', icon: Globe },
  { id: 'estado', label: 'Maranhão', icon: MapPin },
  { id: 'escola', label: 'Minha Escola', icon: School },
];

const RANKING_BRASIL = [
  { pos: 1, nome: 'Lucas M.', xp: 28400 },
  { pos: 2, nome: 'Amanda S.', xp: 26150 },
  { pos: 3, nome: 'Rafael T.', xp: 24980 },
  { pos: 4, nome: 'Beatriz C.', xp: 23100 },
  { pos: 5, nome: 'Igor P.', xp: 21870 },
  { pos: 6, nome: 'Sofia L.', xp: 20340 },
  { pos: 7, nome: 'Gustavo H.', xp: 19200 },
  { pos: 8, nome: 'Larissa R.', xp: 18450 },
];

const MEDALHA_STYLE = {
  1: 'bg-amber-400 text-amber-900',
  2: 'bg-slate-300 text-slate-700',
  3: 'bg-orange-300 text-orange-900',
};

export default function Ranking() {
  const [escopoAtivo, setEscopoAtivo] = useState('brasil');
  const [busca, setBusca] = useState('');

  const minhaPosicao = { pos: 142, nome: 'Você', xp: 12450 };

  const listaFiltrada = RANKING_BRASIL.filter((u) =>
    u.nome.toLowerCase().includes(busca.toLowerCase())
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
            C
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-5 pb-10">

            {/* Sua posição */}
            <div className="bg-slate-950 rounded-3xl p-6 flex items-center justify-between text-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-orange rounded-full flex items-center justify-center font-black shrink-0">
                  #{minhaPosicao.pos}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-0.5">Sua posição</p>
                  <h3 className="text-lg font-black">{minhaPosicao.xp.toLocaleString('pt-BR')} XP</h3>
                </div>
              </div>
              <p className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-full">
                ↑ Subiu 12 posições
              </p>
            </div>

            {/* Abas de escopo + busca */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex p-1 bg-slate-100 rounded-xl flex-1">
                {ESCOPOS.map(({ id, label, icon: Icon }) => (
                  <button
                    key={id}
                    onClick={() => setEscopoAtivo(id)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                      escopoAtivo === id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" /> {label}
                  </button>
                ))}
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
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="divide-y divide-slate-100">
                {listaFiltrada.map((user) => (
                  <div key={user.pos} className="flex items-center gap-4 px-5 py-3.5">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                      MEDALHA_STYLE[user.pos] || 'bg-slate-100 text-slate-500'
                    }`}>
                      {user.pos <= 3 ? <Medal className="w-4 h-4" /> : user.pos}
                    </div>
                    <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {user.nome.charAt(0)}
                    </div>
                    <span className="flex-1 font-bold text-sm text-slate-800">{user.nome}</span>
                    <span className="font-black text-sm text-slate-900">
                      {user.xp.toLocaleString('pt-BR')} <span className="text-xs font-medium text-slate-400">XP</span>
                    </span>
                  </div>
                ))}

                {listaFiltrada.length === 0 && (
                  <p className="px-5 py-8 text-center text-sm text-slate-400 font-medium">
                    Nenhum aluno encontrado com esse nome.
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