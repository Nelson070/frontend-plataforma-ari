import React from 'react';
import { ImagePlus, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { criarBloco } from '../lib/blocos';

export default function BlocoEditor({ blocos, onChange, compact = false }) {
  const adicionar = (tipo) => onChange([...blocos, criarBloco(tipo)]);

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

  const imgSize = compact ? 'h-8' : 'h-10';
  const inputPad = compact ? 'p-2 text-sm' : 'p-2 text-sm';

  return (
    <div className="space-y-2">
      {blocos.map((bloco, index) => (
        <div key={bloco.id} className="flex items-center gap-2">
          {!compact && <span className="text-xs font-bold text-slate-400 w-5 shrink-0">#{index + 1}</span>}

          {bloco.tipo === 'texto' ? (
            <input
              type="text"
              value={bloco.valor}
              onChange={(e) => atualizar(bloco.id, { valor: e.target.value })}
              placeholder="Trecho de texto..."
              className={`flex-1 ${inputPad} bg-white border border-slate-200 rounded-lg outline-none focus:border-brand-orange`}
            />
          ) : (
            <div className="flex-1 flex items-center gap-2">
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
                <div className="flex items-center gap-2">
                  <img src={bloco.valor} alt="Preview" className={`${imgSize} w-auto object-contain rounded border bg-white p-0.5`} />
                  <button
                    type="button"
                    onClick={() => {
                      if (bloco.file) URL.revokeObjectURL(bloco.valor);
                      atualizar(bloco.id, { valor: '', file: null });
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold cursor-pointer"
                  >
                    Remover
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-0.5 shrink-0">
            <button type="button" onClick={() => mover(index, -1)} disabled={index === 0} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
              <ArrowUp className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => mover(index, 1)} disabled={index === blocos.length - 1} className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer">
              <ArrowDown className="w-3.5 h-3.5" />
            </button>
            <button type="button" onClick={() => remover(bloco.id)} className="p-1 text-red-400 hover:text-red-600 cursor-pointer">
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}

      <div className="flex gap-2 pt-1">
        <button type="button" onClick={() => adicionar('texto')} className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-bold text-xs cursor-pointer">
          + Texto
        </button>
        <button type="button" onClick={() => adicionar('imagem')} className="px-2.5 py-1 bg-orange-50 hover:bg-orange-100 text-brand-orange rounded-lg font-bold text-xs cursor-pointer">
          + Imagem
        </button>
      </div>
    </div>
  );
}