import React, { useState } from 'react';
import {
  Search, Filter, BookOpen, ChevronDown,
  MessageSquare, Bookmark, FileText
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function BancoQuestoes() {
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [mostrarComentario, setMostrarComentario] = useState(false);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Banco de Questões</h2>
              <p className="text-xs font-medium text-slate-500">Mais de 25.000 questões disponíveis</p>
            </div>
          </div>

          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
            C
          </div>
        </header>

        {/* CONTEÚDO: FILTROS + QUESTÕES */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* BARRA LATERAL DE FILTROS */}
          <div className="w-full md:w-64 bg-white border-r border-slate-200 overflow-y-auto shrink-0 p-5 flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-orange" /> Filtros
              </h3>
              <button className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors">
                Limpar
              </button>
            </div>

            {/* Busca por palavra-chave */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Palavra-chave..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {/* Filtro: Matéria */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Matéria
              </label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange" defaultChecked />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-brand-orange transition-colors">
                    Matemática (12.430)
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input type="checkbox" className="w-4 h-4 rounded border-slate-300 text-brand-orange focus:ring-brand-orange" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-brand-orange transition-colors">
                    Raciocínio Lógico (8.150)
                  </span>
                </label>
              </div>
            </div>

            {/* Filtro: Assunto */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Assunto
              </label>
              <div className="relative">
                <select className="w-full bg-slate-50 border border-slate-200 text-slate-700 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-brand-orange appearance-none font-medium">
                  <option>Todos os assuntos</option>
                  <option>Probabilidade</option>
                  <option>Análise Combinatória</option>
                  <option>Geometria Plana</option>
                </select>
                <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Filtro: Dificuldade */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Dificuldade
              </label>
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-brand-orange hover:text-brand-orange transition-colors">
                  Fácil
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-brand-orange bg-orange-50 text-xs font-bold text-brand-orange transition-colors">
                  Médio
                </button>
                <button className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:border-brand-orange hover:text-brand-orange transition-colors">
                  Difícil
                </button>
              </div>
            </div>

            <button className="w-full py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors mt-1">
              Aplicar Filtros
            </button>
          </div>

          {/* ÁREA DA LISTA DE QUESTÕES */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-5 pb-12">

              {/* Header da Busca */}
              <div className="flex items-center justify-between">
                <p className="text-sm font-bold text-slate-500">
                  Exibindo <span className="text-slate-900">1-10</span> de 452 questões
                </p>
                <select className="bg-white border border-slate-200 text-slate-700 rounded-lg px-3 py-1.5 text-sm font-medium focus:outline-none">
                  <option>Mais recentes</option>
                  <option>Mais difíceis</option>
                  <option>Mais fáceis</option>
                </select>
              </div>

              {/* CARD DE QUESTÃO */}
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Header do Card (Tags) */}
                <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                      Q14592
                    </span>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                      <BookOpen className="w-3 h-3" /> Matemática
                    </span>
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">
                      Probabilidade
                    </span>
                  </div>
                  <button className="text-slate-400 hover:text-brand-orange transition-colors">
                    <Bookmark className="w-4.5 h-4.5" />
                  </button>
                </div>

                {/* Corpo da Questão */}
                <div className="p-5 md:p-6">
                  <p className="text-slate-800 font-medium leading-relaxed mb-5">
                    (ENEM 2023) Em uma urna há 5 bolas vermelhas e 3 bolas azuis. Retirando-se duas bolas sucessivamente e sem reposição, qual a probabilidade de que ambas sejam vermelhas?
                  </p>

                  <div className="space-y-2.5">
                    {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                      <button
                        key={letra}
                        onClick={() => setRespostaSelecionada(letra)}
                        className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors group ${
                          respostaSelecionada === letra
                            ? 'border-brand-orange bg-orange-50/60'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                          respostaSelecionada === letra
                            ? 'bg-brand-orange text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                        }`}>
                          {letra}
                        </div>
                        <span className={`font-medium text-sm ${respostaSelecionada === letra ? 'text-slate-900' : 'text-slate-600'}`}>
                          {letra === 'A' && '5/14'}
                          {letra === 'B' && '10/28'}
                          {letra === 'C' && '25/64'}
                          {letra === 'D' && '5/8'}
                          {letra === 'E' && '15/56'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Footer do Card (Ações) */}
                <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-between">
                  <button
                    onClick={() => setMostrarComentario(!mostrarComentario)}
                    className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-orange transition-colors"
                  >
                    <MessageSquare className="w-4 h-4" /> Comentário do Professor
                  </button>

                  <button
                    disabled={!respostaSelecionada}
                    className="px-5 py-2 bg-brand-orange hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg transition-colors"
                  >
                    Responder
                  </button>
                </div>

                {/* Área do Comentário */}
                {mostrarComentario && (
                  <div className="px-5 py-4 bg-orange-50/60 border-t border-orange-100">
                    <div className="flex items-center gap-2 mb-2.5">
                      <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                        A
                      </div>
                      <h4 className="font-black text-slate-800 text-sm">Resolução do Prof. Ari</h4>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">
                      Para a primeira retirada, temos 5 vermelhas de um total de 8 bolas (5/8).
                      Como não há reposição, para a segunda retirada sobraram 4 vermelhas em um total de 7 bolas (4/7).
                      Multiplicando as probabilidades: (5/8) × (4/7) = 20/56. Simplificando por 4, chegamos a 5/14. Alternativa A.
                    </p>
                  </div>
                )}
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}