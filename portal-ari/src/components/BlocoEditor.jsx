import React from 'react';
import { ImagePlus, Trash2, ArrowUp, ArrowDown, Images, Plus } from 'lucide-react';
import { criarBloco, criarImagemDoGrupo, contarImagens, MAX_IMAGENS_POR_GRUPO } from '../lib/blocos';

const MAX_IMAGENS = 4;

// Editor reutilizável de blocos texto/imagem/grupo-de-imagens.
// Usado pro enunciado e pra cada alternativa.
export default function BlocoEditor({ blocos, onChange, compact = false }) {
  const totalImagensAvulsas = contarImagens(blocos);
  const limiteAtingido = totalImagensAvulsas >= MAX_IMAGENS;

  const adicionar = (tipo) => {
    if (tipo === 'imagem' && limiteAtingido) return;
    const novoBloco = criarBloco(tipo);
    if (tipo === 'imagens') novoBloco.valor = [criarImagemDoGrupo()];
    onChange([...blocos, novoBloco]);
  };

  const remover = (id) => {
    if (blocos.length === 1) return;
    const bloco = blocos.find((b) => b.id === id);
    if (bloco?.file && bloco.valor) URL.revokeObjectURL(bloco.valor);
    onChange(blocos.filter((b) => b.id !== id));
  };

  const atualizar = (id, updates) => {
    onChange(blocos.map((b) => (b.id === id ? { ...b, ...updates } : b)));
  };

  const mover = (index, direcao) => {
    const novoIndex = index + direcao;
    if (novoIndex < 0 || novoIndex >= blocos.length) return;
    const novos = [...blocos];
    [novos[index], novos[novoIndex]] = [novos[novoIndex], novos[index]];
    onChange(novos);
  };

  // --- helpers específicos do bloco tipo "imagens" (grupo lado a lado) ---
  const atualizarImagemDoGrupo = (blocoId, imgId, updates) => {
    onChange(blocos.map((b) => {
      if (b.id !== blocoId) return b;
      return { ...b, valor: b.valor.map((img) => (img.id === imgId ? { ...img, ...updates } : img)) };
    }));
  };

  const adicionarImagemAoGrupo = (blocoId) => {
    onChange(blocos.map((b) => {
      if (b.id !== blocoId || b.valor.length >= MAX_IMAGENS_POR_GRUPO) return b;
      return { ...b, valor: [...b.valor, criarImagemDoGrupo()] };
    }));
  };

  const removerImagemDoGrupo = (blocoId, imgId) => {
    onChange(blocos.map((b) => {
      if (b.id !== blocoId) return b;
      const img = b.valor.find((i) => i.id === imgId);
      if (img?.file && img.url) URL.revokeObjectURL(img.url);
      return { ...b, valor: b.valor.filter((i) => i.id !== imgId) };
    }));
  };

  const imgSize = compact ? 'h-8' : 'h-10';
  const inputPad = compact ? 'p-2 text-sm' : 'p-2 text-sm';

  return (
    <div className="space-y-2">
      {blocos.map((bloco, index) => (
        <div key={bloco.id} className={bloco.tipo === 'imagens' ? '' : 'flex items-center gap-2'}>

          {bloco.tipo === 'imagens' ? (
            <div className="p-3 bg-slate-50 border border-dashed border-slate-300 rounded-xl">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                  <Images className="w-3.5 h-3.5 text-brand-orange" />
                  Grupo lado a lado ({bloco.valor.length}/{MAX_IMAGENS_POR_GRUPO})
                </span>
                <div className="flex items-center gap-0.5 shrink-0">
                  <button type="button" onClick={() => mover(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => mover(index, 1)} disabled={index === blocos.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button type="button" onClick={() => remover(bloco.id)} className="p-1 text-red-400 hover:text-red-600">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {bloco.valor.map((img) => (
                  <div key={img.id} className="w-40 p-2 bg-white border border-slate-200 rounded-lg space-y-1.5">
                    {!img.url ? (
                      <label className="cursor-pointer flex flex-col items-center justify-center gap-1 py-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 hover:bg-slate-100 text-center">
                        <ImagePlus className="w-4 h-4 text-brand-orange" />
                        <span className="text-[11px] font-bold text-slate-600">Enviar imagem</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files[0];
                            if (file) atualizarImagemDoGrupo(bloco.id, img.id, { file, url: URL.createObjectURL(file) });
                          }}
                          className="hidden"
                        />
                      </label>
                    ) : (
                      <img src={img.url} alt="Preview" className="w-full h-20 object-contain rounded bg-slate-50" />
                    )}
                    <input
                      type="text"
                      value={img.legenda}
                      onChange={(e) => atualizarImagemDoGrupo(bloco.id, img.id, { legenda: e.target.value })}
                      placeholder="Ex: Figura A"
                      className="w-full p-1.5 text-xs bg-white border border-slate-200 rounded-md outline-none focus:border-brand-orange"
                    />
                    <button
                      type="button"
                      onClick={() => removerImagemDoGrupo(bloco.id, img.id)}
                      className="w-full text-center text-[11px] font-bold text-red-500 hover:text-red-700"
                    >
                      Remover
                    </button>
                  </div>
                ))}

                {bloco.valor.length < MAX_IMAGENS_POR_GRUPO && (
                  <button
                    type="button"
                    onClick={() => adicionarImagemAoGrupo(bloco.id)}
                    className="w-40 h-full min-h-[110px] flex flex-col items-center justify-center gap-1 border border-dashed border-slate-300 rounded-lg text-slate-400 hover:text-brand-orange hover:border-brand-orange transition-colors"
                  >
                    <Plus className="w-5 h-5" />
                    <span className="text-[11px] font-bold">Adicionar imagem</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <>
              {!compact && <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{index + 1}</span>}

              {bloco.tipo === 'texto' ? (
                <input
                  type="text"
                  required
                  value={bloco.valor}
                  onChange={(e) => atualizar(bloco.id, { valor: e.target.value })}
                  placeholder="Trecho de texto..."
                  className={`flex-1 ${inputPad} bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-orange`}
                />
              ) : (
                <div className="flex-1 flex items-center gap-2 flex-wrap">
                  {!bloco.valor ? (
                    <label className="cursor-pointer px-3 py-1.5 border border-dashed border-slate-300 rounded-lg bg-white text-xs font-bold text-slate-600 hover:bg-slate-100 flex items-center gap-1">
                      <ImagePlus className="w-4 h-4 text-brand-orange" /> Enviar imagem
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) atualizar(bloco.id, { file, valor: URL.createObjectURL(file) });
                        }}
                        className="hidden"
                      />
                    </label>
                  ) : (
                    <>
                      <img src={bloco.valor} alt="Preview" className={`${imgSize} w-auto object-contain rounded border bg-white p-0.5 shrink-0`} />
                      <input
                        type="text"
                        value={bloco.legenda || ''}
                        onChange={(e) => atualizar(bloco.id, { legenda: e.target.value })}
                        placeholder="Legenda (opcional)"
                        className="flex-1 min-w-[140px] p-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-orange"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (bloco.file) URL.revokeObjectURL(bloco.valor);
                          atualizar(bloco.id, { valor: '', file: null, legenda: '' });
                        }}
                        className="text-red-500 hover:text-red-700 text-xs font-bold shrink-0"
                      >
                        Remover
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="flex items-center gap-0.5 shrink-0">
                <button type="button" onClick={() => mover(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowUp className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => mover(index, 1)} disabled={index === blocos.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30">
                  <ArrowDown className="w-3.5 h-3.5" />
                </button>
                <button type="button" onClick={() => remover(bloco.id)} className="p-1 text-red-400 hover:text-red-600">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          )}
        </div>
      ))}

      <div className="flex items-center gap-2 pt-1 flex-wrap">
        <button type="button" onClick={() => adicionar('texto')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs">
          + Texto
        </button>
        <button
          type="button"
          onClick={() => adicionar('imagem')}
          disabled={limiteAtingido}
          title={limiteAtingido ? 'Limite de 4 imagens avulsas atingido' : ''}
          className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed text-brand-orange rounded-lg font-bold text-xs"
        >
          + Imagem
        </button>
        <button
          type="button"
          onClick={() => adicionar('imagens')}
          className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg font-bold text-xs flex items-center gap-1"
        >
          <Images className="w-3.5 h-3.5" /> + Imagens lado a lado
        </button>
        <span className="text-xs text-slate-400">{totalImagensAvulsas}/{MAX_IMAGENS} avulsas</span>
      </div>
    </div>
  );
}