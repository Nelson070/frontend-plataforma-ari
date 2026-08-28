import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Plus, MoreHorizontal, ChevronDown, FileQuestion, ClipboardList, Loader2, Trash2 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { useAdminQuestoes, useAdminSimulados, useTurmas } from '../hooks/useAdmin.js';

const DIFICULDADE_STYLE = {
  facil: 'bg-emerald-50 text-emerald-700',
  medio: 'bg-amber-50 text-amber-700',
  dificil: 'bg-red-50 text-red-700',
};

const DIFICULDADE_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

export default function AdminSimuladosQuestoes() {
  const [aba, setAba] = useState('questoes');
  const [busca, setBusca] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('');
  const [menuAberto, setMenuAberto] = useState(null);

  
  const { turmas } = useTurmas();
  const { questoes, loading: loadingQ, excluirQuestao } = useAdminQuestoes({ busca, turmaId: turmaFiltro || undefined });
  const { simulados, loading: loadingS, excluirSimulado } = useAdminSimulados({ busca, turmaId: turmaFiltro || undefined });

  const handleExcluirQuestao = async (id) => {
    if (!confirm('Excluir essa questão? Essa ação não pode ser desfeita.')) return;
    await excluirQuestao(id);
    setMenuAberto(null);
  };

  const handleExcluirSimulado = async (id) => {
    if (!confirm('Excluir esse simulado? Essa ação não pode ser desfeita.')) return;
    await excluirSimulado(id);
    setMenuAberto(null);
  };

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">

      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Simulados e Questões</h2>
            <p className="text-xs font-medium text-slate-500">
              {questoes.length} questões · {simulados.length} simulados cadastrados
            </p>
          </div>

          <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Abas */}
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl w-fit">
              <button
                onClick={() => setAba('questoes')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  aba === 'questoes' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <FileQuestion className="w-4 h-4" /> Questões
              </button>
              <button
                onClick={() => setAba('simulados')}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-colors ${
                  aba === 'simulados' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <ClipboardList className="w-4 h-4" /> Simulados
              </button>
            </div>

            {/* Barra de ações */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder={aba === 'questoes' ? 'Buscar por enunciado...' : 'Buscar simulado...'}
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                />
              </div>

              <div className="relative">
                <select
                  value={turmaFiltro}
                  onChange={(e) => setTurmaFiltro(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                >
                  <option value="">Todas as turmas</option>
                  {turmas.map((t) => (
                    <option key={t.id} value={t.id}>{t.nome}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              {aba === 'questoes' ? (
                <Link
                  to="/admin/nova-questao"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shrink-0"
                >
                  <Plus className="w-4 h-4" /> Nova Questão
                </Link>
              ) : (
                <button
                  disabled
                  title="Criação de simulado pela interface ainda não implementada"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-300 text-white font-bold text-sm rounded-xl cursor-not-allowed shrink-0"
                >
                  <Plus className="w-4 h-4" /> Novo Simulado
                </button>
              )}
            </div>

            {/* Tabela: Questões */}
            {aba === 'questoes' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loadingQ ? (
                  <div className="flex items-center justify-center py-14 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando questões...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Enunciado</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Assunto</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Dificuldade</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {questoes.map((q) => (
                          <tr key={q.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-3.5 max-w-xs">
                              <p className="text-sm font-medium text-slate-700 truncate">{q.enunciado}</p>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600">{q.assunto}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600">{q.turmas?.nome || '—'}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${DIFICULDADE_STYLE[q.dificuldade]}`}>
                                {DIFICULDADE_LABEL[q.dificuldade] || q.dificuldade}
                              </span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right relative">
                              <button
                                onClick={() => setMenuAberto(menuAberto === q.id ? null : q.id)}
                                className="text-slate-400 hover:text-brand-orange transition-colors p-1.5"
                              >
                                <MoreHorizontal className="w-4.5 h-4.5" />
                              </button>
                              {menuAberto === q.id && (
                                <div className="absolute right-6 top-10 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
                                  <button
                                    onClick={() => handleExcluirQuestao(q.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Excluir
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {questoes.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                              Nenhuma questão encontrada com esses filtros.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Tabela: Simulados */}
            {aba === 'simulados' && (
              <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {loadingS ? (
                  <div className="flex items-center justify-center py-14 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando simulados...
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Título</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Questões</th>
                          <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {simulados.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="font-bold text-slate-900 text-sm">{s.titulo}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600">{s.turmas?.nome || '—'}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600 capitalize">{s.tipo}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap">
                              <span className="text-sm font-medium text-slate-600">{s.simulado_questoes?.[0]?.count ?? 0}</span>
                            </td>
                            <td className="px-6 py-3.5 whitespace-nowrap text-right relative">
                              <button
                                onClick={() => setMenuAberto(menuAberto === s.id ? null : s.id)}
                                className="text-slate-400 hover:text-brand-orange transition-colors p-1.5"
                              >
                                <MoreHorizontal className="w-4.5 h-4.5" />
                              </button>
                              {menuAberto === s.id && (
                                <div className="absolute right-6 top-10 z-10 bg-white border border-slate-200 rounded-xl shadow-lg py-1 w-40">
                                  <button
                                    onClick={() => handleExcluirSimulado(s.id)}
                                    className="w-full flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" /> Excluir
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {simulados.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                              Nenhum simulado cadastrado ainda.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}