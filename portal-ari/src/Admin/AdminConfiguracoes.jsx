import React, { useState } from 'react';
import { User, GraduationCap, Bell, Lock, Plus, Pencil, Trash2 } from 'lucide-react';
import AdminSidebar from './AdminSidebar';

const TURMAS_INICIAIS = [
  { id: 1, nome: 'ENEM', slug: 'enem', alunos: 842 },
  { id: 2, nome: 'Concursos Públicos', slug: 'concursos', alunos: 615 },
  { id: 3, nome: 'Pré-IFMA/CMT', slug: 'pre-ifma', alunos: 310 },
  { id: 4, nome: '6° Ano (CMT)', slug: 'pre-cmt-6', alunos: 198 },
  { id: 5, nome: 'Isolada de Matemática', slug: 'isolada-matematica', alunos: 485 },
];

function Toggle({ ativo, onChange }) {
  return (
    <button
      onClick={onChange}
      className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${ativo ? 'bg-brand-orange' : 'bg-slate-200'}`}
    >
      <span
        className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
          ativo ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  );
}

export default function AdminConfiguracoes() {
  const [notificacoes, setNotificacoes] = useState({
    novaMatricula: true,
    novaDuvida: true,
    resumoSemanal: false,
  });

  const toggleNotificacao = (chave) => {
    setNotificacoes((prev) => ({ ...prev, [chave]: !prev[chave] }));
  };

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">

      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Configurações</h2>
            <p className="text-xs font-medium text-slate-500">Preferências da conta e da plataforma</p>
          </div>

          <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
            A
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-3xl mx-auto space-y-5 pb-10">

            {/* Perfil do Administrador */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
                <User className="w-4.5 h-4.5 text-brand-orange" /> Perfil do Administrador
              </h3>

              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 bg-brand-orange rounded-full flex items-center justify-center text-white font-black text-xl shrink-0">
                  A
                </div>
                <button className="px-4 py-2 bg-white border border-slate-200 hover:border-brand-orange hover:text-brand-orange text-slate-700 font-bold text-sm rounded-xl transition-colors">
                  Trocar foto
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nome</label>
                  <input
                    type="text"
                    defaultValue="Prof. Ari"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Email</label>
                  <input
                    type="email"
                    defaultValue="ari@aritmaticagabaritando.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                  />
                </div>
              </div>

              <button className="mt-5 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
                Salvar alterações
              </button>
            </div>

            {/* Turmas da Plataforma */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <GraduationCap className="w-4.5 h-4.5 text-brand-orange" /> Turmas da Plataforma
                </h3>
                <button className="flex items-center gap-1.5 text-sm font-bold text-brand-orange hover:text-orange-600 transition-colors">
                  <Plus className="w-4 h-4" /> Nova Turma
                </button>
              </div>

              <div className="divide-y divide-slate-100">
                {TURMAS_INICIAIS.map((turma) => (
                  <div key={turma.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-bold text-slate-900 text-sm">{turma.nome}</p>
                      <p className="text-xs text-slate-500">{turma.alunos} alunos · slug: {turma.slug}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button className="p-2 text-slate-400 hover:text-brand-orange transition-colors">
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Notificações */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
                <Bell className="w-4.5 h-4.5 text-brand-orange" /> Notificações
              </h3>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Nova matrícula</p>
                    <p className="text-xs text-slate-500">Avisar quando um aluno se matricular em qualquer turma</p>
                  </div>
                  <Toggle ativo={notificacoes.novaMatricula} onChange={() => toggleNotificacao('novaMatricula')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Nova dúvida no chat/live</p>
                    <p className="text-xs text-slate-500">Avisar quando um aluno postar uma dúvida</p>
                  </div>
                  <Toggle ativo={notificacoes.novaDuvida} onChange={() => toggleNotificacao('novaDuvida')} />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 text-sm">Resumo semanal por email</p>
                    <p className="text-xs text-slate-500">Receber métricas da plataforma toda segunda-feira</p>
                  </div>
                  <Toggle ativo={notificacoes.resumoSemanal} onChange={() => toggleNotificacao('resumoSemanal')} />
                </div>
              </div>
            </div>

            {/* Segurança */}
            <div className="bg-white border border-slate-200 rounded-2xl p-6">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2 mb-5">
                <Lock className="w-4.5 h-4.5 text-brand-orange" /> Segurança
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Nova senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Confirmar nova senha</label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange transition-colors"
                  />
                </div>
              </div>

              <button className="mt-5 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors">
                Atualizar senha
              </button>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}