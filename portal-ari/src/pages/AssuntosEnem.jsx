import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ListOrdered, ChevronRight, Flame } from 'lucide-react';
import Sidebar from './Sidebar';

const FREQUENCIA_STYLE = {
  'Muito Alta': 'bg-red-50 text-red-600 border-red-100',
  'Alta': 'bg-amber-50 text-amber-700 border-amber-100',
  'Média': 'bg-slate-100 text-slate-600 border-slate-200',
};

const ASSUNTOS = [
  { pos: 1, nome: 'Razões, Proporções e Porcentagem', frequencia: 'Muito Alta' },
  { pos: 2, nome: 'Funções (1º e 2º grau, exponencial e logarítmica)', frequencia: 'Muito Alta' },
  { pos: 3, nome: 'Estatística', frequencia: 'Muito Alta' },
  { pos: 4, nome: 'Probabilidade', frequencia: 'Muito Alta' },
  { pos: 5, nome: 'Geometria Plana', frequencia: 'Muito Alta' },
  { pos: 6, nome: 'Geometria Espacial', frequencia: 'Alta' },
  { pos: 7, nome: 'Matemática Financeira', frequencia: 'Alta' },
  { pos: 8, nome: 'Análise de Gráficos e Tabelas', frequencia: 'Alta' },
  { pos: 9, nome: 'Escala e Grandezas Proporcionais', frequencia: 'Alta' },
  { pos: 10, nome: 'Sistemas Lineares', frequencia: 'Média' },
  { pos: 11, nome: 'Progressões (PA e PG)', frequencia: 'Média' },
  { pos: 12, nome: 'Trigonometria', frequencia: 'Média' },
  { pos: 13, nome: 'Matrizes', frequencia: 'Média' },
  { pos: 14, nome: 'Determinantes', frequencia: 'Média' },
  { pos: 15, nome: 'Análise Combinatória', frequencia: 'Média' },
  { pos: 16, nome: 'Logaritmos', frequencia: 'Média' },
  { pos: 17, nome: 'Geometria Analítica', frequencia: 'Média' },
  { pos: 18, nome: 'Equações e Inequações', frequencia: 'Média' },
];

export default function AssuntosEnem() {
  const navigate = useNavigate();
  const top5 = ASSUNTOS.slice(0, 5);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <ListOrdered className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Assuntos que Mais Caem no ENEM</h2>
              <p className="text-xs font-medium text-slate-500">Priorize os temas com maior incidência nas provas</p>
            </div>
          </div>

          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
            C
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-10">

            {/* Destaque: Top 5 prioridades */}
            <div>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1 flex items-center gap-2">
                <Flame className="w-4 h-4 text-brand-orange" /> Top 5 prioridades
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {top5.map((item) => (
                  <button
                    key={item.pos}
                    onClick={() => navigate('/banco-questoes')}
                    className="bg-white border border-slate-200 hover:border-brand-orange/40 rounded-2xl p-4 text-left transition-colors group"
                  >
                    <span className="text-2xl font-black text-brand-orange/20 group-hover:text-brand-orange/40 transition-colors">
                      {String(item.pos).padStart(2, '0')}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-2 leading-snug">{item.nome}</h4>
                  </button>
                ))}
              </div>
            </div>

            {/* Lista completa */}
            <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-700">Ranking completo</h3>
                <span className="text-xs font-medium text-slate-400">{ASSUNTOS.length} assuntos</span>
              </div>

              <div className="divide-y divide-slate-100">
                {ASSUNTOS.map((item) => (
                  <button
                    key={item.pos}
                    onClick={() => navigate('/banco-questoes')}
                    className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <span className="w-7 text-sm font-black text-slate-300 shrink-0">{item.pos}</span>
                    <span className="flex-1 text-sm font-bold text-slate-800 group-hover:text-slate-900">
                      {item.nome}
                    </span>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-md border shrink-0 ${FREQUENCIA_STYLE[item.frequencia]}`}>
                      {item.frequencia}
                    </span>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-brand-orange group-hover:translate-x-0.5 transition-all shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => navigate('/plano-estudos')}
              className="w-full sm:w-auto px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
            >
              Ver Plano Completo
            </button>

          </div>
        </div>
      </main>
    </div>
  );
}