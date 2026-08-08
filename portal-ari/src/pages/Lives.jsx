import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlayCircle, MessageSquare, Send, Users, Calendar, Download, MoreVertical, ArrowLeft } from 'lucide-react';

export default function Lives() {
  const navigate = useNavigate();
  const [mensagem, setMensagem] = useState('');
  const [chat, setChat] = useState([
    { id: 1, aluno: 'João Silva', texto: 'Boa noite, professor! A aula vai ficar gravada?', isMe: false },
    { id: 2, aluno: 'Maria Oliveira', texto: 'A imagem e o áudio estão perfeitos aqui.', isMe: false },
  ]);

  const handleEnviarMensagem = (e) => {
    e.preventDefault();
    if (!mensagem.trim()) return;

    setChat([...chat, { id: Date.now(), aluno: 'Você', texto: mensagem, isMe: true }]);
    setMensagem('');
  };

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#f3f4f6] font-sans overflow-hidden">

      {/* LADO ESQUERDO: Área Principal (Vídeo + Detalhes) */}
      <div className="flex-1 flex flex-col overflow-y-auto">

        {/* HEADER */}
        <header className="h-16 bg-slate-950 px-6 flex items-center border-b border-slate-800 shrink-0">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-9 h-9 rounded-full bg-slate-900 flex items-center justify-center text-slate-300 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
            aria-label="Voltar ao dashboard"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>
          <div className="ml-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-orange mb-0.5">Ao Vivo</p>
            <h1 className="text-sm font-bold text-white">Trigonometria</h1>
          </div>
        </header>

        {/* Player */}
        <div className="w-full bg-slate-900">
          <div className="max-w-5xl w-full mx-auto p-4 lg:p-6">
            <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-slate-800 group">

              <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 bg-gradient-to-b from-transparent to-slate-900/80">
                <PlayCircle className="w-16 h-16 mb-3 text-brand-orange transition-transform group-hover:scale-110 duration-300" />
                <p className="font-semibold text-sm">A transmissão começará em breve</p>
              </div>

              <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-2 animate-pulse">
                  <span className="w-2 h-2 bg-white rounded-full"></span> AO VIVO
                </span>
                <span className="bg-slate-950/80 backdrop-blur-sm text-white text-xs font-medium px-3 py-1.5 rounded-md flex items-center gap-1.5 border border-slate-800">
                  <Users className="w-4 h-4" /> 1.240 assistindo
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Detalhes da Aula */}
        <div className="flex-1 bg-[#f3f4f6]">
          <div className="max-w-5xl w-full mx-auto p-6 lg:px-8 lg:py-8">
            <div className="flex flex-col md:flex-row gap-6 justify-between items-start">

              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4 flex-wrap">
                  <span className="bg-orange-50 text-brand-orange text-xs font-bold px-3 py-1.5 rounded-md uppercase tracking-wider border border-orange-100">
                    Trigonometria
                  </span>
                  <span className="text-slate-500 text-sm flex items-center gap-1.5 font-medium">
                    <Calendar className="w-4 h-4" /> 04 de Agosto, 19:00
                  </span>
                </div>
                <h1 className="text-2xl lg:text-3xl font-black text-slate-900 mb-3 tracking-tight">
                  Aulão de Véspera: Revisão Geral
                </h1>
                <p className="text-slate-600 text-base leading-relaxed max-w-2xl">
                  Prepare-se para revisar os tópicos mais cobrados pela banca. Traga suas dúvidas sobre Licitações e Contratos para o chat e acompanhe com o material em PDF!
                </p>
              </div>

              <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:border-brand-orange hover:text-brand-orange text-slate-700 font-bold text-sm rounded-xl transition-colors shrink-0">
                <Download className="w-4.5 h-4.5" />
                Material de Apoio
              </button>
            </div>

            <hr className="my-7 border-slate-200" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=Professor&backgroundColor=f3f4f6"
                  alt="Professor"
                  className="w-12 h-12 rounded-full border-2 border-brand-orange bg-white"
                />
                <div>
                  <p className="font-bold text-slate-900">Prof. Carlos Eduardo</p>
                  <p className="text-sm text-slate-500 font-medium">Professor de Trigonometria</p>
                </div>
              </div>
              <button className="p-2 text-slate-400 hover:text-brand-orange rounded-full hover:bg-orange-50 transition-colors">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* LADO DIREITO: Chat Ao Vivo */}
      <div className="w-full lg:w-[360px] bg-white border-l border-slate-200 flex flex-col h-[50vh] lg:h-screen shrink-0">

        <div className="h-16 px-5 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4.5 h-4.5 text-brand-orange" />
            <h2 className="font-bold text-slate-900 text-sm">Chat da Turma</h2>
          </div>
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-slate-50">
          {chat.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.isMe ? 'items-end' : 'items-start'}`}>
              <span className={`text-xs font-semibold mb-1 ${msg.isMe ? 'text-brand-orange mr-1' : 'text-slate-500 ml-1'}`}>
                {msg.aluno}
              </span>
              <div className={`px-4 py-2.5 rounded-2xl max-w-[85%] text-sm ${
                msg.isMe
                  ? 'bg-brand-orange text-white rounded-tr-sm'
                  : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
              }`}>
                {msg.texto}
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <form onSubmit={handleEnviarMensagem} className="relative flex items-center">
            <input
              type="text"
              value={mensagem}
              onChange={(e) => setMensagem(e.target.value)}
              placeholder="Envie sua dúvida..."
              className="w-full pl-5 pr-14 py-3 bg-slate-50 border border-slate-200 rounded-full focus:outline-none focus:ring-1 focus:ring-brand-orange focus:border-brand-orange text-sm font-medium transition-colors"
            />
            <button
              type="submit"
              disabled={!mensagem.trim()}
              className="absolute right-1.5 w-9 h-9 bg-brand-orange hover:bg-orange-600 disabled:bg-slate-300 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}