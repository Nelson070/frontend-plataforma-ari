import React, { useState, useEffect } from 'react';
import {
  Search, Filter, BookOpen, ChevronDown, ChevronRight as ChevronRightIcon,
  MessageSquare, Bookmark, FileText, Loader2, ChevronLeft, ChevronRight, Folder, FolderOpen
} from 'lucide-react';
import Sidebar from './Sidebar';
import RenderBlocos from '../components/RenderBlocos';
import { useQuestoes } from '../hooks/useQuestoes';
import { supabase } from '../lib/supabaseClient';

export default function BancoQuestoes() {
  const [respostaSelecionada, setRespostaSelecionada] = useState(null);
  const [respondida, setRespondida] = useState(false);
  const [gabaritoRevelado, setGabaritoRevelado] = useState(false);
  const [mostrarComentario, setMostrarComentario] = useState(false);
  const [busca, setBusca] = useState('');
  const [dificuldade, setDificuldade] = useState('');
  const [assuntoIdSelecionado, setAssuntoIdSelecionado] = useState('');
  const [pagina, setPagina] = useState(0);

  // Estados para a árvore de assuntos na barra lateral
  const [assuntosArvore, setAssuntosArvore] = useState([]);
  const [turmaIdAluno, setTurmaIdAluno] = useState(null);

  // Descobre a turma do aluno logado e puxa a árvore de assuntos correspondente
  useEffect(() => {
    async function carregarFiltrosArvore() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('turma_id')
        .eq('id', user.id)
        .single();

      if (profile && profile.turma_id) {
        setTurmaIdAluno(profile.turma_id);

        const { data: arvore } = await supabase
          .from('assuntos_hierarquia')
          .select('*')
          .eq('turma_id', profile.turma_id)
          .order('created_at', { ascending: true });

        if (arvore) setAssuntosArvore(arvore);
      }
    }
    carregarFiltrosArvore();
  }, []);

  const { questoes, total, loading, error, responder } = useQuestoes({
    busca,
    dificuldade,
    assuntoId: assuntoIdSelecionado,
    pagina,
    porPagina: 1,
  });

  const questaoAtual = questoes[0];

  const handleResponder = async () => {
    if (!respostaSelecionada || !questaoAtual) return;
    await responder(questaoAtual.id, respostaSelecionada, questaoAtual.resposta_correta);
    setRespondida(true);
  };

  const revelarGabarito = () => {
    setGabaritoRevelado(true);
  };

  const irParaProxima = () => {
    setPagina((p) => p + 1);
    setRespostaSelecionada(null);
    setRespondida(false);
    setGabaritoRevelado(false);
    setMostrarComentario(false);
  };

  const irParaAnterior = () => {
    setPagina((p) => Math.max(0, p - 1));
    setRespostaSelecionada(null);
    setRespondida(false);
    setGabaritoRevelado(false);
    setMostrarComentario(false);
  };

  // Organiza pais e subitens da árvore
  const principais = assuntosArvore.filter(a => !a.categoria_pai_id);
  const getSub = (paiId) => assuntosArvore.filter(a => a.categoria_pai_id === paiId);

  return (
    <div className="flex h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      <Sidebar />

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-orange-50 text-brand-orange rounded-xl flex items-center justify-center shrink-0">
              <FileText className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight">Banco de Questões</h2>
              <p className="text-xs font-medium text-slate-500">
                {total > 0 ? `${total} questões disponíveis` : 'Nenhuma questão cadastrada ainda'}
              </p>
            </div>
          </div>

          <div className="w-9 h-9 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-xs cursor-pointer hover:bg-slate-800 transition-colors">
            C
          </div>
        </header>

        {/* CONTEÚDO: FILTROS + QUESTÕES */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">

          {/* BARRA LATERAL DE FILTROS */}
          <div className="w-full md:w-72 bg-white border-r border-slate-200 overflow-y-auto shrink-0 p-5 flex flex-col gap-6">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                <Filter className="w-4 h-4 text-brand-orange" /> Filtros
              </h3>
              <button
                onClick={() => { setBusca(''); setDificuldade(''); setAssuntoIdSelecionado(''); setPagina(0); }}
                className="text-xs font-bold text-slate-400 hover:text-brand-orange transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={busca}
                onChange={(e) => { setBusca(e.target.value); setPagina(0); }}
                placeholder="Palavra-chave..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-9 pr-4 text-sm font-medium focus:outline-none focus:border-brand-orange transition-colors"
              />
            </div>

            {/* Filtro por Árvore de Assuntos / Categorias */}
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Categorias e Assuntos
              </label>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                <button
                  onClick={() => { setAssuntoIdSelecionado(''); setPagina(0); }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                    !assuntoIdSelecionado ? 'bg-orange-50 text-brand-orange' : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  📁 Todos os Assuntos
                </button>
                {principais.map((pai) => {
                  const subitens = getSub(pai.id);
                  const isPaiSelecionado = assuntoIdSelecionado === pai.id;
                  return (
                    <div key={pai.id} className="space-y-1">
                      <button
                        onClick={() => { setAssuntoIdSelecionado(pai.id); setPagina(0); }}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                          isPaiSelecionado ? 'bg-orange-50 text-brand-orange' : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <Folder className="w-3.5 h-3.5 text-brand-orange shrink-0" />
                        <span className="truncate">{pai.nome}</span>
                      </button>
                      {subitens.map((sub) => {
                        const isSubSelecionado = assuntoIdSelecionado === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => { setAssuntoIdSelecionado(sub.id); setPagina(0); }}
                            className={`w-full text-left pl-7 pr-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1 cursor-pointer ${
                              isSubSelecionado ? 'bg-orange-50 text-brand-orange font-bold' : 'text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span>↳</span>
                            <span className="truncate">{sub.nome}</span>
                          </button>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                Dificuldade
              </label>
              <div className="flex flex-wrap gap-2">
                {[
                  { valor: '', label: 'Todas' },
                  { valor: 'facil', label: 'Fácil' },
                  { valor: 'medio', label: 'Médio' },
                  { valor: 'dificil', label: 'Difícil' },
                ].map((opt) => (
                  <button
                    key={opt.valor}
                    onClick={() => { setDificuldade(opt.valor); setPagina(0); }}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                      dificuldade === opt.valor
                        ? 'border-brand-orange bg-orange-50 text-brand-orange'
                        : 'border-slate-200 text-slate-600 hover:border-brand-orange hover:text-brand-orange'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ÁREA DA QUESTÃO */}
          <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <div className="max-w-3xl mx-auto space-y-5 pb-12">

              {loading && (
                <div className="flex items-center justify-center py-20 text-slate-400 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" /> Carregando questão...
                </div>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-xl text-sm font-medium">
                  Erro ao carregar questões: {error.message}
                </div>
              )}

              {!loading && !error && total === 0 && (
                <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <h3 className="font-bold text-slate-700 mb-1">Nenhuma questão por aqui ainda</h3>
                  <p className="text-sm text-slate-500">Assim que o professor cadastrar questões da sua turma, elas aparecem aqui.</p>
                </div>
              )}

              {!loading && questaoAtual && (
                <>
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-500">
                      Questão <span className="text-slate-900">{pagina + 1}</span> de {total}
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                    <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md flex items-center gap-1">
                          <BookOpen className="w-3 h-3" /> {questaoAtual.materia}
                        </span>
                        <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md text-xs font-bold">
                          {questaoAtual.assunto}
                        </span>
                        {questaoAtual.banca && (
                          <span className="text-xs font-bold text-slate-500 bg-white border border-slate-200 px-2.5 py-1 rounded-md">
                            {questaoAtual.banca}{questaoAtual.ano ? ` · ${questaoAtual.ano}` : ''}
                          </span>
                        )}
                      </div>
                      <button className="text-slate-400 hover:text-brand-orange transition-colors cursor-pointer">
                        <Bookmark className="w-4.5 h-4.5" />
                      </button>
                    </div>

                    <div
                      className="p-6 md:p-8 select-none"
                      onCopy={(e) => e.preventDefault()}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      {/* 1. Enunciado Superior (Texto Inicial) */}
                      {questaoAtual.blocos_enunciado_superior && questaoAtual.blocos_enunciado_superior.length > 0 ? (
                        <div className="text-slate-800 font-medium leading-relaxed mb-4 text-justify">
                          <RenderBlocos blocos={questaoAtual.blocos_enunciado_superior} />
                        </div>
                      ) : (
                        <div className="text-slate-800 font-medium leading-relaxed mb-4 text-justify">
                          <RenderBlocos blocos={questaoAtual.blocos_enunciado} />
                        </div>
                      )}

                      {/* 2. Tabela / Gráfico / Imagem Principal Centralizada */}
                      {questaoAtual.imagem_url && (
                        <div className="my-6 flex flex-col items-center justify-center">
                          <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs inline-block max-w-full">
                            <img
                              src={questaoAtual.imagem_url}
                              alt="Tabela ou Gráfico da Questão"
                              className="max-h-72 w-auto object-contain rounded-xl mx-auto"
                            />
                          </div>
                        </div>
                      )}

                      {/* 3. Enunciado Inferior / Comando Final */}
                      {questaoAtual.blocos_enunciado_inferior && questaoAtual.blocos_enunciado_inferior.length > 0 && (
                        <div className="text-slate-800 font-medium leading-relaxed my-4 text-justify">
                          <RenderBlocos blocos={questaoAtual.blocos_enunciado_inferior} />
                        </div>
                      )}

                      {/* Alternativas */}
                      <div className="space-y-3 mt-6">
                        {questaoAtual.alternativas.map((alt) => (
                          <button
                            key={alt.letra}
                            disabled={respondida}
                            onClick={() => setRespostaSelecionada(alt.letra)}
                            className={`w-full flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-colors group cursor-pointer ${
                              gabaritoRevelado && alt.letra === questaoAtual.resposta_correta
                                ? 'border-emerald-500 bg-emerald-50/60'
                                : gabaritoRevelado && alt.letra === respostaSelecionada
                                ? 'border-red-400 bg-red-50/60'
                                : respostaSelecionada === alt.letra
                                ? 'border-brand-orange bg-orange-50/60'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            } ${respondida ? 'cursor-default' : ''}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                              respostaSelecionada === alt.letra || (gabaritoRevelado && alt.letra === questaoAtual.resposta_correta)
                                ? 'bg-brand-orange text-white'
                                : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200'
                            }`}>
                              {alt.letra}
                            </div>
                            <span className="font-medium text-sm text-slate-700 flex-1">
                              {alt.blocos && alt.blocos.length > 0 ? (
                                <RenderBlocos blocos={alt.blocos} imgHeight="h-8" />
                              ) : (
                                alt.texto
                              )}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="bg-slate-50 border-t border-slate-100 px-5 py-3.5 flex items-center justify-between">
                      <button
                        onClick={() => setMostrarComentario(!mostrarComentario)}
                        disabled={!gabaritoRevelado}
                        className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-brand-orange transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4" /> Comentário do Professor
                      </button>

                      {!respondida ? (
                        <button
                          onClick={handleResponder}
                          disabled={!respostaSelecionada}
                          className="px-5 py-2 bg-brand-orange hover:bg-orange-600 disabled:bg-slate-300 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          Responder
                        </button>
                      ) : !gabaritoRevelado ? (
                        <button
                          onClick={revelarGabarito}
                          className="flex items-center gap-1.5 px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          Ver Gabarito
                        </button>
                      ) : (
                        <button
                          onClick={irParaProxima}
                          className="flex items-center gap-1.5 px-5 py-2 bg-brand-orange hover:bg-orange-600 text-white font-bold text-sm rounded-lg transition-colors cursor-pointer"
                        >
                          Próxima <ChevronRight className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {gabaritoRevelado && mostrarComentario && (questaoAtual.comentario || questaoAtual.video_resolucao_url || questaoAtual.resolucao_video_url) && (
                      <div
                        className="px-6 py-5 bg-orange-50/60 border-t border-orange-100 select-none space-y-4"
                        onCopy={(e) => e.preventDefault()}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">
                            P
                          </div>
                          <h4 className="font-black text-slate-800 text-sm">Resolução do Professor</h4>
                        </div>

                        {(questaoAtual.video_resolucao_url || questaoAtual.resolucao_video_url) && (
                          <div className="aspect-video bg-black rounded-xl overflow-hidden border border-orange-200 shadow-md">
                            <iframe
                              className="w-full h-full"
                              src={questaoAtual.video_resolucao_url || questaoAtual.resolucao_video_url}
                              title="Vídeo de resolução"
                              frameBorder="0"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            ></iframe>
                          </div>
                        )}

                        {questaoAtual.comentario && (
                          <p className="text-sm text-slate-700 font-medium leading-relaxed text-justify whitespace-pre-wrap">
                            {questaoAtual.comentario}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={irParaAnterior}
                      disabled={pagina === 0}
                      className="flex items-center gap-1.5 px-4 py-2 text-slate-600 font-bold text-sm hover:bg-slate-200 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" /> Anterior
                    </button>
                  </div>
                </>
              )}

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}