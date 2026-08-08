import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, Trophy, TrendingUp, Globe, MapPin, School,
  Award, BarChart3, ChevronRight, CheckCircle2, XCircle
} from 'lucide-react';
import Sidebar from './Sidebar';

const KPIS = [
  { icon: Award, iconStyle: 'bg-brand-orange text-white', label: 'Pontuação Total', value: '12.450 XP' },
  { icon: CheckCircle2, iconStyle: 'bg-emerald-50 text-emerald-500', label: 'Taxa de Acertos', value: '76%' },
  { icon: XCircle, iconStyle: 'bg-red-50 text-red-500', label: 'Erros Corrigidos', value: '843' },
  { icon: Target, iconStyle: 'bg-blue-50 text-blue-500', label: 'Simulados Feitos', value: '24' },
];

const RANKING_TABS = [
  { id: 'brasil', label: 'Brasil', icon: Globe, posicao: '#142', escopo: 'Nacional' },
  { id: 'estado', label: 'Maranhão', icon: MapPin, posicao: '#18', escopo: 'Maranhão' },
  { id: 'escola', label: 'Minha Escola', icon: School, posicao: '#3', escopo: 'Escolar' },
];

const TOP_3 = [
  { pos: 1, nome: 'Lucas M.', xp: '28.400' },
  { pos: 2, nome: 'Amanda S.', xp: '26.150' },
  { pos: 3, nome: 'Você', xp: '12.450', isUser: true },
];

const DESEMPENHO_ASSUNTOS = [
  { assunto: 'Estatística', acertos: 92, cor: 'bg-emerald-500' },
  { assunto: 'Probabilidade', acertos: 81, cor: 'bg-emerald-500' },
  { assunto: 'Raciocínio Lógico', acertos: 75, cor: 'bg-brand-orange' },
  { assunto: 'Geometria Plana', acertos: 62, cor: 'bg-amber-500' },
  { assunto: 'Análise Combinatória', acertos: 45, cor: 'bg-red-500' },
];

export default function Desempenho() {
  const navigate = useNavigate();
  const [rankingAtivo, setRankingAtivo] = useState('brasil');

  const abaAtual = RANKING_TABS.find((tab) => tab.id === rankingAtivo);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Estatísticas e Ranking</h2>
              <p className="text-xs font-medium text-slate-500">Acompanhe sua evolução e compare seus resultados</p>
            </div>
          </div>

          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
            C
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6 pb-10">

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {KPIS.map(({ icon: Icon, iconStyle, label, value }) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">{label}</p>
                    <h3 className="text-xl font-black text-slate-900">{value}</h3>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

              {/* RANKING */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-col">
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5 mb-6">
                  <Trophy className="w-5 h-5 text-brand-orange" /> Posição no Ranking
                </h3>

                <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
                  {RANKING_TABS.map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setRankingAtivo(id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                        rankingAtivo === id ? 'bg-white text-slate-900' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Icon className="w-4 h-4" /> {label}
                    </button>
                  ))}
                </div>

                <div className="flex flex-col items-center justify-center py-6 bg-orange-50/60 rounded-2xl mb-6">
                  <p className="text-xs font-bold text-slate-600 mb-2 uppercase tracking-widest">Sua Posição Atual</p>
                  <span className="text-5xl font-black text-brand-orange leading-none">{abaAtual.posicao}</span>
                  <p className="text-xs font-bold text-emerald-600 mt-3 flex items-center bg-emerald-50 px-3 py-1 rounded-full">
                    <TrendingUp className="w-3 h-3 mr-1" /> Subiu 12 posições nesta semana
                  </p>
                </div>

                <div className="space-y-2.5 flex-1">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">
                    Top 3 — {abaAtual.escopo}
                  </h4>

                  {TOP_3.map((user) => (
                    <div
                      key={user.pos}
                      className={`flex items-center justify-between p-3.5 rounded-xl border ${
                        user.isUser ? 'border-brand-orange bg-orange-50/50' : 'border-slate-100 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0 ${
                          user.isUser ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {user.pos}
                        </div>
                        <span className={`font-bold text-sm ${user.isUser ? 'text-brand-orange' : 'text-slate-700'}`}>
                          {user.nome}
                        </span>
                      </div>
                      <span className="font-black text-slate-900 text-sm">
                        {user.xp} <span className="text-xs font-medium text-slate-400">XP</span>
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESEMPENHO POR ASSUNTO */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2.5">
                    <Target className="w-5 h-5 text-brand-orange" /> Domínio por Assunto
                  </h3>
                  <button className="text-xs font-bold text-brand-orange hover:underline">Ver Histórico</button>
                </div>

                <div className="space-y-5">
                  {DESEMPENHO_ASSUNTOS.map((item) => (
                    <div key={item.assunto}>
                      <div className="flex justify-between items-end mb-1.5">
                        <span className="text-sm font-bold text-slate-700">{item.assunto}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-base font-black text-slate-900">{item.acertos}%</span>
                          <span className="text-xs font-bold text-slate-400">de acertos</span>
                        </div>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ${item.cor}`}
                          style={{ width: `${item.acertos}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-7 p-5 bg-slate-50 border border-slate-200 rounded-2xl">
                  <h4 className="font-black text-slate-900 text-sm mb-2">💡 Dica do Prof. Ari</h4>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">
                    Seu desempenho em <strong className="text-slate-900">Estatística e Probabilidade</strong> está excelente! Para subir de vez no ranking, concentre-se em <strong className="text-red-500">Análise Combinatória</strong> esta semana. Que tal fazer um simulado focado nesse assunto?
                  </p>
                  <button
                    onClick={() => navigate('/banco-questoes')}
                    className="mt-3 flex items-center text-brand-orange font-bold text-sm hover:underline"
                  >
                    Treinar Análise Combinatória <ChevronRight className="w-4 h-4 ml-1" />
                  </button>
                </div>
              </div>

            </div>

          </div>
        </div>
      </main>
    </div>
  );
}