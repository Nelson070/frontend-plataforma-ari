import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, BookOpen, Settings2, PlayCircle, Clock,
  ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid, ArrowLeft
} from 'lucide-react';
import Sidebar from './Sidebar';

export default function Simulados() {
  const navigate = useNavigate();

  const [modoResolucao, setModoResolucao] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('oficial'); // oficial, assunto, personalizado
  const [assuntoSelecionado, setAssuntoSelecionado] = useState('');

  const [questaoAtual, setQuestaoAtual] = useState(1);
  const [respostas, setRespostas] = useState({});
  const totalQuestoes = tipoSelecionado === 'oficial' ? 45 : 15;

  const handleVoltar = () => navigate('/dashboard');

  const iniciarSimulado = () => {
    setModoResolucao(true);
    setQuestaoAtual(1);
    setRespostas({});
  };

  const handleResponder = (alternativa) => {
    setRespostas({ ...respostas, [questaoAtual]: alternativa });
  };

  // ==========================================
  // TELA 2: MODO DE RESOLUÇÃO (A PROVA)
  // Tela cheia, sem sidebar — foco total durante a prova.
  // ==========================================
  if (modoResolucao) {
    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setModoResolucao(false)}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
              aria-label="Sair da prova"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">
                {tipoSelecionado === 'oficial' ? 'Simulado Oficial ENEM' : 'Simulado por Assunto'}
              </h1>
              <p className="text-xs text-slate-500 font-medium">Questão {questaoAtual} de {totalQuestoes}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm border border-red-100">
            <Clock className="w-4 h-4" />
            02:29:59
          </div>
        </header>

        <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden">

          {/* Lado Esquerdo: A Questão */}
          <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
            <div
              className="p-6 md:p-8 overflow-y-auto flex-1 select-none"
              onCopy={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  Matemática e suas Tecnologias
                </span>
                <span className="text-sm font-bold text-slate-400">Questão {questaoAtual}</span>
              </div>

              <p className="text-lg text-slate-800 leading-relaxed font-medium mb-8">
                (ENEM) Uma empresa de transporte cobra um valor fixo de R$ 50,00 mais R$ 2,50 por quilômetro rodado.
                Se um cliente pagou R$ 125,00 por uma entrega, qual foi a distância percorrida pelo veículo?
              </p>

              <div className="space-y-2.5">
                {['A', 'B', 'C', 'D', 'E'].map((alt) => (
                  <button
                    key={alt}
                    onClick={() => handleResponder(alt)}
                    className={`w-full flex items-center text-left p-4 rounded-xl border transition-colors ${
                      respostas[questaoAtual] === alt
                        ? 'border-brand-orange bg-orange-50'
                        : 'border-slate-200 hover:border-brand-orange/40 bg-white'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${
                      respostas[questaoAtual] === alt
                        ? 'bg-brand-orange text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {alt}
                    </div>
                    <span className={`text-base font-medium ${respostas[questaoAtual] === alt ? 'text-slate-900' : 'text-slate-700'}`}>
                      {alt === 'A' && '15 km'}
                      {alt === 'B' && '25 km'}
                      {alt === 'C' && '30 km'}
                      {alt === 'D' && '40 km'}
                      {alt === 'E' && '50 km'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
              <button
                onClick={() => setQuestaoAtual(prev => Math.max(1, prev - 1))}
                disabled={questaoAtual === 1}
                className="flex items-center px-4 py-2.5 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Anterior
              </button>

              {questaoAtual === totalQuestoes ? (
                <button className="flex items-center px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-lg transition-colors">
                  <CheckCircle2 className="w-4 h-4 mr-2" /> Finalizar Prova
                </button>
              ) : (
                <button
                  onClick={() => setQuestaoAtual(prev => Math.min(totalQuestoes, prev + 1))}
                  className="flex items-center px-6 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  Próxima <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              )}
            </div>
          </div>

          {/* Lado Direito: Mapa da Prova */}
          <div className="w-full lg:w-72 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shrink-0">
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
              <LayoutGrid className="w-4.5 h-4.5 text-slate-600" />
              <h3 className="font-bold text-slate-800 text-sm">Mapa de Questões</h3>
            </div>

            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: totalQuestoes }, (_, i) => i + 1).map((num) => {
                  const isRespondida = respostas[num];
                  const isAtual = questaoAtual === num;

                  return (
                    <button
                      key={num}
                      onClick={() => setQuestaoAtual(num)}
                      className={`h-9 rounded-lg text-sm font-bold flex items-center justify-center transition-colors ${
                        isAtual
                          ? 'ring-2 ring-brand-orange ring-offset-2 bg-slate-900 text-white'
                          : isRespondida
                            ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                            : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-transparent'
                      }`}
                    >
                      {num}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50 space-y-2">
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                <div className="w-3 h-3 rounded-full bg-brand-orange/20 border border-brand-orange/30 shrink-0"></div>
                Respondidas ({Object.keys(respostas).length})
              </div>
              <div className="flex items-center gap-2.5 text-xs font-medium text-slate-600">
                <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200 shrink-0"></div>
                Em branco ({totalQuestoes - Object.keys(respostas).length})
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 1: HUB DE CONFIGURAÇÃO DO SIMULADO
  // ==========================================
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleVoltar}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-brand-orange border border-slate-200 transition-colors shrink-0"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Central de Simulados</h1>
              <p className="text-slate-500 text-sm font-medium">Configure seu ambiente de prova e teste seus conhecimentos.</p>
            </div>
          </div>

          {/* Tabs de Seleção de Tipo */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setTipoSelecionado('oficial')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'oficial' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'oficial' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Oficial ENEM</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">45 questões, tempo oficial e correção com base na TRI.</p>
            </button>

            <button
              onClick={() => setTipoSelecionado('assunto')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'assunto' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'assunto' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Por Assunto</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Foque nos seus pontos fracos com um conteúdo específico.</p>
            </button>

            <button
              onClick={() => setTipoSelecionado('personalizado')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'personalizado' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'personalizado' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Personalizado</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Escolha a quantidade de questões e a dificuldade.</p>
            </button>
          </div>

          {/* Área de Configuração Dinâmica */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7">

            {tipoSelecionado === 'oficial' && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-slate-900 mb-4">Simulado Oficial de Matemática</h2>
                  <ul className="space-y-2.5 mb-6">
                    <li className="flex items-center text-slate-600 text-sm font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mr-2.5 shrink-0" /> Exatamente 45 questões nos padrões da prova.
                    </li>
                    <li className="flex items-center text-slate-600 text-sm font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mr-2.5 shrink-0" /> Tempo de prova cronometrado (02h 30m).
                    </li>
                    <li className="flex items-center text-slate-600 text-sm font-medium">
                      <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500 mr-2.5 shrink-0" /> Questões com graus de dificuldade balanceados.
                    </li>
                  </ul>
                  <button onClick={iniciarSimulado} className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors active:scale-95">
                    <PlayCircle className="w-5 h-5" /> Iniciar Simulado Agora
                  </button>
                </div>
                <div className="hidden md:flex w-56 h-56 bg-orange-50 rounded-full items-center justify-center shrink-0">
                  <Target className="w-24 h-24 text-brand-orange opacity-20" />
                </div>
              </div>
            )}

            {tipoSelecionado === 'assunto' && (
              <div>
                <h2 className="text-lg font-black text-slate-900 mb-5">Selecione o Assunto</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                  {['Estatística', 'Funções', 'Geometria Plana', 'Probabilidade', 'Porcentagem', 'Mat. Financeira', 'Trigonometria', 'PA e PG'].map(assunto => (
                    <button
                      key={assunto}
                      onClick={() => setAssuntoSelecionado(assunto)}
                      className={`p-3.5 border rounded-xl text-center font-bold text-sm transition-colors ${assuntoSelecionado === assunto ? 'bg-brand-orange text-white border-brand-orange' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-orange/40'}`}
                    >
                      {assunto}
                    </button>
                  ))}
                </div>
                <button
                  onClick={iniciarSimulado}
                  disabled={!assuntoSelecionado}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-orange disabled:bg-slate-300 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
                >
                  <PlayCircle className="w-5 h-5" /> Iniciar Treino
                </button>
              </div>
            )}

            {tipoSelecionado === 'personalizado' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quantidade de Questões</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {[10, 15, 20, 30, 45].map(num => (
                        <button key={num} className="px-5 py-2.5 border border-slate-200 bg-slate-50 hover:border-brand-orange rounded-xl font-bold text-sm text-slate-700 transition-colors">
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nível de Dificuldade</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {['Fácil', 'Médio', 'Difícil', 'Misto'].map(nivel => (
                        <button key={nivel} className="px-5 py-2.5 border border-slate-200 bg-slate-50 hover:border-brand-orange rounded-xl font-bold text-sm text-slate-700 transition-colors">
                          {nivel}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button onClick={iniciarSimulado} className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
                  <PlayCircle className="w-5 h-5" /> Gerar Simulado
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}