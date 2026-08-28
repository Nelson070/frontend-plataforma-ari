import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Calendar, ArrowLeft, Plus, Loader2, Save, Trash2, PlayCircle, Target, RefreshCw, Users, User } from 'lucide-react';
import { Link } from 'react-router-dom';

const DIAS_SEMANA = [
  { id: 1, nome: 'Segunda-feira' },
  { id: 2, nome: 'Terça-feira' },
  { id: 3, nome: 'Quarta-feira' },
  { id: 4, nome: 'Quinta-feira' },
  { id: 5, nome: 'Sexta-feira' },
  { id: 6, nome: 'Sábado' },
  { id: 0, nome: 'Domingo' },
];

const TIPOS = [
  { id: 'aula', nome: 'Videoaula', icone: PlayCircle },
  { id: 'simulado', nome: 'Simulado', icone: Target },
  { id: 'revisao', nome: 'Revisão', icone: RefreshCw },
];

export default function AdminCronograma() {
  const [modo, setModo] = useState('turma'); // 'turma' ou 'aluno'
  
  // Listas de dados
  const [turmas, setTurmas] = useState([]);
  const [alunos, setAlunos] = useState([]);
  
  // Seleções ativas
  const [turmaAtiva, setTurmaAtiva] = useState('');
  const [alunoAtivo, setAlunoAtivo] = useState('');
  
  const [cronograma, setCronograma] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Formulário
  const [diaSemana, setDiaSemana] = useState(1);
  const [tipo, setTipo] = useState('aula');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [salvando, setSalvando] = useState(false);

  // Carregar turmas e alunos ao iniciar
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [{ data: turmasData }, { data: alunosData }] = await Promise.all([
          supabase.from('turmas').select('*').order('nome'),
          supabase.from('profiles').select('id, nome').neq('role', 'admin').order('nome')
        ]);

        if (turmasData && turmasData.length > 0) {
          setTurmas(turmasData);
          setTurmaAtiva(turmasData[0].id);
        }

        if (alunosData && alunosData.length > 0) {
          setAlunos(alunosData);
          setAlunoAtivo(alunosData[0].id);
        }
      } catch (err) {
        console.error('Erro ao buscar dados iniciais:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Carregar cronograma conforme o modo (turma ou aluno)
  useEffect(() => {
    if (modo === 'turma' && turmaAtiva) {
      carregarCronogramaTurma(turmaAtiva);
    } else if (modo === 'aluno' && alunoAtivo) {
      carregarCronogramaAluno(alunoAtivo);
    }
  }, [modo, turmaAtiva, alunoAtivo]);

  async function carregarCronogramaTurma(idTurma) {
    const { data } = await supabase
      .from('cronograma')
      .select('*')
      .eq('turma_id', idTurma)
      .is('usuario_id', null)
      .order('dia_semana', { ascending: true })
      .order('created_at', { ascending: true });
    
    setCronograma(data || []);
  }

  async function carregarCronogramaAluno(idAluno) {
    const { data } = await supabase
      .from('cronograma')
      .select('*')
      .eq('usuario_id', idAluno)
      .order('dia_semana', { ascending: true })
      .order('created_at', { ascending: true });
    
    setCronograma(data || []);
  }

  const handleAdicionar = async (e) => {
    e.preventDefault();
    setSalvando(true);

    try {
      const payload = {
        dia_semana: parseInt(diaSemana),
        tipo,
        titulo,
        descricao: descricao || null,
        turma_id: modo === 'turma' ? turmaAtiva : null,
        usuario_id: modo === 'aluno' ? alunoAtivo : null
      };

      const { error } = await supabase.from('cronograma').insert([payload]);
      if (error) throw error;

      setTitulo('');
      setDescricao('');

      if (modo === 'turma') {
        carregarCronogramaTurma(turmaAtiva);
      } else {
        carregarCronogramaAluno(alunoAtivo);
      }
    } catch (error) {
      alert('Erro ao salvar no cronograma.');
      console.error(error);
    } finally {
      setSalvando(false);
    }
  };

  const handleRemover = async (id) => {
    try {
      await supabase.from('cronograma').delete().eq('id', id);
      if (modo === 'turma') {
        carregarCronogramaTurma(turmaAtiva);
      } else {
        carregarCronogramaAluno(alunoAtivo);
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        {/* HEADER */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Calendar className="w-6 h-6 text-brand-orange" />
                Gerenciar Plano de Estudos
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Monte a rotina semanal por turma ou individualmente por aluno.</p>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            {/* SELETOR DE MODO (TURMA / ALUNO) */}
            <div className="flex p-1 bg-white border border-slate-200 rounded-xl">
              <button
                onClick={() => setModo('turma')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  modo === 'turma' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Users className="w-3.5 h-3.5" /> Por Turma
              </button>
              <button
                onClick={() => setModo('aluno')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                  modo === 'aluno' ? 'bg-brand-orange text-white' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5" /> Por Aluno
              </button>
            </div>

            {/* SELECT DE TURMA OU ALUNO */}
            {modo === 'turma' ? (
              <select 
                value={turmaAtiva} 
                onChange={e => setTurmaAtiva(e.target.value)} 
                className="p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-bold text-sm text-slate-700 shadow-sm"
              >
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            ) : (
              <select 
                value={alunoAtivo} 
                onChange={e => setAlunoAtivo(e.target.value)} 
                className="p-2 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-bold text-sm text-slate-700 shadow-sm"
              >
                {alunos.length === 0 ? (
                  <option value="">Nenhum aluno cadastrado</option>
                ) : (
                  alunos.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)
                )}
              </select>
            )}
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* LADO ESQUERDO: FORMULÁRIO DE ADIÇÃO */}
          <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-slate-200 shadow-sm p-6 shrink-0 h-fit">
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-brand-orange" /> Adicionar Atividade ({modo === 'turma' ? 'Turma' : 'Individual'})
            </h3>

            <form onSubmit={handleAdicionar} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dia da Semana</label>
                <select value={diaSemana} onChange={e => setDiaSemana(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange text-sm font-bold text-slate-700">
                  {DIAS_SEMANA.map(dia => <option key={dia.id} value={dia.id}>{dia.nome}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Tipo de Atividade</label>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS.map(t => {
                    const Icone = t.icone;
                    const isSelecionado = tipo === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setTipo(t.id)}
                        className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all gap-1 ${isSelecionado ? 'border-brand-orange bg-orange-50 text-brand-orange' : 'border-slate-100 bg-white text-slate-500 hover:border-slate-200'}`}
                      >
                        <Icone className="w-5 h-5" />
                        <span className="text-[10px] font-bold uppercase tracking-wider">{t.nome}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Título</label>
                <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Aula de Porcentagem" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange text-sm font-medium" />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Instruções / Descrição (Opcional)</label>
                <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange text-sm font-medium resize-none" placeholder="Ex: Resolver lista PDF após o vídeo..." />
              </div>

              <button disabled={salvando} type="submit" className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 mt-6 shadow-sm">
                {salvando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Lançar na Rotina
              </button>
            </form>
          </div>

          {/* LADO DIREITO: PREVIEW DO CRONOGRAMA */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50 shrink-0 flex items-center justify-between">
              <h3 className="font-bold text-slate-800">
                Cronograma {modo === 'turma' ? 'da Turma' : 'do Aluno'}
              </h3>
              <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-brand-orange rounded-full">
                {cronograma.length} atividades cadastradas
              </span>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cronograma.length === 0 ? (
                <div className="text-center p-12 text-slate-400 font-medium">Nenhuma atividade cadastrada para esta seleção.</div>
              ) : (
                DIAS_SEMANA.map(dia => {
                  const tarefas = cronograma.filter(c => c.dia_semana === dia.id);
                  if (tarefas.length === 0) return null;

                  return (
                    <div key={dia.id} className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                      <h4 className="font-black text-slate-800 mb-3 text-sm uppercase tracking-wider">{dia.nome}</h4>
                      <div className="space-y-2">
                        {tarefas.map(tarefa => {
                          const configTipo = TIPOS.find(t => t.id === tarefa.tipo) || TIPOS[0];
                          const Icone = configTipo.icone;
                          
                          return (
                            <div key={tarefa.id} className="bg-white p-3 rounded-xl border border-slate-200 flex items-start gap-3 group shadow-sm">
                              <div className="p-2 bg-slate-50 text-slate-400 rounded-lg shrink-0 mt-0.5">
                                <Icone className="w-4 h-4" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-bold text-slate-900 text-sm">{tarefa.titulo}</h5>
                                {tarefa.descricao && <p className="text-xs text-slate-500 font-medium mt-1">{tarefa.descricao}</p>}
                              </div>
                              <button onClick={() => handleRemover(tarefa.id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 shrink-0">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}