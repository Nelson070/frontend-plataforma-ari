import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, PlayCircle, CheckCircle, CheckCircle2, Loader2, ChevronRight, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useGamificacao } from '../hooks/useGamificacao'; // 👈 Importando o seu hook!

export default function Player() {
  const navigate = useNavigate();
  const [aulas, setAulas] = useState([]);
  const [aulaAtual, setAulaAtual] = useState(null);
  const [loadingAulas, setLoadingAulas] = useState(true);
  const [marcandoConcluida, setMarcandoConcluida] = useState(false);
  
  // Estados para o feedback visual de sucesso e XP
  const [sucesso, setSucesso] = useState(false);
  const [ganhouXp, setGanhouXp] = useState(false);

  // 👈 Usando o seu hook para pegar o XP atual do aluno
  const { xp, recarregar } = useGamificacao(); 

  useEffect(() => {
    async function carregarAulas() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: profile } = await supabase
          .from('profiles')
          .select('turma_id')
          .eq('id', user.id)
          .single();

        if (profile?.turma_id) {
          const { data: listaAulas, error } = await supabase
            .from('aulas')
            .select('*')
            .eq('turma_id', profile.turma_id)
            .order('ordem', { ascending: true });

          if (error) throw error;
          
          setAulas(listaAulas || []);
          if (listaAulas?.length > 0) {
            setAulaAtual(listaAulas[0]);
          }
        }
      } catch (error) {
        console.error('Erro ao carregar aulas:', error.message);
      } finally {
        setLoadingAulas(false);
      }
    }

    carregarAulas();
  }, [navigate]);

  const handleConcluirAula = async () => {
    if (!aulaAtual) return;
    setMarcandoConcluida(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const novoXp = xp + 50; // 👈 A mágica da Gamificação acontecendo aqui: +50 XP!

      // Atualiza o progresso E o XP no banco
      const { error } = await supabase
        .from('profiles')
        .update({
          ultima_aula: aulaAtual.titulo,
          ultimo_modulo: aulaAtual.modulo_nome,
          progresso_aula: 100,
          xp: novoXp 
        })
        .eq('id', user.id);

      if (error) throw error;

      // Atualiza o hook em tempo real para o front saber que mudou
      recarregar();

      // Dispara as animações de sucesso
      setSucesso(true);
      setGanhouXp(true);
      
      setTimeout(() => {
        setSucesso(false);
        setGanhouXp(false);
      }, 3000);
      
    } catch (error) {
      console.error('Erro ao concluir aula:', error.message);
    } finally {
      setMarcandoConcluida(false);
    }
  };

  if (loadingAulas) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-950 font-sans relative">
      
      {/* HEADER ESCURO */}
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="p-2 bg-slate-800 rounded-xl hover:bg-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-300" />
          </Link>
          <h1 className="text-white font-bold text-lg">Área do Aluno</h1>
        </div>
        
        {/* Mostrador de XP no cabeçalho */}
        <div className="flex items-center gap-2 px-4 py-2 bg-slate-800 rounded-xl border border-slate-700">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-bold text-white">{xp} XP</span>
        </div>
      </header>

      {/* ÁREA PRINCIPAL DIVIDIDA */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* LADO ESQUERDO: VÍDEO E DETALHES */}
        <div className="flex-1 overflow-y-auto">
          {aulaAtual ? (
            <div className="max-w-5xl mx-auto p-4 md:p-6 lg:p-8">
              
              <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl shadow-black/50 mb-6 border border-slate-800 relative">
                <iframe 
                  className="w-full h-full"
                  src={aulaAtual.video_url} 
                  title={aulaAtual.titulo}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              </div>

              <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
                <div>
                  <span className="px-3 py-1 bg-slate-800 text-brand-orange rounded-lg text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                    {aulaAtual.modulo_nome}
                  </span>
                  <h2 className="text-2xl md:text-3xl font-black text-white mb-2">{aulaAtual.titulo}</h2>
                  <p className="text-slate-400 font-medium">Preste atenção aos conceitos e anote as dicas principais.</p>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0 relative">
                  
                  {/* Animação flutuante de XP */}
                  {ganhouXp && (
                    <div className="absolute -top-10 right-4 animate-bounce flex items-center gap-1 text-amber-400 font-black text-lg drop-shadow-lg">
                      <Zap className="w-5 h-5" /> +50 XP
                    </div>
                  )}

                  <button 
                    onClick={handleConcluirAula}
                    disabled={marcandoConcluida || sucesso}
                    className={`flex items-center gap-2 px-6 py-4 rounded-xl font-bold transition-all shadow-lg ${
                      sucesso 
                        ? 'bg-emerald-500 text-white shadow-emerald-500/20' 
                        : 'bg-brand-orange hover:bg-orange-500 text-white shadow-brand-orange/20'
                    } disabled:opacity-80`}
                  >
                    {marcandoConcluida ? <Loader2 className="w-5 h-5 animate-spin" /> : (sucesso ? <CheckCircle2 className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />)}
                    {sucesso ? 'Aula Concluída!' : 'Marcar como Concluída'}
                  </button>
                  
                </div>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center flex-col text-center p-8">
              <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                <PlayCircle className="w-10 h-10 text-slate-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Nenhuma aula encontrada</h3>
              <p className="text-slate-400">O professor ainda está subindo os conteúdos desta turma.</p>
            </div>
          )}
        </div>

        {/* LADO DIREITO: PLAYLIST */}
        <div className="w-full lg:w-[400px] bg-slate-900 border-l border-slate-800 flex flex-col shrink-0 h-64 lg:h-auto">
          <div className="p-6 border-b border-slate-800 shrink-0">
            <h3 className="text-white font-black text-lg">Conteúdo do Curso</h3>
            <p className="text-slate-400 text-sm mt-1">{aulas.length} aulas disponíveis</p>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {aulas.map((aula) => (
              <button
                key={aula.id}
                onClick={() => setAulaAtual(aula)}
                className={`w-full text-left p-4 rounded-xl transition-all border ${
                  aulaAtual?.id === aula.id 
                    ? 'bg-slate-800 border-brand-orange/50 relative overflow-hidden' 
                    : 'bg-transparent border-transparent hover:bg-slate-800/50'
                }`}
              >
                {aulaAtual?.id === aula.id && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-orange rounded-l-xl"></div>
                )}
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider mb-1 block ${aulaAtual?.id === aula.id ? 'text-brand-orange' : 'text-slate-500'}`}>
                      Aula {aula.ordem}
                    </span>
                    <h4 className={`text-sm font-bold ${aulaAtual?.id === aula.id ? 'text-white' : 'text-slate-300'}`}>
                      {aula.titulo}
                    </h4>
                  </div>
                  {aulaAtual?.id === aula.id && <ChevronRight className="w-4 h-4 text-brand-orange" />}
                </div>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}