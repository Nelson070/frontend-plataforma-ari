// Helpers compartilhados para o sistema de "blocos" (texto/imagem
// intercalados) usado no enunciado e nas alternativas das questões.
//
// Tipos de bloco:
//   'texto'   — valor: string
//   'imagem'  — uma imagem sozinha na linha. valor: url, legenda: string opcional
//   'imagens' — um GRUPO de até 4 imagens lado a lado (ex: "Figura A" / "Figura B").
//               valor: array de { id, url, legenda, file }

export const MAX_IMAGENS_POR_GRUPO = 4;

export function criarBloco(tipo = 'texto') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    tipo, // 'texto' | 'imagem' | 'imagens'
    valor: tipo === 'imagens' ? [] : '',
    legenda: '', // só usado em 'imagem' — ex: "Figura A"
    file: null,  // só usado em 'imagem' — File pendente de upload
  };
}

export function criarImagemDoGrupo() {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    url: '',
    legenda: '',
    file: null,
  };
}

// Conta quantas imagens existem no array de blocos (útil para validações e limites)
export function contarImagens(blocos) {
  if (!blocos) return 0;
  return blocos.reduce((total, b) => {
    if (b.tipo === 'imagem') return total + 1;
    if (b.tipo === 'imagens' && Array.isArray(b.valor)) return total + b.valor.length;
    return total;
  }, 0);
}

// Sobe pro Storage cada bloco de imagem (ou cada imagem dentro de um grupo)
// que ainda tem um File pendente, e devolve o array pronto pra salvar no banco.
export async function processarBlocos(supabase, blocos, turmaId, prefixo) {
  return Promise.all(
    blocos.map(async (bloco) => {
      if (bloco.tipo === 'imagem') {
        if (bloco.file) {
          const url = await enviarImagem(supabase, bloco.file, turmaId, prefixo);
          return { tipo: 'imagem', valor: url, legenda: bloco.legenda || '' };
        }
        return { tipo: 'imagem', valor: bloco.valor, legenda: bloco.legenda || '' };
      }

      if (bloco.tipo === 'imagens') {
        const imagens = await Promise.all(
          bloco.valor.map(async (img) => {
            const url = img.file ? await enviarImagem(supabase, img.file, turmaId, prefixo) : img.url;
            return { url, legenda: img.legenda || '' };
          })
        );
        return { tipo: 'imagens', valor: imagens };
      }

      return { tipo: bloco.tipo, valor: bloco.valor };
    })
  );
}

async function enviarImagem(supabase, file, turmaId, prefixo) {
  const fileExt = file.name.split('.').pop();
  const fileName = `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
  const filePath = `${turmaId}/${fileName}`;

  const { error: uploadError } = await supabase.storage.from('questoes_imagens').upload(filePath, file);
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from('questoes_imagens').getPublicUrl(filePath);
  return data.publicUrl;
}

// Versão em texto puro de um array de blocos — usada pra manter a
// coluna "enunciado"/"texto" preenchida (busca e listagem continuam
// funcionando mesmo pra questões feitas com blocos).
export function blocosParaTexto(blocos) {
  return blocos
    .map((b) => {
      if (b.tipo === 'texto') return b.valor;
      if (b.tipo === 'imagens') return `[${b.valor.length} IMAGENS]`;
      return '[IMAGEM]';
    })
    .join(' ')
    .trim();
}