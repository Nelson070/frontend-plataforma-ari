import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, PlayCircle, Download, CheckCircle2,
  MessageSquare, Star, ChevronDown, FileText,
  Clock, Lock, CheckCircle
} from 'lucide-react';

const MODULOS = [
  {
    id: 1,
    label: 'Módulo 1',
    titulo: 'Fundamentos da Lógica',
    aulas: [
      { id: '1-1', titulo: 'O que é uma proposição lógica', duracao: '12 min', status: 'concluida' },
      { id: '1-2', titulo: 'Conectivos e valores lógicos', duracao: '15 min', status: 'concluida' },
    ],
  },
  {
    id: 2,
    label: 'Módulo 2',
    titulo: 'Lógica Proposicional',
    aulas: [
      { id: '2-1', titulo: '1. Tabela-Verdade na Prática', duracao: '18 min', status: 'atual' },
      { id: '2-2', titulo: '2. Conectivos Lógicos e Regras', duracao: '22 min', status: 'bloqueada' },
      { id: '2-3', titulo: '3. Equivalências Lógicas', duracao: '16 min', status: 'bloqueada' },
    ],
  },
];

export default function PlayerAulas() {
  const navigate = useNavigate();
  const [abaAtiva, setAbaAtiva] = useState('visao-geral'); // visao-geral, material, duvidas
  const [moduloAberto, setModuloAberto] = useState(2);
  const [aulaAtivaId, setAulaAtivaId] = useState('2-1');
  const [aulaConcluida, setAulaConcluida] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      {/* HEADER DO PLAYER */}
      <header className="h-16 bg-slate-950 px-6 flex justify-between items-center shrink-0 border-b border-slate-800">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-0.5">Trilha de Matemática</p>
            <h1 className="text-sm font-bold text-white">Módulo 2: Lógica Proposicional</h1>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          <div className="w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div className="h-full bg-brand-orange rounded-full" style={{ width: '45%' }}></div>
          </div>
          <span className="text-xs font-bold text-slate-400">45% concluído</span>
        </div>
      </header>

      {/* ÁREA PRINCIPAL: VÍDEO + PLAYLIST */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">

        {/* ESQUERDA: Player e Conteúdo */}
        <div className="flex-1 overflow-y-auto flex flex-col">

          {/* Container do Vídeo (16:9) */}
          <div className="w-full bg-black relative pt-[56.25%] shrink-0">
            <div className="absolute inset-0 flex items-center justify-center group cursor-pointer overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=1200&auto=format&fit=crop"
                alt="Thumbnail da Aula"
                className="w-full h-full object-cover opacity-50 group-hover:opacity-40 transition-opacity"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-brand-orange text-white rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 ml-1" />
                </div>
              </div>
            </div>
          </div>

          {/* Conteúdo Abaixo do Vídeo */}
          <div className="p-6 md:p-8 max-w-5xl mx-auto w-full flex-1">

            {/* Título e Ações Principais */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-7">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mb-2">
                  1. Tabela-Verdade na Prática
                </h2>
                <div className="flex items-center gap-4 text-sm font-medium text-slate-500">
                  <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> 18 min</span>
                  <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400" /> 4.9 (120 avaliações)</span>
                </div>
              </div>

              <button
                onClick={() => setAulaConcluida(!aulaConcluida)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors shrink-0 ${
                  aulaConcluida
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-white text-slate-700 border border-slate-200 hover:border-brand-orange hover:text-brand-orange'
                }`}
              >
                {aulaConcluida ? <CheckCircle className="w-4.5 h-4.5" /> : <CheckCircle2 className="w-4.5 h-4.5" />}
                {aulaConcluida ? 'Aula Concluída' : 'Marcar como Concluída'}
              </button>
            </div>

            {/* Navegação por Abas */}
            <div className="border-b border-slate-200 mb-6 flex gap-6">
              {[
                { id: 'visao-geral', label: 'Visão Geral' },
                { id: 'material', label: 'Material de Apoio' },
                { id: 'duvidas', label: 'Dúvidas', badge: 12 },
              ].map((aba) => (
                <button
                  key={aba.id}
                  onClick={() => setAbaAtiva(aba.id)}
                  className={`pb-3.5 text-sm font-bold transition-colors relative flex items-center gap-2 ${
                    abaAtiva === aba.id ? 'text-brand-orange' : 'text-slate-500 hover:text-slate-800'
                  }`}
                >
                  {aba.label}
                  {aba.badge != null && (
                    <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{aba.badge}</span>
                  )}
                  {abaAtiva === aba.id && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-orange rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            {/* Conteúdo das Abas */}
            <div className="pb-12">

              {abaAtiva === 'visao-geral' && (
                <div>
                  <h3 className="font-bold text-slate-900 mb-3">Sobre esta aula</h3>
                  <p className="text-slate-600 leading-relaxed font-medium mb-6">
                    Nesta aula, vamos desmistificar a Tabela-Verdade. Você aprenderá como construir as tabelas para os conectivos lógicos (E, OU, OU EXCLUSIVO, SE... ENTÃO, SE E SOMENTE SE) de forma prática e direta, focando em como as bancas de concurso costumam cobrar esse assunto.
                  </p>

                  <div className="flex items-center gap-4 p-4 bg-white border border-slate-200 rounded-2xl">
                    <div className="w-11 h-11 bg-orange-50 rounded-full flex items-center justify-center text-brand-orange font-black shrink-0">
                      H
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">Prof. Hugo Neves</h4>
                      <p className="text-xs text-slate-500 font-medium">Especialista em Raciocínio Lógico e Matemática</p>
                    </div>
                  </div>
                </div>
              )}

              {abaAtiva === 'material' && (
                <div className="space-y-3">
                  {[
                    { icon: FileText, color: 'text-red-500 bg-red-50', title: 'Slides da Aula (Tabela-Verdade)', meta: 'PDF • 2.4 MB' },
                    { icon: FileText, color: 'text-blue-500 bg-blue-50', title: 'Lista de Exercícios Complementar', meta: 'PDF • 1.1 MB' },
                  ].map((item) => (
                    <div
                      key={item.title}
                      className="flex items-center justify-between p-4 bg-white border border-slate-200 hover:border-brand-orange/40 rounded-2xl transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.color}`}>
                          <item.icon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">{item.title}</h4>
                          <p className="text-xs text-slate-500 font-medium">{item.meta}</p>
                        </div>
                      </div>
                      <button className="text-slate-400 group-hover:text-brand-orange transition-colors">
                        <Download className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {abaAtiva === 'duvidas' && (
                <div>
                  <div className="flex gap-4 mb-7">
                    <div className="w-9 h-9 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold text-sm shrink-0">C</div>
                    <div className="flex-1 relative">
                      <textarea
                        rows="2"
                        placeholder="Ficou com alguma dúvida? Envie aqui..."
                        className="w-full bg-white border border-slate-200 rounded-xl p-4 pr-12 focus:outline-none focus:border-brand-orange focus:ring-1 focus:ring-brand-orange font-medium resize-none text-sm"
                      ></textarea>
                      <button className="absolute right-3 bottom-3 p-2 bg-brand-orange text-white rounded-lg hover:bg-orange-600 transition-colors">
                        <MessageSquare className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-5">
                    <div className="flex gap-4">
                      <div className="w-9 h-9 bg-slate-200 text-slate-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0">M</div>
                      <div className="flex-1">
                        <div className="bg-white border border-slate-200 p-4 rounded-2xl rounded-tl-none">
                          <div className="flex justify-between items-center mb-2">
                            <h4 className="font-bold text-slate-800 text-sm">Marcos Silva</h4>
                            <span className="text-xs font-medium text-slate-400">Há 2 dias</span>
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed">
                            Professor, no caso da condicional (Se... então), se a primeira premissa for F e a segunda for V, o resultado é verdadeiro. Alguém tem um macete para decorar isso?
                          </p>
                        </div>

                        <div className="flex gap-4 mt-3 ml-6">
                          <div className="w-8 h-8 bg-brand-orange text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0">H</div>
                          <div className="flex-1 bg-orange-50 border border-orange-100 p-4 rounded-2xl rounded-tl-none">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-bold text-slate-900 text-sm">Prof. Hugo Neves</h4>
                              <span className="bg-brand-orange/20 text-brand-orange text-[10px] font-bold px-2 py-0.5 rounded-full">Professor</span>
                            </div>
                            <p className="text-sm text-slate-700 font-medium leading-relaxed">
                              Fala Marcos! O macete clássico é lembrar da regra da "Vera Fischer". Na condicional, a única forma de dar Falso (F) é se a primeira for V (Vera) e a segunda for F (Fischer). V com F = F. Qualquer outra combinação (F com V, F com F, V com V) vai dar Verdadeiro (V). Abraço!
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* DIREITA: Lista de Aulas (Playlist) */}
        <div className="w-full lg:w-[360px] bg-white border-l border-slate-200 flex flex-col shrink-0 h-[50vh] lg:h-auto">
          <div className="p-5 border-b border-slate-200 bg-slate-50">
            <h3 className="font-bold text-slate-800 text-sm">Conteúdo do Curso</h3>
          </div>

          <div className="flex-1 overflow-y-auto">
            {MODULOS.map((modulo) => {
              const aberto = moduloAberto === modulo.id;
              return (
                <div key={modulo.id} className="border-b border-slate-100">
                  <button
                    onClick={() => setModuloAberto(aberto ? null : modulo.id)}
                    className={`w-full px-5 py-4 flex items-center justify-between transition-colors ${
                      aberto ? 'bg-slate-50' : 'hover:bg-slate-50'
                    }`}
                  >
                    <div className="text-left pr-4">
                      <p className="text-xs font-bold text-slate-400 mb-0.5">{modulo.label}</p>
                      <h4 className="font-bold text-slate-800 text-sm">{modulo.titulo}</h4>
                    </div>
                    <ChevronDown className={`w-4.5 h-4.5 text-slate-400 shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </button>

                  {aberto && (
                    <div>
                      {modulo.aulas.map((aula) => {
                        const ativa = aulaAtivaId === aula.id;
                        const bloqueada = aula.status === 'bloqueada';
                        return (
                          <button
                            key={aula.id}
                            onClick={() => !bloqueada && setAulaAtivaId(aula.id)}
                            disabled={bloqueada}
                            className={`w-full px-5 py-3.5 flex gap-3 text-left transition-colors group ${
                              ativa
                                ? 'border-l-4 border-brand-orange bg-orange-50/60'
                                : 'border-l-4 border-transparent hover:bg-slate-50'
                            } ${bloqueada ? 'cursor-not-allowed' : ''}`}
                          >
                            {aula.status === 'concluida' ? (
                              <CheckCircle className="w-4.5 h-4.5 text-emerald-500 shrink-0 mt-0.5" />
                            ) : bloqueada ? (
                              <Lock className="w-4.5 h-4.5 text-slate-300 shrink-0 mt-0.5" />
                            ) : (
                              <PlayCircle className="w-4.5 h-4.5 text-brand-orange shrink-0 mt-0.5" />
                            )}
                            <div>
                              <p className={`text-sm font-bold mb-0.5 ${ativa ? 'text-brand-orange' : bloqueada ? 'text-slate-600' : 'text-slate-800'}`}>
                                {aula.titulo}
                              </p>
                              <p className="text-xs font-medium text-slate-400">Vídeo • {aula.duracao}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}