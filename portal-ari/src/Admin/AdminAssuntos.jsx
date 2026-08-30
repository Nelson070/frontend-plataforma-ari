import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FolderTree, Plus, Trash2, ArrowLeft, Loader2, Folder, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminAssuntos() {
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState('');
  const [assuntos, setAssuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Formulário de novo assunto
  const [nome, setNome] = useState('');
  const [categoriaPaiId, setCategoriaPaiId] = useState('');

  useEffect(() => {
    async function fetchTurmas() {
      const { data } = await supabase.from('turmas').select('*');
      if (data && data.length > 0) {
        setTurmas(data);
        setTurmaId(data[0].id);
      }
    }
    fetchTurmas();
  }, []);

  useEffect(() => {
    if (turmaId) fetchAssuntos();
  }, [turmaId]);

  async function fetchAssuntos() {
    setLoading(true);
    const { data, error } = await supabase
      .from('assuntos_hierarquia')
      .select('*')
      .eq('turma_id', turmaId)
      .order('created_at', { ascending: true });
    
    if (!error && data) setAssuntos(data);
    setLoading(false);
  }

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    const { error } = await supabase.from('assuntos_hierarquia').insert([
      {
        turma_id: turmaId,
        nome: nome.trim(),
        categoria_pai_id: categoriaPaiId || null
      }
    ]);

    if (error) {
      alert('Erro ao salvar assunto.');
    } else {
      setNome('');
      setCategoriaPaiId('');
      fetchAssuntos();
    }
  };

  const handleDeletar = async (id) => {
    if (!confirm('Deseja realmente excluir este assunto e seus subitens?')) return;
    const { error } = await supabase.from('assuntos_hierarquia').delete().eq('id', id);
    if (!error) fetchAssuntos();
  };

  // Separa categorias principais e subcategorias
  const principais = assuntos.filter(a => !a.categoria_pai_id);
  const getSub = (paiId) => assuntos.filter(a => a.categoria_pai_id === paiId);

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">

        <div className="flex items-center gap-4">
          <Link to="/admin/simulados-questoes" className="p-2 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <FolderTree className="w-6 h-6 text-brand-orange" />
              Gerenciar Árvore de Assuntos
            </h1>
            <p className="text-sm text-slate-500">Cadastre disciplinas principais e subcategorias para organizar o conteúdo.</p>
          </div>
        </div>

        {/* SELETOR DE TURMA + FORMULÁRIO DE CADASTRO */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">Selecione a Turma</label>
            <select value={turmaId} onChange={(e) => setTurmaId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none">
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
          </div>

          <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3 items-end pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Assunto ou Subcategoria</label>
              <input type="text" required value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex: Geometria Plana ou Ângulos..." className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-brand-orange" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria Pai (Opcional)</label>
              <select value={categoriaPaiId} onChange={(e) => setCategoriaPaiId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none">
                <option value="">(É uma Categoria Principal)</option>
                {principais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
              </select>
            </div>
            <button type="submit" className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all">
              <Plus className="w-4 h-4" /> Adicionar
            </button>
          </form>
        </div>

        {/* LISTAGEM DA ÁRVORE */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Estrutura Atual</h3>

          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-6 h-6 animate-spin text-slate-400" /></div>
          ) : principais.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Nenhum assunto cadastrado para esta turma ainda.</p>
          ) : (
            <div className="space-y-3">
              {principais.map(pai => {
                const subitens = getSub(pai.id);
                return (
                  <div key={pai.id} className="border border-slate-200 rounded-2xl p-4 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-slate-900">
                        <Folder className="w-4 h-4 text-brand-orange" />
                        {pai.nome}
                      </div>
                      <button onClick={() => handleDeletar(pai.id)} className="text-red-400 hover:text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                    </div>

                    {subitens.length > 0 && (
                      <div className="pl-6 space-y-1.5 pt-2 border-t border-slate-200/60">
                        {subitens.map(sub => (
                          <div key={sub.id} className="flex items-center justify-between text-sm bg-white p-2.5 rounded-xl border border-slate-200">
                            <span className="font-medium text-slate-700 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-brand-orange"></span>
                              {sub.nome}
                            </span>
                            <button onClick={() => handleDeletar(sub.id)} className="text-red-400 hover:text-red-600"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}