import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// RLS já garante que só vêm questões da turma do aluno logado —
// aqui só aplicamos os filtros extras que a tela de Banco de Questões oferece.
export function useQuestoes({ materia, assunto, dificuldade, busca, pagina = 0, porPagina = 10 } = {}) {
  const [questoes, setQuestoes] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    let query = supabase
      .from('questoes')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pagina * porPagina, pagina * porPagina + porPagina - 1);

    if (materia) query = query.eq('materia', materia);
    if (assunto) query = query.eq('assunto', assunto);
    if (dificuldade) query = query.eq('dificuldade', dificuldade);
    if (busca) query = query.ilike('enunciado', `%${busca}%`);

    const { data, error, count } = await query;

    if (error) {
      setError(error);
    } else {
      setQuestoes(data);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [materia, assunto, dificuldade, busca, pagina, porPagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  // Salva a resposta do aluno e retorna se acertou (não expõe a resposta_correta em texto).
  async function responder(questaoId, alternativaEscolhida, respostaCorreta) {
    const correta = alternativaEscolhida === respostaCorreta;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { correta, error: new Error('Usuário não autenticado') };

    const { error } = await supabase.from('respostas_questoes').insert({
      user_id: user.id,
      questao_id: questaoId,
      alternativa_escolhida: alternativaEscolhida,
      correta,
    });

    return { correta, error };
  }

  return { questoes, total, loading, error, recarregar: carregar, responder };
}
