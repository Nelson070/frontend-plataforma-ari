import React, { useState } from 'react';
import { Search, Filter, MoreHorizontal, UserPlus, ChevronDown } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const TURMAS = ['Todas', 'ENEM', 'Concursos Públicos', 'Pré-IFMA/CMT', '6° Ano (CMT)', 'Isolada de Matemática'];

const STATUS_STYLE = {
  Ativo: 'bg-emerald-50 text-emerald-700',
  Pendente: 'bg-amber-50 text-amber-700',
  Inativo: 'bg-slate-100 text-slate-500',
};

const ALUNOS = [
  { id: 1, nome: 'Carlos Silva', email: 'carlos.silva@email.com', turma: 'Concursos Públicos', plano: 'Anual Premium', status: 'Ativo', cadastro: '03/08/2026' },
  { id: 2, nome: 'Amanda Nunes', email: 'amanda.nunes@email.com', turma: 'ENEM', plano: 'Mensal Básico', status: 'Ativo', cadastro: '04/08/2026' },
  { id: 3, nome: 'Felipe Costa', email: 'felipe.costa@email.com', turma: 'Pré-IFMA/CMT', plano: 'Anual Premium', status: 'Pendente', cadastro: '05/08/2026' },
  { id: 4, nome: 'Juliana Paes', email: 'juliana.paes@email.com', turma: 'ENEM', plano: 'Mensal Básico', status: 'Ativo', cadastro: '05/08/2026' },
  { id: 5, nome: 'Rafael Torres', email: 'rafael.torres@email.com', turma: '6° Ano (CMT)', plano: 'Mensal Básico', status: 'Inativo', cadastro: '28/07/2026' },
  { id: 6, nome: 'Beatriz Cunha', email: 'beatriz.cunha@email.com', turma: 'Isolada de Matemática', plano: 'Anual Premium', status: 'Ativo', cadastro: '30/07/2026' },
  { id: 7, nome: 'Igor Pereira', email: 'igor.pereira@email.com', turma: 'Concursos Públicos', plano: 'Mensal Básico', status: 'Ativo', cadastro: '01/08/2026' },
];

function iniciais(nome) {
  return nome.split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();
}

export default function AdminAlunos() {
  const [busca, setBusca] = useState('');
  const [turmaFiltro, setTurmaFiltro] = useState('Todas');

  const alunosFiltrados = ALUNOS.filter((aluno) => {
    const bateBusca =
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.email.toLowerCase().includes(busca.toLowerCase());
    const bateTurma = turmaFiltro === 'Todas' || aluno.turma === turmaFiltro;
    return bateBusca && bateTurma;
  });

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">

      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Gestão de Alunos</h2>
            <p className="text-xs font-medium text-slate-500">{ALUNOS.length} alunos cadastrados na plataforma</p>
          </div>

          <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-5">

            {/* Barra de ações: busca, filtro de turma, novo aluno */}
            <div className="flex flex-col md:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={busca}
                  onChange={(e) => setBusca(e.target.value)}
                  placeholder="Buscar por nome ou email..."
                  className="w-full bg-white border border-slate-200 rounded-xl py-2.5 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                />
              </div>

              <div className="relative">
                <select
                  value={turmaFiltro}
                  onChange={(e) => setTurmaFiltro(e.target.value)}
                  className="appearance-none bg-white border border-slate-200 rounded-xl py-2.5 pl-4 pr-10 text-sm font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                >
                  {TURMAS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              </div>

              <button className="flex items-center justify-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shrink-0">
                <UserPlus className="w-4 h-4" /> Convidar Aluno
              </button>
            </div>

            {/* Tabela de alunos */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Turma</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Cadastro</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {alunosFiltrados.map((aluno) => (
                      <tr key={aluno.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {iniciais(aluno.nome)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm leading-tight">{aluno.nome}</p>
                              <p className="text-xs text-slate-500">{aluno.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-600">{aluno.turma}</span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-600">{aluno.plano}</span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-500">{aluno.cadastro}</span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[aluno.status]}`}>
                            {aluno.status}
                          </span>
                        </td>
                        <td className="px-6 py-3.5 whitespace-nowrap text-right">
                          <button className="text-slate-400 hover:text-brand-orange transition-colors p-1.5">
                            <MoreHorizontal className="w-4.5 h-4.5" />
                          </button>
                        </td>
                      </tr>
                    ))}

                    {alunosFiltrados.length === 0 && (
                      <tr>
                        <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-400 font-medium">
                          Nenhum aluno encontrado com esses filtros.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}