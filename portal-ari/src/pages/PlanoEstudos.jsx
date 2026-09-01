import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, BookOpen, Target, RefreshCw, Loader2, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' },
];

const TIPO_CONFIG = {
  aula: { icone: PlayCircle, cor: 'text-brand-orange', bg: 'bg-orange-50' },
  simulado: { icone: Target, cor: 'text-emerald-500', bg: 'bg-emerald-50' },
  revisao: { icone: RefreshCw, cor: 'text-blue-500', bg: 'bg-blue-50' },
};

export default function PlanoEstudos() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [cronograma, setCronograma] = useState([]);
  const [perfil, setPerfil] = useState(null);

  useEffect(() => {
    async function carregarPlano() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, nome, turma_id, turmas(nome)')
          .eq('id', user.id)
          .single();
        
        setPerfil(userProfile);

        if (userProfile) {
          // Busca tanto as tarefas da turma quanto as tarefas exclusivas do aluno em uma única chamada
          let query = supabase.from('cronograma').select('*');

          if (userProfile.turma_id) {
            query = query.or(`turma_id.eq.${userProfile.turma_id},usuario_id.eq.${userProfile.id}`);
          } else {
            query = query.eq('usuario_id', userProfile.id);
          }

          const { data, error } = await query.order('dia_semana', { ascending: true });
          if (error) throw error;

          setCronograma(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar cronograma:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarPlano();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  // Descobre qual é o dia da semana hoje (0 a 6)
  const diaHoje = new Date().getDay();

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Plano de Estudos</h2>
              <p className="text-xs font-medium text-slate-500">Turma: {perfil?.turmas?.nome || 'Não definida'}</p>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto pb-10 space-y-6">
            
            <div className="bg-slate-950 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-slate-900/10">
              <div>
                <h2 className="text-2xl font-black mb-2">Sua Rotina Semanal</h2>
                <p className="text-slate-400 text-sm font-medium">
                  Siga o cronograma preparado pelo professor para garantir que você veja todo o conteúdo até o dia da prova. Constância é o segredo da aprovação.
                </p>
              </div>
              <BookOpen className="w-16 h-16 text-brand-orange opacity-80 shrink-0 hidden md:block" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {DIAS_SEMANA.map((dia) => {
                const tarefasDoDia = cronograma.filter(c => c.dia_semana === dia.id);
                const isHoje = dia.id === diaHoje;

                return (
                  <div 
                    key={dia.id} 
                    className={`p-6 rounded-3xl border transition-all ${
                      isHoje 
                        ? 'bg-white border-brand-orange shadow-md ring-1 ring-brand-orange' 
                        : 'bg-white border-slate-200 shadow-sm opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
                      <h3 className={`font-black text-lg ${isHoje ? 'text-brand-orange' : 'text-slate-900'}`}>
                        {dia.nome}
                      </h3>
                      {isHoje && (
                        <span className="px-3 py-1 bg-brand-orange text-white text-[10px] font-black uppercase tracking-widest rounded-lg">
                          Hoje
                        </span>
                      )}
                    </div>

                    {tarefasDoDia.length === 0 ? (
                      <p className="text-sm font-medium text-slate-400 py-4 text-center">
                        Nenhuma atividade programada. Dia livre!
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {tarefasDoDia.map(tarefa => {
                          const config = TIPO_CONFIG[tarefa.tipo] || TIPO_CONFIG.aula;
                          const Icone = config.icone;

                          return (
                            <div key={tarefa.id} className="flex gap-3 items-start group">
                              <div className={`mt-0.5 p-2 rounded-xl shrink-0 ${config.bg} ${config.cor}`}>
                                <Icone className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-0.5">
                                  {tarefa.materia && (
                                    <span className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] font-bold uppercase">
                                      {tarefa.materia}
                                    </span>
                                  )}
                                  <span className="text-[10px] font-bold text-slate-400 uppercase">
                                    {tarefa.tipo}
                                  </span>
                                </div>
                                <h4 className="font-bold text-slate-800 text-sm">{tarefa.titulo}</h4>
                                {tarefa.descricao && (
                                  <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                                    {tarefa.descricao}
                                  </p>
                                )}
                              </div>
                            </div>
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
      </main>
    </div>
  );
}