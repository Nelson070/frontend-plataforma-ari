import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Target, ArrowLeft, Plus, Search, Loader2, Save, Trash2, CheckCircle2, FileText, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AdminSimuladosQuestoes() {
  const [turmas, setTurmas] = useState([]);
  const [simulados, setSimulados] = useState([]);
  const [loading, setLoading] = useState(true);

  // Controle de Telas
  const [view, setView] = useState('LIST'); 
  const [simuladoAtivo, setSimuladoAtivo] = useState(null);
  
  // Controle de Abas no Gerenciador (Busca vs Criação Manual)
  const [abaEsquerda, setAbaEsquerda] = useState('BUSCA');

  // Estados Form CREATE SIMULADO
  const [turmaId, setTurmaId] = useState('');
  const [titulo, setTitulo] = useState('');
  const [descricao, setDescricao] = useState('');
  const [tempo, setTempo] = useState(120);
  const [criando, setCriando] = useState(false);

  // Estados MANAGE (Adicionar Questões via Busca)
  const [termoBusca, setTermoBusca] = useState('');
  const [questoesBusca, setQuestoesBusca] = useState([]);
  const [questoesDoSimulado, setQuestoesDoSimulado] = useState([]);
  const [buscando, setBuscando] = useState(false);

  // Estados MANAGE (Criar Questão Manual Express)
  const [qMateria, setQMateria] = useState('Matemática');
  const [qEnunciado, setQEnunciado] = useState('');
  const [qImagemUrl, setQImagemUrl] = useState('');
  const [qAltA, setQAltA] = useState('');
  const [qAltB, setQAltB] = useState('');
  const [qAltC, setQAltC] = useState('');
  const [qAltD, setQAltD] = useState('');
  const [qAltE, setQAltE] = useState('');
  const [qCorreta, setQCorreta] = useState('A');
  const [qComentario, setQComentario] = useState('');
  const [salvandoQuestaoManual, setSalvandoQuestaoManual] = useState(false);

  useEffect(() => {
    fetchInicial();
  }, []);

  async function fetchInicial() {
    setLoading(true);
    try {
      const { data: dataTurmas } = await supabase.from('turmas').select('*');
      if (dataTurmas) {
        setTurmas(dataTurmas);
        if (dataTurmas.length > 0) setTurmaId(dataTurmas[0].id);
      }

      const { data: dataSimulados } = await supabase
        .from('simulados')
        .select('*, turmas(nome)')
        .order('created_at', { ascending: false });
      
      if (dataSimulados) setSimulados(dataSimulados);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }

  // ==========================================
  // FUNÇÕES DE CRIAÇÃO DO SIMULADO
  // ==========================================
  const handleCriarSimulado = async (e) => {
    e.preventDefault();
    setCriando(true);
    try {
      const { data, error } = await supabase
        .from('simulados')
        .insert([{ 
          turma_id: turmaId, 
          titulo: titulo, 
          descricao: descricao || null, 
          tempo_minutos: parseInt(tempo, 10) 
        }])
        .select()
        .single();

      if (error) throw error;
      
      setTitulo(''); setDescricao(''); setTempo(120);
      await fetchInicial();
      abrirGerenciador(data);
    } catch (error) {
      alert('Erro ao criar simulado.');
      console.error(error);
    } finally {
      setCriando(false);
    }
  };

  // ==========================================
  // FUNÇÕES DO GERENCIADOR DE QUESTÕES
  // ==========================================
  const abrirGerenciador = async (simulado) => {
    setSimuladoAtivo(simulado);
    setView('MANAGE');
    carregarQuestoesDoSimulado(simulado.id);
  };

  const carregarQuestoesDoSimulado = async (simulado_id) => {
    const { data } = await supabase
      .from('simulado_questoes')
      .select('ordem, questao_id, questoes(enunciado, materia)')
      .eq('simulado_id', simulado_id)
      .order('ordem', { ascending: true });
    
    if (data) setQuestoesDoSimulado(data);
  };

  const buscarQuestoes = async () => {
    if (!termoBusca) return;
    setBuscando(true);
    try {
      const { data } = await supabase
        .from('questoes')
        .select('id, enunciado, materia')
        .ilike('enunciado', `%${termoBusca}%`)
        .limit(10);
      
      setQuestoesBusca(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setBuscando(false);
    }
  };

  const adicionarQuestao = async (questao_id) => {
    if (questoesDoSimulado.find(q => q.questao_id === questao_id)) return;
    const novaOrdem = questoesDoSimulado.length + 1;
    try {
      await supabase
        .from('simulado_questoes')
        .insert([{ simulado_id: simuladoAtivo.id, questao_id, ordem: novaOrdem }]);
      carregarQuestoesDoSimulado(simuladoAtivo.id);
    } catch (error) {
      console.error(error);
    }
  };

  const removerQuestao = async (questao_id) => {
    try {
      await supabase
        .from('simulado_questoes')
        .delete()
        .match({ simulado_id: simuladoAtivo.id, questao_id });
      carregarQuestoesDoSimulado(simuladoAtivo.id);
    } catch (error) {
      console.error(error);
    }
  };

  // ==========================================
  // FUNÇÃO: CRIAR QUESTÃO MANUAL EXPRESS
  // ==========================================
  const handleCriarQuestaoManual = async (e) => {
    e.preventDefault();
    setSalvandoQuestaoManual(true);
    try {
      const alternativas = [
        { letra: 'A', texto: qAltA },
        { letra: 'B', texto: qAltB },
        { letra: 'C', texto: qAltC },
        { letra: 'D', texto: qAltD },
        { letra: 'E', texto: qAltE }
      ];

      // 1. Salva no banco de questões principal
      const { data, error } = await supabase.from('questoes').insert([{
        materia: qMateria,
        enunciado: qEnunciado,
        imagem_url: qImagemUrl || null,
        alternativas: alternativas,
        resposta_correta: qCorreta,
        comentario: qComentario || null
      }]).select().single();

      if (error) throw error;

      // 2. Adiciona instantaneamente ao simulado ativo
      await adicionarQuestao(data.id);
      
      // 3. Limpa o formulário e volta pra aba de busca
      setQEnunciado(''); setQImagemUrl(''); setQAltA(''); setQAltB(''); setQAltC(''); setQAltD(''); setQAltE(''); setQComentario('');
      setAbaEsquerda('BUSCA');
      alert('Questão criada e adicionada ao simulado com sucesso!');

    } catch (err) {
      console.error(err);
      alert('Erro ao salvar a questão.');
    } finally {
      setSalvandoQuestaoManual(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-brand-orange" />
      </div>
    );
  }

  // ==========================================
  // RENDER: TELA DE LISTAGEM
  // ==========================================
  if (view === 'LIST') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <Link to="/admin/dashboard" className="p-2 bg-white rounded-xl shadow-sm border border-slate-200 hover:bg-slate-50">
                <ArrowLeft className="w-5 h-5 text-slate-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                  <Target className="w-6 h-6 text-brand-orange" />
                  Gerenciar Simulados
                </h1>
                <p className="text-sm text-slate-500 font-medium mt-1">Crie provas e vincule as questões.</p>
              </div>
            </div>
            <button onClick={() => setView('CREATE')} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all shadow-md">
              <Plus className="w-5 h-5" /> Novo Simulado
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {simulados.map((simulado) => (
              <div key={simulado.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-orange bg-orange-50 px-2 py-1 rounded-md mb-3 inline-block">
                    {simulado.turmas?.nome}
                  </span>
                  <h3 className="font-bold text-slate-900 mb-1 leading-tight">{simulado.titulo}</h3>
                  <p className="text-sm text-slate-500 mb-4">{simulado.tempo_minutos} minutos</p>
                </div>
                <button onClick={() => abrirGerenciador(simulado)} className="w-full py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-sm font-bold transition-colors">
                  Gerenciar Questões
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TELA DE CRIAÇÃO
  // ==========================================
  if (view === 'CREATE') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setView('LIST')} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </button>

          <form onSubmit={handleCriarSimulado} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-black text-slate-900 mb-6">Criar Novo Simulado</h2>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Turma Alvo</label>
              <select value={turmaId} onChange={e => setTurmaId(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange">
                {turmas.map(t => <option key={t.id} value={t.id}>{t.nome}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Nome do Simulado</label>
              <input required value={titulo} onChange={e => setTitulo(e.target.value)} placeholder="Ex: Simulado ENEM 01" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Tempo (em minutos)</label>
              <input required type="number" value={tempo} onChange={e => setTempo(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">Descrição (Opcional)</label>
              <textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange resize-none" placeholder="Instruções para a prova..." />
            </div>

            <div className="pt-4 flex justify-end">
              <button disabled={criando} type="submit" className="flex items-center gap-2 px-8 py-3 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all disabled:opacity-70">
                {criando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                Salvar e Adicionar Questões
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: TELA DE GERENCIAMENTO (Abas: Busca e Manual)
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto flex flex-col h-[calc(100vh-4rem)]">
        
        <div className="flex items-center justify-between shrink-0 mb-6">
          <div>
            <button onClick={() => { setView('LIST'); fetchInicial(); }} className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-2 transition-colors">
              <ArrowLeft className="w-4 h-4" /> Voltar para lista
            </button>
            <h2 className="text-2xl font-black text-slate-900 flex items-center gap-2">
              <Target className="w-6 h-6 text-brand-orange" /> {simuladoAtivo.titulo}
            </h2>
          </div>
          <div className="text-right">
            <span className="text-xs font-bold text-slate-500 uppercase">Total de Questões</span>
            <div className="text-2xl font-black text-brand-orange">{questoesDoSimulado.length}</div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">
          
          {/* LADO ESQUERDO: CONTROLADOR DE ABAS */}
          <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
            
            {/* Cabecalho de Abas */}
            <div className="flex border-b border-slate-200 shrink-0 bg-slate-50">
              <button 
                onClick={() => setAbaEsquerda('BUSCA')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${abaEsquerda === 'BUSCA' ? 'border-brand-orange text-brand-orange bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Search className="w-4 h-4" /> Buscar no Banco
              </button>
              <button 
                onClick={() => setAbaEsquerda('MANUAL')}
                className={`flex-1 py-4 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-colors ${abaEsquerda === 'MANUAL' ? 'border-brand-orange text-brand-orange bg-white' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
              >
                <Plus className="w-4 h-4" /> Criar Questão Inédita
              </button>
            </div>

            {/* CONTEÚDO DA ABA: BUSCA */}
            {abaEsquerda === 'BUSCA' && (
              <div className="flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-slate-100 shrink-0">
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={termoBusca} 
                      onChange={e => setTermoBusca(e.target.value)} 
                      onKeyDown={e => e.key === 'Enter' && buscarQuestoes()}
                      placeholder="Busque por palavras-chave..." 
                      className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-brand-orange text-sm font-medium" 
                    />
                    <button onClick={buscarQuestoes} className="p-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors">
                      {buscando ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {questoesBusca.length === 0 && !buscando ? (
                    <div className="text-center p-8 text-slate-400 font-medium text-sm">Pesquise para listar questões.</div>
                  ) : (
                    questoesBusca.map(q => {
                      const jaAdicionada = questoesDoSimulado.find(qs => qs.questao_id === q.id);
                      return (
                        <div key={q.id} className={`p-4 border rounded-xl flex items-start gap-4 ${jaAdicionada ? 'border-emerald-200 bg-emerald-50' : 'border-slate-100 hover:border-brand-orange'}`}>
                          <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 block">{q.materia}</span>
                            <p className="text-sm text-slate-700 font-medium line-clamp-2">{q.enunciado}</p>
                          </div>
                          <button 
                            onClick={() => adicionarQuestao(q.id)}
                            disabled={jaAdicionada}
                            className={`p-2 rounded-lg shrink-0 transition-colors ${jaAdicionada ? 'text-emerald-500 cursor-not-allowed' : 'bg-orange-50 text-brand-orange hover:bg-brand-orange hover:text-white'}`}
                          >
                            {jaAdicionada ? <CheckCircle2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            {/* CONTEÚDO DA ABA: CRIAR MANUAL EXPRESS */}
            {abaEsquerda === 'MANUAL' && (
              <div className="flex-1 overflow-y-auto p-5 md:p-6">
                <form onSubmit={handleCriarQuestaoManual} className="space-y-4">
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Matéria</label>
                      <input required value={qMateria} onChange={e => setQMateria(e.target.value)} placeholder="Ex: Matemática" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-orange" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Resposta Correta</label>
                      <select value={qCorreta} onChange={e => setQCorreta(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-orange">
                        {['A', 'B', 'C', 'D', 'E'].map(letra => <option key={letra} value={letra}>{letra}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Enunciado / Texto Base</label>
                    <textarea required value={qEnunciado} onChange={e => setQEnunciado(e.target.value)} rows="3" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-orange resize-none" placeholder="Digite o corpo da questão aqui..." />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <ImageIcon className="w-4 h-4 text-slate-400" /> Link da Imagem / Gráfico (Opcional)
                    </label>
                    <input type="url" value={qImagemUrl} onChange={e => setQImagemUrl(e.target.value)} placeholder="https://exemplo.com/grafico.png" className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-orange" />
                  </div>

                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider mb-2">Alternativas</h4>
                    {['A', 'B', 'C', 'D', 'E'].map(letra => {
                      const valores = { A: qAltA, B: qAltB, C: qAltC, D: qAltD, E: qAltE };
                      const setters = { A: setQAltA, B: setQAltB, C: setQAltC, D: setQAltD, E: setQAltE };
                      return (
                        <div key={letra} className="flex gap-2">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm shrink-0 ${qCorreta === letra ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-600'}`}>{letra}</span>
                          <input required value={valores[letra]} onChange={e => setters[letra](e.target.value)} placeholder={`Alternativa ${letra}`} className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-brand-orange" />
                        </div>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1">
                      <FileText className="w-4 h-4 text-slate-400" /> Comentário do Professor (Opcional)
                    </label>
                    <textarea value={qComentario} onChange={e => setQComentario(e.target.value)} rows="2" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm outline-none focus:border-brand-orange resize-none" placeholder="Explicação para quando o aluno errar..." />
                  </div>

                  <button disabled={salvandoQuestaoManual} type="submit" className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2">
                    {salvandoQuestaoManual ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                    Criar e Adicionar ao Simulado
                  </button>

                </form>
              </div>
            )}
          </div>

          {/* LADO DIREITO: QUESTÕES DA PROVA */}
          <div className="w-full lg:w-[400px] bg-white rounded-3xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
            <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
              <h3 className="font-bold text-slate-800">Questões do Simulado</h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {questoesDoSimulado.length === 0 ? (
                <div className="text-center p-8 text-slate-400 font-medium text-sm">Nenhuma questão adicionada ainda.</div>
              ) : (
                questoesDoSimulado.map((item, idx) => (
                  <div key={item.questao_id} className="p-3 border border-slate-100 rounded-xl flex items-center gap-3 hover:border-slate-300 transition-colors">
                    <div className="w-6 h-6 rounded bg-slate-100 text-slate-500 flex items-center justify-center text-xs font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-600 font-medium truncate">{item.questoes?.enunciado}</p>
                    </div>
                    <button onClick={() => removerQuestao(item.questao_id)} className="text-slate-300 hover:text-red-500 transition-colors p-1 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}