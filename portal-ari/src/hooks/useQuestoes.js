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

  async function responder(questaoId, alternativaEscolhida, respostaCorreta) {
    return responderQuestaoAvulsa(questaoId, alternativaEscolhida, respostaCorreta);
  }

  return { questoes, total, loading, error, recarregar: carregar, responder };
}

// Versão "solta" de responder, sem precisar instanciar o hook inteiro —
// útil dentro do modo de resolução do Simulado, por exemplo.
export async function responderQuestaoAvulsa(questaoId, alternativaEscolhida, respostaCorreta) {
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

// Assuntos únicos disponíveis (já filtrados pela turma via RLS) —
// usado no hub de Simulados, aba "Por Assunto".
export function useAssuntosDisponiveis() {
  const [assuntos, setAssuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('questoes').select('assunto').then(({ data, error }) => {
      if (!error && data) {
        const unicos = [...new Set(data.map((q) => q.assunto))].sort();
        setAssuntos(unicos);
      }
      setLoading(false);
    });
  }, []);

  return { assuntos, loading };
}

// Busca um lote de questões pra montar um simulado (por assunto ou
// personalizado) e embaralha no cliente — o Supabase JS não tem
// "order by random()" direto sem uma função RPC dedicada.
export async function buscarQuestoesParaSimulado({ assunto, dificuldade, quantidade }) {
  let query = supabase.from('questoes').select('id, dificuldade');
  if (assunto) query = query.eq('assunto', assunto);
  if (dificuldade && dificuldade !== 'misto') query = query.eq('dificuldade', dificuldade);

  const { data, error } = await query;
  if (error) return { questaoIds: [], error };

  const embaralhado = [...(data ?? [])].sort(() => Math.random() - 0.5);
  return { questaoIds: embaralhado.slice(0, quantidade).map((q) => q.id), error: null };
}