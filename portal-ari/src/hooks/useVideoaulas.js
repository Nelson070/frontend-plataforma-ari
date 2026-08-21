import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';

// Agrupa as videoaulas por módulo, no formato que a tela do Player já espera
// (mesma forma do array MODULOS que estava mockado).
export function useVideoaulas() {
  const [modulos, setModulos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('videoaulas')
      .select('*')
      .order('modulo', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) {
      setError(error);
      setLoading(false);
      return;
    }

    const agrupado = data.reduce((acc, aula) => {
      let grupo = acc.find((m) => m.titulo === aula.modulo);
      if (!grupo) {
        grupo = { id: aula.modulo, label: aula.modulo, titulo: aula.modulo, aulas: [] };
        acc.push(grupo);
      }
      grupo.aulas.push({
        id: aula.id,
        titulo: aula.titulo,
        duracao: `${aula.duracao_min} min`,
        url: aula.url_video,
      });
      return acc;
    }, []);

    setModulos(agrupado);
    setLoading(false);
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  return { modulos, loading, error, recarregar: carregar };
}
