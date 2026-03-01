import { useState, useEffect, useCallback } from 'react';
import { fetchUniqueTags } from '../utils/api';

export const useTags = (service_name = null) => {
    const [tags, setTags] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadTags = useCallback(async (serviceName = null) => {
        setLoading(true);
        setError(null);

        try {
            const uniqueTags = await fetchUniqueTags(serviceName);
            setTags(uniqueTags);
        } catch (err) {
            console.error('Error fetching tags:', err);
            setError(err.message || 'Failed to load tags');
            setTags({});
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadTags(service_name);
    }, [service_name, loadTags]);

    return { tags, loading, error, refetch: loadTags };
};

export default useTags;