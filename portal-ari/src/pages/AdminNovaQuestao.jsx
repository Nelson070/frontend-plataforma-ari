import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, ArrowLeft, Loader2, CheckCircle2, ImagePlus, X, Eye, Video, FolderTree } from 'lucide-react';
import BlocoEditor from '../components/BlocoEditor';
import RenderBlocos from '../components/RenderBlocos';
import { criarBloco, processarBlocos, blocosParaTexto } from '../lib/blocos';

const LETRAS = ['A', 'B', 'C', 'D', 'E'];

// Função interna para formatar a URL do vídeo de resolução do YouTube
const formatarUrlVideo = (url) => {
  if (!url) return '';
  if (url.includes('embed')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/embed/${match[1]}`;
  }
  return url;
};

export default function AdminNovaQuestao() {
  const [turmas, setTurmas] = useState([]);
  const [assuntosArvore, setAssuntosArvore] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  const [turmaId, setTurmaId] = useState('');
  const [materia, setMateria] = useState('');
  const [assuntoId, setAssuntoId] = useState(''); 
  const [assuntoTexto, setAssuntoTexto] = useState('');
  const [dificuldade, setDificuldade] = useState('medio');
  const [comentario, setComentario] = useState('');
  const [videoResolucaoUrl, setVideoResolucaoUrl] = useState('');
  const [respostaCorreta, setRespostaCorreta] = useState('A');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [banca, setBanca] = useState('Inédita');

  // Enunciado Superior (Texto antes da tabela/gráfico)
  const [blocosEnunciadoSuperior, setBlocosEnunciadoSuperior] = useState([criarBloco('texto')]);

  // Gráfico / Tabela principal em destaque centralizada (Fica no meio)
  const [imagemPrincipalFile, setImagemPrincipalFile] = useState(null);
  const [imagemPrincipalPreview, setImagemPrincipalPreview] = useState(null);

  // Enunciado Inferior (Texto / Comando após a tabela/gráfico)
  const [blocosEnunciadoInferior, setBlocosEnunciadoInferior] = useState([]);

  // Cada alternativa possui seus próprios blocos de texto/imagem
  const [alternativasBlocos, setAlternativasBlocos] = useState(() =>
    Object.fromEntries(LETRAS.map((letra) => [letra, [criarBloco('texto')]]))
  );

  useEffect(() => {
    supabase.from('turmas').select('*').order('nome').then(({ data, error }) => {
      if (!error && data) {
        setTurmas(data);
        if (data.length > 0) setTurmaId(data[0].id);
      }
    });
  }, []);

  // Busca a árvore de assuntos sempre que a turma mudar
  useEffect(() => {
    if (turmaId) {
      supabase
        .from('assuntos_hierarquia')
        .select('*')
        .eq('turma_id', turmaId)
        .order('created_at', { ascending: true })
        .then(({ data }) => {
          if (data) setAssuntosArvore(data);
        });
    }
  }, [turmaId]);

  const handleImagemPrincipalChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemPrincipalFile(file);
      setImagemPrincipalPreview(URL.createObjectURL(file));
    }
  };

  const removerImagemPrincipal = () => {
    if (imagemPrincipalPreview) URL.revokeObjectURL(imagemPrincipalPreview);
    setImagemPrincipalFile(null);
    setImagemPrincipalPreview(null);
  };

  const resetarFormulario = () => {
    setBlocosEnunciadoSuperior([criarBloco('texto')]);
    setBlocosEnunciadoInferior([]);
    setAlternativasBlocos(Object.fromEntries(LETRAS.map((letra) => [letra, [criarBloco('texto')]])));
    removerImagemPrincipal();
    setComentario('');
    setVideoResolucaoUrl('');
    setAssuntoId('');
    setAssuntoTexto('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!assuntoId) return alert('Selecione um assunto da árvore hierárquica.');

    setLoading(true);
    setSucesso(false);

    try {
      // 1. Sobe os blocos superiores e inferiores
      const blocosSupProntos = await processarBlocos(supabase, blocosEnunciadoSuperior, turmaId, 'enunciado-sup');
      const blocosInfProntos = blocosEnunciadoInferior.length > 0 
        ? await processarBlocos(supabase, blocosEnunciadoInferior, turmaId, 'enunciado-inf')
        : [];

      // Junta todos os blocos para compatibilidade com o campo geral "enunciado" e "blocos_enunciado"
      const todosBlocosUnificados = [...blocosSupProntos, ...blocosInfProntos];

      // 2. Sobe a imagem principal / quadro estatístico ou gráfico em destaque, se houver
      let imagemPrincipalUrl = null;
      if (imagemPrincipalFile) {
        const fileExt = imagemPrincipalFile.name.split('.').pop();
        const filePath = `${turmaId}/principal-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('questoes_imagens').upload(filePath, imagemPrincipalFile);
        if (uploadError) throw uploadError;
        const { data } = supabase.storage.from('questoes_imagens').getPublicUrl(filePath);
        imagemPrincipalUrl = data.publicUrl;
      }

      // 3. Sobe as imagens de cada alternativa
      const alternativasFormatadas = await Promise.all(
        LETRAS.map(async (letra) => {
          const blocosProntos = await processarBlocos(supabase, alternativasBlocos[letra], turmaId, `alt-${letra}`);
          return {
            letra,
            texto: blocosParaTexto(blocosProntos),
            blocos: blocosProntos,
          };
        })
      );

      const urlVideoFormatada = formatarUrlVideo(videoResolucaoUrl);

      // Pega o nome do assunto selecionado
      const assuntoSelecionadoObj = assuntosArvore.find(a => a.id === assuntoId);
      const nomeAssuntoFinal = assuntoSelecionadoObj ? assuntoSelecionadoObj.nome : assuntoTexto;

      const { error } = await supabase.from('questoes').insert([{
        turma_id: turmaId,
        materia,
        assunto: nomeAssuntoFinal,
        assunto_id: assuntoId,
        dificuldade,
        enunciado: blocosParaTexto(todosBlocosUnificados),
        blocos_enunciado: todosBlocosUnificados,
        blocos_enunciado_superior: blocosSupProntos,
        blocos_enunciado_inferior: blocosInfProntos,
        imagem_url: imagemPrincipalUrl,
        alternativas: alternativasFormatadas,
        resposta_correta: respostaCorreta,
        comentario,
        video_resolucao_url: urlVideoFormatada,
        ano: parseInt(ano),
        banca,
      }]);

      if (error) throw error;

      setSucesso(true);
      resetarFormulario();
      setTimeout(() => setSucesso(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar questão:', error.message);
      alert('Erro ao salvar a questão. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const turmaAtual = turmas.find((t) => t.id === turmaId);
  const assuntoSelecionadoObj = assuntosArvore.find(a => a.id === assuntoId);
  const previewVideoUrlFormatado = formatarUrlVideo(videoResolucaoUrl);

  const principais = assuntosArvore.filter(a => !a.categoria_pai_id);
  const getSub = (paiId) => assuntosArvore.filter(a => a.categoria_pai_id === paiId);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/simulados-questoes" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-brand-orange" />
              Adicionar Nova Questão
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Layout clássico de prova: Texto Superior ➔ Tabela/Gráfico Central ➔ Texto Inferior.</p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-6 h-6" />
            Questão salva com sucesso no banco de dados!
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">

          {/* FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-8">

            {/* Classificação */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Classificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Turma / Nicho</label>
                  <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium cursor-pointer">
                    {turmas.map((t) => <option key={t.id} value={t.id}>{t.nome}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Matéria</label>
                  <input required type="text" value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Ex: Matemática" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <FolderTree className="w-4 h-4 text-brand-orange" /> Assunto (Árvore Hierárquica)
                  </label>
                  <select 
                    required 
                    value={assuntoId} 
                    onChange={(e) => setAssuntoId(e.target.value)} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium text-slate-700 cursor-pointer"
                  >
                    <option value="">Selecione a categoria/subcategoria...</option>
                    {principais.map(pai => {
                      const subitens = getSub(pai.id);
                      return (
                        <React.Fragment key={pai.id}>
                          <option value={pai.id} className="font-bold">📁 {pai.nome}</option>
                          {subitens.map(sub => (
                            <option key={sub.id} value={sub.id}>&nbsp;&nbsp;&nbsp;&nbsp;↳ {sub.nome}</option>
                          ))}
                        </React.Fragment>
                      );
                    })}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dificuldade</label>
                  <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium cursor-pointer">
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Banca (Opcional)</label>
                  <input type="text" value={banca} onChange={(e) => setBanca(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ano (Opcional)</label>
                  <input type="number" value={ano} onChange={(e) => setAno(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium" />
                </div>
              </div>
            </div>

            {/* 1. Enunciado Superior (Texto Inicial) */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">1. Enunciado (Texto Superior / Introdução)</h3>
              <p className="text-xs text-slate-500 mb-3">Insira o texto introdutório que fica <b>acima</b> da tabela ou gráfico.</p>
              <BlocoEditor blocos={blocosEnunciadoSuperior} onChange={setBlocosEnunciadoSuperior} />
            </div>

            {/* 2. Tabela / Gráfico / Imagem Central */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1">2. Tabela / Gráfico / Imagem Central (Opcional)</h3>
              <p className="text-xs text-slate-500 mb-3">Exibido em destaque centralizado exatamente no meio do enunciado — padrão exato de provas do ENEM.</p>
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-4 text-center">
                {!imagemPrincipalPreview ? (
                  <label className="cursor-pointer flex flex-col items-center justify-center py-4">
                    <ImagePlus className="w-8 h-8 text-slate-400 mb-2" />
                    <span className="text-xs font-bold text-slate-700">Clique para enviar a tabela ou gráfico principal</span>
                    <input type="file" accept="image/*" onChange={handleImagemPrincipalChange} className="hidden" />
                  </label>
                ) : (
                  <div className="relative inline-block">
                    <img src={imagemPrincipalPreview} alt="Tabela Principal" className="max-h-48 mx-auto rounded-xl border bg-white p-2 object-contain shadow-xs" />
                    <button type="button" onClick={removerImagemPrincipal} className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow transition-colors cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Enunciado Inferior (Texto / Comando final) */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-1 border-b border-slate-100 pb-2">3. Enunciado (Texto Inferior / Comando Final - Opcional)</h3>
              <p className="text-xs text-slate-500 mb-3">Insira o texto ou comando que fica <b>abaixo</b> da tabela (ex: "Utilizando os dados acima, assinale...").</p>
              <BlocoEditor blocos={blocosEnunciadoInferior} onChange={setBlocosEnunciadoInferior} />
            </div>

            {/* Alternativas */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alternativas</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-600">Gabarito:</span>
                  <select value={respostaCorreta} onChange={(e) => setRespostaCorreta(e.target.value)} className="p-2 bg-brand-orange text-white rounded-lg font-bold outline-none cursor-pointer">
                    {LETRAS.map((l) => <option key={l} value={l}>Letra {l}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {LETRAS.map((letra) => (
                  <div key={letra} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${respostaCorreta === letra ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-700'}`}>
                        {letra}
                      </span>
                      <div className="flex-1">
                        <BlocoEditor
                          compact
                          blocos={alternativasBlocos[letra]}
                          onChange={(novos) => setAlternativasBlocos((prev) => ({ ...prev, [letra]: novos }))}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comentário e Vídeo de Resolução */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-2">Resolução da Questão</h3>
              
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1 flex items-center gap-1.5">
                  <Video className="w-4 h-4 text-brand-orange" /> Link do Vídeo de Resolução (YouTube - Opcional)
                </label>
                <input 
                  type="text" 
                  value={videoResolucaoUrl} 
                  onChange={(e) => setVideoResolucaoUrl(e.target.value)} 
                  placeholder="Ex: https://www.youtube.com/watch?v=..." 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium text-sm" 
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Texto Explicativo da Resolução</label>
                <textarea 
                  value={comentario} 
                  onChange={(e) => setComentario(e.target.value)} 
                  rows="4" 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium resize-y text-sm" 
                  placeholder="Explique o passo a passo da resposta correta..."
                ></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-70 cursor-pointer">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Salvando...' : 'Salvar Questão'}
              </button>
            </div>

          </form>

          {/* PREVIEW AO VIVO (Estilo Prova Oficial) */}
          <div className="xl:sticky xl:top-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Como o aluno vai ver</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="bg-slate-50 border-b border-slate-100 px-5 py-3 flex items-center justify-between text-xs font-bold flex-wrap gap-1">
                <span className="text-blue-600 bg-blue-50 px-2.5 py-1 rounded-md">{materia || 'Matéria'}</span>
                <span className="text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-md">{assuntoSelecionadoObj?.nome || 'Assunto / Categoria'}</span>
                <span className="text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md capitalize">{dificuldade}</span>
              </div>

              <div className="p-5">
                {/* 1. Texto Superior */}
                <div className="text-slate-800 font-medium leading-relaxed mb-4 text-justify">
                  <RenderBlocos blocos={blocosEnunciadoSuperior} placeholder="O texto superior aparece aqui..." />
                </div>

                {/* 2. Imagem / Tabela Principal Centralizada no Meio */}
                {imagemPrincipalPreview && (
                  <div className="my-6 flex flex-col items-center justify-center">
                    <div className="p-3 bg-white border border-slate-200 rounded-2xl shadow-xs inline-block max-w-full">
                      <img src={imagemPrincipalPreview} alt="Tabela Principal" className="max-h-64 w-auto object-contain rounded-xl mx-auto" />
                    </div>
                  </div>
                )}

                {/* 3. Texto Inferior / Comando Final */}
                {blocosEnunciadoInferior.length > 0 && (
                  <div className="text-slate-800 font-medium leading-relaxed my-4 text-justify">
                    <RenderBlocos blocos={blocosEnunciadoInferior} />
                  </div>
                )}

                {/* Alternativas */}
                <div className="space-y-2.5 mt-6">
                  {LETRAS.map((letra) => (
                    <div
                      key={letra}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border ${
                        respostaCorreta === letra ? 'border-brand-orange bg-orange-50/60' : 'border-slate-200 bg-white'
                      }`}
                    >
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        respostaCorreta === letra ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {letra}
                      </div>
                      <span className="font-medium text-sm text-slate-700 flex-1">
                        <RenderBlocos blocos={alternativasBlocos[letra]} imgHeight="h-8" placeholder={`Alternativa ${letra}`} />
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {(comentario || previewVideoUrlFormatado) && (
                <div className="px-5 py-4 bg-orange-50/60 border-t border-orange-100 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0">P</div>
                    <h4 className="font-black text-slate-800 text-sm">Resolução do Professor</h4>
                  </div>

                  {previewVideoUrlFormatado && (
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-orange-200 shadow-md">
                      <iframe 
                        className="w-full h-full"
                        src={previewVideoUrlFormatado} 
                        title="Vídeo de Resolução"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {comentario && (
                    <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">{comentario}</p>
                  )}
                </div>
              )}
            </div>

            <p className="text-xs text-slate-400 font-medium mt-3 px-1">
              Turma: {turmaAtual?.nome || '—'} {banca && banca !== 'Inédita' ? `· ${banca}` : ''} {ano ? `· ${ano}` : ''}
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}