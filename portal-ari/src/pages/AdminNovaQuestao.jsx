import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, FileQuestion, BookOpen, 
  Target, AlignLeft, CheckCircle2, MessageSquare, LayoutDashboard, ChevronDown
} from 'lucide-react';

export default function AdminNovaQuestao() {
  const navigate = useNavigate();
  const [gabarito, setGabarito] = useState('A');

  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-800 overflow-hidden">
      
      {/* SIDEBAR DO ADMIN */}
      <aside className="w-64 bg-[#1e2330] text-slate-400 flex flex-col hidden lg:flex shrink-0">
        <div className="h-20 flex items-center px-6 border-b border-slate-700/50">
          <h1 className="text-2xl font-black text-white tracking-tight">
            Admin<span className="text-brand-orange">Ari</span>
          </h1>
        </div>
        
        <nav className="flex-1 px-4 py-8 space-y-2">
          <Link to="/admin" className="flex items-center px-4 py-3 hover:bg-slate-800 hover:text-white rounded-xl font-medium transition-all group">
            <LayoutDashboard className="w-5 h-5 mr-3 group-hover:text-brand-orange transition-colors" /> Visão Geral
          </Link>
          <Link to="#" className="flex items-center px-4 py-3 bg-brand-orange text-white rounded-xl font-bold transition-all shadow-md shadow-brand-orange/20">
            <FileQuestion className="w-5 h-5 mr-3" /> Questões
          </Link>
        </nav>
      </aside>

      {/* ÁREA PRINCIPAL */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* HEADER DA PÁGINA */}
        <header className="h-20 bg-white border-b border-slate-200 px-6 md:px-8 flex items-center shrink-0">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center text-sm font-semibold text-slate-500 hover:text-brand-orange transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar para o Painel
          </button>
        </header>

        {/* CONTEÚDO SCROLLÁVEL - O FORMULÁRIO */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar">
          <div className="max-w-4xl mx-auto">
            
            {/* Título da Página */}
            <div className="mb-8 flex items-center gap-4">
              <div className="w-12 h-12 bg-brand-orange text-white rounded-xl flex items-center justify-center shadow-lg shadow-brand-orange/20">
                <FileQuestion className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                  Cadastrar Nova Questão
                </h2>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  Preencha os dados abaixo para adicionar uma nova questão ao banco.
                </p>
              </div>
            </div>

            <form className="space-y-6">
              
              {/* BLOCO 1: Classificação */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <BookOpen className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    1. Classificação da Questão
                  </h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Matéria</label>
                    <select className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 font-medium appearance-none transition-all">
                      <option>Matemática e suas Tecnologias</option>
                      <option>Raciocínio Lógico</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-[2.4rem] w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Assunto (Tópico)</label>
                    <select className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 font-medium appearance-none transition-all">
                      <option>Probabilidade</option>
                      <option>Geometria Plana</option>
                      <option>Análise Combinatória</option>
                      <option>Estatística</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-[2.4rem] w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Dificuldade</label>
                    <select className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-3 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 font-medium appearance-none transition-all">
                      <option>Fácil</option>
                      <option>Médio</option>
                      <option>Difícil</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-[2.4rem] w-4 h-4 text-slate-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* BLOCO 2: Enunciado */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <AlignLeft className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    2. Enunciado
                  </h3>
                </div>
                <div>
                  <textarea 
                    rows="5" 
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 font-medium resize-none transition-all"
                    placeholder="Digite o texto da questão aqui..."
                  ></textarea>
                </div>
              </div>

              {/* BLOCO 3: Alternativas e Gabarito */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-brand-orange" />
                    <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                      3. Alternativas & Gabarito
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-brand-orange bg-orange-50 border border-orange-100 px-3 py-1 rounded-full">
                    Marque a opção correta
                  </span>
                </div>
                
                <div className="space-y-4">
                  {['A', 'B', 'C', 'D', 'E'].map((letra) => (
                    <div 
                      key={letra} 
                      onClick={() => setGabarito(letra)}
                      className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer group ${
                        gabarito === letra 
                          ? 'border-brand-orange bg-orange-50/30 shadow-sm' 
                          : 'border-slate-200 hover:border-brand-orange/40 bg-white'
                      }`}
                    >
                      {/* Radio Button Customizado */}
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-colors shrink-0 ${
                        gabarito === letra 
                          ? 'bg-brand-orange border-brand-orange text-white' 
                          : 'border-slate-300 text-transparent group-hover:border-brand-orange/40'
                      }`}>
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      
                      <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 font-black flex items-center justify-center shrink-0 group-hover:bg-slate-200 transition-colors">
                        {letra}
                      </div>
                      
                      <input 
                        type="text" 
                        onClick={(e) => e.stopPropagation()} // Evita marcar o radio ao clicar para digitar
                        className="w-full bg-transparent border-none px-2 py-2 focus:outline-none text-slate-800 font-medium placeholder-slate-400"
                        placeholder={`Texto da alternativa ${letra}...`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* BLOCO 4: Resolução Comentada (Opcional) */}
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-2 mb-6 border-b border-slate-100 pb-4">
                  <MessageSquare className="w-5 h-5 text-brand-orange" />
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    4. Resolução Comentada <span className="text-slate-400 font-medium normal-case tracking-normal">(Opcional)</span>
                  </h3>
                </div>
                <div>
                  <textarea 
                    rows="3" 
                    className="w-full bg-slate-50 border border-slate-300 text-slate-800 rounded-xl px-4 py-4 focus:outline-none focus:border-brand-orange focus:ring-2 focus:ring-brand-orange/20 font-medium resize-none transition-all"
                    placeholder="Explique o passo a passo para chegar na resposta..."
                  ></textarea>
                </div>
              </div>

              {/* RODAPÉ DO FORMULÁRIO (Botões de Ação) */}
              <div className="flex items-center justify-end gap-4 pt-2 pb-12">
                <button 
                  type="button" 
                  onClick={() => navigate('/admin')}
                  className="px-6 py-3.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl font-bold transition-all"
                >
                  Cancelar
                </button>
                <button 
                  type="button" 
                  className="flex items-center gap-2 px-8 py-3.5 bg-brand-orange hover:bg-orange-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-brand-orange/20 active:scale-95"
                >
                  <Save className="w-5 h-5" /> Salvar Questão
                </button>
              </div>

            </form>
          </div>
        </div>
      </main>
    </div>
  );
}