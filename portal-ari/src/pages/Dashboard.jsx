import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Award, Flame, PlayCircle as PlayIcon, FileText, Target, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabaseClient';

const QUICK_ACCESS = [
  {
    to: '/banco-questoes',
    icon: FileText,
    title: 'Banco de Questões',
    description: 'Questões focadas na sua área.',
    cta: 'Acessar',
  },
  {
    to: '/simulados',
    icon: Target,
    title: 'Simulados Inéditos',
    description: 'Teste seus conhecimentos com tempo real.',
    cta: 'Acessar',
  },
  {
    to: '/desempenho',
    icon: TrendingUp,
    title: 'Meu Desempenho',
    description: 'Veja seus pontos fortes e o que precisa reforçar.',
    cta: 'Ver ranking',
  },
  {
    to: '/plano-estudos',
    icon: Calendar,
    title: 'Plano de Estudos',
    description: 'Organize sua rotina com o cronograma da turma.',
    cta: 'Organizar',
  },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [ultimaAula, setUltimaAula] = useState(null);
  const [dadosProgresso, setDadosProgresso] = useState({ dias_seguidos: 1, meta_dias_semana: 0, meta_total_semana: 5, progresso_aula_porcentagem: 0 });
  const [loading, setLoading] = useState(true);

  const nome = profile?.nome || 'Concurseiro(a)';
  const primeiroNome = nome.split(' ')[0];
  const inicial = nome.charAt(0).toUpperCase();
  const turmaNome = profile?.turmas?.nome || '—';

  useEffect(() => {
    async function fetchData() {
      if (!profile?.id) return;

      try {
        // 1. Busca a última aula cadastrada
        const { data: aulaData } = await supabase
          .from('aulas')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (aulaData) setUltimaAula(aulaData);

        // 2. Cálculo correto da segunda-feira da semana atual (sem mutar data global)
        const agora = new Date();
        const diaSemana = agora.getDay(); // 0 (Domingo) a 6 (Sábado)
        const diffDias = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        
        const segundaFeira = new Date(agora.setDate(diffDias));
        segundaFeira.setHours(0, 0, 0, 0);

        // 3. Busca tarefas concluídas pelo aluno nesta semana na tabela 'plano_estudos_tarefas'
        const { data: tarefasSemana, error: erroTarefas } = await supabase
          .from('plano_estudos_tarefas')
          .select('*')
          .eq('aluno_id', profile.id)
          .eq('concluido', true)
          .gte('updated_at', segundaFeira.toISOString());

        // Conta quantos dias únicos da semana o aluno concluiu tarefas
        let diasEstudadosReais = 0;
        if (!erroTarefas && tarefasSemana) {
          const diasUnicos = new Set(
            tarefasSemana.map(t => new Date(t.updated_at).toDateString())
          );
          diasEstudadosReais = diasUnicos.size;
        }

        // 4. Busca ou inicializa o progresso na tabela 'progresso_aluno'
        let { data: progData, error } = await supabase
          .from('progresso_aluno')
          .select('*')
          .eq('aluno_id', profile.id)
          .single();

        if (error || !progData) {
          const { data: novoProg } = await supabase
            .from('progresso_aluno')
            .insert([{ 
              aluno_id: profile.id, 
              dias_seguidos: 1, 
              meta_dias_semana: diasEstudadosReais, 
              meta_total_semana: 5, 
              progresso_aula_porcentagem: 15 
            }])
            .select()
            .single();
          
          if (novoProg) {
            setDadosProgresso({
              ...novoProg,
              meta_dias_semana: diasEstudadosReais
            });
          }
        } else {
          setDadosProgresso({
            ...progData,
            meta_dias_semana: diasEstudadosReais
          });
        }

      } catch (err) {
        console.error('Erro ao carregar dados do dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [profile]);

  const fadeUp = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.06 } },
  };

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Visão Geral</h2>
            <p className="text-xs font-medium text-slate-500">Turma: {turmaNome}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-xs font-bold text-brand-orange">{dadosProgresso.dias_seguidos} dias seguidos</span>
            </div>
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
              {inicial}
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            className="max-w-5xl mx-auto space-y-6 pb-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >

            {/* Continue de onde parou + Meta semanal */}
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">

              <div className="md:col-span-2 bg-slate-950 rounded-3xl p-6 md:p-7 text-white flex flex-col justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-black mb-1">Bora gabaritar hoje, {primeiroNome}?</h2>
                  <p className="text-slate-400 text-sm font-medium mb-5">
                    {ultimaAula ? `Sua última aula foi sobre ${ultimaAula.titulo || ultimaAula.nome}. Vamos continuar?` : 'Acompanhe seus estudos por aqui.'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-orange rounded-xl flex items-center justify-center shrink-0">
                    <PlayIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">
                      {ultimaAula?.modulo || 'Módulo Recente'}
                    </p>
                    <h4 className="font-bold text-white text-sm truncate">
                      {loading ? 'Carregando...' : (ultimaAula?.titulo || ultimaAula?.nome || 'Nenhuma aula recente')}
                    </h4>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${dadosProgresso.progresso_aula_porcentagem}%` }} />
                    </div>
                  </div>
                  <button
                    onClick={() => navigate('/player')}
                    className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors shrink-0"
                  >
                    Continuar
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">
                  Meta Semanal
                </p>
                <h3 className="text-2xl font-black text-slate-900">
                  {dadosProgresso.meta_dias_semana} / {dadosProgresso.meta_total_semana} dias
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  {dadosProgresso.meta_total_semana - dadosProgresso.meta_dias_semana > 0 
                    ? `Falta ${dadosProgresso.meta_total_semana - dadosProgresso.meta_dias_semana} dia para bater a meta` 
                    : 'Meta batida esta semana! 🎉'}
                </p>
              </div>
            </motion.div>

            {/* Atalhos */}
            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">
                Atalhos
              </h3>
              <div className="bg-white border border-slate-200 rounded-3xl divide-y divide-slate-100 overflow-hidden">
                {QUICK_ACCESS.map(({ to, icon: Icon, title, description, cta }) => (
                  <button
                    key={to}
                    onClick={() => navigate(to)}
                    className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left group"
                  >
                    <div className="w-10 h-10 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-slate-900 text-sm">{title}</h4>
                      <p className="text-xs text-slate-500 font-medium truncate">{description}</p>
                    </div>
                    <div className="flex items-center text-xs font-bold text-brand-orange shrink-0">
                      {cta}
                      <ChevronRight className="w-4 h-4 ml-0.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}