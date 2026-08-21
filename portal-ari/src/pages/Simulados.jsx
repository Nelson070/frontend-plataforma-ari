import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Clock, PlayCircle, AlertCircle, CheckCircle2, XCircle, ChevronRight, ChevronLeft, Loader2, Target } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamificacao } from '../hooks/useGamificacao';

export default function Simulados() {
  const navigate = useNavigate();
  
  // Estados Gerais
  const [loading, setLoading] = useState(true);
  const [listaSimulados, setListaSimulados] = useState([]);
  const [simuladoAtivo, setSimuladoAtivo] = useState(null);
  
  // Estados da Prova
  const [questoes, setQuestoes] = useState([]);
  const [indiceAtual, setIndiceAtual] = useState(0);
  const [respostas, setRespostas] = useState({});
  const [tempoRestante, setTempoRestante] = useState(0);
  const [finalizado, setFinalizado] = useState(false);
  const [resultado, setResultado] = useState({ acertos: 0, total: 0 });

  // Hook de Gamificação (para atualizar o XP depois)
  const { xp, recarregar } = useGamificacao();

  // 1. CARREGAR A LISTA DE SIMULADOS DA TURMA
  useEffect(() => {
    async function carregarSimulados() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: profile } = await supabase
          .from('profiles')
          .select('turma_id')
          .eq('id', user.id)
          .single();

        if (profile?.turma_id) {
          const { data, error } = await supabase
            .from('simulados')
            .select('*')
            .eq('turma_id', profile.turma_id)
            .order('created_at', { ascending: false });

          if (error) throw error;
          setListaSimulados(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar simulados:', error.message);
      } finally {
        setLoading(false);
      }
    }
    carregarSimulados();
  }, [navigate]);

  // 2. CRONÔMETRO
  useEffect(() => {
    let intervalo;
    if (simuladoAtivo && !finalizado && tempoRestante > 0) {
      intervalo = setInterval(() => {
        setTempoRestante((prev) => {
          if (prev <= 1) {
            finalizarProva(true); // Força a entrega se o tempo acabar
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(intervalo);
  }, [simuladoAtivo, finalizado, tempoRestante]);

  // 3. INICIAR O SIMULADO
  const iniciarSimulado = async (simulado) => {
    setLoading(true);
    try {
      // Busca as questões vinculadas a este simulado
      const { data, error } = await supabase
        .from('simulado_questoes')
        .select('questoes(*)')
        .eq('simulado_id', simulado.id)
        .order('ordem', { ascending: true });

      if (error) throw error;

      const formatadas = data.map(item => item.questoes);
      
      setQuestoes(formatadas);
      setSimuladoAtivo(simulado);
      setTempoRestante(simulado.tempo_minutos * 60); // Converte minutos para segundos
      setRespostas({});
      setIndiceAtual(0);
      setFinalizado(false);

    } catch (error) {
      console.error('Erro ao carregar questões:', error.message);
      alert('Erro ao carregar a prova.');
    } finally {
      setLoading(false);
    }
  };

  // 4. MARCAR RESPOSTA
  const handleResponder = (letra) => {
    setRespostas(prev => ({
      ...prev,
      [questoes[indiceAtual].id]: letra
    }));
  };

  // 5. FINALIZAR PROVA
  const finalizarProva = async (tempoEsgotado = false) => {
    if (!tempoEsgotado && !window.confirm('Tem certeza que deseja entregar a prova?')) return;
    
    setLoading(true);
    let acertos = 0;
    
    questoes.forEach(q => {
      if (respostas[q.id] === q.resposta_correta) {
        acertos++;
      }
    });

    setResultado({ acertos, total: questoes.length });
    setFinalizado(true);
    
    // Bônus de XP: 10 XP por questão certa (Gamificação!)
    if (acertos > 0) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase
          .from('profiles')
          .update({ xp: xp + (acertos * 10) })
          .eq('id', user.id);
        recarregar();
      } catch (err) {
        console.error('Erro ao dar XP:', err);
      }
    }
    
    setLoading(false);
  };

  // Formatação do tempo (MM:SS)
  const formatarTempo = (segundos) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = segundos % 60;
    if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  // ==========================================
  // TELA 1: LISTA DE SIMULADOS (LOBBY)
  // ==========================================
  if (!simuladoAtivo) {
    return (
      <div className="min-h-screen bg-[#f3f4f6] font-sans p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <Link to="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </Link>
            <div>
              <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                <Target className="w-6 h-6 text-brand-orange" />
                Simulados Inéditos
              </h1>
              <p className="text-sm text-slate-500 font-medium mt-1">Teste seus conhecimentos e simule o dia da prova.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {listaSimulados.length === 0 ? (
              <div className="col-span-full bg-white rounded-3xl p-12 text-center border border-slate-200">
                <Target className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">Nenhum simulado disponível</h3>
                <p className="text-slate-500 mt-2">O professor ainda está preparando as provas para a sua turma.</p>
              </div>
            ) : (
              listaSimulados.map((simulado) => (
                <div key={simulado.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-black text-slate-900 leading-tight">{simulado.titulo}</h3>
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-brand-orange rounded-lg text-xs font-bold">
                        <Clock className="w-3.5 h-3.5" />
                        {simulado.tempo_minutos} min
                      </div>
                    </div>
                    {simulado.descricao && <p className="text-sm text-slate-500 font-medium mb-6">{simulado.descricao}</p>}
                  </div>
                  <button
                    onClick={() => iniciarSimulado(simulado)}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all"
                  >
                    <PlayCircle className="w-5 h-5" />
                    Iniciar Prova
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // TELA 2: RESOLUÇÃO DA PROVA (OU RESULTADO)
  // ==========================================
  const questaoAtual = questoes[indiceAtual];
  const porcentagemAcerto = Math.round((resultado.acertos / resultado.total) * 100) || 0;

  return (
    <div className="min-h-screen bg-[#f3f4f6] font-sans flex flex-col">
      
      {/* HEADER DA PROVA (Fixado) */}
      <header className="h-16 bg-slate-900 px-6 flex items-center justify-between shrink-0 shadow-md z-10">
        <div className="flex items-center gap-3">
          {finalizado && (
            <button onClick={() => setSimuladoAtivo(null)} className="p-1.5 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors mr-2">
              <ArrowLeft className="w-5 h-5 text-slate-300" />
            </button>
          )}
          <h1 className="text-white font-bold truncate max-w-[200px] md:max-w-md">{simuladoAtivo.titulo}</h1>
        </div>
        
        {!finalizado && (
          <div className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-black tracking-widest ${tempoRestante < 300 ? 'bg-red-500/20 text-red-400' : 'bg-slate-800 text-brand-orange'}`}>
            <Clock className="w-4 h-4" />
            {formatarTempo(tempoRestante)}
          </div>
        )}
      </header>

      {/* ÁREA CENTRAL DIVIDIDA (Questão x Mapa) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* LADO ESQUERDO: QUESTÃO ATUAL */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            
            {finalizado && indiceAtual === 0 && (
              <div className="mb-8 p-6 bg-white rounded-3xl border border-slate-200 shadow-sm text-center">
                <h2 className="text-2xl font-black text-slate-900 mb-2">Simulado Finalizado!</h2>
                <div className="text-5xl font-black text-brand-orange my-4">{porcentagemAcerto}%</div>
                <p className="text-slate-500 font-medium mb-4">Você acertou {resultado.acertos} de {resultado.total} questões.</p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-bold">
                  +{resultado.acertos * 10} XP Adquiridos!
                </div>
              </div>
            )}

            {questaoAtual ? (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm">
                
                {/* Cabeçalho da Questão */}
                <div className="flex flex-wrap items-center gap-3 mb-6 pb-4 border-b border-slate-100">
                  <span className="px-3 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                    Questão {indiceAtual + 1}
                  </span>
                  <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider">
                    {questaoAtual.materia}
                  </span>
                </div>

                {/* Enunciado */}
                <div className="prose prose-slate max-w-none mb-8">
                  <p className="text-slate-800 font-medium text-lg leading-relaxed whitespace-pre-wrap">
                    {questaoAtual.enunciado}
                  </p>
                  {questaoAtual.imagem_url && (
                    <div className="mt-6 mb-6">
                      <img src={questaoAtual.imagem_url} alt="Imagem da questão" className="max-h-96 rounded-xl border border-slate-200 object-contain" />
                    </div>
                  )}
                </div>

                {/* Alternativas */}
                <div className="space-y-3">
                  {questaoAtual.alternativas.map((alt) => {
                    const isSelecionada = respostas[questaoAtual.id] === alt.letra;
                    const isCorreta = finalizado && alt.letra === questaoAtual.resposta_correta;
                    const errouEssa = finalizado && isSelecionada && !isCorreta;
                    
                    let estilo = "border-slate-200 bg-white hover:border-brand-orange text-slate-700 cursor-pointer";
                    if (isSelecionada && !finalizado) estilo = "border-brand-orange bg-orange-50 text-brand-orange ring-1 ring-brand-orange";
                    if (isCorreta) estilo = "border-emerald-500 bg-emerald-50 text-emerald-800";
                    if (errouEssa) estilo = "border-red-500 bg-red-50 text-red-800";
                    if (finalizado && !isCorreta && !errouEssa) estilo = "border-slate-100 bg-slate-50 text-slate-400 opacity-60";

                    return (
                      <button
                        key={alt.letra}
                        onClick={() => !finalizado && handleResponder(alt.letra)}
                        disabled={finalizado}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 text-left transition-all ${estilo}`}
                      >
                        <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${isSelecionada && !finalizado ? 'bg-brand-orange text-white' : (isCorreta ? 'bg-emerald-500 text-white' : (errouEssa ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'))}`}>
                          {alt.letra}
                        </div>
                        <span className="font-medium flex-1">{alt.texto}</span>
                        {isCorreta && <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />}
                        {errouEssa && <XCircle className="w-5 h-5 text-red-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Comentário do Professor (Apenas após finalizar) */}
                {finalizado && questaoAtual.comentario && (
                  <div className="mt-8 p-5 bg-blue-50 border border-blue-100 rounded-2xl">
                    <h5 className="text-xs font-bold uppercase tracking-wider text-blue-600 mb-2">Comentário do Professor</h5>
                    <p className="text-sm font-medium text-slate-700 whitespace-pre-wrap">{questaoAtual.comentario}</p>
                  </div>
                )}
                
              </div>
            ) : (
              <div className="text-center p-12 bg-white rounded-3xl border border-slate-200">
                <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-slate-700">Este simulado está vazio!</h3>
                <p className="text-slate-500 mt-2">O professor criou o simulado, mas esqueceu de adicionar as questões.</p>
              </div>
            )}

            {/* Navegação Prev / Next (Mobile e Desktop) */}
            <div className="flex items-center justify-between mt-6">
              <button 
                onClick={() => setIndiceAtual(prev => Math.max(0, prev - 1))}
                disabled={indiceAtual === 0}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                <ChevronLeft className="w-5 h-5" /> Anterior
              </button>
              
              <button 
                onClick={() => setIndiceAtual(prev => Math.min(questoes.length - 1, prev + 1))}
                disabled={indiceAtual === questoes.length - 1}
                className="flex items-center gap-2 px-5 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 disabled:opacity-50"
              >
                Próxima <ChevronRight className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>

        {/* LADO DIREITO: MAPA DA PROVA */}
        <div className="w-full lg:w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0 h-48 lg:h-auto shadow-[0_-10px_20px_rgba(0,0,0,0.05)] lg:shadow-none z-20">
          <div className="p-4 md:p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-black text-slate-900">Mapa da Prova</h3>
            <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-lg">
              {Object.keys(respostas).length} / {questoes.length}
            </span>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 md:p-6">
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2 md:gap-3">
              {questoes.map((q, idx) => {
                const respondida = !!respostas[q.id];
                const ativa = indiceAtual === idx;
                
                // Cores do mapa após finalizar
                let estiloFinalizado = "";
                if (finalizado) {
                  const acertou = respostas[q.id] === q.resposta_correta;
                  estiloFinalizado = acertou ? "bg-emerald-500 text-white border-emerald-500" : (respondida ? "bg-red-500 text-white border-red-500" : "bg-slate-200 text-slate-400 border-slate-200");
                }

                return (
                  <button
                    key={q.id}
                    onClick={() => setIndiceAtual(idx)}
                    className={`aspect-square rounded-xl font-black text-sm flex items-center justify-center transition-all border-2
                      ${ativa && !finalizado ? 'ring-4 ring-orange-100' : ''}
                      ${finalizado 
                        ? estiloFinalizado 
                        : (respondida ? 'bg-brand-orange border-brand-orange text-white' : (ativa ? 'border-brand-orange text-brand-orange' : 'border-slate-200 text-slate-400 hover:border-slate-300'))
                      }
                    `}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
          
          {/* Botão de Entregar Prova */}
          {!finalizado && questoes.length > 0 && (
            <div className="p-4 md:p-6 border-t border-slate-100 bg-slate-50">
              <button
                onClick={() => finalizarProva(false)}
                className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-transform active:scale-95"
              >
                Entregar Prova
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}