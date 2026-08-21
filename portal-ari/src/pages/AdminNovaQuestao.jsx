import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, PlusCircle, ArrowLeft, Loader2, CheckCircle2, ImagePlus, X } from 'lucide-react';
import { Link } from 'react-router-dom';



export default function AdminNovaQuestao() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados do Formulário
  const [turmaId, setTurmaId] = useState('');
  const [materia, setMateria] = useState('');
  const [assunto, setAssunto] = useState('');
  const [dificuldade, setDificuldade] = useState('medio');
  const [enunciado, setEnunciado] = useState('');
  const [comentario, setComentario] = useState('');
  const [respostaCorreta, setRespostaCorreta] = useState('A');
  const [ano, setAno] = useState(new Date().getFullYear());
  const [banca, setBanca] = useState('Inédita');
  
  // Estado para a Imagem
  const [imagemFile, setImagemFile] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(null);

  // Alternativas
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

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagemFile(file);
      // Cria uma URL local só para mostrar a pré-visualização para o Ari
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  const removeImagem = () => {
    setImagemFile(null);
    setImagemPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSucesso(false);

    try {
      let imagemUrl = null;

      // 1. Se tiver imagem, fazemos o upload primeiro
      if (imagemFile) {
        // Cria um nome único para o arquivo para não dar conflito
        const fileExt = imagemFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
        const filePath = `${turmaId}/${fileName}`; // Organiza em pastas por turma

        const { error: uploadError } = await supabase.storage
          .from('questoes_imagens')
          .upload(filePath, imagemFile);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('questoes_imagens')
          .getPublicUrl(filePath);

        imagemUrl = data.publicUrl;
      }

      const alternativasFormatadas = [
        { letra: 'A', texto: altA },
        { letra: 'B', texto: altB },
        { letra: 'C', texto: altC },
        { letra: 'D', texto: altD },
        { letra: 'E', texto: altE }
      ];

      // 3. Salva a questão inteira no banco
      const { error } = await supabase.from('questoes').insert([
        {
          turma_id: turmaId,
          materia,
          assunto,
          dificuldade,
          enunciado,
          alternativas: alternativasFormatadas,
          resposta_correta: respostaCorreta,
          comentario,
          ano: parseInt(ano),
          banca,
          imagem_url: imagemUrl // Nova coluna de imagem sendo enviada!
        }
      ]);

      if (error) throw error;

      setSucesso(true);
      
      // Limpar o formulário para a próxima questão
      setEnunciado('');
      setAltA(''); setAltB(''); setAltC(''); setAltD(''); setAltE('');
      setComentario('');
      removeImagem();
      
      setTimeout(() => setSucesso(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar questão:', error.message);
      alert('Erro ao salvar a questão. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <PlusCircle className="w-6 h-6 text-brand-orange" />
              Adicionar Nova Questão
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Alimente o banco de questões da plataforma.</p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-6 h-6" />
            Questão salva com sucesso no banco de dados!
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-8">
          
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

          {/* BLOCO 2: Enunciado e Imagem */}
          <div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Conteúdo da Questão</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2">Enunciado</label>
                <textarea required value={enunciado} onChange={(e) => setEnunciado(e.target.value)} rows="4" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium resize-y" placeholder="Escreva o texto da questão aqui..."></textarea>
              </div>

              {/* UPLOAD DE IMAGEM */}
              <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 transition-all hover:bg-slate-100">
                {!imagemPreview ? (
                  <label className="flex flex-col items-center justify-center cursor-pointer h-full">
                    <ImagePlus className="w-10 h-10 text-slate-400 mb-3" />
                    <span className="text-sm font-bold text-slate-700">Adicionar Imagem ou Gráfico</span>
                    <span className="text-xs text-slate-500 mt-1">PNG, JPG ou WEBP</span>
                    <input type="file" accept="image/*" onChange={handleImagemChange} className="hidden" />
                  </label>
                ) : (
                  <div className="relative inline-block w-full max-w-sm">
                    <img src={imagemPreview} alt="Preview" className="rounded-xl border border-slate-200 object-contain max-h-64 mx-auto" />
                    <button type="button" onClick={removeImagem} className="absolute -top-3 -right-3 bg-red-500 hover:bg-red-600 text-white rounded-full p-1.5 shadow-lg transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
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
      </div>
    </div>
  );
}