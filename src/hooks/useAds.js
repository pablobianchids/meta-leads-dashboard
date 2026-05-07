import { useState, useEffect, useCallback } from 'react';
import { fetchAds } from '../services/api';

/**
 * Hook que centraliza fetch + polling de ads. Ambos AdPreviews e
 * InsightsCards consomem essa mesma fonte de dados via App.jsx.
 */
export function useAds(datePreset, client, customRange) {
  const [ads, setAds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateLimited, setRateLimited] = useState(false);
  const [tokenExpired, setTokenExpired] = useState(false);

  const load = useCallback(() => {
    if (!client) return;
    setError(null);
    setLoading(true);
    fetchAds(datePreset, client, customRange)
      .then(d => {
        if (d.error) {
          if (d.error.rateLimited) {
            setRateLimited(true);
            throw new Error('rate-limit');
          }
          if (d.error.tokenExpired) {
            setTokenExpired(true);
            throw new Error('token-expired');
          }
          throw new Error(d.error.message || JSON.stringify(d.error));
        }
        setAds(d.data || []);
        setError(null);
        setRateLimited(false);
        setTokenExpired(false);
      })
      .catch(e => {
        if (e.message !== 'rate-limit' && e.message !== 'token-expired') setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [datePreset, client, customRange?.since, customRange?.until]);

  useEffect(() => {
    setAds([]);
    load();
    const interval = setInterval(load, 600000);
    return () => clearInterval(interval);
  }, [load]);

  return { ads, loading, error, rateLimited, tokenExpired, refetch: load };
}
