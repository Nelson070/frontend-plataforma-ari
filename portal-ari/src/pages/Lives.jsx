import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Video, Calendar, Clock, PlayCircle, Radio, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Lives() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [listaLives, setListaLives] = useState([]);
  const [perfil, setPerfil] = useState(null);

  // Função para calcular o status da live com base na data/hora atual
  const calcularStatus = (dataHoraStr) => {
    if (!dataHoraStr) return 'Agendada';
    const agora = new Date();
    const dataLive = new Date(dataHoraStr);
    const diffMinutos = (dataLive - agora) / (1000 * 60);

    if (diffMinutos <= 15 && diffMinutos >= -120) {
      return 'Ao Vivo'; // Começa 15 min antes e dura até 2h depois
    } else if (agora > dataLive) {
      return 'Encerrada';
    } else {
      return 'Agendada';
    }
  };

  useEffect(() => {
    async function carregarDados() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return navigate('/login');

        const { data: userProfile } = await supabase
          .from('profiles')
          .select('id, nome, turma_id, turmas(nome)')
          .eq('id', user.id)
          .single();
        
        setPerfil(userProfile);

        if (userProfile?.turma_id) {
          // Buscamos as lives cadastradas na tabela 'lives' para a turma do aluno
          const { data, error } = await supabase
            .from('lives')
            .select('*')
            .eq('turma_id', userProfile.turma_id)
            .order('data_hora', { ascending: true });

          if (error) throw error;
          setListaLives(data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar lives:', error);
      } finally {
        setLoading(false);
      }
    }
    carregarDados();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f3f4f6]">
        <Loader2 className="w-12 h-12 animate-spin text-brand-orange" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <Radio className="w-4.5 h-4.5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Aulas & Lives</h2>
              <p className="text-xs font-medium text-slate-500">Turma: {perfil?.turmas?.nome || 'Geral'}</p>
            </div>
          </div>
        </header>

        {/* CONTEÚDO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-5xl mx-auto space-y-6 pb-10">
            
            {/* Banner Destaque */}
            <div className="bg-slate-950 rounded-3xl p-6 md:p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-lg shadow-slate-900/10 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-brand-orange/20 rounded-full blur-3xl"></div>
              <div className="relative z-10">
                <span className="px-3 py-1 bg-brand-orange text-white rounded-lg text-xs font-bold uppercase tracking-wider mb-3 inline-block">
                  Transmissões ao Vivo
                </span>
                <h2 className="text-2xl md:text-3xl font-black mb-2">Fique ligado nas mentorias</h2>
                <p className="text-slate-400 text-sm font-medium max-w-xl">
                  Participe das aulas ao vivo para tirar suas dúvidas em tempo real com o professor Ari e gabaritar no ENEM.
                </p>
              </div>
              <div className="p-4 bg-white/10 rounded-2xl backdrop-blur-md border border-white/10 relative z-10 shrink-0 text-center">
                <Radio className="w-8 h-8 text-brand-orange mx-auto mb-1 animate-pulse" />
                <span className="text-xs font-bold text-slate-300">Agenda Ativa</span>
              </div>
            </div>

            {/* Lista de Lives Disponíveis */}
            <div className="space-y-4">
              <h3 className="font-black text-slate-900 text-lg">Próximas Transmissões e Lives</h3>

              {listaLives.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                  <Video className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <h4 className="text-lg font-bold text-slate-700">Nenhuma live agendada</h4>
                  <p className="text-slate-500 text-sm mt-1">O professor ainda não publicou lives para esta turma.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {listaLives.map((live) => {
                    const status = calcularStatus(live.data_hora);
                    
                    return (
                      <div key={live.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between hover:border-brand-orange/50 transition-all">
                        <div>
                          <div className="flex justify-between items-start mb-3">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                              {live.professor || 'Prof. Ari'}
                            </span>
                            
                            {/* Badge dinâmica de Status */}
                            {status === 'Ao Vivo' && (
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2.5 py-1 rounded-lg flex items-center gap-1 animate-pulse">
                                <span className="w-2 h-2 rounded-full bg-red-500"></span> AO VIVO
                              </span>
                            )}
                            {status === 'Agendada' && (
                              <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">
                                Agendada
                              </span>
                            )}
                            {status === 'Encerrada' && (
                              <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
                                Encerrada
                              </span>
                            )}
                          </div>

                          <h4 className="font-black text-slate-900 text-lg mb-1 leading-snug">{live.titulo}</h4>
                          <p className="text-xs font-medium text-slate-500 flex items-center gap-1.5 mt-2">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            {live.data_hora ? new Date(live.data_hora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'Data a definir'}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-slate-100 flex items-center justify-between mt-4">
                          <span className="text-xs font-medium text-slate-400">
                            {status === 'Encerrada' ? 'Transmissão finalizada' : 'Acesse no horário marcado'}
                          </span>
                          
                          {live.link_transmissao ? (
                            <Link 
                              to={`/live/${live.id}`}
                              className="flex items-center gap-2 px-5 py-2.5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-orange-500/20"
                            >
                              <Radio className="w-4 h-4" /> Assistir ao Vivo
                            </Link>
                          ) : (
                            <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold cursor-not-allowed">
                              Link em breve
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}