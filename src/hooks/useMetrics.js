import { useState, useEffect, useCallback } from 'react';
import { fetchMetricsHistory } from '../utils/api';

export const useMetrics = (params) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const loadMetrics = useCallback(async (queryParams) => {
        setLoading(true);
        setError(null);

        try {
            const metrics = await fetchMetricsHistory(queryParams);
            setData(metrics);
        } catch (err) {
            console.error('Error fetching metrics:', err);
            setError(err.message || 'Failed to load metrics');
            setData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (params?.service_name && params?.metric_name) {
            loadMetrics(params);
        }
    }, [params, loadMetrics]);

    return { data, loading, error, refetch: loadMetrics };
};

export default useMetrics;