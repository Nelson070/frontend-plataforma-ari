import React from 'react';

// Renderiza um array de blocos [{tipo, valor}] em fluxo inline —
// texto e imagem se intercalam na mesma linha/parágrafo.
// Usado tanto no enunciado quanto nas alternativas.
export default function RenderBlocos({ blocos, imgHeight = 'h-12', placeholder }) {
  if (!blocos || blocos.length === 0) {
    return placeholder ? <span className="text-slate-300 italic">{placeholder}</span> : null;
  }

  return (
    <span className="inline-flex flex-wrap items-center gap-1.5 align-middle">
      {blocos.map((b, i) =>
        b.tipo === 'imagem' ? (
          b.valor ? (
            <img
              key={i}
              src={b.valor}
              alt=""
              className={`${imgHeight} w-auto object-contain rounded border border-slate-200 bg-white p-0.5 inline-block align-middle`}
            />
          ) : null
        ) : (
          <span key={i}>{b.valor}</span>
        )
      )}
    </span>
  );
}
