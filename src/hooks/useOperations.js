import { useState, useEffect, useCallback } from 'react';

const buildUrl = (path, params = {}) => {
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v != null && v !== '')
  ).toString();
  return qs ? `${path}?${qs}` : path;
};

const dateParams = (datePreset, customRange) => {
  if (datePreset === 'custom' && customRange?.since && customRange?.until) {
    return { since: customRange.since, until: customRange.until };
  }
  return { date_preset: datePreset || 'last_30d' };
};

/**
 * Hook que busca métricas operacionais (Clinicorp e futuras integrações).
 * Só faz fetch se o cliente tem 'clinicorp' (ou outra integração relevante)
 * habilitada — passar a lista de integrations pra evitar chamadas desnecessárias.
 */
export function useOperations(client, datePreset, customRange, integrations = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const enabled = !!client && integrations.includes('clinicorp');

  const load = useCallback(() => {
    if (!enabled) {
      setData(null);
      setLoading(false);
      return;
    }
    setError(null);
    setLoading(true);
    fetch(buildUrl('/api/operations', { ...dateParams(datePreset, customRange), client }))
      .then(r => r.json())
      .then(d => {
        if (d.error) throw new Error(d.error.message || JSON.stringify(d.error));
        setData(d);
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [enabled, datePreset, client, customRange?.since, customRange?.until]);

  useEffect(() => {
    setData(null);
    load();
    // Polling reduzido (cache no backend é 30 min, então 30 min aqui também)
    if (!enabled) return;
    const interval = setInterval(load, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [load, enabled]);

  return { data, loading, error, enabled, refetch: load };
}
