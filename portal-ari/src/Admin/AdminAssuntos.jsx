import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FolderTree, Plus, Trash2, ArrowLeft, Loader2, Folder, FolderOpen, ChevronRight, ChevronDown, BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import AdminSidebar from './AdminSidebar';

export default function AdminAssuntos() {
  const [turmas, setTurmas] = useState([]);
  const [turmaId, setTurmaId] = useState('');
  const [assuntos, setAssuntos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [salvando, setSalvando] = useState(false);
  
  // Controle de pastas expandidas na árvore (armazena IDs abertos)
  const [expandidos, setExpandidos] = useState({});

  // Formulário de novo assunto
  const [nome, setNome] = useState('');
  const [categoriaPaiId, setCategoriaPaiId] = useState('');

  useEffect(() => {
    async function fetchTurmas() {
      const { data } = await supabase.from('turmas').select('*').order('nome');
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
    
    if (!error && data) {
      setAssuntos(data);
      // Deixa todas as categorias principais expandidas por padrão
      const mapExp = {};
      data.filter(a => !a.categoria_pai_id).forEach(p => { mapExp[p.id] = true; });
      setExpandidos(mapExp);
    }
    setLoading(false);
  }

  const toggleExpand = (id) => {
    setExpandidos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSalvar = async (e) => {
    e.preventDefault();
    if (!nome.trim()) return;

    setSalvando(true);
    const slugGerado = nome.trim().toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('assuntos_hierarquia').insert([
      {
        turma_id: turmaId,
        nome: nome.trim(),
        slug: slugGerado,
        categoria_pai_id: categoriaPaiId || null
      }
    ]);

    setSalvando(false);
    if (error) {
      alert('Erro ao salvar assunto: ' + error.message);
    } else {
      setNome('');
      setCategoriaPaiId('');
      fetchAssuntos();
    }
  };

  const handleDeletar = async (id, nomeItem) => {
    if (!window.confirm(`Deseja realmente excluir "${nomeItem}" e todas as suas subcategorias?`)) return;
    const { error } = await supabase.from('assuntos_hierarquia').delete().eq('id', id);
    if (error) {
      alert('Erro ao excluir item.');
    } else {
      fetchAssuntos();
    }
  };

  // Separa principais e subcategorias
  const principais = assuntos.filter(a => !a.categoria_pai_id);
  const getSub = (paiId) => assuntos.filter(a => a.categoria_pai_id === paiId);

  return (
    <div className="flex h-screen bg-[#f4f7f6] font-sans overflow-hidden text-slate-800">
      <AdminSidebar />

      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 md:px-8 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-4">
            <Link to="/admin" className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h2 className="text-lg font-black text-slate-900 leading-tight flex items-center gap-2">
                <FolderTree className="w-5 h-5 text-brand-orange" /> Gerenciar Árvore de Assuntos
              </h2>
              <p className="text-xs font-medium text-slate-500">Organize disciplinas principais e subcategorias em formato de árvore.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={turmaId} 
              onChange={(e) => setTurmaId(e.target.value)} 
              className="p-2 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange font-bold text-sm text-slate-700 shadow-sm"
            >
              {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
            </select>
            <div className="w-9 h-9 bg-brand-orange rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0">
              A
            </div>
          </div>
        </header>

        {/* CONTEÚDO PRINCIPAL */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6 pb-12">

            {/* FORMULÁRIO DE CADASTRO */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                <Plus className="w-4 h-4 text-brand-orange" /> Adicionar Novo Assunto ou Subcategoria
              </h3>

              <form onSubmit={handleSalvar} className="grid grid-cols-1 md:grid-cols-[1fr_240px_auto] gap-3 items-end pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome do Assunto</label>
                  <input 
                    type="text" 
                    required 
                    value={nome} 
                    onChange={(e) => setNome(e.target.value)} 
                    placeholder="Ex: Geometria Plana ou Ângulos..." 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-brand-orange" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Categoria Pai (Opcional)</label>
                  <select 
                    value={categoriaPaiId} 
                    onChange={(e) => setCategoriaPaiId(e.target.value)} 
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none text-slate-700"
                  >
                    <option value="">(É uma Categoria Principal)</option>
                    {principais.map(p => <option key={p.id} value={p.id}>{p.nome}</option>)}
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={salvando}
                  className="px-6 py-3 bg-brand-orange hover:bg-orange-600 text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                >
                  {salvando ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Adicionar
                </button>
              </form>
            </div>

            {/* LISTAGEM DA ÁRVORE EXPANSÍVEL */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-brand-orange" /> Estrutura Hierárquica da Turma
                </h3>
                <span className="text-xs font-bold px-3 py-1 bg-orange-100 text-brand-orange rounded-full">
                  {assuntos.length} itens cadastrados
                </span>
              </div>

              {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-brand-orange" /></div>
              ) : principais.length === 0 ? (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">Nenhum assunto cadastrado para esta turma ainda.</div>
              ) : (
                <div className="space-y-3">
                  {principais.map(pai => {
                    const subitens = getSub(pai.id);
                    const estaExpandido = expandidos[pai.id];

                    return (
                      <div key={pai.id} className="border border-slate-200 rounded-2xl bg-slate-50/50 overflow-hidden transition-all">
                        {/* CATEGORIA PRINCIPAL (PASTA) */}
                        <div className="p-4 flex items-center justify-between bg-white border-b border-slate-100">
                          <div className="flex items-center gap-3 cursor-pointer select-none flex-1" onClick={() => toggleExpand(pai.id)}>
                            <button className="text-slate-400 hover:text-slate-600">
                              {estaExpandido ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                            </button>
                            <div className="flex items-center gap-2 font-black text-slate-900 text-sm">
                              {estaExpandido ? <FolderOpen className="w-4 h-4 text-brand-orange" /> : <Folder className="w-4 h-4 text-brand-orange" />}
                              {pai.nome}
                              <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold">
                                {subitens.length} subitens
                              </span>
                            </div>
                          </div>
                          
                          <button 
                            onClick={() => handleDeletar(pai.id, pai.nome)} 
                            className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors cursor-pointer"
                            title="Excluir Categoria"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* SUBCATEGORIAS */}
                        {estaExpandido && subitens.length > 0 && (
                          <div className="p-3 pl-10 space-y-2 bg-slate-50/80">
                            {subitens.map(sub => (
                              <div key={sub.id} className="flex items-center justify-between text-sm bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
                                <span className="font-bold text-slate-700 flex items-center gap-2.5">
                                  <span className="w-2 h-2 rounded-full bg-brand-orange"></span>
                                  {sub.nome}
                                </span>
                                <button 
                                  onClick={() => handleDeletar(sub.id, sub.nome)} 
                                  className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                                  title="Excluir Subcategoria"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
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
      </main>
    </div>
  );
}