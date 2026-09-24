// Helpers compartilhados para o sistema de "blocos" (texto/imagem
// intercalados) usado no enunciado e nas alternativas das questões.

export function criarBloco(tipo = 'texto') {
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`,
    tipo, // 'texto' | 'imagem'
    valor: '', // texto digitado, OU url de preview local (blob:) enquanto a imagem não foi enviada
    file: null, // File real, só existe pra blocos de imagem ainda não enviados
  };
}

// Sobe pro Storage cada bloco de imagem que ainda tem um File pendente,
// e devolve o array pronto pra salvar no banco (só {tipo, valor}).
export async function processarBlocos(supabase, blocos, turmaId, prefixo) {
  return Promise.all(
    blocos.map(async (bloco) => {
      if (bloco.tipo === 'imagem' && bloco.file) {
        const fileExt = bloco.file.name.split('.').pop();
        const fileName = `${prefixo}-${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
        const filePath = `${turmaId}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('questoes_imagens')
          .upload(filePath, bloco.file);
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('questoes_imagens').getPublicUrl(filePath);
        return { tipo: 'imagem', valor: data.publicUrl };
      }
      return { tipo: bloco.tipo, valor: bloco.valor };
    })
  );
}

// Versão em texto puro de um array de blocos — usada pra manter a
// coluna "enunciado"/"texto" preenchida (busca e listagem continuam
// funcionando mesmo pra questões feitas com blocos).
export function blocosParaTexto(blocos) {
  return blocos.map((b) => (b.tipo === 'texto' ? b.valor : '[IMAGEM]')).join(' ').trim();
}
