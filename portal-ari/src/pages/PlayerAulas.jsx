import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, PlayCircle, CheckCircle2, Loader2, ChevronRight, Zap, Clock, BookmarkPlus, Trash2, Edit3, ChevronDown, ChevronUp, Layers } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamificacao } from '../hooks/useGamificacao';
import Sidebar from './Sidebar';

export default function PlayerAulas() {
  const navigate = useNavigate();
  const [modulos, setModulos] = useState([]);
  const [aulasPorModulo, setAulasPorModulo] = useState({});
  const [aulaAtual, setAulaAtual] = useState(null);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [marcandoConcluida, setMarcandoConcluida] = useState(false);

  // Módulos recolhidos/abertos na sidebar: { [moduloId]: boolean }
  const [modulosAbertos, setModulosAbertos] = useState({});

  // progresso[aula_id] = { progresso, concluida }
  const [progresso, setProgresso] = useState({});

  const [sucesso, setSucesso] = useState(false);
  const [ganhouXp, setGanhouXp] = useState(false);
  const { xp, recarregar } = useGamificacao();

  const [anotacoes, setAnotacoes] = useState([]);
  const [novaAnotacao, setNovaAnotacao] = useState('');
  const [minutoInput, setMinutoInput] = useState('00:00');
  const [carregandoAnotacoes, setCarregandoAnotacoes] = useState(false);
  const iframeRef = useRef(null);

  const carregarProgresso = async (userId) => {
    const { data } = await supabase
      .from('progresso_aulas')
      .select('aula_id, progresso, concluida')
      .eq('user_id', userId);

    const mapa = {};
    (data ?? []).forEach((p) => { mapa[p.aula_id] = { progresso: p.progresso, concluida: p.concluida }; });
    setProgresso(mapa);
  };

 useEffect(() => {
    async function carregarDadosCurso() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('turma_id')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        await carregarProgresso(user.id);

        if (profile?.turma_id) {
          // Tenta buscar os módulos, mas se a tabela falhar, tratamos para não quebrar a tela
          let listaModulos = [];
          const { data: modData } = await supabase
            .from('modulos')
            .select('*')
            .eq('turma_id', profile.turma_id)
            .order('ordem', { ascending: true });
          
          if (modData) listaModulos = modData;

          // Busca todas as aulas da turma
          const { data: listaAulas, error: aulasError } = await supabase
            .from('aulas')
            .select('*')
            .eq('turma_id', profile.turma_id)
            .order('ordem', { ascending: true });

          if (aulasError) throw aulasError;

          const abertosMap = {};
          listaModulos.forEach(m => { abertosMap[m.id] = true; });

          // Agrupa as aulas por módulo ou cria um Módulo Geral automático
          const agrupadas = {};
          const aulasSemModulo = [];

          (listaAulas || []).forEach(aula => {
            if (aula.modulo_id && listaModulos.some(m => m.id === aula.modulo_id)) {
              if (!agrupadas[aula.modulo_id]) agrupadas[aula.modulo_id] = [];
              agrupadas[aula.modulo_id].push(aula);
            } else {
              aulasSemModulo.push(aula);
            }
          });

          let modulosFinais = [...listaModulos];
          if (aulasSemModulo.length > 0) {
            const modGeralId = 'geral-fallback';
            modulosFinais.push({ id: modGeralId, titulo: 'Módulo Geral / Aulas Avulsas', ordem: 999 });
            agrupadas[modGeralId] = aulasSemModulo;
            abertosMap[modGeralId] = true;
          }

          setModulos(modulosFinais);
          setAulasPorModulo(agrupadas);
          setModulosAbertos(abertosMap);

          const primeiraAula = listaAulas?.[0];
          if (primeiraAula) setAulaAtual(primeiraAula);
        }
      } catch (error) {
        console.error('Erro ao carregar dados do curso:', error.message);
      } finally {
        setLoadingAulas(false);
      }
    }

    carregarDadosCurso();
  }, [navigate]);
  // Marca 50% de progresso assim que abre a aula
  useEffect(() => {
    async function registrarProgressoInicial() {
      if (!aulaAtual) return;
      const jaConcluida = progresso[aulaAtual.id]?.concluida;
      if (jaConcluida) return;

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('progresso_aulas')
        .upsert(
          { user_id: user.id, aula_id: aulaAtual.id, progresso: 50, atualizado_em: new Date().toISOString() },
          { onConflict: 'user_id,aula_id' }
        );

      if (!error) {
        setProgresso((prev) => ({ ...prev, [aulaAtual.id]: { progresso: 50, concluida: false } }));
      }
    }
    registrarProgressoInicial();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [aulaAtual]);

  useEffect(() => {
    async function carregarAnotacoesDaAula() {
      if (!aulaAtual) return;
      setCarregandoAnotacoes(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('aulas_anotacoes')
          .select('*')
          .eq('aula_id', aulaAtual.id)
          .eq('user_id', user.id)
          .order('minuto_segundos', { ascending: true });

        if (error) throw error;
        setAnotacoes(data || []);
      } catch (err) {
        console.error('Erro ao carregar anotações:', err);
      } finally {
        setCarregandoAnotacoes(false);
      }
    }

    carregarAnotacoesDaAula();
  }, [aulaAtual]);

  const handleConcluirAula = async () => {
    if (!aulaAtual) return;
    setMarcandoConcluida(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const { error } = await supabase
        .from('progresso_aulas')
        .upsert(
          {
            user_id: user.id,
            aula_id: aulaAtual.id,
            progresso: 100,
            concluida: true,
            concluida_em: new Date().toISOString(),
            atualizado_em: new Date().toISOString(),
          },
          { onConflict: 'user_id,aula_id' }
        );

      if (error) throw error;

      setProgresso((prev) => ({ ...prev, [aulaAtual.id]: { progresso: 100, concluida: true } }));
      recarregar();

      setSucesso(true);
      setGanhouXp(true);
      setTimeout(() => { setSucesso(false); setGanhouXp(false); }, 3000);

    } catch (error) {
      console.error('Erro ao concluir aula:', error.message);
      alert('Erro ao concluir aula: ' + error.message);
    } finally {
      setMarcandoConcluida(false);
    }
  };

  const handleSalvarAnotacao = async (e) => {
    e.preventDefault();
    if (!novaAnotacao.trim() || !aulaAtual) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const partes = minutoInput.split(':');
      const segundosTotais = partes.length === 2 ? parseInt(partes[0]) * 60 + parseInt(partes[1]) : 0;

      const { data, error } = await supabase.from('aulas_anotacoes').insert({
        aula_id: aulaAtual.id,
        user_id: user.id,
        minuto_segundos: segundosTotais,
        tempo_formatado: minutoInput,
        texto: novaAnotacao.trim(),
      }).select().single();

      if (error) throw error;

      setAnotacoes((prev) => [...prev, data].sort((a, b) => a.minuto_segundos - b.minuto_segundos));
      setNovaAnotacao('');
      setMinutoInput('00:00');
    } catch (err) {
      console.error('Erro ao salvar anotação:', err);
      alert('Erro ao salvar anotação.');
    }
  };

  const handleDeletarAnotacao = async (id) => {
    try {
      const { error } = await supabase.from('aulas_anotacoes').delete().eq('id', id);
      if (error) throw error;
      setAnotacoes((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Erro ao deletar anotação:', err);
    }
  };

  const pularParaMinuto = (segundos) => {
    if (!aulaAtual || !aulaAtual.video_url) return;
    const urlBase = aulaAtual.video_url.split('?')[0];
    const novaUrl = `${urlBase}?start=${segundos}&autoplay=1`;
    if (iframeRef.current) iframeRef.current.src = novaUrl;
  };

  const toggleModulo = (modId) => {
    setModulosAbertos(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const isAulaConcluida = aulaAtual && progresso[aulaAtual.id]?.concluida;

  // Conta total de aulas cadastradas
  const totalAulas = Object.values(aulasPorModulo).reduce((acc, curr) => acc + curr.length, 0);

  if (loadingAulas) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-950 font-sans overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/dashboard" className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </Link>
            <h1 className="text-white font-bold text-lg">Assistir Videoaula & Anotações</h1>
          </div>

          <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
            <Zap className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-bold text-white">{xp} XP</span>
          </div>
        </header>

        <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
          
          {/* LADO ESQUERDO: VÍDEO + ANOTAÇÕES */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 space-y-6">
            {aulaAtual ? (
              <div className="max-w-4xl mx-auto w-full">
                <div className="aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 relative mb-6">
                  <iframe
                    ref={iframeRef}
                    className="w-full h-full"
                    src={aulaAtual.video_url}
                    title={aulaAtual.titulo}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                  <div>
                    <span className="px-3 py-1 bg-slate-800 text-brand-orange rounded-lg text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                      {aulaAtual.modulo_nome || 'Módulo Geral'}
                    </span>
                    <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{aulaAtual.titulo}</h2>
                    <p className="text-slate-400 font-medium">Marque a aula como concluída para registrar seu progresso no Dashboard.</p>
                  </div>

                  <div className="flex flex-col items-end gap-2 shrink-0 relative">
                    {ganhouXp && (
                      <div className="absolute -top-10 right-4 animate-bounce flex items-center gap-1 text-amber-400 font-black text-lg drop-shadow-lg">
                        <Zap className="w-5 h-5" /> +50 XP
                      </div>
                    )}
                    <button
                      onClick={handleConcluirAula}
                      disabled={marcandoConcluida || sucesso || isAulaConcluida}
                      className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all ${
                        isAulaConcluida || sucesso
                          ? 'bg-emerald-500 text-white'
                          : 'bg-brand-orange hover:bg-orange-500 text-white'
                      } disabled:opacity-85`}
                    >
                      {marcandoConcluida ? <Loader2 className="w-5 h-5 animate-spin" /> : ((isAulaConcluida || sucesso) ? <CheckCircle2 className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5 opacity-50" />)}
                      {isAulaConcluida ? 'Aula Concluída!' : (sucesso ? 'Aula Concluída!' : 'Marcar como Concluída')}
                    </button>
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Edit3 className="w-5 h-5 text-brand-orange" />
                    <h3 className="text-white font-bold text-lg">Minhas Anotações de Estudo</h3>
                  </div>

                  <form onSubmit={handleSalvarAnotacao} className="flex flex-col sm:flex-row gap-3 mb-6">
                    <div className="w-full sm:w-32">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Minuto (MM:SS)</label>
                      <input
                        type="text"
                        value={minutoInput}
                        onChange={(e) => setMinutoInput(e.target.value)}
                        placeholder="Ex: 12:45"
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">O que o professor falou?</label>
                      <input
                        type="text"
                        value={novaAnotacao}
                        onChange={(e) => setNovaAnotacao(e.target.value)}
                        placeholder="Ex: Dica importante sobre geometria plana..."
                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-orange"
                      />
                    </div>
                    <div className="flex items-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 shrink-0 h-[38px]"
                      >
                        <BookmarkPlus className="w-4 h-4" /> Salvar Nota
                      </button>
                    </div>
                  </form>

                  <div className="space-y-3">
                    {carregandoAnotacoes ? (
                      <div className="flex justify-center py-6 text-slate-500">
                        <Loader2 className="w-5 h-5 animate-spin" />
                      </div>
                    ) : anotacoes.length === 0 ? (
                      <p className="text-slate-500 text-xs text-center py-4">Nenhuma anotação nesta aula ainda.</p>
                    ) : (
                      anotacoes.map((nota) => (
                        <div key={nota.id} className="bg-slate-800/60 border border-slate-700/60 p-4 rounded-xl flex items-center justify-between gap-4 group hover:border-brand-orange/40 transition-all">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <button
                              type="button"
                              onClick={() => pularParaMinuto(nota.minuto_segundos)}
                              className="px-2.5 py-1 bg-brand-orange/10 text-brand-orange border border-brand-orange/30 rounded-lg text-xs font-mono font-bold hover:bg-brand-orange hover:text-white transition-colors shrink-0 flex items-center gap-1"
                              title="Clique para ir para este minuto no vídeo"
                            >
                              <PlayCircle className="w-3.5 h-3.5" /> {nota.tempo_formatado}
                            </button>
                            <p className="text-slate-300 text-xs truncate leading-relaxed">{nota.texto}</p>
                          </div>

                          <button
                            onClick={() => handleDeletarAnotacao(nota.id)}
                            className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                            title="Excluir anotação"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex h-full items-center justify-center flex-col text-center p-8">
                <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <PlayCircle className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Nenhuma aula encontrada</h3>
                <p className="text-slate-400">O professor ainda não subiu os conteúdos desta turma.</p>
              </div>
            )}
          </div>

          {/* LADO DIREITO: PLAYLIST AGRUPADA POR MÓDULOS */}
          <div className="w-full lg:w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-80 lg:h-auto">
            <div className="p-6 border-b border-slate-800 shrink-0 flex items-center justify-between">
              <div>
                <h3 className="text-white font-black text-lg flex items-center gap-2">
                  <Layers className="w-4 h-4 text-brand-orange" /> Conteúdo do Curso
                </h3>
                <p className="text-slate-400 text-xs mt-0.5">{totalAulas} aulas disponíveis</p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {modulos.map((modulo) => {
                const aulasDoModulo = aulasPorModulo[modulo.id] || [];
                if (aulasDoModulo.length === 0) return null;
                const aberto = modulosAbertos[modulo.id];

                return (
                  <div key={modulo.id} className="border border-slate-800 rounded-2xl overflow-hidden bg-slate-950/40">
                    <button
                      onClick={() => toggleModulo(modulo.id)}
                      className="w-full flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/80 transition-colors text-left"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-orange-500/10 text-brand-orange font-black text-[11px] flex items-center justify-center shrink-0">
                          {modulo.ordem < 900 ? modulo.ordem : '•'}
                        </span>
                        <h4 className="font-bold text-white text-xs truncate">{modulo.titulo}</h4>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-bold text-slate-400">{aulasDoModulo.length} aulas</span>
                        {aberto ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </button>

                    {aberto && (
                      <div className="p-2 space-y-1.5 border-t border-slate-800/60">
                        {aulasDoModulo.map((aula) => {
                          const concluida = progresso[aula.id]?.concluida;
                          const selecionada = aulaAtual?.id === aula.id;

                          return (
                            <button
                              key={aula.id}
                              onClick={() => setAulaAtual(aula)}
                              className={`w-full text-left p-3 rounded-xl transition-all border ${
                                selecionada
                                  ? 'bg-slate-800 border-brand-orange/50 relative overflow-hidden'
                                  : 'bg-transparent border-transparent hover:bg-slate-800/40'
                              }`}
                            >
                              {selecionada && (
                                <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange rounded-l-xl"></div>
                              )}
                              <div className="flex items-center justify-between">
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2 mb-0.5">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider ${selecionada ? 'text-brand-orange' : 'text-slate-500'}`}>
                                      Aula {aula.ordem}
                                    </span>
                                    {aula.duracao_min && (
                                      <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                        <Clock className="w-3 h-3" /> {aula.duracao_min} min
                                      </span>
                                    )}
                                  </div>
                                  <h5 className={`text-xs font-bold flex items-center gap-2 truncate ${selecionada ? 'text-white' : 'text-slate-300'}`}>
                                    {concluida && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                                    <span className="truncate">{aula.titulo}</span>
                                  </h5>
                                </div>
                                {selecionada && <ChevronRight className="w-4 h-4 text-brand-orange shrink-0 ml-2" />}
                              </div>
                            </button>
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
      </div>
    </div>
  );
}