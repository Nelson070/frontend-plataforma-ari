import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, Bell, Calendar, Plus, DollarSign, TrendingUp,
  Users, FileQuestion, MoreHorizontal, LogOut
} from 'lucide-react';
import AdminSidebar from './AdminSidebar';
import { supabase } from '../lib/supabaseClient';

const KPIS = [
  { icon: Users, iconStyle: 'bg-blue-50 text-blue-500', label: 'Alunos Ativos', value: '2.450', delta: '+12%' },
  { icon: DollarSign, iconStyle: 'bg-emerald-50 text-emerald-500', label: 'Receita do Mês', value: 'R$ 45.900', delta: '+8%' },
  { icon: FileQuestion, iconStyle: 'bg-orange-50 text-brand-orange', label: 'Simulados Realizados', value: '12.304', delta: '+24%' },
];

const MATRICULAS = [
  { id: 1, aluno: 'Carlos Silva', iniciais: 'C', plano: 'Anual Premium', data: 'Hoje, 14:30', status: 'Ativo' },
  { id: 2, aluno: 'Amanda Nunes', iniciais: 'A', plano: 'Mensal Básico', data: 'Hoje, 11:15', status: 'Ativo' },
  { id: 3, aluno: 'Felipe Costa', iniciais: 'F', plano: 'Anual Premium', data: 'Ontem, 16:40', status: 'Pendente' },
  { id: 4, aluno: 'Juliana Paes', iniciais: 'J', plano: 'Mensal Básico', data: 'Ontem, 09:20', status: 'Ativo' },
];

const STATUS_STYLE = {
  Ativo: 'bg-emerald-50 text-emerald-700',
  Pendente: 'bg-amber-50 text-amber-700',
};

export default function Admin() {
  const navigate = useNavigate();

  // Função para deslogar caso o Ari queira sair da conta
  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">
      
      <AdminSidebar />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="relative w-full max-w-sm hidden md:block">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar aluno, email ou CPF..."
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
            />
          </div>

          <div className="flex items-center gap-5 ml-auto">
            <button className="relative text-slate-400 hover:text-brand-orange transition-colors">
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            
            <div className="flex items-center gap-4 pl-5 border-l border-slate-200">
              <div className="flex items-center gap-2.5 cursor-pointer">
                <div className="text-right hidden sm:block">
                  <p className="font-bold text-sm text-slate-900 leading-none">Prof. Ari</p>
                  <p className="text-xs text-slate-500 mt-1">Administrador</p>
                </div>
                <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
                  A
                </div>
              </div>

              {/* Botão de Logout rápido pro Admin */}
              <button 
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors ml-2"
                title="Sair da conta"
              >
                <LogOut className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-6xl mx-auto space-y-6">
            
            {/* Boas-vindas e Ações */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">Bom dia, Ari!</h2>
                <p className="text-slate-500 text-sm font-medium mt-1">Aqui está o resumo da sua plataforma hoje.</p>
              </div>

              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-brand-orange hover:border-brand-orange rounded-xl font-bold text-sm transition-colors shadow-sm">
                  <Calendar className="w-4 h-4" /> Agendar Live
                </button>
                <Link
                  to="/admin/nova-questao" 
                  className="flex items-center gap-2 px-4 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold text-sm transition-colors shadow-sm shadow-orange-500/20"
                >
                  <Plus className="w-4 h-4" /> Nova Questão
                </Link>
              </div>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {KPIS.map(({ icon: Icon, iconStyle, label, value, delta }) => (
                <div key={label} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 hover:border-brand-orange/30 transition-colors cursor-default">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconStyle}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-500 mb-1">{label}</p>
                    <div className="flex items-end gap-2">
                      <h3 className="text-2xl font-black text-slate-900 leading-none">{value}</h3>
                      <span className="flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-md mb-0.5">
                        <TrendingUp className="w-3 h-3 mr-0.5" /> {delta}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Tabela de Matrículas */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="text-base font-black text-slate-900">Últimas Matrículas</h3>
                <button className="text-sm font-bold text-brand-orange hover:text-orange-600 transition-colors">
                  Ver todos
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white border-b border-slate-100">
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Aluno</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Plano</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {MATRICULAS.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                              {row.iniciais}
                            </div>
                            <span className="font-bold text-slate-900 text-sm">{row.aluno}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-bold text-slate-600">{row.plano}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-slate-500">{row.data}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${STATUS_STYLE[row.status]}`}>
                            {row.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <button className="text-slate-400 hover:text-brand-orange bg-white hover:bg-orange-50 rounded-lg transition-colors p-2">
                            <MoreHorizontal className="w-4.5 h-4.5" />
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