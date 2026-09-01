import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// Módulos de uma turma, com as aulas já agrupadas dentro de cada um —
// usado tanto no admin (gerenciar) quanto no player do aluno (assistir).
export function useModulosComAulas(turmaId) {
  const [modulos, setModulos] = useState([]); // [{ id, titulo, ordem, aulas: [...] }]
  const [semModulo, setSemModulo] = useState([]); // aulas com modulo_id nulo
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    if (!turmaId) return;
    setLoading(true);
    setError(null);

    const [modulosRes, aulasRes] = await Promise.all([
      supabase.from('modulos').select('*').eq('turma_id', turmaId).order('ordem', { ascending: true }),
      supabase.from('aulas').select('*').eq('turma_id', turmaId).order('ordem', { ascending: true }),
    ]);

    if (modulosRes.error) { setError(modulosRes.error); setLoading(false); return; }
    if (aulasRes.error) { setError(aulasRes.error); setLoading(false); return; }

    const aulas = aulasRes.data ?? [];
    const gruposComAulas = (modulosRes.data ?? []).map((m) => ({
      ...m,
      aulas: aulas.filter((a) => a.modulo_id === m.id),
    }));

    setModulos(gruposComAulas);
    setSemModulo(aulas.filter((a) => !a.modulo_id));
    setLoading(false);
  }, [turmaId]);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { modulos, semModulo, loading, error, recarregar: carregar };
}

export async function criarModulo({ turmaId, titulo, ordem }) {
  const { data, error } = await supabase.from('modulos').insert({ turma_id: turmaId, titulo, ordem }).select().single();
  return { modulo: data, error };
}

export async function renomearModulo(id, titulo) {
  const { error } = await supabase.from('modulos').update({ titulo }).eq('id', id);
  return { error };
}

export async function excluirModulo(id) {
  // Aulas desse módulo não são apagadas — modulo_id delas vira null (on delete set null).
  const { error } = await supabase.from('modulos').delete().eq('id', id);
  return { error };
}

// Troca a ordem de dois módulos (mover pra cima/baixo na lista).
export async function reordenarModulos(modulos, index, direcao) {
  const novoIndex = index + direcao;
  if (novoIndex < 0 || novoIndex >= modulos.length) return { error: null };

  const a = modulos[index];
  const b = modulos[novoIndex];

  const [resA, resB] = await Promise.all([
    supabase.from('modulos').update({ ordem: b.ordem }).eq('id', a.id),
    supabase.from('modulos').update({ ordem: a.ordem }).eq('id', b.id),
  ]);

  return { error: resA.error || resB.error };
}

// Move uma aula pra outro módulo (equivalente a "arrastar" — só que via seleção,
// mais confiável em qualquer dispositivo, inclusive mobile).
export async function moverAulaParaModulo(aulaId, moduloId) {
  const { error } = await supabase.from('aulas').update({ modulo_id: moduloId }).eq('id', aulaId);
  return { error };
}

// Troca a ordem de duas aulas dentro do mesmo módulo.
export async function reordenarAulas(aulas, index, direcao) {
  const novoIndex = index + direcao;
  if (novoIndex < 0 || novoIndex >= aulas.length) return { error: null };

  const a = aulas[index];
  const b = aulas[novoIndex];

  const [resA, resB] = await Promise.all([
    supabase.from('aulas').update({ ordem: b.ordem }).eq('id', a.id),
    supabase.from('aulas').update({ ordem: a.ordem }).eq('id', b.id),
  ]);

  return { error: resA.error || resB.error };
}

export async function excluirAula(id) {
  const { error } = await supabase.from('aulas').delete().eq('id', id);
  return { error };
}