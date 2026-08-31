import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Award, Flame, PlayCircle as PlayIcon, FileText, Target, TrendingUp, Calendar, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';
import { supabase } from '../lib/supabaseClient';

const QUICK_ACCESS = [
  { to: '/banco-questoes', icon: FileText, title: 'Banco de Questões', description: 'Questões focadas na sua área.', cta: 'Acessar' },
  { to: '/simulados', icon: Target, title: 'Simulados Inéditos', description: 'Teste seus conhecimentos com tempo real.', cta: 'Acessar' },
  { to: '/desempenho', icon: TrendingUp, title: 'Meu Desempenho', description: 'Veja seus pontos fortes e o que precisa reforçar.', cta: 'Ver ranking' },
  { to: '/plano-estudos', icon: Calendar, title: 'Plano de Estudos', description: 'Organize sua rotina com o cronograma da turma.', cta: 'Organizar' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [perfilAluno, setPerfilAluno] = useState(null);
  const [turmaNome, setTurmaNome] = useState('—');
  const [dadosProgresso, setDadosProgresso] = useState({ dias_seguidos: 1, meta_dias_semana: 0, meta_total_semana: 5 });

  useEffect(() => {
    async function carregarDadosDoAluno() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        // Busca o perfil atualizado do aluno
        const { data: profileData, error: profileErr } = await supabase
          .from('profiles')
          .select('*, turmas(nome)')
          .eq('id', user.id)
          .single();

        if (profileErr) throw profileErr;
        setPerfilAluno(profileData);
        if (profileData?.turmas?.nome) {
          setTurmaNome(profileData.turmas.nome);
        }

        // Cálculo da meta semanal
        const agora = new Date();
        const diaSemana = agora.getDay(); 
        const diffDias = agora.getDate() - diaSemana + (diaSemana === 0 ? -6 : 1);
        const segundaFeira = new Date(agora.setDate(diffDias));
        segundaFeira.setHours(0, 0, 0, 0);

        const { data: tarefasSemana, error: erroTarefas } = await supabase
          .from('plano_estudos_tarefas')
          .select('*')
          .eq('aluno_id', user.id)
          .eq('concluido', true)
          .gte('updated_at', segundaFeira.toISOString());

        let diasEstudadosReais = 0;
        if (!erroTarefas && tarefasSemana) {
          const diasUnicos = new Set(
            tarefasSemana.map(t => new Date(t.updated_at).toDateString())
          );
          diasEstudadosReais = diasUnicos.size;
        }

        setDadosProgresso(prev => ({
          ...prev,
          meta_dias_semana: diasEstudadosReais
        }));

      } catch (err) {
        console.error('Erro ao carregar dashboard:', err);
      } finally {
        setLoading(false);
      }
    }

    carregarDadosDoAluno();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  const nome = perfilAluno?.nome || 'Concurseiro(a)';
  const primeiroNome = nome.split(' ')[0];
  const inicial = nome.charAt(0).toUpperCase();

  const ultimaAulaTitulo = perfilAluno?.ultima_aula || null;
  const ultimoModuloNome = perfilAluno?.ultimo_modulo || 'Módulo Recente';
  const progressoAulaPorcentagem = perfilAluno?.progresso_aula || 0;

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
              <span className="text-xs font-bold text-brand-orange">{dadosProgresso.dias_seguidos} dias seguidos</span>
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
                    {ultimaAulaTitulo ? `Sua última aula foi sobre ${ultimaAulaTitulo}. Vamos continuar?` : 'Acompanhe seus estudos por aqui acessando sua primeira aula.'}
                  </p>
                </div>

                <div className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                  <div className="w-11 h-11 bg-brand-orange rounded-xl flex items-center justify-center shrink-0">
                    <PlayIcon className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-brand-orange uppercase tracking-wider mb-0.5">
                      {ultimoModuloNome}
                    </p>
                    <h4 className="font-bold text-white text-sm truncate">
                      {ultimaAulaTitulo || 'Nenhuma aula iniciada ainda'}
                    </h4>
                    <div className="w-full h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-brand-orange rounded-full transition-all duration-500" style={{ width: `${progressoAulaPorcentagem}%` }} />
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
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1">Meta Semanal</p>
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