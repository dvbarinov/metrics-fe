import React, { useMemo } from 'react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale,
} from 'chart.js';
import 'chartjs-adapter-date-fns';
import { ru } from 'date-fns/locale';
import styles from './MetricsChart.module.css';
import { COLORS } from '../../utils/chartColors';
import { formatValue, formatTimestamp } from '../../utils/format';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler,
    TimeScale
);

const MetricsChart = ({ metrics, metricName, isLoading, tagsFilter }) => {
    const chartData = useMemo(() => {
        if (!metrics || metrics.length === 0) {
            return {
                datasets: [],
            };
        }

        // Группируем метрики по уникальным комбинациям тегов
        const grouped = {};
        metrics.forEach((metric) => {
            const tagKey = JSON.stringify(metric.tags || {});
            if (!grouped[tagKey]) {
                grouped[tagKey] = [];
            }
            grouped[tagKey].push(metric);
        });

        const datasets = Object.entries(grouped).map(([tagKey, data], index) => {
            const tags = JSON.parse(tagKey);
            const tagLabel = Object.entries(tags)
                .map(([k, v]) => `${k}: ${v}`)
                .join(', ');

            const colorIndex = index % Object.values(COLORS).length;
            const color = Object.values(COLORS)[colorIndex];

            return {
                label: tagLabel || 'Без тегов',
                data: data.map((m) => ({
                    x: new Date(m.timestamp),
                    y: m.value,
                })),
                borderColor: color,
                backgroundColor: `${color}20`, // 20% opacity
                borderWidth: 2,
                pointRadius: 3,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.3,
            };
        });

        return {
            datasets,
        };
    }, [metrics, metricName]);

    const options = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
            mode: 'index',
            intersect: false,
        },
        plugins: {
            title: {
                display: true,
                text: `Метрика: ${formatMetricName(metricName)}`,
                color: '#f3f4f6',
                font: {
                    size: 18,
                    weight: '600',
                },
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                backgroundColor: '#1f2937',
                titleColor: '#f3f4f6',
                bodyColor: '#f3f4f6',
                borderColor: '#374151',
                borderWidth: 1,
                padding: 12,
                callbacks: {
                    label: (context) => {
                        const value = context.parsed.y;
                        const tags = context.dataset.label;
                        return [
                            `Значение: ${formatValue(value, metricName)}`,
                            tags !== 'Без тегов' ? `Теги: ${tags}` : null
                        ].filter(Boolean);
                    },
                    title: (context) => {
                        const date = context[0].parsed.x;
                        return formatTimestamp(date);
                    },
                },
            },
            legend: {
                position: 'bottom',
                labels: {
                    color: '#f3f4f6',
                    padding: 20,
                    usePointStyle: true,
                    pointStyle: 'circle',
                },
            },
        },
        scales: {
            x: {
                type: 'time',
                time: {
                    unit: 'minute',
                    tooltipFormat: 'dd.MM.yyyy HH:mm:ss',
                    displayFormats: {
                        minute: 'HH:mm',
                        hour: 'HH:mm',
                        day: 'dd.MM',
                    },
                },
                grid: {
                    color: '#374151',
                },
                ticks: {
                    color: '#9ca3af',
                },
                title: {
                    display: true,
                    text: 'Время',
                    color: '#9ca3af',
                },
            },
            y: {
                grid: {
                    color: '#374151',
                },
                ticks: {
                    color: '#9ca3af',
                },
                title: {
                    display: true,
                    text: getUnit(metricName),
                    color: '#9ca3af',
                },
            },
        },
    }), [metricName]);

    if (isLoading) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.loading}>Загрузка данных...</div>
            </div>
        );
    }

    if (!metrics || metrics.length === 0) {
        return (
            <div className={styles.chartContainer}>
                <div className={styles.empty}>
                    <div className={styles.emptyIcon}>📊</div>
                    <p className={styles.emptyText}>Нет данных для отображения</p>
                    <p className={styles.emptyHint}>Выберите сервис и метрику выше</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.chartContainer}>
            <div className={styles.chartWrapper}>
                <Line data={chartData} options={options} />
            </div>
        </div>
    );
};

const formatMetricName = (name) => {
    const map = {
        'latency_ms': 'Задержка',
        'rps': 'Запросов в секунду',
        'error_rate': 'Процент ошибок',
        'cpu_usage': 'Использование CPU',
        'memory_usage': 'Использование памяти',
        'response_time': 'Время ответа',
    };
    return map[name] || name;
};

const getUnit = (metricName) => {
    const map = {
        'latency_ms': 'мс',
        'rps': 'req/s',
        'error_rate': '%',
        'cpu_usage': '%',
        'memory_usage': '%',
        'response_time': 'мс',
    };
    return map[metricName] || '';
};

export default MetricsChart;