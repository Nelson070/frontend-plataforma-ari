import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useQuestoes({ materia, assunto, assuntoId, dificuldade, busca, pagina = 0, porPagina = 10 } = {}) {
  const [questoes, setQuestoes] = useState([]);
  const [assuntosArvore, setAssuntosArvore] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Carrega a árvore de assuntos para o menu lateral do aluno
  useEffect(() => {
    async function carregarArvore() {
      const { data, error } = await supabase
        .from('assuntos_hierarquia')
        .select('*')
        .order('created_at', { ascending: true });

      if (!error && data) {
        setAssuntosArvore(data);
      }
    }
    carregarArvore();
  }, []);

  const carregar = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Traz a questão e os dados da tabela assuntos_hierarquia vinculada
    let query = supabase
      .from('questoes')
      .select('*, assuntos_hierarquia(*)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(pagina * porPagina, pagina * porPagina + porPagina - 1);

    if (materia) query = query.eq('materia', materia);
    if (assuntoId) query = query.eq('assunto_id', assuntoId);
    else if (assunto) query = query.eq('assunto', assunto);
    
    if (dificuldade) query = query.eq('dificuldade', dificuldade);
    if (busca) query = query.ilike('enunciado', `%${busca}%`);

    const { data, error, count } = await query;

    if (error) {
      setError(error);
    } else {
      setQuestoes(data || []);
      setTotal(count ?? 0);
    }
    setLoading(false);
  }, [materia, assunto, assuntoId, dificuldade, busca, pagina, porPagina]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  async function responder(questaoId, alternativaEscolhida, respostaCorreta) {
    return responderQuestaoAvulsa(questaoId, alternativaEscolhida, respostaCorreta);
  }

  return { questoes, assuntosArvore, total, loading, error, recarregar: carregar, responder };
}

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

export function useAssuntosDisponiveis() {
  const [assuntos, setAssuntos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('assuntos_hierarquia').select('nome').then(({ data, error }) => {
      if (!error && data) {
        const unicos = [...new Set(data.map((q) => q.nome))].sort();
        setAssuntos(unicos);
      }
      setLoading(false);
    });
  }, []);

  return { assuntos, loading };
}

export async function buscarQuestoesParaSimulado({ assuntoId, dificuldade, quantidade }) {
  let query = supabase.from('questoes').select('id, dificuldade');
  if (assuntoId) query = query.eq('assunto_id', assuntoId);
  if (dificuldade && dificuldade !== 'misto') query = query.eq('dificuldade', dificuldade);

  const { data, error } = await query;
  if (error) return { questaoIds: [], error };

  const embaralhado = [...(data ?? [])].sort(() => Math.random() - 0.5);
  return { questaoIds: embaralhado.slice(0, quantidade).map((q) => q.id), error: null };
}