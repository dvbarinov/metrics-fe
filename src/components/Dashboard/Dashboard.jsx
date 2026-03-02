import React, { useState, useEffect, useMemo, useCallback } from 'react';
import styles from './Dashboard.module.css';
import MetricsSelector from '../MetricsSelector';
import TagFilter from '../TagFilter';
import TimeRangeSelector from '../TimeRangeSelector';
import MetricsChart from '../MetricsChart';
import StatsCard from '../StatsCard';
import LoadingSpinner from '../LoadingSpinner';
import useMetrics from '../../hooks/useMetrics';
import useWebSocket from '../../hooks/useWebSocket';
import { formatValue } from '../../utils/format';

const Dashboard = () => {
    const [selectedService, setSelectedService] = useState('api-gateway');
    const [selectedMetric, setSelectedMetric] = useState('latency_ms');
    const [selectedTags, setSelectedTags] = useState({});
    const [timeRange, setTimeRange] = useState(60);
    const [liveStats, setLiveStats] = useState({});

    // Мемоизируем параметры для хуков
    const metricsParams = useMemo(() => ({
        service_name: selectedService,
        metric_name: selectedMetric,
        last_minutes: timeRange,
        tags_filter: selectedTags,
    }), [selectedService, selectedMetric, timeRange, selectedTags]);

    const { data: metricsData, loading, error, refetch } = useMetrics(metricsParams);

    // Стабильная функция обработки сообщений
    const handleWebSocketMessage = useCallback((message) => {
        if (message.service_name === selectedService &&
            message.metric_name === selectedMetric) {
            setLiveStats(prev => ({
                ...prev,
                [JSON.stringify(message.tags || {})]: message,
            }));
        }
    }, [selectedService, selectedMetric]);

    // Мемоизируем параметры WebSocket
    const wsOptions = useMemo(() => ({
        tagsFilter: selectedTags,
        groupBy: Object.keys(selectedTags).length > 0 ? Object.keys(selectedTags) : null,
    }), [selectedTags]);

    useWebSocket(handleWebSocketMessage, wsOptions);

    // Сброс статистики только при смене ключевых параметров
    useEffect(() => {
        setLiveStats({});
    }, [selectedService, selectedMetric]);

    // Вычисляем агрегированную статистику
    const stats = useMemo(() => {
        if (!metricsData || metricsData.length === 0) return null;

        const values = metricsData.map(m => m.value);
        const sorted = [...values].sort((a, b) => a - b);

        const sum = values.reduce((a, b) => a + b, 0);
        const avg = sum / values.length;
        const min = Math.min(...values);
        const max = Math.max(...values);
        const p50 = sorted[Math.floor(sorted.length * 0.5)];
        const p95 = sorted[Math.floor(sorted.length * 0.95)];
        const p99 = sorted[Math.floor(sorted.length * 0.99)];

        return { avg, min, max, p50, p95, p99, count: values.length };
    }, [metricsData]);

    // Статистика из реального времени
    const liveStatsArray = Object.values(liveStats);

    return (
        <div className={styles.dashboard}>
            <header className={styles.header}>
                <h1 className={styles.title}>📊 Real-time Metrics Dashboard</h1>
                <div className={styles.subtitle}>
                    Мониторинг производительности микросервисов
                </div>
            </header>

            <div className={styles.controls}>
                <MetricsSelector
                    selectedService={selectedService}
                    selectedMetric={selectedMetric}
                    onServiceChange={setSelectedService}
                    onMetricChange={setSelectedMetric}
                />

                <TagFilter
                    service_name={selectedService}
                    selectedTags={selectedTags}
                    onChange={setSelectedTags}
                />

                <TimeRangeSelector
                    selectedRange={timeRange}
                    onChange={setTimeRange}
                />
            </div>

            {error && (
                <div className={styles.error}>
                    ❌ Ошибка: {error}
                </div>
            )}

            <div className={styles.statsGrid}>
                {stats ? (
                    <>
                        <StatsCard
                            title="Среднее"
                            value={stats.avg}
                            metricName={selectedMetric}
                        />
                        <StatsCard
                            title="Минимум"
                            value={stats.min}
                            metricName={selectedMetric}
                        />
                        <StatsCard
                            title="Максимум"
                            value={stats.max}
                            metricName={selectedMetric}
                        />
                        <StatsCard
                            title="P95"
                            value={stats.p95}
                            metricName={selectedMetric}
                        />
                        <StatsCard
                            title="P99"
                            value={stats.p99}
                            metricName={selectedMetric}
                        />
                        <StatsCard
                            title="Всего точек"
                            value={stats.count}
                            metricName={selectedMetric}
                        />
                    </>
                ) : (
                    <div className={styles.statsPlaceholder}>
                        {loading ? (
                            <LoadingSpinner size="small" text="" />
                        ) : (
                            <span className={styles.placeholderText}>Выберите метрику для просмотра статистики</span>
                        )}
                    </div>
                )}
            </div>

            <div className={styles.liveStats}>
                {liveStatsArray.length > 0 && (
                    <div className={styles.liveStatsHeader}>
                        <h3>⚡ Данные в реальном времени (последние 30 сек)</h3>
                    </div>
                )}
                <div className={styles.liveStatsGrid}>
                    {liveStatsArray.map((stat, index) => (
                        <div key={index} className={styles.liveStatCard}>
                            <div className={styles.liveStatHeader}>
                <span className={styles.liveStatTitle}>
                  {Object.entries(stat.tags || {})
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(', ') || 'Без тегов'}
                </span>
                            </div>
                            <div className={styles.liveStatBody}>
                                <div className={styles.liveStatValue}>
                                    {formatValue(stat.avg_value, selectedMetric)}
                                </div>
                                <div className={styles.liveStatDetails}>
                                    <span>Min: {formatValue(stat.min_value, selectedMetric)}</span>
                                    <span>Max: {formatValue(stat.max_value, selectedMetric)}</span>
                                    <span>P95: {formatValue(stat.p95, selectedMetric)}</span>
                                </div>
                                <div className={styles.liveStatCount}>
                                    {stat.count} измерений
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className={styles.chartSection}>
                <MetricsChart
                    metrics={metricsData}
                    metricName={selectedMetric}
                    isLoading={loading}
                    tagsFilter={selectedTags}
                />
            </div>
        </div>
    );
};

export default Dashboard;