import React from 'react';

// Renderiza um array de blocos [{tipo, valor, legenda}] em fluxo:
// - 'texto': flui normalmente.
// - 'imagem': uma figura sozinha, com legenda opcional embaixo.
// - 'imagens': um GRUPO de até 4 imagens deliberadamente lado a lado
//   (estilo "Figura A / Figura B" do ENEM) — sempre juntas, não depende
//   de wrap por sorte.
export default function RenderBlocos({ blocos, imgHeight = 'h-40', placeholder }) {
  if (!blocos || blocos.length === 0) {
    return placeholder ? <span className="text-slate-300 italic">{placeholder}</span> : null;
  }

  return (
    <span className="inline-flex flex-wrap items-start gap-3 align-middle">
      {blocos.map((b, i) => {
        if (b.tipo === 'imagens') {
          return (
            <span key={i} className="inline-flex flex-wrap gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100">
              {b.valor.map((img, j) => (
                img.url ? (
                  <span key={j} className="inline-flex flex-col items-center gap-1">
                    <img
                      src={img.url}
                      alt={img.legenda || ''}
                      className={`${imgHeight} w-auto max-w-full object-contain rounded-lg border border-slate-200 bg-white p-1.5`}
                    />
                    {img.legenda && (
                      <span className="text-xs font-bold text-slate-500">{img.legenda}</span>
                    )}
                  </span>
                ) : null
              ))}
            </span>
          );
        }

        if (b.tipo === 'imagem') {
          return b.valor ? (
            <span key={i} className="inline-flex flex-col items-center gap-1 align-top">
              <img
                src={b.valor}
                alt={b.legenda || ''}
                className={`${imgHeight} w-auto max-w-full object-contain rounded-lg border border-slate-200 bg-white p-1.5`}
              />
              {b.legenda && (
                <span className="text-xs font-bold text-slate-500">{b.legenda}</span>
              )}
            </span>
          ) : null;
        }

        return <span key={i} className="self-center">{b.valor}</span>;
      })}
    </span>
  );
}