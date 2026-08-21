import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useSimulados({ tipo } = {}) {
  const [simulados, setSimulados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('simulados').select('*').order('created_at', { ascending: false });
    if (tipo) query = query.eq('tipo', tipo);

    const { data, error } = await query;
    if (error) setError(error);
    else setSimulados(data);
    setLoading(false);
  }, [tipo]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { simulados, loading, error, recarregar: carregar };
}

// Busca as questões de um simulado específico, na ordem certa.
export async function buscarQuestoesDoSimulado(simuladoId) {
  const { data, error } = await supabase
    .from('simulado_questoes')
    .select('ordem, questoes (*)')
    .eq('simulado_id', simuladoId)
    .order('ordem', { ascending: true });

  if (error) return { questoes: [], error };
  return { questoes: data.map((row) => row.questoes), error: null };
}

// Cria uma tentativa nova ao iniciar o simulado.
export async function iniciarTentativa(simuladoId) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { tentativa: null, error: new Error('Usuário não autenticado') };

  const { data, error } = await supabase
    .from('tentativas_simulado')
    .insert({ user_id: user.id, simulado_id: simuladoId, respostas: {} })
    .select()
    .single();

  return { tentativa: data, error };
}

// Salva as respostas e fecha a tentativa.
export async function finalizarTentativa(tentativaId, respostas, { acertos, erros, emBranco }) {
  const { data, error } = await supabase
    .from('tentativas_simulado')
    .update({
      respostas,
      acertos,
      erros,
      em_branco: emBranco,
      finalizado_em: new Date().toISOString(),
    })
    .eq('id', tentativaId)
    .select()
    .single();

  return { tentativa: data, error };
}
