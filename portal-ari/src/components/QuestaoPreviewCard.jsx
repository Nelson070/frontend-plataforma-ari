import React from 'react';

const DIFICULDADE_STYLE = {
  facil: 'bg-emerald-50 text-emerald-700',
  medio: 'bg-amber-50 text-amber-700',
  dificil: 'bg-red-50 text-red-700',
};

const DIFICULDADE_LABEL = { facil: 'Fácil', medio: 'Médio', dificil: 'Difícil' };

export default function QuestaoPreviewCard({
  materia,
  assunto,
  dificuldade,
  enunciado,
  blocosEnunciado,
  imagemUrl,
  alternativas = [],
  respostaCorreta,
  comentario,
}) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-4 font-sans text-slate-800">
      
      {/* Cabeçalho do Card */}
      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
        <span className="bg-slate-100 px-2.5 py-1 rounded-lg uppercase">
          {materia || 'Matéria'} {assunto ? `> ${assunto}` : ''}
        </span>
        {dificuldade && (
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${DIFICULDADE_STYLE[dificuldade] || 'bg-slate-100 text-slate-600'}`}>
            {DIFICULDADE_LABEL[dificuldade] || dificuldade}
          </span>
        )}
      </div>

      {/* Enunciado Dinâmico (Blocos Inline ou Legado) */}
      <div className="flex flex-wrap items-center gap-2 text-slate-900 font-medium text-base leading-relaxed">
        {blocosEnunciado && blocosEnunciado.length > 0 ? (
          blocosEnunciado.map((bloco, idx) => (
            bloco.tipo === 'texto' ? (
              <span key={idx} className="inline-block">
                {bloco.valor}
              </span>
            ) : (
              <img 
                key={idx} 
                src={bloco.valor} 
                alt="Ilustração inline" 
                className="inline-block h-8 w-auto object-contain align-middle mx-1 rounded border border-slate-200 bg-white" 
              />
            )
          ))
        ) : (
          // Fallback para o modo legado caso venha texto simples
          <>
            <span className="inline-block">{enunciado || 'Enunciado da questão...'}</span>
            {imagemUrl && (
              <img src={imagemUrl} alt="Questão" className="inline-block h-10 w-auto object-contain align-middle mx-1 rounded border border-slate-200 bg-white" />
            )}
          </>
        )}
      </div>

      {/* Alternativas */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        {alternativas.map((alt) => {
          const isCorreta = respostaCorreta === alt.letra;
          return (
            <div 
              key={alt.letra} 
              className={`p-3 rounded-xl border text-sm font-medium flex items-center gap-3 transition-colors ${
                isCorreta 
                  ? 'border-brand-orange bg-orange-50/50 text-slate-900' 
                  : 'border-slate-200 bg-slate-50/50 text-slate-700'
              }`}
            >
              <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                isCorreta ? 'bg-brand-orange text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {alt.letra}
              </span>
              <span className="leading-normal">{alt.texto || `Alternativa ${alt.letra}...`}</span>
            </div>
          );
        })}
      </div>

      {/* Comentário / Resolução */}
      {comentario && (
        <div className="p-3.5 bg-blue-50 border border-blue-100 rounded-xl text-xs text-blue-900 mt-3 space-y-1">
          <span className="font-bold block text-blue-950 uppercase tracking-wider text-[10px]">Resolução Comentada:</span>
          <p className="leading-relaxed">{comentario}</p>
        </div>
      )}

    </div>
  );
}