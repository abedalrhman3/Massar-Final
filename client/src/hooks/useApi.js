import { useState, useEffect, useCallback } from 'react';

// Generic data-fetching hook.
//
// Usage:
//   const { data, loading, error, refetch } = useApi(getDestinations);
//   const { data } = useApi(() => getDestination(slug), [slug]);
//
// - apiFn must be a stable function reference or the deps array controls re-runs.
// - data is the full res.data from axios (e.g. { success, data: [...] }).

export function useApi(apiFn, deps = []) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetch = useCallback(() => {
        setLoading(true);
        setError(null);
        apiFn()
            .then((res) => setData(res.data))
            .catch((err) => setError(err.response?.data?.message || 'Something went wrong'))
            .finally(() => setLoading(false));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps);

    useEffect(() => { fetch(); }, [fetch]);

    return { data, loading, error, refetch: fetch };
}