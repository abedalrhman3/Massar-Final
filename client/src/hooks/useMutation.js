import { useState } from 'react';









export function useMutation(apiFunction, { onSuccess, onError } = {}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const mutate = async (...args) => {
        setLoading(true);
        setError(null);
        try {
            const res = await apiFunction(...args);
            onSuccess?.(res.data);
            return res.data;
        } catch (err) {
            const message = err.response?.data?.message || 'Something went wrong';
            setError(message);
            onError?.(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { mutate, loading, error };
}