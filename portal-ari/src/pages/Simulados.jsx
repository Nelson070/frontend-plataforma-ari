import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Target, BookOpen, Settings2, PlayCircle, Clock,
  ChevronLeft, ChevronRight, CheckCircle2, LayoutGrid, ArrowLeft, Loader2
} from 'lucide-react';
import Sidebar from './Sidebar';
import { useAuth } from '../hooks/useAuth';
import {
  useSimulados, buscarQuestoesDoSimulado, criarSimuladoAluno,
  iniciarTentativa, finalizarTentativa,
} from '../hooks/useSimulados';
import { useAssuntosDisponiveis, buscarQuestoesParaSimulado, responderQuestaoAvulsa } from '../hooks/useQuestoes';
import RenderBlocos from '../components/RenderBlocos';

export default function Simulados() {
  const navigate = useNavigate();
  const { profile } = useAuth();

  const [modoResolucao, setModoResolucao] = useState(false);
  const [tipoSelecionado, setTipoSelecionado] = useState('oficial');
  const [assuntoSelecionado, setAssuntoSelecionado] = useState('');
  const [quantidadePersonalizada, setQuantidadePersonalizada] = useState(15);
  const [dificuldadePersonalizada, setDificuldadePersonalizada] = useState('misto');
  const [gerando, setGerando] = useState(false);

  const { simulados: simuladosOficiais, loading: loadingOficiais } = useSimulados({ tipo: 'oficial' });
  const { assuntos, loading: loadingAssuntos } = useAssuntosDisponiveis();

  const [simuladoAtivo, setSimuladoAtivo] = useState(null); // { id, titulo, tempo_minutos }
  const [tentativaId, setTentativaId] = useState(null);
  const [questoesProva, setQuestoesProva] = useState([]);
  const [carregandoProva, setCarregandoProva] = useState(false);

  const [questaoAtual, setQuestaoAtual] = useState(0);
  const [respostas, setRespostas] = useState({}); // { questaoId: letra }
  const [finalizando, setFinalizando] = useState(false);
  const [resultado, setResultado] = useState(null); // { acertos, erros, emBranco }
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const handleVoltar = () => navigate('/dashboard');

  // Timer regressivo durante a prova
  useEffect(() => {
    if (!modoResolucao || resultado) return;
    if (segundosRestantes <= 0) return;
    const t = setInterval(() => setSegundosRestantes((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [modoResolucao, resultado, segundosRestantes]);

  const formatarTempo = (s) => {
    const h = String(Math.floor(s / 3600)).padStart(2, '0');
    const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
    const sec = String(s % 60).padStart(2, '0');
    return `${h}:${m}:${sec}`;
  };

  async function abrirProva(simulado) {
    setCarregandoProva(true);
    setSimuladoAtivo(simulado);

    const { questoes, error } = await buscarQuestoesDoSimulado(simulado.id);
    if (error || questoes.length === 0) {
      alert('Não foi possível carregar as questões desse simulado.');
      setCarregandoProva(false);
      return;
    }

    const { tentativa, error: erroTentativa } = await iniciarTentativa(simulado.id);
    if (erroTentativa) {
      alert('Não foi possível iniciar o simulado.');
      setCarregandoProva(false);
      return;
    }

    setQuestoesProva(questoes);
    setTentativaId(tentativa.id);
    setRespostas({});
    setQuestaoAtual(0);
    setResultado(null);
    setSegundosRestantes((simulado.tempo_minutos ?? 60) * 60);
    setModoResolucao(true);
    setCarregandoProva(false);
  }

  const iniciarOficial = (simulado) => abrirProva(simulado);

  const iniciarPorAssunto = async () => {
    if (!assuntoSelecionado) return;
    setGerando(true);

    const { questaoIds, error: erroBusca } = await buscarQuestoesParaSimulado({
      assunto: assuntoSelecionado,
      quantidade: 15,
    });

    if (erroBusca || questaoIds.length === 0) {
      alert('Não encontramos questões suficientes desse assunto ainda.');
      setGerando(false);
      return;
    }

    const { simulado, error } = await criarSimuladoAluno({
      titulo: `Treino: ${assuntoSelecionado}`,
      turmaId: profile.turma_id,
      tipo: 'assunto',
      tempoMinutos: 30,
      questaoIds,
    });

    setGerando(false);
    if (error) {
      alert('Erro ao gerar o simulado. Tente novamente.');
      return;
    }
    abrirProva(simulado);
  };

  const iniciarPersonalizado = async () => {
    setGerando(true);

    const { questaoIds, error: erroBusca } = await buscarQuestoesParaSimulado({
      dificuldade: dificuldadePersonalizada,
      quantidade: quantidadePersonalizada,
    });

    if (erroBusca || questaoIds.length === 0) {
      alert('Não encontramos questões suficientes com esse filtro ainda.');
      setGerando(false);
      return;
    }

    const { simulado, error } = await criarSimuladoAluno({
      titulo: `Personalizado (${quantidadePersonalizada} questões)`,
      turmaId: profile.turma_id,
      tipo: 'personalizado',
      tempoMinutos: Math.max(20, quantidadePersonalizada * 2),
      questaoIds,
    });

    setGerando(false);
    if (error) {
      alert('Erro ao gerar o simulado. Tente novamente.');
      return;
    }
    abrirProva(simulado);
  };

  const handleResponder = (letra) => {
    const id = questoesProva[questaoAtual].id;
    setRespostas((prev) => ({ ...prev, [id]: letra }));
  };

  const handleFinalizar = async () => {
    setFinalizando(true);

    let acertos = 0, erros = 0;
    const registros = [];

    for (const q of questoesProva) {
      const escolhida = respostas[q.id];
      if (!escolhida) continue;
      const correta = escolhida === q.resposta_correta;
      if (correta) acertos++; else erros++;
      registros.push(responderQuestaoAvulsa(q.id, escolhida, q.resposta_correta));
    }

    await Promise.all(registros);

    const emBranco = questoesProva.length - acertos - erros;
    await finalizarTentativa(tentativaId, respostas, { acertos, erros, emBranco });

    setResultado({ acertos, erros, emBranco });
    setFinalizando(false);
  };

  const sairDaProva = () => {
    setModoResolucao(false);
    setSimuladoAtivo(null);
    setQuestoesProva([]);
    setResultado(null);
  };

  // ==========================================
  // TELA 2: MODO DE RESOLUÇÃO (A PROVA)
  // ==========================================
  if (modoResolucao) {
    const questao = questoesProva[questaoAtual];

    return (
      <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
        <header className="bg-white border-b border-slate-200 h-16 flex items-center justify-between px-6 shrink-0 sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <button
              onClick={sairDaProva}
              className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 rounded-lg transition-colors"
              aria-label="Sair da prova"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="font-bold text-slate-900 text-sm">{simuladoAtivo?.titulo}</h1>
              <p className="text-xs text-slate-500 font-medium">Questão {questaoAtual + 1} de {questoesProva.length}</p>
            </div>
          </div>

          {!resultado && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold text-sm border border-red-100">
              <Clock className="w-4 h-4" />
              {formatarTempo(segundosRestantes)}
            </div>
          )}
        </header>

        {resultado ? (
          <div className="flex-1 flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl border border-slate-200 p-8 max-w-md w-full text-center">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
              <h2 className="text-xl font-black text-slate-900 mb-1">Simulado finalizado!</h2>
              <p className="text-sm text-slate-500 font-medium mb-6">Confira seu resultado:</p>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="bg-emerald-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-emerald-600">{resultado.acertos}</p>
                  <p className="text-xs font-bold text-emerald-700">Acertos</p>
                </div>
                <div className="bg-red-50 rounded-xl p-3">
                  <p className="text-2xl font-black text-red-600">{resultado.erros}</p>
                  <p className="text-xs font-bold text-red-700">Erros</p>
                </div>
                <div className="bg-slate-100 rounded-xl p-3">
                  <p className="text-2xl font-black text-slate-600">{resultado.emBranco}</p>
                  <p className="text-xs font-bold text-slate-500">Em branco</p>
                </div>
              </div>

              <button
                onClick={() => navigate('/desempenho')}
                className="w-full py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors mb-2"
              >
                Ver meu desempenho
              </button>
              <button
                onClick={sairDaProva}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-xl transition-colors"
              >
                Voltar aos Simulados
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row gap-6 p-6 h-[calc(100vh-4rem)] overflow-hidden">

            <div className="flex-1 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden">
              <div className="p-6 md:p-8 overflow-y-auto flex-1">
                {!questao ? (
                  <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando questão...
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-between mb-6">
                      <span className="bg-slate-100 text-slate-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                        {questao.materia}{questao.assunto ? ` · ${questao.assunto}` : ''}
                      </span>
                      <span className="text-sm font-bold text-slate-400">Questão {questaoAtual + 1}</span>
                    </div>

                    <div className="select-none" onCopy={(e) => e.preventDefault()} onContextMenu={(e) => e.preventDefault()}>
                      <p className="text-lg text-slate-800 leading-relaxed font-medium mb-6">
                        {questao.blocos_enunciado?.length > 0 ? (
                          <RenderBlocos blocos={questao.blocos_enunciado} imgHeight="h-20" />
                        ) : (
                          questao.enunciado
                        )}
                      </p>

                      {questao.imagem_url && (
                        <img src={questao.imagem_url} alt="Ilustração" className="rounded-xl border border-slate-200 max-h-72 mx-auto mb-6" />
                      )}

                      <div className="space-y-2.5">
                        {questao.alternativas.map((alt) => (
                          <button
                            key={alt.letra}
                            onClick={() => handleResponder(alt.letra)}
                            className={`w-full flex items-center text-left p-4 rounded-xl border transition-colors ${
                              respostas[questao.id] === alt.letra
                                ? 'border-brand-orange bg-orange-50'
                                : 'border-slate-200 hover:border-brand-orange/40 bg-white'
                            }`}
                          >
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-4 shrink-0 transition-colors ${
                              respostas[questao.id] === alt.letra ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {alt.letra}
                            </div>
                            <span className="text-base font-medium text-slate-700">
                              {alt.blocos?.length > 0 ? <RenderBlocos blocos={alt.blocos} imgHeight="h-10" /> : alt.texto}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center shrink-0">
                <button
                  onClick={() => setQuestaoAtual((p) => Math.max(0, p - 1))}
                  disabled={questaoAtual === 0}
                  className="flex items-center px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  <ChevronLeft className="w-5 h-5 mr-1" /> Anterior
                </button>

                {questaoAtual === questoesProva.length - 1 ? (
                  <button
                    onClick={handleFinalizar}
                    disabled={finalizando}
                    className="flex items-center px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-70"
                  >
                    {finalizando ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
                    Finalizar Prova
                  </button>
                ) : (
                  <button
                    onClick={() => setQuestaoAtual((p) => Math.min(questoesProva.length - 1, p + 1))}
                    className="flex items-center px-6 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-lg transition-colors shadow-md"
                  >
                    Próxima <ChevronRight className="w-5 h-5 ml-1" />
                  </button>
                )}
              </div>
            </div>

            <div className="w-full lg:w-80 bg-white rounded-2xl border border-slate-200 flex flex-col overflow-hidden shrink-0">
              <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-2">
                <LayoutGrid className="w-5 h-5 text-slate-600" />
                <h3 className="font-bold text-slate-800">Mapa de Questões</h3>
              </div>

              <div className="p-4 overflow-y-auto flex-1">
                <div className="grid grid-cols-5 gap-2">
                  {questoesProva.map((q, i) => {
                    const isRespondida = !!respostas[q.id];
                    const isAtual = questaoAtual === i;
                    return (
                      <button
                        key={q.id}
                        onClick={() => setQuestaoAtual(i)}
                        className={`h-10 rounded-lg text-sm font-bold flex items-center justify-center transition-all ${
                          isAtual
                            ? 'ring-2 ring-brand-orange ring-offset-2 bg-slate-900 text-white'
                            : isRespondida
                              ? 'bg-brand-orange/20 text-brand-orange border border-brand-orange/30'
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200 border border-transparent'
                        }`}
                      >
                        {i + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600 mb-2">
                  <div className="w-3 h-3 rounded-full bg-brand-orange/20 border border-brand-orange/30"></div> Respondidas ({Object.keys(respostas).length})
                </div>
                <div className="flex items-center gap-3 text-xs font-medium text-slate-600">
                  <div className="w-3 h-3 rounded-full bg-slate-100 border border-slate-200"></div> Em branco ({questoesProva.length - Object.keys(respostas).length})
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ==========================================
  // TELA 1: HUB DE CONFIGURAÇÃO DO SIMULADO
  // ==========================================
  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-4xl mx-auto">

          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={handleVoltar}
              className="w-9 h-9 bg-white rounded-full flex items-center justify-center text-slate-500 hover:text-brand-orange border border-slate-200 transition-colors shrink-0"
              aria-label="Voltar ao dashboard"
            >
              <ArrowLeft className="w-4.5 h-4.5" />
            </button>
            <div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">Central de Simulados</h1>
              <p className="text-slate-500 text-sm font-medium">Configure seu ambiente de prova e teste seus conhecimentos.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button
              onClick={() => setTipoSelecionado('oficial')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'oficial' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'oficial' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <Target className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Oficial</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Simulados oficiais preparados pelo professor.</p>
            </button>

            <button
              onClick={() => setTipoSelecionado('assunto')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'assunto' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'assunto' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Por Assunto</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Foque nos seus pontos fracos com um conteúdo específico.</p>
            </button>

            <button
              onClick={() => setTipoSelecionado('personalizado')}
              className={`p-5 rounded-2xl border text-left transition-colors ${tipoSelecionado === 'personalizado' ? 'border-brand-orange bg-white' : 'border-slate-200 bg-white hover:border-orange-200'}`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${tipoSelecionado === 'personalizado' ? 'bg-brand-orange text-white' : 'bg-orange-50 text-brand-orange'}`}>
                <Settings2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1.5">Personalizado</h3>
              <p className="text-xs text-slate-500 font-medium leading-relaxed">Escolha a quantidade de questões e a dificuldade.</p>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-7">

            {tipoSelecionado === 'oficial' && (
              <div>
                <h2 className="text-lg font-black text-slate-900 mb-5">Simulados Oficiais Disponíveis</h2>
                {loadingOficiais ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando...
                  </div>
                ) : simuladosOficiais.length === 0 ? (
                  <p className="text-sm text-slate-400 font-medium text-center py-10">
                    Nenhum simulado oficial cadastrado pra sua turma ainda.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {simuladosOficiais.map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-xl">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{s.titulo}</h4>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">
                            {s.simulado_questoes?.[0]?.count ?? 0} questões · {s.tempo_minutos} min
                          </p>
                        </div>
                        <button
                          onClick={() => iniciarOficial(s)}
                          disabled={carregandoProva}
                          className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-70"
                        >
                          {carregandoProva && simuladoAtivo?.id === s.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlayCircle className="w-4 h-4" />}
                          Iniciar
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tipoSelecionado === 'assunto' && (
              <div>
                <h2 className="text-lg font-black text-slate-900 mb-5">Selecione o Assunto</h2>
                {loadingAssuntos ? (
                  <div className="flex items-center justify-center py-10 text-slate-400 gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" /> Carregando assuntos...
                  </div>
                ) : assuntos.length === 0 ? (
                  <p className="text-sm text-slate-400 font-medium text-center py-10">
                    Ainda não há questões cadastradas pra gerar um treino por assunto.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                      {assuntos.map((a) => (
                        <button
                          key={a}
                          onClick={() => setAssuntoSelecionado(a)}
                          className={`p-3.5 border rounded-xl text-center font-bold text-sm transition-colors ${assuntoSelecionado === a ? 'bg-brand-orange text-white border-brand-orange' : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-brand-orange/40'}`}
                        >
                          {a}
                        </button>
                      ))}
                    </div>
                    <button
                      onClick={iniciarPorAssunto}
                      disabled={!assuntoSelecionado || gerando}
                      className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-orange disabled:bg-slate-300 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors"
                    >
                      {gerando ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                      Iniciar Treino
                    </button>
                  </>
                )}
              </div>
            )}

            {tipoSelecionado === 'personalizado' && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Quantidade de Questões</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {[10, 15, 20, 30, 45].map((num) => (
                        <button
                          key={num}
                          onClick={() => setQuantidadePersonalizada(num)}
                          className={`px-5 py-2.5 border rounded-xl font-bold text-sm transition-colors ${quantidadePersonalizada === num ? 'bg-brand-orange text-white border-brand-orange' : 'border-slate-200 bg-slate-50 hover:border-brand-orange text-slate-700'}`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Nível de Dificuldade</h3>
                    <div className="flex flex-wrap gap-2.5">
                      {[
                        { valor: 'facil', label: 'Fácil' },
                        { valor: 'medio', label: 'Médio' },
                        { valor: 'dificil', label: 'Difícil' },
                        { valor: 'misto', label: 'Misto' },
                      ].map((op) => (
                        <button
                          key={op.valor}
                          onClick={() => setDificuldadePersonalizada(op.valor)}
                          className={`px-5 py-2.5 border rounded-xl font-bold text-sm transition-colors ${dificuldadePersonalizada === op.valor ? 'bg-brand-orange text-white border-brand-orange' : 'border-slate-200 bg-slate-50 hover:border-brand-orange text-slate-700'}`}
                        >
                          {op.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <button
                  onClick={iniciarPersonalizado}
                  disabled={gerando}
                  className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors disabled:opacity-70"
                >
                  {gerando ? <Loader2 className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
                  Gerar Simulado
                </button>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}