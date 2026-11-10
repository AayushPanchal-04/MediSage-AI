import { useCallback, useEffect, useState } from 'react';
import api from './api';

interface Options {
  method?: 'get' | 'post';
  body?: any;
  autoLoad?: boolean;
}

/**
 * Small wrapper around the AI insight endpoints.
 * - autoLoad: fire the request on mount (for read-only insights).
 * - load(body): fire manually (for the symptom checker form).
 * - reload(): same request but with ?refresh=true to bypass the server cache.
 */
export function useAiInsight<T = any>(url: string, { method = 'get', body, autoLoad = true }: Options = {}) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(autoLoad);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(
    async (overrideBody?: any, refresh = false) => {
      setLoading(true);
      setError(null);
      try {
        const target = refresh ? `${url}${url.includes('?') ? '&' : '?'}refresh=true` : url;
        const res =
          method === 'post' ? await api.post(target, overrideBody ?? body) : await api.get(target);
        setData(res.data.data);
        return res.data.data as T;
      } catch (err: any) {
        setError(err?.response?.data?.message || 'The AI service is unavailable right now. Please try again.');
        return null;
      } finally {
        setLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [url, method],
  );

  useEffect(() => {
    if (autoLoad) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [load, autoLoad]);

  return { data, loading, error, load, reload: () => load(undefined, true) };
}
