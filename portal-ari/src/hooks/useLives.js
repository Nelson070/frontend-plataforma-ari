import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

export function useAdminVideoaulas({ busca, turmaId } = {}) {
  const [videoaulas, setVideoaulas] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVideoaulas = useCallback(async () => {
    setLoading(true);
    let query = supabase.from('aulas').select('*, turmas(nome)');

    if (turmaId) {
      query = query.eq('turma_id', turmaId);
    }
    if (busca) {
      query = query.ilike('titulo', `%${busca}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    if (!error) setVideoaulas(data || []);
    setLoading(false);
  }, [busca, turmaId]);

  useEffect(() => {
    fetchVideoaulas();
  }, [fetchVideoaulas]);

  const excluirVideoaula = async (id) => {
    const { error } = await supabase.from('aulas').delete().eq('id', id);
    if (!error) {
      setVideoaulas(prev => prev.filter(v => v.id !== id));
    }
  };

  return { videoaulas, loading, excluirVideoaula };
}

export function useAdminLives({ busca, turmaId } = {}) {
  const [lives, setLives] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLives = useCallback(async () => {
    setLoading(true);
    // Se você tiver uma tabela 'lives' separada ou usar a mesma de aulas, ajuste aqui. 
    // Como padrão, vamos buscar na tabela 'lives' ou 'aulas' filtrando por tipo se houver.
    let query = supabase.from('lives').select('*, turmas(nome)');

    if (turmaId) {
      query = query.eq('turma_id', turmaId);
    }
    if (busca) {
      query = query.ilike('titulo', `%${busca}%`);
    }

    const { data, error } = await query.order('data_hora', { ascending: true });
    if (!error) setLives(data || []);
    setLoading(false);
  }, [busca, turmaId]);

  useEffect(() => {
    fetchLives();
  }, [fetchLives]);

  const excluirLive = async (id) => {
    const { error } = await supabase.from('lives').delete().eq('id', id);
    if (!error) {
      setLives(prev => prev.filter(l => l.id !== id));
    }
  };

  const statusDaLive = (dataHora) => {
    const agora = new Date();
    const dataLive = new Date(dataHora);
    return dataLive > agora ? 'Agendada' : 'Encerrada';
  };

  return { lives, loading, excluirLive, statusDaLive };
}

export function useTurmas() {
  const [turmas, setTurmas] = useState([]);

  useEffect(() => {
    async function fetchTurmas() {
      const { data } = await supabase.from('turmas').select('*');
      if (data) setTurmas(data);
    }
    fetchTurmas();
  }, []);

  return { turmas };
}