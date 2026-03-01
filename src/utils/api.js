import axios from 'axios';
import { API_BASE_URL } from '../config';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const fetchMetricsHistory = async (params) => {
    const { service_name, metric_name, last_minutes = 60, tags_filter } = params;

    const queryParams = new URLSearchParams({
        service_name,
        metric_name,
        last_minutes,
    });

    if (tags_filter && Object.keys(tags_filter).length > 0) {
        queryParams.append('tags_filter', JSON.stringify(tags_filter));
    }

    const response = await api.get(`/metrics/history?${queryParams.toString()}`);
    return response.data;
};

export const fetchUniqueTags = async (service_name = null) => {
    const params = new URLSearchParams();
    if (service_name) {
        params.append('service_name', service_name);
    }

    const response = await api.get(`/metrics/unique-tags${params.toString() ? `?${params.toString()}` : ''}`);
    return response.data;
};

export const fetchServices = async () => {
    // Можно добавить отдельный endpoint для списка сервисов
    const response = await api.get('/metrics/unique-tags');
    // Извлекаем уникальные service_name из метрик
    const servicesResponse = await api.get('/metrics/history?service_name=*&metric_name=*&last_minutes=1440');
    // или лучше сделать отдельный эндпоинт
    return ['api-gateway', 'auth-service', 'payment-service', 'user-service'];
};

export default api;