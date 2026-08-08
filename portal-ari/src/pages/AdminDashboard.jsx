import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Users, FileQuestion, Video, Settings, 
  Search, Bell, Calendar, Plus, DollarSign, TrendingUp, 
  UserPlus, MoreHorizontal
} from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();

  // Dados mockados para a tabela
  const matriculas = [
    { id: 1, aluno: 'Carlos Silva', iniciais: 'C', plano: 'Anual Premium', data: 'Hoje, 14:30', status: 'Ativo' },
    { id: 2, aluno: 'Amanda Nunes', iniciais: 'A', plano: 'Mensal Básico', data: 'Hoje, 11:15', status: 'Ativo' },
    { id: 3, aluno: 'Felipe Costa', iniciais: 'F', plano: 'Anual Premium', data: 'Ontem, 16:40', status: 'Pendente' },
    { id: 4, aluno: 'Juliana Paes', iniciais: 'J', plano: 'Mensal Básico', data: 'Ontem, 09:20', status: 'Ativo' },
  ];

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">
      
      {/* SIDEBAR DO ADMIN */}
      <aside className="w-64 bg-[#1e2330] text-slate-400 flex flex-col hidden lg:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-700/50">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Admin<span className="text-brand-orange">Ari</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/admin" className="flex items-center px-4 py-3 bg-brand-orange text-white rounded-xl font-bold transition-all shadow-md shadow-brand-orange/20">
            <LayoutDashboard className="w-5 h-5 mr-3" /> Visão Geral
          </Link>
          <Link to="#" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all group">
            <Users className="w-5 h-5 mr-3 group-hover:text-brand-orange transition-colors" /> Gestão de Alunos
          </Link>
          <Link to="#" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all group">
            <FileQuestion className="w-5 h-5 mr-3 group-hover:text-brand-orange transition-colors" /> Simulados e Questões
          </Link>
          <Link to="#" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all group">
            <Video className="w-5 h-5 mr-3 group-hover:text-brand-orange transition-colors" /> Aulas e Lives
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <Link to="#" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all group">
            <Settings className="w-5 h-5 mr-3 group-hover:text-brand-orange transition-colors" /> Configurações
          </Link>
        </div>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-slate-100 px-8 flex justify-between items-center shrink-0">
          <div className="relative w-96 hidden md:block">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Buscar aluno, email ou CPF..." 
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 pl-11 pr-4 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange transition-all"
            />
          </div>
          
          <div className="flex items-center gap-6 ml-auto">
            <button className="relative text-slate-400 hover:text-brand-orange transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3 pl-6 border-l border-slate-200 cursor-pointer">
              <div className="text-right hidden sm:block">
                <p className="font-bold text-sm text-slate-900 leading-none">Prof. Ari</p>
                <p className="text-xs text-slate-500 mt-1">Administrador</p>
              </div>
              <div className="w-10 h-10 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                A
              </div>
            </div>
          </div>
        </header>

        {/* CONTEÚDO SCROLLÁVEL */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto space-y-8">
            
            {/* Boas-vindas e Ações */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">Bom dia, Ari!</h2>
                <p className="text-slate-500 mt-1 font-medium">Aqui está o resumo da sua plataforma hoje.</p>
              </div>
              
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-brand-orange hover:border-brand-orange rounded-xl font-bold transition-all shadow-sm">
                  <Calendar className="w-4 h-4" /> Agendar Live
                </button>
                <Link 
                    to="/admin/nova-questao" 
  className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-md shadow-brand-orange/20"
>
  <Plus className="w-4 h-4" /> Nova Questão
</Link>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-blue-50 text-blue-500 rounded-2xl flex items-center justify-center shrink-0">
                  <Users className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Alunos Ativos</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-slate-900 leading-none">2.450</h3>
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-md mb-0.5">
                      <TrendingUp className="w-3 h-3 mr-1" /> +12%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-green-50 text-green-500 rounded-2xl flex items-center justify-center shrink-0">
                  <DollarSign className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Receita do Mês</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-slate-900 leading-none">R$ 45.900</h3>
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-md mb-0.5">
                      <TrendingUp className="w-3 h-3 mr-1" /> +8%
                    </span>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-5">
                <div className="w-14 h-14 bg-orange-50 text-brand-orange rounded-2xl flex items-center justify-center shrink-0">
                  <FileQuestion className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-500 mb-1">Simulados Realizados</p>
                  <div className="flex items-end gap-3">
                    <h3 className="text-3xl font-black text-slate-900 leading-none">12.304</h3>
                    <span className="flex items-center text-xs font-bold text-green-500 bg-green-50 px-2 py-0.5 rounded-md mb-0.5">
                      <TrendingUp className="w-3 h-3 mr-1" /> +24%
                    </span>
                  </div>
                </div>
              </div>

            </div>

            {/* Tabela de Matrículas */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-black text-slate-900">Últimas Matrículas</h3>
                <button className="text-sm font-bold text-brand-orange hover:text-orange-600 transition-colors">
                  Ver todos
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {matriculas.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm">
                              {row.iniciais}
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{row.aluno}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-600">{row.plano}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-500">{row.data}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {row.status === 'Ativo' ? (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                              Ativo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">
                              Pendente
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-slate-400 hover:text-brand-orange transition-colors p-2">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
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