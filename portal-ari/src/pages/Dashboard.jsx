import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Award, Flame, PlayCircle as PlayIcon, FileText, Target, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useGamificacao } from '../hooks/useGamificacao';

const QUICK_ACCESS = [
  { to: '/banco-questoes', icon: FileText, title: 'Banco de Questões', description: 'Questões focadas na sua área.', cta: 'Acessar' },
  { to: '/simulados', icon: Target, title: 'Simulados Inéditos', description: 'Teste seus conhecimentos com tempo real.', cta: 'Acessar' },
  { to: '/desempenho', icon: TrendingUp, title: 'Meu Desempenho', description: 'Veja seus pontos fortes e o que precisa reforçar.', cta: 'Ver ranking' },
  { to: '/plano-estudos', icon: Calendar, title: 'Plano de Estudos', description: 'Organize sua rotina com o cronograma da turma.', cta: 'Organizar' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [loadingUltimaAula, setLoadingUltimaAula] = useState(true);
  const [ultimaAula, setUltimaAula] = useState(null); // { titulo, modulo_nome, progresso, aula_id }

  const { streak, diasEstudadosSemana, metaSemanalDias } = useGamificacao(
    profile?.turma_id,
    profile?.turmas?.meta_semanal_dias ?? 5
  );

  useEffect(() => {
    async function carregarUltimaAula() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // A aula mais recentemente mexida pelo aluno — não importa se já
      // concluiu outras antes, essa é a que aparece como "continue de onde parou".
      const { data, error } = await supabase
        .from('progresso_aulas')
        .select('progresso, concluida, atualizado_em, aulas ( titulo, modulo_nome )')
        .eq('user_id', user.id)
        .order('atualizado_em', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setUltimaAula({
          titulo: data.aulas?.titulo,
          modulo: data.aulas?.modulo_nome || 'Módulo Geral',
          progresso: data.progresso,
        });
      }
      setLoadingUltimaAula(false);
    }
    carregarUltimaAula();
  }, []);

  const nome = profile?.nome || 'Concurseiro(a)';
  const primeiroNome = nome.split(' ')[0];
  const inicial = nome.charAt(0).toUpperCase();
  const turmaNome = profile?.turmas?.nome || '—';

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

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-lg font-black text-slate-900 leading-tight">Visão Geral</h2>
            <p className="text-xs font-medium text-slate-500">Turma: {turmaNome}</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-xs font-bold text-brand-orange">
                {streak > 0 ? `${streak} dia${streak > 1 ? 's' : ''} seguidos` : 'Comece hoje!'}
              </span>
            </div>
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
              {inicial}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <motion.div
            className="max-w-5xl mx-auto space-y-6 pb-10"
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2 bg-slate-950 rounded-3xl p-6 md:p-7 text-white flex flex-col justify-between">
                <div>
                  <h2 className="text-xl md:text-2xl font-black mb-1">Bora gabaritar hoje, {primeiroNome}?</h2>
                  <p className="text-slate-400 text-sm font-medium mb-5">
                    {ultimaAula?.titulo ? `Sua última aula foi sobre ${ultimaAula.titulo}. Vamos continuar?` : 'Acompanhe seus estudos por aqui acessando sua primeira aula.'}
                  </p>
                </div>

                {loadingUltimaAula ? (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-sm">
                    <Loader2 className="w-4 h-4 animate-spin" /> Carregando...
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                    <div className="w-11 h-11 bg-brand-orange rounded-xl flex items-center justify-center shrink-0">
                      <PlayIcon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">
                        {ultimaAula?.modulo || 'Módulo Recente'}
                      </p>
                      <h4 className="font-bold text-white text-sm truncate">
                        {ultimaAula?.titulo || 'Nenhuma aula iniciada ainda'}
                      </h4>
                      <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${ultimaAula?.progresso ?? 0}%` }} />
                      </div>
                    </div>
                    <button
                      onClick={() => navigate('/player')}
                      className="px-4 py-2 bg-white text-slate-900 hover:bg-slate-100 rounded-xl font-bold text-sm transition-colors shrink-0"
                    >
                      Continuar
                    </button>
                  </div>
                )}
              </div>

              <div className="bg-white border border-slate-200 rounded-3xl p-6 flex flex-col items-center justify-center text-center">
                <Award className="w-8 h-8 text-amber-500 mb-2" />
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Semanal</p>
                <h3 className="text-2xl font-black text-slate-900">
                  {diasEstudadosSemana} / {metaSemanalDias} dias
                </h3>
                <p className="text-xs font-medium text-slate-500 mt-1.5">
                  {diasEstudadosSemana >= metaSemanalDias
                    ? 'Meta batida essa semana! 🎉'
                    : `Faltam ${metaSemanalDias - diasEstudadosSemana} dia${metaSemanalDias - diasEstudadosSemana > 1 ? 's' : ''} para bater a meta`}
                </p>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3 px-1">Atalhos</h3>
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