import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle2, Circle, ChevronLeft, ChevronRight,
  Clock, BookOpen, Flame, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import Sidebar from './Sidebar';

const SEMANA = [
  { dia: 'Seg', data: '03', status: 'concluido' },
  { dia: 'Ter', data: '04', status: 'concluido' },
  { dia: 'Qua', data: '05', status: 'concluido' },
  { dia: 'Qui', data: '06', status: 'hoje' },
  { dia: 'Sex', data: '07', status: 'pendente' },
  { dia: 'Sáb', data: '08', status: 'pendente' },
  { dia: 'Dom', data: '09', status: 'descanso' },
];

export default function PlanoEstudos() {
  const navigate = useNavigate();

  const [tarefasHoje, setTarefasHoje] = useState([
    { id: 1, titulo: 'Videoaula: Tabela-Verdade', modulo: 'Raciocínio Lógico', tempo: '45 min', concluido: true },
    { id: 2, titulo: 'Lista de Fixação (15 questões)', modulo: 'Raciocínio Lógico', tempo: '30 min', concluido: false },
    { id: 3, titulo: 'Revisão: Regra de Três', modulo: 'Matemática', tempo: '20 min', concluido: false },
  ]);

  const toggleTarefa = (id) => {
    setTarefasHoje(tarefasHoje.map(t => t.id === id ? { ...t, concluido: !t.concluido } : t));
  };

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
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Plano de Estudos</h2>
              <p className="text-xs font-medium text-slate-500">Sua trilha personalizada rumo à aprovação</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 rounded-full">
              <Flame className="w-3.5 h-3.5 text-brand-orange" />
              <span className="text-xs font-bold text-brand-orange">12 dias seguidos</span>
            </div>
            <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
              C
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

            {/* CONTROLE DA SEMANA */}
            <motion.div variants={fadeUp} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">Agosto 2026</h3>
                <p className="text-slate-500 text-sm font-medium mt-0.5">Semana 1 (03 a 09 de Agosto)</p>
              </div>
              <div className="flex items-center gap-2 bg-white p-1 rounded-xl border border-slate-200 w-fit">
                <button className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors">
                  <ChevronLeft className="w-4.5 h-4.5" />
                </button>
                <span className="text-sm font-bold text-slate-700 px-3">Semana Atual</span>
                <button className="p-1.5 text-slate-400 hover:text-brand-orange hover:bg-orange-50 rounded-lg transition-colors">
                  <ChevronRight className="w-4.5 h-4.5" />
                </button>
              </div>
            </motion.div>

            {/* GRID DOS DIAS DA SEMANA */}
            <motion.div variants={staggerContainer} className="grid grid-cols-7 gap-2.5 md:gap-3">
              {SEMANA.map((dia) => (
                <motion.div
                  key={dia.dia}
                  variants={fadeUp}
                  className={`flex flex-col items-center p-3.5 rounded-xl border transition-colors ${
                    dia.status === 'hoje'
                      ? 'bg-brand-orange text-white border-brand-orange'
                      : dia.status === 'concluido'
                      ? 'bg-emerald-50/60 border-emerald-100 text-slate-600'
                      : dia.status === 'descanso'
                      ? 'bg-slate-100 border-dashed border-slate-300 text-slate-400'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-brand-orange/50'
                  }`}
                >
                  <span className={`text-xs font-bold uppercase tracking-widest mb-1.5 ${dia.status === 'hoje' ? 'text-orange-200' : 'text-slate-400'}`}>
                    {dia.dia}
                  </span>
                  <span className={`text-xl font-black ${dia.status === 'hoje' ? 'text-white' : 'text-slate-800'}`}>
                    {dia.data}
                  </span>
                  <div className="mt-2 h-5 flex items-center">
                    {dia.status === 'concluido' && <CheckCircle2 className="w-4.5 h-4.5 text-emerald-500" />}
                    {dia.status === 'hoje' && <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />}
                    {dia.status === 'pendente' && <div className="w-1.5 h-1.5 bg-slate-300 rounded-full" />}
                  </div>
                </motion.div>
              ))}
            </motion.div>

            {/* AGENDA DE HOJE */}
            <motion.div variants={fadeUp} className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-100 bg-slate-50/60 flex flex-col md:flex-row justify-between md:items-center gap-3">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    Minhas Metas de Hoje
                    <span className="bg-brand-orange text-white text-xs px-2 py-0.5 rounded-full">Qui, 06</span>
                  </h3>
                  <p className="text-sm text-slate-500 font-medium mt-1">
                    Você completou {tarefasHoje.filter(t => t.concluido).length} de {tarefasHoje.length} tarefas. Continue firme!
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm font-bold text-slate-600 bg-white px-3.5 py-2 rounded-xl border border-slate-200 w-fit">
                  <Clock className="w-4 h-4 text-brand-orange" />
                  Tempo estimado: 1h 35m
                </div>
              </div>

              <div className="p-6 space-y-3">
                {tarefasHoje.map((tarefa) => (
                  <div
                    key={tarefa.id}
                    onClick={() => toggleTarefa(tarefa.id)}
                    className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-colors group ${
                      tarefa.concluido
                        ? 'border-emerald-200 bg-emerald-50/40'
                        : 'border-slate-200 hover:border-brand-orange/40 bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`transition-colors shrink-0 ${tarefa.concluido ? 'text-emerald-500' : 'text-slate-300 group-hover:text-brand-orange'}`}>
                        {tarefa.concluido ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className={`font-bold text-sm transition-colors ${tarefa.concluido ? 'text-slate-500 line-through decoration-slate-300' : 'text-slate-900'}`}>
                          {tarefa.titulo}
                        </h4>
                        <div className="flex items-center gap-2.5 mt-1">
                          <span className={`text-xs font-bold px-2 py-0.5 rounded-md ${tarefa.concluido ? 'bg-slate-100 text-slate-400' : 'bg-orange-50 text-brand-orange'}`}>
                            {tarefa.modulo}
                          </span>
                          <span className="text-xs font-medium text-slate-400 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {tarefa.tempo}
                          </span>
                        </div>
                      </div>
                    </div>

                    {!tarefa.concluido && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/player');
                        }}
                        className="hidden md:flex px-4 py-2 bg-slate-900 hover:bg-brand-orange text-white text-sm font-bold rounded-xl transition-colors shrink-0"
                      >
                        Iniciar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* PREPARAÇÃO PARA AMANHÃ */}
            <motion.div variants={fadeUp} className="bg-slate-950 rounded-3xl p-6 md:p-7 text-white">
              <div className="flex flex-col md:flex-row items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <div className="w-11 h-11 bg-white/10 rounded-xl flex items-center justify-center shrink-0">
                    <BookOpen className="w-5 h-5 text-brand-orange" />
                  </div>
                  <div>
                    <h4 className="text-base font-black">Preparação para Amanhã</h4>
                    <p className="text-slate-400 text-sm mt-0.5">
                      Amanhã iniciaremos o módulo de <strong className="text-white">Probabilidade</strong>. Descanse bem!
                    </p>
                  </div>
                </div>
                <button className="w-full md:w-auto px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl font-bold text-sm transition-colors shrink-0">
                  Ver Cronograma Completo
                </button>
              </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}