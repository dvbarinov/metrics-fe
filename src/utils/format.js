import { format, formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export const formatTimestamp = (timestamp, showTime = true) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return format(date, showTime ? 'dd.MM.yyyy HH:mm:ss' : 'dd.MM.yyyy', { locale: ru });
};

export const formatDuration = (ms) => {
    if (ms < 1000) return `${ms} ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)} s`;
    return `${(ms / 60000).toFixed(1)} min`;
};

export const formatValue = (value, metricName) => {
    if (typeof value !== 'number') return value;

    if (metricName?.includes('latency') || metricName?.includes('duration')) {
        return `${value.toFixed(2)} ms`;
    }

    if (metricName?.includes('rate') || metricName?.includes('rps')) {
        return `${value.toFixed(2)} req/s`;
    }

    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;

    return value.toFixed(2);
};

export const timeAgo = (timestamp) => {
    if (!timestamp) return '-';
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true, locale: ru });
};