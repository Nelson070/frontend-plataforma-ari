import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Save, Video, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAulasLives() {
  const [turmas, setTurmas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sucesso, setSucesso] = useState(false);

  // Estados do Formulário
  const [turmaId, setTurmaId] = useState('');
  const [moduloNome, setModuloNome] = useState('Módulo 1');
  const [titulo, setTitulo] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [ordem, setOrdem] = useState(1);

  // Busca as turmas na hora que a tela abre
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSucesso(false);

    try {
      // Ajuste simples caso o Ari cole a URL inteira do YouTube em vez do link de Embed
      let urlFinal = videoUrl;
      if (videoUrl.includes('youtube.com/watch?v=')) {
        urlFinal = videoUrl.replace('youtube.com/watch?v=', 'youtube.com/embed/');
        // Remove parâmetros extras como &t= ou &list=
        urlFinal = urlFinal.split('&')[0]; 
      } else if (videoUrl.includes('youtu.be/')) {
        urlFinal = videoUrl.replace('youtu.be/', 'youtube.com/embed/');
        urlFinal = urlFinal.split('?')[0];
      }

      const { error } = await supabase.from('aulas').insert([
        {
          turma_id: turmaId,
          modulo_nome: moduloNome,
          titulo,
          video_url: urlFinal,
          ordem: parseInt(ordem)
        }
      ]);

      if (error) throw error;

      setSucesso(true);
      // Limpar o formulário para a próxima aula (mantém a turma e o módulo para facilitar)
      setTitulo('');
      setVideoUrl('');
      setOrdem(prev => parseInt(prev) + 1); // Já sugere o próximo número
      
      setTimeout(() => setSucesso(false), 3000);

    } catch (error) {
      console.error('Erro ao salvar aula:', error.message);
      alert('Erro ao salvar a aula. Verifique o console.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        <div className="flex items-center gap-4 mb-8">
          <Link to="/admin/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Video className="w-6 h-6 text-brand-orange" />
              Cadastrar Nova Aula
            </h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Adicione videoaulas à plataforma dos alunos.</p>
          </div>
        </div>

        {sucesso && (
          <div className="mb-6 bg-emerald-50 border border-emerald-200 text-emerald-700 p-4 rounded-xl flex items-center gap-3 font-bold">
            <CheckCircle2 className="w-6 h-6" />
            Aula salva com sucesso! O Player já foi atualizado.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Turma</label>
              <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium">
                {turmas.map(t => (
                  <option key={t.id} value={t.id}>{t.nome}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Ordem da Aula</label>
              <input required type="number" min="1" value={ordem} onChange={(e) => setOrdem(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Módulo</label>
              <input required type="text" value={moduloNome} onChange={(e) => setModuloNome(e.target.value)} placeholder="Ex: Matemática Básica" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Título da Aula</label>
              <input required type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex: Regra de Três Simples" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Link do Vídeo (YouTube)</label>
            <input 
              required 
              type="text" 
              value={videoUrl} 
              onChange={(e) => setVideoUrl(e.target.value)} 
              placeholder="Ex: https://www.youtube.com/watch?v=XXXXXXX" 
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange focus:ring-2 focus:ring-orange-100 font-medium" 
            />
            <p className="text-xs text-slate-400 mt-2 font-medium">Você pode colar o link normal do YouTube, o sistema converte automaticamente para o Player.</p>
          </div>

          <div className="pt-4 flex justify-end">
            <button disabled={loading} type="submit" className="flex items-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all disabled:opacity-70">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {loading ? 'Salvando...' : 'Publicar Aula'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}