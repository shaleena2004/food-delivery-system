import { useState, useEffect, useCallback, useRef } from 'react';

export const useFetch = (fetchFunction, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  const fetchRef = useRef(fetchFunction);
  useEffect(() => {
    fetchRef.current = fetchFunction;
  }, [fetchFunction]);

  const refetch = useCallback(() => {
    setReloadKey((prev) => prev + 1);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    let isMounted = true;

    setLoading(true);
    setError(null);

    fetchRef
      .current(abortController.signal)
      .then((res) => {
        if (!isMounted) return;
        setData(res?.data !== undefined ? res.data : res);
        setLoading(false);
      })
      .catch((err) => {
        if (!isMounted) return;
        if (err.name === 'AbortError') return;
        setError(err.message || 'An unexpected error occurred');
        setLoading(false);
      });

    return () => {
      isMounted = false;
      abortController.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadKey, ...dependencies]);

  return { data, loading, error, refetch, setData };
};
