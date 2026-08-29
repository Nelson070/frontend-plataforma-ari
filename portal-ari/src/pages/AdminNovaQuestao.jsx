import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, ArrowLeft, Loader2, CheckCircle2, ImagePlus, X, Eye, Plus, Trash2, ArrowUp, ArrowDown, Type } from 'lucide-react';
import { Link } from 'react-router-dom';
import QuestaoPreviewCard from '../components/QuestaoPreviewCard';

const DIFICULDADE_STYLE = {
  facil: 'bg-emerald-50 text-emerald-700',
  medio: 'bg-amber-50 text-amber-700',
  dificil: 'bg-red-50 text-red-700',
};
const DIFICULDADE_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

export default function AdminNovaQuestao() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados do Formulário
  const [turmaId, setTurmaId] = useState('');
  const [materia, setMateria] = useState('');
  const [assunto, setAssunto] = useState('');
  const [dificuldade, setDificuldade] = useState('medio');
  const [comentario, setComentario] = useState('');
  const [respostaCorreta, setRespostaCorreta] = useState('A');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [banca, setBanca] = useState('Inédita');

  // Estado de Blocos do Enunciado (Texto e Imagens intercaladas - máx 4 imagens)
  const [blocos, setBlocos] = useState([
    { id: Date.now(), tipo: 'texto', valor: '', file: null }
  ]);

  const [altA, setAltA] = useState('');
  const [altB, setAltB] = useState('');
  const [altC, setAltC] = useState('');
  const [altD, setAltD] = useState('');
  const [altE, setAltE] = useState('');

  useEffect(() => {
    async function fetchTurmas() {
      const { data, error } = await supabase.from('turmas').select('*');
      if (!error && data) {
        setTurmas(data);
        if (data.length > 0) setTurmaId(data[0].id);
      }
    }
    fetchTurmas();
  }, []);

  // Manipulação dos blocos do enunciado
  const adicionarBloco = (tipo) => {
    if (tipo === 'imagem') {
      const totalImagens = blocos.filter(b => b.tipo === 'imagem').length;
      if (totalImagens >= 4) {
        return alert('O limite máximo é de 4 imagens por questão.');
      }
    }
    setBlocos([...blocos, { id: Date.now(), tipo, valor: '', file: null }]);
  };

  const removerBloco = (id) => {
    if (blocos.length === 1) return alert('A questão precisa ter ao menos um bloco no enunciado.');
    setBlocos(blocos.filter(b => b.id !== id));
  };

  const atualizarBlocoTexto = (id, texto) => {
    setblocosState(id, { valor: texto });
  };

  const atualizarBlocoImagem = (id, e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setblocosState(id, { file, valor: previewUrl });
    }
  };

  const setblocosState = (id, updates) => {
    setBlocos(blocos.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const moverBloco = (index, direcao) => {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= blocos.length) return;
    const novosBlocos = [...blocos];
    const temp = novosBlocos[index];
    novosBlocos[index] = novosBlocos[novoIndex];
    novosBlocos[novoIndex] = temp;
    setBlocos(novosBlocos);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSucesso(false);

    try {
      // Processa o upload de cada imagem dentro dos blocos
      const blocosProcessados = await Promise.all(
        blocos.map(async (bloco) => {
          if (bloco.tipo === 'imagem' && bloco.file) {
            const fileExt = bloco.file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
            const filePath = `${turmaId}/${fileName}`;

            const { error: uploadError } = await supabase.storage
              .from('questoes_imagens')
              .upload(filePath, bloco.file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from('questoes_imagens').getPublicUrl(filePath);
            return { tipo: 'imagem', valor: data.publicUrl };
          }
          return { tipo: bloco.tipo, valor: bloco.valor };
        })
      );

      const alternativasFormatadas = [
        { letra: 'A', texto: altA },
        { letra: 'B', texto: altB },
        { letra: 'C', texto: altC },
        { letra: 'D', texto: altD },
        { letra: 'E', texto: altE },
      ];

      const enunciadoTextoSimples = blocosProcessados
        .map(b => b.tipo === 'texto' ? b.valor : '[IMAGEM]')
        .join(' ');

      const { error } = await supabase.from('questoes').insert([
        {
          turma_id: turmaId,
          materia,
          assunto,
          dificuldade,
          enunciado: enunciadoTextoSimples,
          blocos_enunciado: blocosProcessados,
          alternativas: alternativasFormatadas,
          resposta_correta: respostaCorreta,
          comentario,
          ano: parseInt(ano),
          banca,
          imagem_url: blocosProcessados.find(b => b.tipo === 'imagem')?.valor || null,
        },
      ]);

      if (error) throw error;

      setSucesso(true);
      setBlocos([{ id: Date.now(), tipo: 'texto', valor: '', file: null }]);
      setAltA(''); setAltB(''); setAltC(''); setAltD(''); setAltE('');
      setComentario('');

      setTimeout(() => setSucesso(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar questão:', error.message);
      alert('Erro ao salvar a questão. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  const turmaAtual = turmas.find((t) => t.id === turmaId);
  const alternativasPreview = [
    { letra: 'A', texto: altA },
    { letra: 'B', texto: altB },
    { letra: 'C', texto: altC },
    { letra: 'D', texto: altD },
    { letra: 'E', texto: altE },
  ];

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
            <p className="text-sm text-slate-500 font-medium mt-1">Alimente o banco de questões com blocos flexíveis em linha.</p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-6 h-6" />
            Questão salva com sucesso no banco de dados!
          </div>
        )}

        {/* LAYOUT DE 2 COLUNAS: FORMULÁRIO + PREVIEW AO VIVO */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">

          {/* COLUNA ESQUERDA: FORMULÁRIO */}
          <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 space-y-8">

            {/* BLOCO 1: Classificação */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Classificação</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Turma / Nicho</label>
                  <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium">
                    {turmas.map(t => (
                      <option key={t.id} value={t.id}>{t.nome}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Matéria</label>
                  <input required type="text" value={materia} onChange={(e) => setMateria(e.target.value)} placeholder="Ex: Matemática" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Assunto</label>
                  <input required type="text" value={assunto} onChange={(e) => setAssunto(e.target.value)} placeholder="Ex: Geometria Plana" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Dificuldade</label>
                  <select value={dificuldade} onChange={(e) => setDificuldade(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium">
                    <option value="facil">Fácil</option>
                    <option value="medio">Médio</option>
                    <option value="dificil">Difícil</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Banca (Opcional)</label>
                  <input type="text" value={banca} onChange={(e) => setBanca(e.target.value)} placeholder="Ex: INEP, FGV..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Ano (Opcional)</label>
                  <input type="number" value={ano} onChange={(e) => setAno(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
                </div>
              </div>
            </div>

            {/* BLOCO 2: Construtor de Enunciado em Blocos (Texto e Imagens Inline) */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <div>
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Editor de Enunciado (Blocos Inline)</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Intercale textos e imagens na mesma linha do texto.</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => adicionarBloco('texto')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold text-xs transition-colors"
                  >
                    <Type className="w-3.5 h-3.5" /> + Texto
                  </button>
                  <button
                    type="button"
                    onClick={() => adicionarBloco('imagem')}
                    className="flex items-center gap-1 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-brand-orange rounded-xl font-bold text-xs transition-colors"
                  >
                    <ImagePlus className="w-3.5 h-3.5" /> + Imagem
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                {blocos.map((bloco, index) => (
                  <div key={bloco.id} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl relative group">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-400 uppercase">
                        Bloco #{index + 1} ({bloco.tipo === 'texto' ? 'Texto' : 'Imagem'})
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moverBloco(index, -1)}
                          disabled={index === 0}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Mover para cima"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moverBloco(index, 1)}
                          disabled={index === blocos.length - 1}
                          className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30"
                          title="Mover para baixo"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removerBloco(bloco.id)}
                          className="p-1 text-red-400 hover:text-red-600 ml-2"
                          title="Remover bloco"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {bloco.tipo === 'texto' ? (
                      <input
                        type="text"
                        required
                        value={bloco.valor}
                        onChange={(e) => atualizarBlocoTexto(bloco.id, e.target.value)}
                        placeholder="Digite o trecho do texto..."
                        className="w-full p-3 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-medium text-sm"
                      />
                    ) : (
                      <div>
                        {!bloco.valor ? (
                          <label className="flex flex-col items-center justify-center cursor-pointer h-28 border-2 border-dashed border-slate-300 rounded-xl bg-white hover:bg-slate-50 transition-all">
                            <ImagePlus className="w-7 h-7 text-slate-400 mb-1" />
                            <span className="text-xs font-bold text-slate-700">Clique para enviar ícone/imagem inline</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => atualizarBlocoImagem(bloco.id, e)}
                              className="hidden"
                            />
                          </label>
                        ) : (
                          <div className="relative inline-block">
                            <img src={bloco.valor} alt="Preview Inline" className="h-12 w-auto object-contain rounded border border-slate-200 bg-white p-0.5" />
                            <button
                              type="button"
                              onClick={() => setblocosState(bloco.id, { valor: '', file: null })}
                              className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCO 3: Alternativas */}
            <div>
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Alternativas</h3>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-slate-600">Gabarito Correto:</span>
                  <select value={respostaCorreta} onChange={(e) => setRespostaCorreta(e.target.value)} className="p-2 bg-brand-orange text-white rounded-lg font-bold outline-none cursor-pointer">
                    <option value="A">Letra A</option>
                    <option value="B">Letra B</option>
                    <option value="C">Letra C</option>
                    <option value="D">Letra D</option>
                    <option value="E">Letra E</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3">
                {[
                  { letra: 'A', state: altA, set: setAltA },
                  { letra: 'B', state: altB, set: setAltB },
                  { letra: 'C', state: altC, set: setAltC },
                  { letra: 'D', state: altD, set: setAltD },
                  { letra: 'E', state: altE, set: setAltE },
                ].map((item) => (
                  <div key={item.letra} className="flex items-center gap-3">
                    <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center font-black text-sm transition-colors ${respostaCorreta === item.letra ? 'bg-brand-orange text-white' : 'bg-slate-100 text-slate-500'}`}>
                      {item.letra}
                    </div>
                    <input required type="text" value={item.state} onChange={(e) => item.set(e.target.value)} placeholder={`Texto da alternativa ${item.letra}...`} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
                  </div>
                ))}
              </div>
            </div>

            {/* BLOCO 4: Comentário do Professor */}
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Resolução (Opcional)</h3>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} rows="3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium resize-y" placeholder="Explique o passo a passo da resposta correta..."></textarea>
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={loading} type="submit" className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-70">
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                {loading ? 'Salvando...' : 'Salvar Questão'}
              </button>
            </div>

          </form>

          {/* COLUNA DIREITA: PREVIEW AO VIVO COM FLUXO INLINE */}
          <div className="xl:sticky xl:top-8">
            <div className="flex items-center gap-2 mb-3 px-1">
              <Eye className="w-4 h-4 text-slate-400" />
              <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider">Como o aluno vai ver</h3>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                <span className="bg-slate-100 px-2.5 py-1 rounded-lg uppercase">{materia || 'Matéria'}</span>
                <span className="capitalize">{dificuldade}</span>
              </div>

              {/* ENUNCIADO FLUIDO INLINE */}
              <div className="flex flex-wrap items-center gap-2 text-slate-800 font-medium text-base leading-relaxed">
                {blocos.map((bloco, idx) => (
                  bloco.tipo === 'texto' ? (
                    <span key={idx} className="inline-block">
                      {bloco.valor || (idx === 0 ? 'Escreva o texto...' : '')}
                    </span>
                  ) : (
                    bloco.valor ? (
                      <img key={idx} src={bloco.valor} alt="Inline" className="inline-block h-8 w-auto object-contain align-middle mx-1 rounded border border-slate-200 bg-white" />
                    ) : (
                      <span key={idx} className="inline-block bg-slate-100 text-slate-400 px-2 py-0.5 rounded text-xs border border-dashed border-slate-300">
                        [Imagem]
                      </span>
                    )
                  )
                ))}
              </div>

              {/* ALTERNATIVAS PREVIEW */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                {alternativasPreview.map((alt) => (
                  <div key={alt.letra} className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 ${respostaCorreta === alt.letra ? 'border-brand-orange bg-orange-50/50 text-slate-900' : 'border-slate-200 bg-slate-50/50 text-slate-700'}`}>
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs ${respostaCorreta === alt.letra ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'}`}>
                      {alt.letra}
                    </span>
                    <span>{alt.texto || `Alternativa ${alt.letra}...`}</span>
                  </div>
                ))}
              </div>

              {comentario && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 mt-2">
                  <span className="font-bold block mb-0.5">Resolução:</span>
                  {comentario}
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